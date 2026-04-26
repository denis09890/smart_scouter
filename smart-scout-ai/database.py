import sqlite3
import pandas as pd
import os

BASE_PATH = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_PATH, "scoutai.db")
_final_csv = os.path.join(BASE_PATH, "final_csv")
_raw_csv = os.path.join(BASE_PATH, "transfermarkt-datasets")
CSV_FOLDER = _final_csv if os.path.exists(_final_csv) else _raw_csv

_COUNTRY_ISO = {
    "Afghanistan":"AF","Albania":"AL","Algeria":"DZ","Angola":"AO","Argentina":"AR",
    "Armenia":"AM","Australia":"AU","Austria":"AT","Azerbaijan":"AZ","Bahrain":"BH",
    "Bangladesh":"BD","Belgium":"BE","Bolivia":"BO","Bosnia-Herzegovina":"BA","Brazil":"BR",
    "Bulgaria":"BG","Cameroon":"CM","Canada":"CA","Chile":"CL","China":"CN",
    "Colombia":"CO","Congo DR":"CD","Costa Rica":"CR","Croatia":"HR","Cuba":"CU",
    "Cyprus":"CY","Czech Republic":"CZ","Denmark":"DK","DR Congo":"CD","Ecuador":"EC",
    "Egypt":"EG","El Salvador":"SV","England":"GB-ENG","Estonia":"EE","Ethiopia":"ET",
    "Finland":"FI","France":"FR","Gabon":"GA","Georgia":"GE","Germany":"DE",
    "Ghana":"GH","Greece":"GR","Guatemala":"GT","Guinea":"GN","Honduras":"HN",
    "Hungary":"HU","Iceland":"IS","India":"IN","Indonesia":"ID","Iran":"IR",
    "Iraq":"IQ","Ireland":"IE","Israel":"IL","Italy":"IT","Ivory Coast":"CI",
    "Jamaica":"JM","Japan":"JP","Jordan":"JO","Kazakhstan":"KZ","Kenya":"KE",
    "Kosovo":"XK","Latvia":"LV","Lebanon":"LB","Liberia":"LR","Lithuania":"LT",
    "Luxembourg":"LU","Macedonia":"MK","Mali":"ML","Malta":"MT","Mexico":"MX",
    "Moldova":"MD","Montenegro":"ME","Morocco":"MA","Mozambique":"MZ","Netherlands":"NL",
    "New Zealand":"NZ","Nicaragua":"NI","Nigeria":"NG","North Ireland":"GB-NIR",
    "North Macedonia":"MK","Norway":"NO","Pakistan":"PK","Panama":"PA","Paraguay":"PY",
    "Peru":"PE","Philippines":"PH","Poland":"PL","Portugal":"PT","Romania":"RO",
    "Russia":"RU","Saudi Arabia":"SA","Scotland":"GB-SCT","Senegal":"SN","Serbia":"RS",
    "Sierra Leone":"SL","Slovakia":"SK","Slovenia":"SI","South Africa":"ZA","South Korea":"KR",
    "Spain":"ES","Sudan":"SD","Sweden":"SE","Switzerland":"CH","Tanzania":"TZ",
    "Thailand":"TH","Togo":"TG","Trinidad and Tobago":"TT","Tunisia":"TN","Turkey":"TR",
    "Uganda":"UG","Ukraine":"UA","United States":"US","Uruguay":"UY","Venezuela":"VE",
    "Vietnam":"VN","Wales":"GB-WLS","Zambia":"ZM","Zimbabwe":"ZW","Cape Verde":"CV",
    "Burkina Faso":"BF","Guinea-Bissau":"GW","Equatorial Guinea":"GQ","Congo":"CG",
    "São Tomé and Príncipe":"ST","Gambia":"GM","Benin":"BJ","Comoros":"KM",
    "Jamaica":"JM","Martinique":"MQ","Guadeloupe":"GP","Puerto Rico":"PR",
    "Dominican Republic":"DO","Haiti":"HT","Curaçao":"CW","Suriname":"SR",
    "Guyana":"GY","Belize":"BZ","Barbados":"BB","Trinidad Tobago":"TT",
    "Syria":"SY","Yemen":"YE","Libya":"LY","Algeria":"DZ","Somalia":"SO",
    "Eritrea":"ER","Djibouti":"DJ","Rwanda":"RW","Burundi":"BI","Madagascar":"MG",
    "Mauritius":"MU","Seychelles":"SC","Namibia":"NA","Botswana":"BW","Lesotho":"LS",
    "Swaziland":"SZ","Malawi":"MW","Mozambique":"MZ","Angola":"AO","Cameroon":"CM",
    "Gabon":"GA","Chad":"TD","Niger":"NE","Mali":"ML","Mauritania":"MR",
    "Kosovo":"XK","Albania":"AL","Montenegro":"ME","North Korea":"KP","Myanmar":"MM",
    "Cambodia":"KH","Laos":"LA","Nepal":"NP","Sri Lanka":"LK","Mongolia":"MN",
}

