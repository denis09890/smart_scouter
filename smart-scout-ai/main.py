import os
import sys
from clean_data import extract_all_csvs
from database import build_database, is_db_ready
from scout_agent import ScoutAgent


def clear_screen():
    os.system("cls" if os.name == "nt" else "clear")


def setup_if_needed():
    """Extrage CSV-urile si construieste DB-ul daca nu exista."""
    if not is_db_ready():
        print("Prima pornire - pregatesc baza de date...\n")
        print("Pasul 1: Extrag fisierele CSV.GZ...")
        result = extract_all_csvs()
        if not result:
            print("EROARE: Nu am putut extrage fisierele. Verifica folderul 'transfermarkt-datasets'.")
            sys.exit(1)
        print("\nPasul 2: Construiesc baza de date SQLite...")
        ok = build_database()
        if not ok:
            print("EROARE: Nu am putut construi baza de date.")
            sys.exit(1)
        print()


def main():
    clear_screen()
    print("=" * 55)
    print("        SCOUT AI - Expert Global in Fotbal")
    print("        Powered by Transfermarkt + Groq AI")
    print("=" * 55)

    setup_if_needed()

    print("Initializez agentul AI...")
    try:
        agent = ScoutAgent()
    except Exception as e:
        print(f"Eroare la pornire: {e}")
        sys.exit(1)

    print("\nSistemul este online. Poti intreba despre orice jucator.")
    print("Scrie 'iesire' pentru a inchide.\n")
    print("-" * 55)

    while True:
        try:
            user_input = input("Tu: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nLa revedere!")
            break

        if not user_input:
            continue

        if user_input.lower() in ("iesire", "exit", "quit"):
            print("\nLa revedere!")
            break

        raspuns = agent.ask(user_input)
        print()
        print(f"Scout AI: {raspuns}")
        print("-" * 55)


if __name__ == "__main__":
    main()
