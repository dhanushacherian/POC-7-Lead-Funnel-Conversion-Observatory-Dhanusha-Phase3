from pathlib import Path
import csv


PROJECT_ROOT = Path(__file__).resolve().parents[2]

SOURCE_FILE = (
    PROJECT_ROOT
    / "data"
    / "source-sample"
    / "source_sample.csv"
)


def main():
    if not SOURCE_FILE.exists():
        raise FileNotFoundError(
            f"Source sample not found: {SOURCE_FILE}"
        )

    with SOURCE_FILE.open(
        "r",
        newline="",
        encoding="utf-8",
    ) as file:
        rows = list(csv.DictReader(file))

    # The source contains only 30 records, which is already
    # below the Phase 3 row limit.
    # Therefore, all source records are retained.
    print("Sampling decision: RETAIN ALL SOURCE RECORDS")
    print(f"Records retained: {len(rows)}")
    print(f"Source sample: {SOURCE_FILE}")


if __name__ == "__main__":
    main()