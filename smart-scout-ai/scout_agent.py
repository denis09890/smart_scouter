import os
import sqlite3
import re
import pandas as pd
import unicodedata
from groq import Groq
from dotenv import load_dotenv
from database import DB_PATH, get_player_context, search_players_by_criteria

load_dotenv()

SYSTEM_PROMPT = """Ești Scout AI, expert scout fotbalistic. Răspunde EXCLUSIV în română.
Reguli: (1) Folosește DOAR datele din [TRANSFERMARKT DATA] sau [SEARCH RESULTS]. (2) Deduce logic ce lipsește din statistici. (3) Pune întrebări de calibrare când ceri context tactic. (4) Dacă nu ai date, spune clar. (5) Citează cifre exacte."""

# ── Mapări pentru extragerea criteriilor din mesaj ──────────────────────────

POSITION_KEYWORDS = {
    # fundași
    "fundas central": "Centre-Back", "fundasi centrali": "Centre-Back",
    "fundaș central": "Centre-Back", "fundași centrali": "Centre-Back",
    "fundas": "Centre-Back", "fundași": "Centre-Back", "fundasi": "Centre-Back",
    "aparator central": "Centre-Back", "apărător central": "Centre-Back",
    "aparatori centrali": "Centre-Back", "apărători centrali": "Centre-Back",
    "fundas stanga": "Left-Back", "fundaș stânga": "Left-Back",
    "fundasi laterali stanga": "Left-Back", "fundași laterali stânga": "Left-Back",
    "fundasi laterali dreapta": "Right-Back", "fundași laterali dreapta": "Right-Back",
    "fundas lateral": "Left-Back", "fundaș lateral": "Left-Back",
    "fundasi laterali": "Left-Back", "fundași laterali": "Left-Back",
    "lateral stanga": "Left-Back", "lateral stânga": "Left-Back",
    "fundas dreapta": "Right-Back", "fundaș dreapta": "Right-Back",
    "lateral dreapta": "Right-Back", "fundas lateral dreapta": "Right-Back",
    "lateral stanga": "Left-Back", "lateral stânga": "Left-Back",
    "fundas lateral stanga": "Left-Back", "fundas lateral stânga": "Left-Back",
    "lateral": "Left-Back",
    "aparator": "Defender", "apărător": "Defender",
    "aparatori": "Defender", "apărători": "Defender",
    "defender": "Defender", "defensiv": "Defender",
    # mijlocași
    "mijlocas central": "Central Midfield", "mijlocaș central": "Central Midfield",
    "mijlocasi centrali": "Central Midfield", "mijlocași centrali": "Central Midfield",
    "mijlocas defensiv": "Defensive Midfield", "mijlocaș defensiv": "Defensive Midfield",
    "mijlocasi defensivi": "Defensive Midfield", "mijlocași defensivi": "Defensive Midfield",
    "mijlocas ofensiv": "Attacking Midfield", "mijlocaș ofensiv": "Attacking Midfield",
    "mijlocasi ofensivi": "Attacking Midfield", "mijlocași ofensivi": "Attacking Midfield",
    "mijlocas": "Central Midfield", "mijlocaș": "Central Midfield",
    "mijlocasi": "Central Midfield", "mijlocași": "Central Midfield",
    "medians": "Central Midfield", "median": "Central Midfield",
    # atacanți
    "atacant central": "Centre-Forward", "atacanți centrali": "Centre-Forward",
    "atacanti centrali": "Centre-Forward", "varf": "Centre-Forward", "vârf": "Centre-Forward",
    "atacant": "Centre-Forward", "atacanți": "Centre-Forward", "atacanti": "Centre-Forward",
    "extrema stanga": "Left Winger", "extremă stânga": "Left Winger",
    "extreme stanga": "Left Winger", "extreme stânga": "Left Winger",
    "extrema dreapta": "Right Winger", "extremă dreapta": "Right Winger",
    "extreme dreapta": "Right Winger",
    "extrema": "Left Winger", "extremă": "Left Winger", "extreme": "Left Winger",
    "winger": "Left Winger",
    "al doilea varf": "Second Striker", "al doilea vârf": "Second Striker",
    "forward": "Centre-Forward",
    # portar
    "portar": "Goalkeeper", "portari": "Goalkeeper", "goalkeeper": "Goalkeeper",
    # abrevieri
    "cb": "Centre-Back", "lb": "Left-Back", "rb": "Right-Back",
    "cm": "Central Midfield", "dm": "Defensive Midfield", "am": "Attacking Midfield",
    "lm": "Left Midfield", "rm": "Right Midfield",
    "lw": "Left Winger", "rw": "Right Winger",
    "cf": "Centre-Forward", "st": "Centre-Forward", "ss": "Second Striker",
    "gk": "Goalkeeper",
}

