import os
import sqlite3
import re
import pandas as pd
from groq import Groq
from dotenv import load_dotenv
from database import DB_PATH, get_player_context

load_dotenv()

SYSTEM_PROMPT = """Ești "Scout AI", un expert global în fotbal cu acces la baza de date Transfermarkt (sute de mii de jucători profesioniști din întreaga lume).

DOMENII DE EXPERTIZĂ:
- Profiluri complete ale jucătorilor (statistici, transferuri, valori de piață, evoluție în carieră)
- Analiza performanțelor pe club, ligă și competiție europeană
- Istoricul transferurilor și al valorilor de piață
- Tactici, formații, roluri și stiluri de joc
- Comparații între jucători și analize de potențial
- Informații despre cluburi, antrenori și ligi din toată lumea
- Accidentări și suspendări (când sunt disponibile din date sau cunoștințe generale)

DESPRE DATELE DISPONIBILE:
- Când primești un bloc "DATE DIN TRANSFERMARKT", acestea sunt date reale și actuale — folosește-le ca sursă primară
- Dacă nu primești date pentru un jucător, folosește cunoștințele tale generale despre fotbal
- Nu ai date directe despre accidentări, dar poți analiza perioadele cu meciuri lipsă pentru a deduce potențiale probleme
- Datele acoperă jucători din ligile majore și secundare din Europa și din alte continente

STIL DE RĂSPUNS:
1. Răspunde în limba în care ești întrebat (română sau altă limbă)
2. Fii precis cu statisticile — citează cifre exacte din date când sunt disponibile
3. Oferă analize tehnice reale: nu doar cifre, ci interpretări utile
4. Poți compara jucători, evalua transferuri, discuta tactici
5. Fii pasionat și profesionist — vorbești ca un scout UEFA cu experiență
6. Dacă un jucător nu e în baza de date, spune-o explicit și răspunde din cunoștințe generale
"""


def _build_ngrams(text, max_n=3):
    """Genereaza n-grame de cuvinte din text pentru cautarea numelor."""
    words = re.findall(r"[A-Za-zÀ-ÿĀ-ɏ]{2,}", text)
    ngrams = []
    for n in range(1, max_n + 1):
        for i in range(len(words) - n + 1):
            ngrams.append(" ".join(words[i : i + n]))
    return ngrams


class ScoutAgent:
    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = "llama-3.3-70b-versatile"
        self.history = [{"role": "system", "content": SYSTEM_PROMPT}]
        print("  Incarc indexul jucatorilor pentru cautare rapida...", end=" ", flush=True)
        self._name_index = self._load_name_index()
        print(f"{len(self._name_index):,} jucatori indexati.")

    def _load_name_index(self):
        """Incarca toate numele jucatorilor in memorie: lowercase_name -> (player_id, original_name)."""
        if not os.path.exists(DB_PATH):
            return {}
        try:
            conn = sqlite3.connect(DB_PATH)
            df = pd.read_sql_query("SELECT player_id, name FROM players WHERE name IS NOT NULL", conn)
            conn.close()
            return {
                row["name"].lower(): (int(row["player_id"]), row["name"])
                for _, row in df.iterrows()
            }
        except Exception as e:
            print(f"(Avertisment index: {e})")
            return {}

    def _find_players_in_message(self, text, max_players=3):
        """Gaseste nume de jucatori mentionate in mesajul utilizatorului."""
        ngrams = _build_ngrams(text)
        found = {}
        for gram in ngrams:
            key = gram.lower()
            if key in self._name_index and len(key) > 4:
                pid, pname = self._name_index[key]
                if pid not in found:
                    found[pid] = pname
                if len(found) >= max_players:
                    break
        return list(found.items())  # [(player_id, name), ...]

    def _build_data_context(self, players):
        """Construieste blocul de context cu date reale pentru jucatorii gasiti."""
        blocks = []
        for pid, _ in players:
            data = get_player_context(pid)
            blocks.append(f"{'='*50}\n{data}")
        return "\n".join(blocks)

    def ask(self, message):
        try:
            players_found = self._find_players_in_message(message)

            if players_found:
                names_str = ", ".join(p[1] for p in players_found)
                print(f"  [DB] Date gasite pentru: {names_str}")
                data_context = self._build_data_context(players_found)
                enriched = (
                    f"[DATE DIN TRANSFERMARKT - foloseste-le ca sursa primara]\n"
                    f"{data_context}\n\n"
                    f"[INTREBAREA UTILIZATORULUI]\n{message}"
                )
            else:
                enriched = message

            # Trimitem mesajul imbogatit la AI
            self.history.append({"role": "user", "content": enriched})

            completion = self.client.chat.completions.create(
                model=self.model,
                messages=self.history,
                temperature=0.3,
                max_tokens=2048,
            )

            response = completion.choices[0].message.content

            # Salvam in istoric versiunea curata (fara dump de date) pentru a nu bloca contextul
            self.history[-1] = {"role": "user", "content": message}
            self.history.append({"role": "assistant", "content": response})

            return response

        except Exception as e:
            return f"Eroare la comunicarea cu AI: {e}"