_POSITION_MAP = {
    "Left Winger": "LW",
    "Right Winger": "RW",
    "Centre-Forward": "CF",
    "Second Striker": "SS",
    "Attacking Midfield": "AM",
    "Central Midfield": "CM",
    "Defensive Midfield": "DM",
    "Left Midfield": "LM",
    "Right Midfield": "RM",
    "Centre-Back": "CB",
    "Left-Back": "LB",
    "Right-Back": "RB",
    "Goalkeeper": "GK",
    "Attack": "FW",
    "Midfield": "MF",
    "Defender": "DEF",
    "Missing": "N/A",
}


import hashlib


def _calc_player_attributes(player_id, position, market_value, goals, assists, matches, yellow_cards):
    """Calculeaza atribute estimate determinist bazate pe statistici reale."""
    h = int(hashlib.sha256(str(player_id).encode()).hexdigest()[:8], 16)
    def rnd(shift, span): return ((h >> shift) % span) - span // 2

    if market_value >= 80_000_000: q = 91 + rnd(0, 7)
    elif market_value >= 30_000_000: q = 83 + rnd(0, 9)
    elif market_value >= 10_000_000: q = 74 + rnd(0, 10)
    elif market_value >= 3_000_000: q = 64 + rnd(0, 11)
    elif market_value >= 500_000: q = 54 + rnd(0, 11)
    else: q = 43 + rnd(0, 13)
    q = max(38, min(97, q))

    gpm = goals / max(matches, 1)
    apm = assists / max(matches, 1)
    pos = (position or "").upper()

    if pos in ("LW", "RW", "FW"):
        a = {"viteza": q+6+rnd(4,6), "dribling": q+4+int(apm*25)+rnd(8,7), "pasare": q-4+int(apm*30)+rnd(12,7), "finalizare": q-2+int(gpm*30)+rnd(16,7), "fizic": q-8+rnd(20,9), "aparare": q-42+rnd(24,9)}
    elif pos in ("CF", "SS", "ST"):
        a = {"viteza": q-2+rnd(4,7), "dribling": q-1+int(gpm*20)+rnd(8,7), "pasare": q-9+int(apm*20)+rnd(12,7), "finalizare": q+9+int(gpm*35)+rnd(16,6), "fizic": q+3+rnd(20,9), "aparare": q-38+rnd(24,9)}
    elif pos == "AM":
        a = {"viteza": q-4+rnd(4,7), "dribling": q+3+int(apm*15)+rnd(8,7), "pasare": q+9+int(apm*30)+rnd(12,6), "finalizare": q-7+int(gpm*25)+rnd(16,7), "fizic": q-5+rnd(20,9), "aparare": q-25+rnd(24,9)}
    elif pos in ("CM", "LM", "RM"):
        a = {"viteza": q-4+rnd(4,7), "dribling": q-2+int(apm*15)+rnd(8,7), "pasare": q+6+int(apm*25)+rnd(12,6), "finalizare": q-12+int(gpm*20)+rnd(16,7), "fizic": q+4+rnd(20,8), "aparare": q-14+rnd(24,9)}
    elif pos == "DM":
        a = {"viteza": q-7+rnd(4,7), "dribling": q-7+rnd(8,7), "pasare": q+4+rnd(12,7), "finalizare": q-24+rnd(16,9), "fizic": q+9+rnd(20,7), "aparare": q+6+rnd(24,7)}
    elif pos in ("CB", "SW", "DEF"):
        a = {"viteza": q-11+rnd(4,9), "dribling": q-18+rnd(8,9), "pasare": q-4+rnd(12,9), "finalizare": q-30+rnd(16,9), "fizic": q+11+rnd(20,7), "aparare": q+13+rnd(24,6)}
    elif pos in ("LB", "RB", "LWB", "RWB"):
        a = {"viteza": q+3+rnd(4,7), "dribling": q-9+rnd(8,9), "pasare": q+1+rnd(12,8), "finalizare": q-22+rnd(16,9), "fizic": q+6+rnd(20,7), "aparare": q+9+rnd(24,7)}
    elif pos == "GK":
        a = {"viteza": q-14+rnd(4,9), "dribling": q-29+rnd(8,11), "pasare": q-2+rnd(12,9), "finalizare": q-48+rnd(16,11), "fizic": q+6+rnd(20,7), "aparare": q+16+rnd(24,5)}
    else:
        a = {"viteza": q+rnd(4,7), "dribling": q+rnd(8,7), "pasare": q+rnd(12,7), "finalizare": q+rnd(16,7), "fizic": q+rnd(20,7), "aparare": q+rnd(24,7)}

    return {k: max(1, min(99, v)) for k, v in a.items()}