NATIONALITY_KEYWORDS = {
    "roman": "Romania", "română": "Romania", "romani": "Romania", "români": "Romania",
    "brazilian": "Brazil", "brazilieni": "Brazil", "braziliana": "Brazil",
    "francez": "France", "francezi": "France", "franceza": "France",
    "spaniol": "Spain", "spanioli": "Spain", "spaniola": "Spain",
    "german": "Germany", "germani": "Germany", "germana": "Germany",
    "italian": "Italy", "italieni": "Italy", "italiana": "Italy",
    "englez": "England", "englezi": "England", "engleza": "England",
    "argentinian": "Argentina", "argentinieni": "Argentina",
    "olandez": "Netherlands", "olandezi": "Netherlands",
    "portughez": "Portugal", "portughezi": "Portugal",
    "belgian": "Belgium", "belgieni": "Belgium",
    "columbian": "Colombia", "columbieni": "Colombia",
    "urugayan": "Uruguay", "uruguayeni": "Uruguay",
    "croat": "Croatia", "croati": "Croatia",
    "sarb": "Serbia", "sarbi": "Serbia", "sârb": "Serbia", "sârbi": "Serbia",
    "olandez": "Netherlands", "olandezi": "Netherlands",
    "danez": "Denmark", "danezi": "Denmark",
    "suedez": "Sweden", "suedezi": "Sweden",
    "norvegian": "Norway", "norvegieni": "Norway",
    "elvetian": "Switzerland", "elvețian": "Switzerland", "elvetieni": "Switzerland",
    "austriac": "Austria", "austrieci": "Austria",
    "polonez": "Poland", "polonezi": "Poland",
    "ucrainean": "Ukraine", "ucraineni": "Ukraine",
    "rus": "Russia", "rusi": "Russia",
    "turc": "Turkey", "turci": "Turkey",
    "grec": "Greece", "greci": "Greece",
    "japonez": "Japan", "japonezi": "Japan",
    "coreean": "South Korea", "coreeni": "South Korea",
    "american": "United States", "americani": "United States",
    "mexican": "Mexico", "mexicani": "Mexico",
    "senegalez": "Senegal", "senegalezi": "Senegal",
    "ghanez": "Ghana", "ghanezi": "Ghana",
    "nigerian": "Nigeria", "nigerieni": "Nigeria",
    "ivorian": "Ivory Coast", "ivorieni": "Ivory Coast",
    "camerunez": "Cameroon", "camerunezi": "Cameroon",
    "marocan": "Morocco", "marocani": "Morocco",
    "egiptean": "Egypt", "egipteni": "Egypt",
    "scotian": "Scotland", "scoțian": "Scotland", "scotieni": "Scotland",
    "galez": "Wales", "galezi": "Wales",
    "irlandez": "Ireland", "irlandezi": "Ireland",
}

# Cuvinte care indică o cerere de căutare (nu analiză de jucător specific)
SEARCH_TRIGGER_WORDS = [
    "cauta", "caută", "gaseste", "găsește", "recomanda", "recomandă",
    "sugereaza", "sugerează", "am nevoie de", "am nevoie", "vreau",
    "arata-mi", "arată-mi", "listează", "listeaza", "care sunt",
    "cei mai buni", "cel mai bun", "top", "give me", "find me",
]


def _normalize(text):
    if not text:
        return ""
    return unicodedata.normalize('NFKD', str(text)).encode('ASCII', 'ignore').decode('utf-8').lower()


def _build_ngrams(text, max_n=4):
    words = re.findall(r"[A-Za-zÀ-ÿĀ-ɏ\-]{2,}", text)
    ngrams = []
    for n in range(max_n, 0, -1):
        for i in range(len(words) - n + 1):
            ngrams.append(" ".join(words[i: i + n]))
    return ngrams


def _extract_number(text, keyword_pattern):
    """Extrage un număr care apare în apropierea unui keyword (ex: '3 fundași')."""
    m = re.search(r'(\d+)\s+' + keyword_pattern, text, re.IGNORECASE)
    if m:
        return int(m.group(1))
    m = re.search(keyword_pattern + r'\s+(\d+)', text, re.IGNORECASE)
    if m:
        return int(m.group(1))
    return None


