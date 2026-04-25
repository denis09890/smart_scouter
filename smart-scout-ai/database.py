import sqlite3
import pandas as pd
import os

BASE_PATH = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_PATH, "scoutai.db")
CSV_FOLDER = os.path.join(BASE_PATH, "final_csv")

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


def get_player_context(player_id):
    """Returneaza toate datele relevante despre un jucator ca text formatat."""
    conn = sqlite3.connect(DB_PATH)

    # Profil de baza
    player_df = pd.read_sql_query(
        "SELECT * FROM players WHERE player_id = ?", conn, params=(player_id,)
    )

    # Statistici totale cariera
    stats_df = pd.read_sql_query(
        """
        SELECT
            COUNT(*)           AS meciuri_totale,
            SUM(goals)         AS goluri_totale,
            SUM(assists)       AS pase_decisive,
            SUM(minutes_played)AS minute_jucate,
            SUM(yellow_cards)  AS cartonase_galbene,
            SUM(red_cards)     AS cartonase_rosii
        FROM appearances WHERE player_id = ?
        """,
        conn,
        params=(player_id,),
    )

    # Statistici pe sezon (ultimele 5 sezoane)
    season_df = pd.read_sql_query(
        """
        SELECT
            strftime('%Y', date) AS an,
            COUNT(*)             AS meciuri,
            SUM(goals)           AS goluri,
            SUM(assists)         AS pase_decisive,
            SUM(minutes_played)  AS minute
        FROM appearances
        WHERE player_id = ?
        GROUP BY an
        ORDER BY an DESC
        LIMIT 5
        """,
        conn,
        params=(player_id,),
    )

    # Istoric transferuri
    transfers_df = pd.read_sql_query(
        """
        SELECT transfer_date, from_club_name, to_club_name, transfer_fee
        FROM transfers WHERE player_id = ?
        ORDER BY transfer_date DESC LIMIT 10
        """,
        conn,
        params=(player_id,),
    )

    # Evolutie valoare de piata (ultimele 6 intrari)
    valuation_df = pd.read_sql_query(
        """
        SELECT date, market_value_in_eur
        FROM player_valuations WHERE player_id = ?
        ORDER BY date DESC LIMIT 6
        """,
        conn,
        params=(player_id,),
    )

    conn.close()

    parts = []

    if not player_df.empty:
        row = player_df.iloc[0]
        fields = {
            "Nume": row.get("name"),
            "Pozitie": row.get("position") or row.get("last_position"),
            "Sub-pozitie": row.get("sub_position"),
            "Data nasterii": row.get("date_of_birth"),
            "Nationalitate": row.get("country_of_citizenship") or row.get("nationality"),
            "Tara nasterii": row.get("country_of_birth"),
            "Inaltime (cm)": row.get("height_in_cm"),
            "Picior preferat": row.get("foot"),
            "Club curent": row.get("current_club_name"),
            "Valoare piata (EUR)": row.get("market_value_in_eur"),
            "Valoare maxima (EUR)": row.get("highest_market_value_in_eur"),
            "Ultima stagiune": row.get("last_season"),
        }
        lines = [f"  {k}: {v}" for k, v in fields.items() if v and str(v) != "nan"]
        parts.append("PROFIL JUCATOR:\n" + "\n".join(lines))

    if not stats_df.empty and stats_df.iloc[0]["meciuri_totale"]:
        parts.append("STATISTICI CARIERA TOTALA:\n" + stats_df.to_string(index=False))

    if not season_df.empty:
        parts.append("STATISTICI PE AN (ultimii 5 ani):\n" + season_df.to_string(index=False))

    if not transfers_df.empty:
        parts.append("ISTORIC TRANSFERURI:\n" + transfers_df.to_string(index=False))

    if not valuation_df.empty:
        parts.append("EVOLUTIE VALOARE DE PIATA:\n" + valuation_df.to_string(index=False))

    return "\n\n".join(parts) if parts else f"Date limitate disponibile pentru player_id={player_id}"


if __name__ == "__main__":
    build_database(force=True)