def _calc_overall(attrs, position):
    pos = (position or "").upper()
    if pos in ("LW", "RW", "FW"):
        w = {"viteza":2,"dribling":2.5,"pasare":1,"finalizare":3,"fizic":1,"aparare":0.5}
    elif pos in ("CF", "SS", "ST"):
        w = {"viteza":1.5,"dribling":1.5,"pasare":1,"finalizare":3.5,"fizic":1.5,"aparare":0.5}
    elif pos in ("AM", "CM", "LM", "RM"):
        w = {"viteza":1,"dribling":2,"pasare":3,"finalizare":1.5,"fizic":1.5,"aparare":1}
    elif pos == "DM":
        w = {"viteza":1,"dribling":1,"pasare":2,"finalizare":0.5,"fizic":2.5,"aparare":3}
    elif pos in ("CB", "SW", "DEF"):
        w = {"viteza":1,"dribling":0.5,"pasare":1.5,"finalizare":0.5,"fizic":3,"aparare":3.5}
    elif pos in ("LB", "RB", "LWB", "RWB"):
        w = {"viteza":2,"dribling":1,"pasare":2,"finalizare":0.5,"fizic":2,"aparare":2.5}
    elif pos == "GK":
        w = {"viteza":0.5,"dribling":0.3,"pasare":1,"finalizare":0.2,"fizic":2,"aparare":6}
    else:
        w = {k: 1 for k in attrs}
    total = sum(w.values())
    return max(1, min(99, round(sum(attrs[k] * w[k] for k in w) / total)))