def _extract_criteria(message):
    """
    Extrage criterii de căutare din mesaj: poziție, naționalitate, club, vârstă, valoare.
    Logica de detecție: mai întâi extrage criteriile, dacă există cel puțin unul
    AND (trigger word SAU mesajul nu conține niciun nume de jucător din index) → e căutare.
    Returnează dict cu criterii sau None dacă e analiză de jucător specific.
    """
    norm_msg = _normalize(message)
    msg_lower = message.lower()

    criteria = {}

    # ── Număr explicit de rezultate (ex: "3 fundași", "5 jucători") ────────
    num_match = re.search(r'\b(\d+)\b', msg_lower)
    if num_match:
        criteria["limit"] = min(int(num_match.group(1)), 10)

    # ── Poziție — cel mai lung keyword match ────────────────────────────────
    found_pos = None
    for kw in sorted(POSITION_KEYWORDS.keys(), key=len, reverse=True):
        if _normalize(kw) in norm_msg:
            found_pos = POSITION_KEYWORDS[kw]
            break
    if found_pos:
        criteria["position"] = found_pos

    # ── Naționalitate — cel mai lung keyword match ──────────────────────────
    found_nat = None
    for kw in sorted(NATIONALITY_KEYWORDS.keys(), key=len, reverse=True):
        if _normalize(kw) in norm_msg:
            found_nat = NATIONALITY_KEYWORDS[kw]
            break
    if found_nat:
        criteria["nationality"] = found_nat

    # ── Club — "de la <Club>" / "din <Club>" ───────────────────────────────
    club_match = re.search(
        r'\b(?:de la|din|club[ul]*|echip[aă]*)\s+([A-Z][A-Za-z\s]+?)(?:\s*,|\s*\.|$|\s+(?:cu|care|sub|peste|si|și))',
        message, re.IGNORECASE
    )
    if club_match:
        criteria["club"] = club_match.group(1).strip()

    # ── Vârstă ──────────────────────────────────────────────────────────────
    age_max = re.search(r'(?:sub|maxim|max|pana la|pana in|cel mult)\s+(\d+)\s*(?:de\s+)?ani', norm_msg)
    if age_max:
        criteria["max_age"] = int(age_max.group(1))

    age_min = re.search(r'(?:peste|minim|min|de la|cel putin|macar)\s+(\d+)\s*(?:de\s+)?ani', norm_msg)
    if age_min:
        criteria["min_age"] = int(age_min.group(1))

    # ── Valoare de piață ────────────────────────────────────────────────────
    val_max = re.search(
        r'(?:sub|maxim|max|pana la|pana in|buget)\s+([\d,.]+)\s*(?:mil|m\b|milioane?|mil\.?\s*eur|m\s*eur)',
        norm_msg
    )
    if val_max:
        try:
            criteria["max_value"] = float(val_max.group(1).replace(',', '.')) * 1_000_000
        except ValueError:
            pass

    val_min = re.search(
        r'(?:peste|minim|min|cel putin)\s+([\d,.]+)\s*(?:mil|m\b|milioane?|mil\.?\s*eur|m\s*eur)',
        norm_msg
    )
    if val_min:
        try:
            criteria["min_value"] = float(val_min.group(1).replace(',', '.')) * 1_000_000
        except ValueError:
            pass

    # ── Dacă nu există niciun criteriu de filtrare, nu e o căutare ──────────
    search_keys = ("position", "nationality", "club", "max_age", "min_age", "max_value", "min_value")
    if not any(k in criteria for k in search_keys):
        return None

    # ── Detecție: e căutare sau analiză de jucător specific? ────────────────
    # Dacă mesajul conține un trigger word explicit → cu siguranță căutare
    has_trigger = any(_normalize(t) in norm_msg for t in SEARCH_TRIGGER_WORDS)
    # Dacă nu are trigger, verifică dacă mesajul sună a analiză (ex: "analizează X", "cum e X")
    analysis_patterns = [
        r'\b(analizeaza|analizează|evalueaza|evaluează|cum\s+e|ce\s+crezi|parerea|opinia)\b',
        r'\b(compara|compară|versus|vs\.?)\b',
    ]
    is_analysis = any(re.search(p, norm_msg) for p in analysis_patterns)

    if is_analysis and not has_trigger:
        return None

    return criteria


def _format_criteria_summary(criteria):
    """Construiește un text descriptiv al criteriilor pentru context AI."""
    parts = []
    if "position" in criteria:
        parts.append(f"Poziție: {criteria['position']}")
    if "nationality" in criteria:
        parts.append(f"Naționalitate: {criteria['nationality']}")
    if "club" in criteria:
        parts.append(f"Club: {criteria['club']}")
    if "max_age" in criteria:
        parts.append(f"Vârstă maximă: {criteria['max_age']} ani")
    if "min_age" in criteria:
        parts.append(f"Vârstă minimă: {criteria['min_age']} ani")
    if "max_value" in criteria:
        parts.append(f"Valoare maximă: {criteria['max_value']/1_000_000:.1f}M €")
    if "min_value" in criteria:
        parts.append(f"Valoare minimă: {criteria['min_value']/1_000_000:.1f}M €")
    return ", ".join(parts)


