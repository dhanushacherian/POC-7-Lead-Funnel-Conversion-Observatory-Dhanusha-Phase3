from pathlib import Path
import csv
import json


PROJECT_ROOT = Path(__file__).resolve().parents[2]

CANONICAL_FILE = (
    PROJECT_ROOT
    / "data"
    / "canonical"
    / "intelligence_data.csv"
)

PUBLISHED_FILE = (
    PROJECT_ROOT
    / "data"
    / "published"
    / "intelligence_data.json"
)


def main():
    if not CANONICAL_FILE.exists():
        raise FileNotFoundError(
            f"Canonical dataset not found: {CANONICAL_FILE}"
        )

    PUBLISHED_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    with CANONICAL_FILE.open(
        "r",
        newline="",
        encoding="utf-8",
    ) as file:
        reader = csv.DictReader(file)
        rows = list(reader)

    with PUBLISHED_FILE.open(
        "w",
        encoding="utf-8",
    ) as file:
        json.dump(
            rows,
            file,
            indent=2,
            ensure_ascii=False,
        )

    print("Published JSON generated successfully.")
    print(f"Records published: {len(rows)}")
    print(f"Output: {PUBLISHED_FILE}")


if __name__ == "__main__":
    main()