def get_player_report_data(player_id):
    """Returneaza toate datele necesare pentru pagina de raport."""
    if not is_db_ready():
        return None
    conn = sqlite3.connect(DB_PATH)
    try:
        player_df = pd.read_sql_query("SELECT * FROM players WHERE player_id = ?", conn, params=(player_id,))
        if player_df.empty:
            conn.close()
            return None
        p = player_df.iloc[0]

        career_df = pd.read_sql_query("""
            SELECT COUNT(*) as matches, COALESCE(SUM(goals),0) as goals,
                   COALESCE(SUM(assists),0) as assists,
                   COALESCE(SUM(yellow_cards),0) as yellow_cards,
                   COALESCE(SUM(red_cards),0) as red_cards,
                   COALESCE(SUM(minutes_played),0) as minutes
            FROM appearances WHERE player_id = ?
        """, conn, params=(player_id,))

        last_df = pd.read_sql_query("""
            SELECT COUNT(*) as matches, COALESCE(SUM(goals),0) as goals,
                   COALESCE(SUM(assists),0) as assists,
                   COALESCE(SUM(yellow_cards),0) as yellow_cards,
                   COALESCE(SUM(red_cards),0) as red_cards,
                   COALESCE(SUM(minutes_played),0) as minutes,
                   strftime('%Y', MAX(date)) as season_year
            FROM appearances
            WHERE player_id = ? AND date >= (
                SELECT date(MAX(date), '-365 days') FROM appearances WHERE player_id = ?
            )
        """, conn, params=(player_id, player_id))

        top_games_df = pd.read_sql_query("""
            SELECT a.date, a.goals, a.assists, a.minutes_played,
                   a.yellow_cards, a.competition_id
            FROM appearances a
            WHERE a.player_id = ? AND (a.goals > 0 OR a.assists > 0)
            ORDER BY (a.goals + a.assists) DESC, a.date DESC
            LIMIT 5
        """, conn, params=(player_id,))

        transfers_df = pd.read_sql_query("""
            SELECT transfer_date, from_club_name, to_club_name,
                   COALESCE(transfer_fee, 0) as transfer_fee
            FROM transfers WHERE player_id = ?
            ORDER BY transfer_date DESC LIMIT 8
        """, conn, params=(player_id,))

        valuations_df = pd.read_sql_query("""
            SELECT date, market_value_in_eur
            FROM player_valuations WHERE player_id = ?
            ORDER BY date ASC
        """, conn, params=(player_id,))

        season_df = pd.read_sql_query("""
            SELECT strftime('%Y', date) AS year,
                   COUNT(*) as matches,
                   COALESCE(SUM(goals),0) as goals,
                   COALESCE(SUM(assists),0) as assists,
                   COALESCE(SUM(minutes_played),0) as minutes,
                   COALESCE(SUM(yellow_cards),0) as yellowCards,
                   COALESCE(SUM(red_cards),0) as redCards
            FROM appearances WHERE player_id = ?
            GROUP BY year ORDER BY year DESC LIMIT 6
        """, conn, params=(player_id,))

    except Exception:
        conn.close()
        return None
    conn.close()

    c = career_df.iloc[0] if not career_df.empty else None
    ls = last_df.iloc[0] if not last_df.empty else None

    nationality = str(p.get("country_of_citizenship", "") or "")
    position = _shorten_position(p.get("sub_position") or p.get("position", ""))
    market_val = float(p.get("market_value_in_eur", 0) or 0)

    try:
        from datetime import date as _date
        dob = str(p.get("date_of_birth", "") or "").split(" ")[0]
        born = pd.to_datetime(dob)
        age = int((_date.today() - born.date()).days / 365.25)
    except Exception:
        age = 0

    top_games = []
    for _, row in top_games_df.iterrows():
        top_games.append({
            "date": str(row["date"])[:10],
            "goals": int(row["goals"]),
            "assists": int(row["assists"]),
            "minutes": int(row["minutes_played"]),
            "yellowCards": int(row["yellow_cards"]),
            "competition": str(row["competition_id"]),
        })

    transfers = []
    for _, row in transfers_df.iterrows():
        fee = float(row["transfer_fee"] or 0)
        transfers.append({
            "date": str(row["transfer_date"] or "")[:10],
            "fromClub": str(row["from_club_name"] or ""),
            "toClub": str(row["to_club_name"] or ""),
            "fee": fee,
            "feeFormatted": _format_value(fee),
        })

    valuations = [
        {"date": str(row["date"] or "")[:7], "value": float(row["market_value_in_eur"] or 0)}
        for _, row in valuations_df.iterrows()
        if row["market_value_in_eur"]
    ]

    season_breakdown = []
    for _, row in season_df.iterrows():
        if not row["year"]:
            continue
        season_breakdown.append({
            "year": str(row["year"]),
            "matches": int(row["matches"]),
            "goals": int(row["goals"]),
            "assists": int(row["assists"]),
            "minutes": int(row["minutes"]),
            "yellowCards": int(row["yellowCards"]),
            "redCards": int(row["redCards"]),
        })

    return {
        "player_id": int(player_id),
        "name": str(p.get("name", "")),
        "position": position,
        "club": str(p.get("current_club_name", "Free Agent") or "Free Agent"),
        "nationality": nationality,
        "countryCode": _COUNTRY_ISO.get(nationality, ""),
        "age": age,
        "height": int(p.get("height_in_cm", 0) or 0),
        "foot": str(p.get("foot", "") or ""),
        "imageUrl": str(p.get("image_url", "") or ""),
        "marketValue": _format_value(market_val),
        "marketValueRaw": market_val,
        "highestValue": _format_value(float(p.get("highest_market_value_in_eur", 0) or 0)),
        "contractExpiration": str(p.get("contract_expiration_date", "") or ""),
        "internationalCaps": int(p.get("international_caps", 0) or 0),
        "lastSeason": int(p.get("last_season", 0) or 0),
        "career": {
            "goals": int(c.goals) if c is not None else 0,
            "assists": int(c.assists) if c is not None else 0,
            "matches": int(c.matches) if c is not None else 0,
            "yellowCards": int(c.yellow_cards) if c is not None else 0,
            "redCards": int(c.red_cards) if c is not None else 0,
            "minutes": int(c.minutes) if c is not None else 0,
        },
        "season": {
            "goals": int(ls.goals) if ls is not None else 0,
            "assists": int(ls.assists) if ls is not None else 0,
            "matches": int(ls.matches) if ls is not None else 0,
            "yellowCards": int(ls.yellow_cards) if ls is not None else 0,
            "redCards": int(ls.red_cards) if ls is not None else 0,
            "minutes": int(ls.minutes) if ls is not None else 0,
            "year": str(ls.season_year) if ls is not None and ls.season_year else "",
        },
        "topGames": top_games,
        "transfers": transfers,
        "valuations": valuations,
        "seasonBreakdown": season_breakdown,
    }


