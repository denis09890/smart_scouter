import os
import sqlite3
import re
import pandas as pd
import unicodedata
from groq import Groq
from dotenv import load_dotenv
from database import DB_PATH, get_player_context

load_dotenv()

SYSTEM_PROMPT = """Ești "Scout AI", un Chief Data Analyst și Expert Scout la nivel de elită. Rolul tău este să oferi analize fotbalistice de o precizie chirurgicală.

REGULI STRICTE DE COMPORTAMENT:
1. Răspunde EXCLUSIV în limba română, folosind terminologie tehnico-tactică avansată.
2. BAZAT 100% PE DATELE FURNIZATE: Informațiile din blocul "[TRANSFERMARKT DATA]" sunt SINGURA ta sursă de adevăr. NU folosi absolut nicio informație din afara acestor date!
3. INTERPRETARE DEDUCTIVĂ: Dacă o informație cerută lipsește direct (ex: istoric de accidentări, atribute fizice), DEDUCE-O logic din statisticile existente. (ex: "Jucătorul are o medie de doar 45 min/meci, sugerând probleme de rezistență fizică sau accidentări frecvente").
4. DIALOG INTERACTIV: Transformă conversația într-un schimb real de idei. Dacă utilizatorul cere o evaluare pentru transfer fără a da context tactic, oferă-i o scurtă analiză a datelor, apoi PUNE-I ÎNTREBĂRI de calibrare la finalul mesajului (ex: "În ce formație vrei să-l integrezi?", "Ce stil de joc abordați?", "Ai nevoie de un jucător de posesie sau de tranziție?"). Ghidează-te după răspunsurile lui în replicile următoare pentru a-i oferi recomandări personalizate.
5. FĂRĂ INVENȚII: Dacă nici măcar deducția logică nu te ajută să oferi un răspuns, spune ferm: "Baza mea de date nu conține suficiente informații pentru a evalua acest aspect."
6. STRUCTURĂ PROFESIONISTĂ: Analizează, nu doar rezuma. Citează cifre exacte din date pentru a-ți susține afirmațiile deduse.
7. JUCĂTORI INEXISTENȚI: Dacă nu primești date pentru un jucător, SPUNE CLAR că jucătorul nu există în baza de date pe care o analizezi și REFUZĂ să răspunzi folosind cunoștințe externe.
"""


def _normalize_name(text):
    """Sterge accentele si converteste in litere mici pentru o potrivire perfecta."""
    if not text:
        return ""
    return unicodedata.normalize('NFKD', str(text)).encode('ASCII', 'ignore').decode('utf-8').lower()

def _build_ngrams(text, max_n=4):
    """Genereaza n-grame de cuvinte din text pentru cautarea numelor."""
    words = re.findall(r"[A-Za-zÀ-ÿĀ-ɏ\-]{2,}", text)
    ngrams = []
    for n in range(max_n, 0, -1):
        for i in range(len(words) - n + 1):
            ngrams.append(" ".join(words[i : i + n]))
    return ngrams


class ScoutAgent:
    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = "llama-3.1-8b-instant"
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
            index = {}
            for _, row in df.iterrows():
                pid = int(row["player_id"])
                original_name = row["name"]
                norm_name = _normalize_name(original_name)
                index[norm_name] = (pid, original_name)
                
                # Adaugam un fallback inteligent si pentru numele de familie
                parts = norm_name.split()
                if len(parts) > 1:
                    last_name = parts[-1]
                    if len(last_name) >= 5 and last_name not in index:
                        index[last_name] = (pid, original_name)
            return index
        except Exception as e:
            print(f"(Avertisment index: {e})")
            return {}

    def _find_players_in_message(self, text, max_players=8):
        """Gaseste nume de jucatori mentionate in mesajul utilizatorului."""
        ngrams = _build_ngrams(text, max_n=4)
        found = {}
        for gram in ngrams:
            key = _normalize_name(gram)
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
                    f"[TRANSFERMARKT DATA - use as primary source]\n"
                    f"{data_context}\n\n"
                    f"[USER QUESTION]\n{message}"
                )
            else:
                enriched = message

            self.history.append({"role": "user", "content": enriched})

            completion = self.client.chat.completions.create(
                model=self.model,
                messages=self.history,
                temperature=0.4,
                max_tokens=2048,
            )

            response = completion.choices[0].message.content

            self.history[-1] = {"role": "user", "content": message}
            self.history.append({"role": "assistant", "content": response})

            # Cauta si jucatori mentionati in raspunsul AI (pe langa cei din intrebare)
            ai_players = self._find_players_in_message(response)
            all_found = {pid: pname for pid, pname in players_found + ai_players}

            return response, list(all_found.keys())

        except Exception as e:
            return f"Error communicating with AI: {e}", []
