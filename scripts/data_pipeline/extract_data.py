from pathlib import Path
import csv
import re


PROJECT_ROOT = Path(__file__).resolve().parents[2]

SOURCE_FILE = PROJECT_ROOT / "src" / "data" / "crmData.ts"
OUTPUT_FILE = PROJECT_ROOT / "data" / "source-sample" / "source_sample.csv"


EXPECTED_COLUMNS = [
    "id",
    "date",
    "location",
    "team",
    "product",
    "source",
    "stage",
    "daysInStage",
    "value",
]


def extract_records():
    text = SOURCE_FILE.read_text(encoding="utf-8")

    match = re.search(
        r"export\s+const\s+crmData:\s*CRMLead\[\]\s*=\s*\[(.*?)\];",
        text,
        re.DOTALL,
    )

    if not match:
        raise RuntimeError("Could not find crmData array in crmData.ts")

    data_block = match.group(1)

    objects = re.findall(
        r"\{(.*?)\}",
        data_block,
        re.DOTALL,
    )

    records = []

    for obj in objects:
        record = {}

        for column in EXPECTED_COLUMNS:
            match_field = re.search(
                rf'\b{re.escape(column)}:\s*(?:"([^"]*)"|([0-9]+(?:\.[0-9]+)?))',
                obj,
            )

            if not match_field:
                raise RuntimeError(
                    f"Could not extract field '{column}' from record:\n{obj}"
                )

            text_value = match_field.group(1)
            numeric_value = match_field.group(2)

            if text_value is not None:
                record[column] = text_value
            else:
                record[column] = numeric_value

        records.append(record)

    return records


def main():
    records = extract_records()

    if not records:
        raise RuntimeError("No CRM records were extracted.")

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    with OUTPUT_FILE.open(
        "w",
        newline="",
        encoding="utf-8",
    ) as file:
        writer = csv.DictWriter(
            file,
            fieldnames=EXPECTED_COLUMNS,
        )

        writer.writeheader()
        writer.writerows(records)

    print(f"Extracted records: {len(records)}")
    print(f"Columns: {len(EXPECTED_COLUMNS)}")
    print(f"Output: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()