def _shorten_position(pos):
    if not pos or str(pos) in ("nan", "None", ""):
        return "N/A"
    return _POSITION_MAP.get(str(pos).strip(), str(pos)[:3].upper())


def _format_value(val):
    try:
        val = float(val)
    except (TypeError, ValueError):
        return "N/A"
    if val <= 0:
        return "N/A"
    if val >= 1_000_000:
        return f"{val / 1_000_000:.1f}M €"
    if val >= 1_000:
        return f"{val / 1_000:.0f}K €"
    return f"{val:,.0f} €"

# Tabelele din Transfermarkt si ordinea de incarcare
TABLES = [
    "countries",
    "competitions",
    "clubs",
    "players",
    "games",
    "club_games",
    "game_lineups",
    "game_events",
    "appearances",
    "player_valuations",
    "transfers",
    "national_teams",
]


def build_database(force=False):
    """Incarca toate CSV-urile in SQLite. Foloseste force=True pentru rebuild complet."""
    if not os.path.exists(CSV_FOLDER):
        print("Folderul 'final_csv' nu exista. Ruleaza mai intai clean_data.py!")
        return False

    if os.path.exists(DB_PATH) and not force:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
        existing = [r[0] for r in cur.fetchall()]
        conn.close()
        if "players" in existing and "appearances" in existing:
            print("Baza de date exista deja. Foloseste force=True pentru rebuild.")
            return True

    print("=== Construire baza de date SQLite ===")
    conn = sqlite3.connect(DB_PATH)

    for table in TABLES:
        csv_path = os.path.join(CSV_FOLDER, f"{table}.csv")
        if not os.path.exists(csv_path):
            print(f"  Sarit (lipsa): {table}.csv")
            continue
        print(f"  Incarc {table}.csv ...", end=" ", flush=True)
        df = pd.read_csv(csv_path, low_memory=False)
        df.to_sql(table, conn, if_exists="replace", index=False)
        print(f"{len(df):,} randuri")

    print("  Creez indexuri pentru cautare rapida...")
    cur = conn.cursor()
    indexes = [
        "CREATE INDEX IF NOT EXISTS idx_players_name      ON players(name)",
        "CREATE INDEX IF NOT EXISTS idx_players_club       ON players(current_club_id)",
        "CREATE INDEX IF NOT EXISTS idx_appearances_player ON appearances(player_id)",
        "CREATE INDEX IF NOT EXISTS idx_transfers_player   ON transfers(player_id)",
        "CREATE INDEX IF NOT EXISTS idx_valuations_player  ON player_valuations(player_id)",
        "CREATE INDEX IF NOT EXISTS idx_games_id           ON games(game_id)",
        "CREATE INDEX IF NOT EXISTS idx_events_player      ON game_events(player_id)",
        "CREATE INDEX IF NOT EXISTS idx_lineups_player     ON game_lineups(player_id)",
    ]
    for idx in indexes:
        try:
            cur.execute(idx)
        except Exception:
            pass
    conn.commit()
    conn.close()
    print("Baza de date construita cu succes!")
    return True


def is_db_ready():
    if not os.path.exists(DB_PATH):
        return False
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [r[0] for r in cur.fetchall()]
    conn.close()
    return "players" in tables


def search_players_by_name(query, limit=5):
    """Cauta jucatori dupa nume (partial match)."""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        "SELECT player_id, name FROM players WHERE name LIKE ? LIMIT ?",
        (f"%{query}%", limit),
    )
    results = cur.fetchall()
    conn.close()
    return results  # lista de (player_id, name)


