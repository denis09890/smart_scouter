import os
import gzip
import shutil

BASE_PATH = os.path.dirname(os.path.abspath(__file__))
SOURCE_FOLDER = os.path.join(BASE_PATH, "transfermarkt-datasets")
OUTPUT_FOLDER = os.path.join(BASE_PATH, "final_csv")


def extract_all_csvs():
    if not os.path.exists(SOURCE_FOLDER):
        print(f"EROARE: Folderul '{SOURCE_FOLDER}' nu exista!")
        return None

    os.makedirs(OUTPUT_FOLDER, exist_ok=True)

    gz_files = [f for f in os.listdir(SOURCE_FOLDER) if f.endswith(".csv.gz")]
    if not gz_files:
        print("Nu s-au gasit fisiere .csv.gz in folderul surs.")
        return OUTPUT_FOLDER

    extracted = []
    skipped = []

    for file_name in sorted(gz_files):
        csv_name = file_name[:-3]  # scoatem .gz
        output_path = os.path.join(OUTPUT_FOLDER, csv_name)

        if os.path.exists(output_path):
            skipped.append(csv_name)
            continue

        gz_path = os.path.join(SOURCE_FOLDER, file_name)
        print(f"  Extrag: {file_name} -> final_csv/{csv_name}")
        with gzip.open(gz_path, "rb") as f_in, open(output_path, "wb") as f_out:
            shutil.copyfileobj(f_in, f_out)
        extracted.append(csv_name)

    if skipped:
        print(f"  Deja extrase ({len(skipped)}): {', '.join(skipped)}")
    print(f"\nGATA! {len(extracted)} fisiere noi extrase in 'final_csv/'")
    return OUTPUT_FOLDER


if __name__ == "__main__":
    print("=== Extragere CSV.GZ -> final_csv/ ===")
    result = extract_all_csvs()
    if result:
        print(f"Folderul cu date: {result}")
        print("\nUrmatorul pas: ruleaza 'python database.py' pentru a construi baza de date.")
