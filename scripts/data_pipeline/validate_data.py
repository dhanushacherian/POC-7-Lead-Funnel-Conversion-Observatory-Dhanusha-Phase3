from pathlib import Path
import csv
import json
from datetime import datetime


PROJECT_ROOT = Path(__file__).resolve().parents[2]

CANONICAL_FILE = PROJECT_ROOT / "data" / "canonical" / "intelligence_data.csv"
SCHEMA_FILE = PROJECT_ROOT / "data" / "schema.json"
MANIFEST_FILE = PROJECT_ROOT / "data" / "manifest.json"
REPORT_FILE = PROJECT_ROOT / "data" / "quality" / "validation_report.json"

MAX_ROWS = 10000
MAX_COLUMNS = 50
MAX_TEXT_LENGTH = 500

EXPECTED_COLUMNS = [
    "record_id",
    "record_type",
    "observed_at",
    "entity_id",
    "related_entity_id",
    "entity_name",
    "category",
    "subcategory",
    "status",
    "stage",
    "metric_name",
    "metric_value",
    "metric_unit",
    "text_value",
    "latitude",
    "longitude",
    "source_name",
    "source_record_id",
    "is_synthetic",
    "data_version",
]

NUMERIC_COLUMNS = {
    "metric_value",
    "latitude",
    "longitude",
}

BOOLEAN_COLUMNS = {
    "is_synthetic",
}


def fail(message):
    raise ValueError(message)


def validate_date(value):
    if not value:
        return

    try:
        datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        fail(f"Invalid observed_at value: {value}")


def validate_numeric(value, column_name):
    if not value:
        return

    try:
        float(value)
    except ValueError:
        fail(
            f"Invalid numeric value in {column_name}: {value}"
        )


def validate_boolean(value):
    if value not in {"true", "false", ""}:
        fail(
            f"Invalid boolean value for is_synthetic: {value}"
        )


def main():

    errors = []
    warnings = []

    required_files = [
        CANONICAL_FILE,
        SCHEMA_FILE,
        MANIFEST_FILE,
    ]

    for file_path in required_files:
        if not file_path.exists():
            errors.append(
                f"Missing required file: {file_path.relative_to(PROJECT_ROOT)}"
            )

    if errors:
        write_report(errors, warnings, 0, 0)
        fail("\n".join(errors))

    with CANONICAL_FILE.open(
        "r",
        newline="",
        encoding="utf-8",
    ) as file:

        reader = csv.DictReader(file)

        actual_columns = reader.fieldnames or []

        if actual_columns != EXPECTED_COLUMNS:
            errors.append(
                "Canonical column order does not match the required schema."
            )

        rows = list(reader)

    row_count = len(rows)
    column_count = len(actual_columns)

    if row_count > MAX_ROWS:
        errors.append(
            f"Row limit exceeded: {row_count} > {MAX_ROWS}"
        )

    if column_count > MAX_COLUMNS:
        errors.append(
            f"Column limit exceeded: {column_count} > {MAX_COLUMNS}"
        )

    record_ids = []

    for index, row in enumerate(rows, start=2):

        record_id = row.get("record_id", "")

        if not record_id:
            errors.append(
                f"Empty record_id at CSV row {index}"
            )
        else:
            record_ids.append(record_id)

        validate_date(row.get("observed_at", ""))

        for column_name in NUMERIC_COLUMNS:
            validate_numeric(
                row.get(column_name, ""),
                column_name,
            )

        validate_boolean(
            row.get("is_synthetic", "")
        )

        text_value = row.get("text_value", "")

        if len(text_value) > MAX_TEXT_LENGTH:
            errors.append(
                f"text_value exceeds {MAX_TEXT_LENGTH} characters "
                f"at CSV row {index}"
            )

        if not row.get("source_name", ""):
            errors.append(
                f"Missing source_name at CSV row {index}"
            )

        if not row.get("data_version", ""):
            errors.append(
                f"Missing data_version at CSV row {index}"
            )

    if len(record_ids) != len(set(record_ids)):
        errors.append(
            "Duplicate record_id values detected."
        )

    with SCHEMA_FILE.open(
        "r",
        encoding="utf-8",
    ) as file:

        schema = json.load(file)

    schema_columns = [
        item["name"]
        for item in schema["columns"]
    ]

    if schema_columns != EXPECTED_COLUMNS:
        errors.append(
            "schema.json column definition does not match "
            "the required canonical column order."
        )

    with MANIFEST_FILE.open(
        "r",
        encoding="utf-8",
    ) as file:

        manifest = json.load(file)

    manifest_count = manifest["canonical"]["record_count"]

    if manifest_count != row_count:
        errors.append(
            "Manifest canonical record count does not match "
            f"the CSV: {manifest_count} != {row_count}"
        )

    manifest_columns = manifest["canonical"]["column_count"]

    if manifest_columns != column_count:
        errors.append(
            "Manifest canonical column count does not match "
            f"the CSV: {manifest_columns} != {column_count}"
        )

    if not manifest.get("data_version"):
        errors.append(
            "Manifest data_version is missing."
        )

    if not all(
        row.get("is_synthetic", "") in {"true", "false"}
        for row in rows
    ):
        warnings.append(
            "is_synthetic is not fully populated with confirmed "
            "boolean provenance values."
        )

    write_report(
        errors,
        warnings,
        row_count,
        column_count,
    )

    if errors:
        print("VALIDATION FAILED")
        for error in errors:
            print(f"- {error}")
        raise SystemExit(1)

    print("VALIDATION PASSED")
    print(f"Canonical records: {row_count}")
    print(f"Canonical columns: {column_count}")

    if warnings:
        print("Warnings:")
        for warning in warnings:
            print(f"- {warning}")


def write_report(errors, warnings, row_count, column_count):

    REPORT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    report = {
        "validation_version": "phase3-v1",
        "status": "PASSED" if not errors else "FAILED",
        "canonical_record_count": row_count,
        "canonical_column_count": column_count,
        "errors": errors,
        "warnings": warnings,
    }

    with REPORT_FILE.open(
        "w",
        encoding="utf-8",
    ) as file:

        json.dump(
            report,
            file,
            indent=2,
        )


if __name__ == "__main__":
    main()