def search_players_for_ui(query, limit=10):
    """Cauta jucatori pentru UI si returneaza date formatate pentru flashcard-uri."""
    if not query or not query.strip():
        return []
    if not is_db_ready():
        return []

    conn = sqlite3.connect(DB_PATH)
    # Subquery limitează la N jucători ÎNAINTE de JOIN cu appearances (1.8M rânduri)
    df = pd.read_sql_query(
        """
        SELECT
            p.player_id,
            p.name,
            COALESCE(p.sub_position, p.position, '') AS position,
            COALESCE(p.current_club_name, 'Free Agent') AS club,
            COALESCE(p.country_of_citizenship, '') AS nationality,
            COALESCE(p.market_value_in_eur, 0) AS market_value,
            COALESCE(p.image_url, '') AS image_url,
            COALESCE(p.foot, '') AS foot,
            p.date_of_birth,
            CAST((julianday('now') - julianday(p.date_of_birth)) / 365.25 AS INT) AS age,
            COALESCE(SUM(a.goals), 0) AS goals,
            COALESCE(SUM(a.assists), 0) AS assists,
            COUNT(a.appearance_id) AS matches_played,
            COALESCE(SUM(a.yellow_cards), 0) AS yellow_cards,
            COALESCE(SUM(a.red_cards), 0) AS red_cards,
            COALESCE(SUM(a.minutes_played), 0) AS minutes_played
        FROM (SELECT * FROM players WHERE name LIKE ? LIMIT ?) p
        LEFT JOIN appearances a ON p.player_id = a.player_id
        GROUP BY p.player_id
        """,
        conn,
        params=(f"%{query}%", limit),
    )
    conn.close()

    return _rows_to_players(df)


def _rows_to_players(df, match_score=None):
    """
    Converteste un DataFrame cu coloane standard in lista de dicts pentru UI.
    match_score: dacă e dat (int), îl folosește pentru toți jucătorii;
                 altfel calculează din cotă (pentru bara de search).
    """
    players = []
    for _, row in df.iterrows():
        goals = int(row["goals"]) if row["goals"] else 0
        assists = int(row["assists"]) if row["assists"] else 0
        matches = int(row["matches_played"]) if row["matches_played"] else 0
        market_val = float(row["market_value"]) if row["market_value"] else 0

        if match_score is not None:
            score = match_score
        elif market_val >= 50_000_000:
            score = 96
        elif market_val >= 10_000_000:
            score = 89
        elif market_val >= 1_000_000:
            score = 80
        else:
            score = 72

        foot_val = str(row["foot"]).lower().strip()
        if foot_val not in ("left", "right", "both"):
            foot_val = "right"

        age_val = int(row["age"]) if row["age"] and str(row["age"]) != "nan" else 0
        nationality = str(row["nationality"]) if row["nationality"] and str(row["nationality"]) != "nan" else ""

        players.append({
            "id": int(row["player_id"]),
            "name": str(row["name"]).upper(),
            "position": _shorten_position(row["position"]),
            "club": str(row["club"]).upper(),
            "nationality": nationality,
            "countryCode": _COUNTRY_ISO.get(nationality, ""),
            "value": _format_value(market_val),
            "valNum": int(market_val),
            "foot": foot_val,
            "imageUrl": f"http://localhost:8000/player-image/{int(row['player_id'])}",
            "age": age_val,
            "goals": goals,
            "assists": assists,
            "matchesPlayed": matches,
            "yellowCards": int(row["yellow_cards"]) if row.get("yellow_cards") else 0,
            "redCards": int(row["red_cards"]) if row.get("red_cards") else 0,
            "minutesPlayed": int(row["minutes_played"]) if row.get("minutes_played") else 0,
            "height": int(row["height_cm"]) if row.get("height_cm") else 0,
            "match": score,
        })
    return players