MAX_HISTORY_TURNS = 4  # perechi user+assistant păstrate în context

class ScoutAgent:
    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = "llama-3.1-8b-instant"
        self.history = []  # doar mesaje curate (fără blocuri de date DB)
        print("  Incarc indexul jucatorilor pentru cautare rapida...", end=" ", flush=True)
        self._name_index = self._load_name_index()
        print(f"{len(self._name_index):,} jucatori indexati.")

    def _load_name_index(self):
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
                norm_name = _normalize(original_name)
                index[norm_name] = (pid, original_name)
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
        ngrams = _build_ngrams(text, max_n=4)
        found = {}
        for gram in ngrams:
            key = _normalize(gram)
            if key in self._name_index and len(key) > 4:
                pid, pname = self._name_index[key]
                if pid not in found:
                    found[pid] = pname
                if len(found) >= max_players:
                    break
        return list(found.items())

    def _build_data_context(self, players):
        blocks = []
        for pid, _ in players:
            data = get_player_context(pid)
            blocks.append(f"{'='*50}\n{data}")
        return "\n".join(blocks)

    def _build_messages_for_api(self, enriched_user_msg):
        """Construiește lista de mesaje trimisă la Groq: system + ultimele N turns + mesajul curent."""
        recent = self.history[-(MAX_HISTORY_TURNS * 2):]
        return [{"role": "system", "content": SYSTEM_PROMPT}] + recent + [{"role": "user", "content": enriched_user_msg}]

    def ask(self, message):
        try:
            # 1. Încearcă căutarea parametrică
            criteria = _extract_criteria(message)
            if criteria:
                explicit_limit = criteria.pop("limit", None)
                players_found_ui = search_players_by_criteria(**criteria)

                if explicit_limit:
                    criteria["limit"] = explicit_limit

                if players_found_ui:
                    criteria_summary = _format_criteria_summary(criteria)
                    print(f"  [CRITERIA SEARCH] {criteria_summary} → {len(players_found_ui)} jucători")

                    ai_context_players = players_found_ui[:5]
                    player_ids_for_context = [p["id"] for p in ai_context_players]
                    detail_blocks = []
                    for pid in player_ids_for_context:
                        detail_blocks.append(f"{'='*50}\n{get_player_context(pid)}")
                    data_context = "\n".join(detail_blocks)

                    hint = f" (utilizatorul a cerut {explicit_limit})" if explicit_limit else ""
                    enriched = (
                        f"[SEARCH RESULTS — Criterii: {criteria_summary}]\n"
                        f"Am găsit {len(players_found_ui)} jucători în baza de date{hint}. "
                        f"Prezint datele primilor {len(ai_context_players)} pentru analiză:\n\n"
                        f"{data_context}\n\n"
                        f"[ÎNTREBAREA UTILIZATORULUI]\n{message}"
                    )

                    completion = self.client.chat.completions.create(
                        model=self.model,
                        messages=self._build_messages_for_api(enriched),
                        temperature=0.4,
                        max_tokens=800,
                    )
                    response = completion.choices[0].message.content
                    self.history.append({"role": "user", "content": message})
                    self.history.append({"role": "assistant", "content": response})

                    return response, [], players_found_ui[:15]

                else:
                    criteria_summary = _format_criteria_summary(criteria)
                    print(f"  [CRITERIA SEARCH] {criteria_summary} → 0 rezultate")
                    enriched = (
                        f"[SEARCH RESULTS — Criterii: {criteria_summary}]\n"
                        f"Baza de date nu conține jucători care să corespundă acestor criterii.\n\n"
                        f"[ÎNTREBAREA UTILIZATORULUI]\n{message}"
                    )
                    completion = self.client.chat.completions.create(
                        model=self.model,
                        messages=self._build_messages_for_api(enriched),
                        temperature=0.4,
                        max_tokens=400,
                    )
                    response = completion.choices[0].message.content
                    self.history.append({"role": "user", "content": message})
                    self.history.append({"role": "assistant", "content": response})
                    return response, [], []

            # 2. Căutare clasică după nume de jucători menționați explicit
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

            completion = self.client.chat.completions.create(
                model=self.model,
                messages=self._build_messages_for_api(enriched),
                temperature=0.4,
                max_tokens=800,
            )
            response = completion.choices[0].message.content
            self.history.append({"role": "user", "content": message})
            self.history.append({"role": "assistant", "content": response})

            ai_players = self._find_players_in_message(response)
            all_found = {pid: pname for pid, pname in players_found + ai_players}
            return response, list(all_found.keys()), []

        except Exception as e:
            return f"Error communicating with AI: {e}", [], []