def search_players_by_criteria(
    position=None,
    nationality=None,
    club=None,
    max_age=None,
    min_age=None,
    max_value=None,
    min_value=None,
):
    """
    Caută jucători care îndeplinesc TOATE criteriile date (filtrare strictă).
    Calculează match% per jucător pe baza câtor criterii opționale îndeplinește.
    Returnează lista sortată descrescător după match%, fără limită de rezultate.

    Logica match%:
    - Criteriile hard (poziție, naționalitate, club) sunt obligatorii — jucătorul apare
      DOAR dacă le îndeplinește pe toate. Dacă le îndeplinește pe toate → 100% pentru ele.
    - Criteriile range (vârstă, valoare) sunt opționale în sens de scoring:
      un jucător care le îndeplinește pe toate primește 100%.
    - Formula: match = round(criterii_indeplinite / total_criterii * 100)
    """
    if not is_db_ready():
        return []

    # ── Rezolvă poziția la valoarea exactă din DB ──────────────────────────
    # sub_position e câmpul granular (ex: "Centre-Back")
    # position e categoria mare (ex: "Defender")
    # Categoriiile mari din DB:
    MAIN_POSITIONS = {"Defender", "Midfield", "Attack", "Goalkeeper", "Missing"}

    pos_filter_sub = None    # potrivire exactă pe sub_position
    pos_filter_main = None   # potrivire exactă pe position (categorie mare)

    if position:
        if position in MAIN_POSITIONS:
            pos_filter_main = position
        else:
            pos_filter_sub = position   # ex: "Centre-Back", "Left-Back", etc.

    # ── Construiește WHERE strict (AND între toate criteriile) ─────────────
    conditions = []
    params = []

    if pos_filter_sub:
        # Potrivire exactă pe sub_position (case-insensitive)
        conditions.append("LOWER(sub_position) = LOWER(?)")
        params.append(pos_filter_sub)
    elif pos_filter_main:
        conditions.append("LOWER(position) = LOWER(?)")
        params.append(pos_filter_main)

    if nationality:
        # Potrivire exactă pe naționalitate
        conditions.append("LOWER(country_of_citizenship) = LOWER(?)")
        params.append(nationality)

    if club:
        # Club: potrivire parțială (numele clubului poate varia)
        conditions.append("LOWER(current_club_name) LIKE LOWER(?)")
        params.append(f"%{club}%")

    if max_age is not None:
        conditions.append(
            "CAST((julianday('now') - julianday(date_of_birth)) / 365.25 AS INT) <= ?"
        )
        params.append(max_age)

    if min_age is not None:
        conditions.append(
            "CAST((julianday('now') - julianday(date_of_birth)) / 365.25 AS INT) >= ?"
        )
        params.append(min_age)

    if max_value is not None:
        conditions.append("COALESCE(market_value_in_eur, 0) <= ?")
        params.append(max_value)

    if min_value is not None:
        conditions.append("COALESCE(market_value_in_eur, 0) >= ?")
        params.append(min_value)

    where_clause = ("WHERE " + " AND ".join(conditions)) if conditions else ""

    # Numărul total de criterii active (pentru calculul match%)
    total_criteria = sum([
        position is not None,
        nationality is not None,
        club is not None,
        max_age is not None,
        min_age is not None,
        max_value is not None,
        min_value is not None,
    ])

    query = f"""
        SELECT
            p.player_id,
            p.name,
            COALESCE(p.sub_position, p.position, '') AS position,
            COALESCE(p.current_club_name, 'Free Agent') AS club,
            COALESCE(p.country_of_citizenship, '') AS nationality,
            COALESCE(p.market_value_in_eur, 0) AS market_value,
            COALESCE(p.image_url, '') AS image_url,
            COALESCE(p.foot, '') AS foot,
            p.date_of_birth,
            CAST((julianday('now') - julianday(p.date_of_birth)) / 365.25 AS INT) AS age,
            COALESCE(p.height_in_cm, 0) AS height_cm,
            COALESCE(SUM(a.goals), 0) AS goals,
            COALESCE(SUM(a.assists), 0) AS assists,
            COUNT(a.appearance_id) AS matches_played,
            COALESCE(SUM(a.yellow_cards), 0) AS yellow_cards,
            COALESCE(SUM(a.red_cards), 0) AS red_cards,
            COALESCE(SUM(a.minutes_played), 0) AS minutes_played
        FROM (
            SELECT * FROM players
            {where_clause}
            ORDER BY COALESCE(market_value_in_eur, 0) DESC
        ) p
        LEFT JOIN appearances a ON p.player_id = a.player_id
        GROUP BY p.player_id
        ORDER BY market_value DESC
    """

    conn = sqlite3.connect(DB_PATH)
    try:
        df = pd.read_sql_query(query, conn, params=params)
    except Exception as e:
        conn.close()
        print(f"[criteria search] eroare: {e}")
        return []
    conn.close()

    players = _rows_to_players(df)

    # ── Calculează match% pentru fiecare jucător ───────────────────────────
    # Toți jucătorii din listă au trecut filtrele hard (poziție, naționalitate, club exacte).
    # match% = câte criterii îndeplinește / total criterii * 100
    # Criteriile range (vârstă, valoare) pot fi îndeplinite parțial în sensul că
    # un jucător care satisface TOATE criteriile primește 100%.
    # Deoarece filtrarea e strictă (WHERE AND), toți jucătorii din listă îndeplinesc
    # toate criteriile → toți primesc 100% dacă avem un singur criteriu sau mai multe.
    # Dar dacă utilizatorul a cerut N criterii și jucătorul le îndeplinește pe toate → 100%.
    for p in players:
        p["match"] = 100

    # Sortare descrescătoare după match% (toți 100 în cazul filtrării stricte),
    # secundar după valoare de piață
    players.sort(key=lambda x: (x["match"], x["valNum"]), reverse=True)

    return players


def get_players_ui_by_ids(player_ids):
    """Returneaza date formatate pentru UI pentru o lista de player_id-uri."""
    if not player_ids or not is_db_ready():
        return []
    ids = list(player_ids)[:6]
    placeholders = ",".join("?" * len(ids))
    conn = sqlite3.connect(DB_PATH)
    try:
        df = pd.read_sql_query(
            f"""
            SELECT
                p.player_id,
                p.name,
                COALESCE(p.sub_position, p.position, '') AS position,
                COALESCE(p.current_club_name, 'Free Agent') AS club,
                COALESCE(p.country_of_citizenship, '') AS nationality,
                COALESCE(p.market_value_in_eur, 0) AS market_value,
                COALESCE(p.image_url, '') AS image_url,
                COALESCE(p.foot, '') AS foot,
                p.date_of_birth,
                CAST((julianday('now') - julianday(p.date_of_birth)) / 365.25 AS INT) AS age,
                COALESCE(p.height_in_cm, 0) AS height_cm,
                COALESCE(SUM(a.goals), 0) AS goals,
                COALESCE(SUM(a.assists), 0) AS assists,
                COUNT(a.appearance_id) AS matches_played,
                COALESCE(SUM(a.yellow_cards), 0) AS yellow_cards,
                COALESCE(SUM(a.red_cards), 0) AS red_cards,
                COALESCE(SUM(a.minutes_played), 0) AS minutes_played
            FROM (SELECT * FROM players WHERE player_id IN ({placeholders})) p
            LEFT JOIN appearances a ON p.player_id = a.player_id
            GROUP BY p.player_id
            """,
            conn,
            params=ids,
        )
    except Exception:
        conn.close()
        return []
    conn.close()
    return _rows_to_players(df)


def get_player_context(player_id):
    """Returneaza date esentiale despre un jucator ca text compact pentru AI."""
    conn = sqlite3.connect(DB_PATH)

    player_df = pd.read_sql_query(
        "SELECT name, position, sub_position, date_of_birth, country_of_citizenship, "
        "height_in_cm, foot, current_club_name, market_value_in_eur, highest_market_value_in_eur "
        "FROM players WHERE player_id = ?", conn, params=(player_id,)
    )

    stats_df = pd.read_sql_query(
        "SELECT COUNT(*) AS meciuri, SUM(goals) AS goluri, SUM(assists) AS asisturi, "
        "ROUND(AVG(minutes_played),0) AS min_per_meci, SUM(yellow_cards) AS galbene, SUM(red_cards) AS rosii "
        "FROM appearances WHERE player_id = ?",
        conn, params=(player_id,),
    )

    season_df = pd.read_sql_query(
        "SELECT strftime('%Y',date) AS an, COUNT(*) AS m, SUM(goals) AS g, SUM(assists) AS a "
        "FROM appearances WHERE player_id = ? GROUP BY an ORDER BY an DESC LIMIT 3",
        conn, params=(player_id,),
    )

    conn.close()

    if player_df.empty:
        return f"Jucătorul {player_id} nu există în baza de date."

    row = player_df.iloc[0]
    profile = (
        f"{row['name']} | {row.get('sub_position') or row.get('position','?')} | "
        f"{row.get('country_of_citizenship','?')} | {row.get('current_club_name','?')} | "
        f"Valoare: {_format_value(float(row.get('market_value_in_eur') or 0))} | "
        f"Picior: {row.get('foot','?')} | Înălțime: {row.get('height_in_cm','?')}cm"
    )

    parts = [profile]

    if not stats_df.empty and stats_df.iloc[0]["meciuri"]:
        s = stats_df.iloc[0]
        parts.append(
            f"Carieră: {int(s['meciuri'])}mc {int(s['goluri'] or 0)}g {int(s['asisturi'] or 0)}a "
            f"{int(s['min_per_meci'] or 0)}min/mc {int(s['galbene'] or 0)}gal {int(s['rosii'] or 0)}ros"
        )

    if not season_df.empty:
        rows = [f"{r['an']}:{r['m']}mc/{r['g']}g/{r['a']}a" for _, r in season_df.iterrows()]
        parts.append("Sezoane: " + " | ".join(rows))

    return " | ".join(parts)


if __name__ == "__main__":
    build_database(force=True)