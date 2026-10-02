from pathlib import Path
import csv


PROJECT_ROOT = Path(__file__).resolve().parents[2]

SOURCE_FILE = (
    PROJECT_ROOT
    / "data"
    / "source-sample"
    / "source_sample.csv"
)

OUTPUT_FILE = (
    PROJECT_ROOT
    / "data"
    / "canonical"
    / "intelligence_data.csv"
)

CANONICAL_COLUMNS = [
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


def create_lead_record(row):
    """Create the canonical lead-value record."""

    return {
        "record_id": row["id"],
        "record_type": "crm_lead",
        "observed_at": row["date"],
        "entity_id": row["id"],
        "related_entity_id": "",
        "entity_name": "",
        "category": row["product"],
        "subcategory": row["source"],
        "status": row["stage"],
        "stage": row["stage"],
        "metric_name": "lead_value",
        "metric_value": row["value"],
        "metric_unit": "currency_unspecified",
        "text_value": (
            f"location={row['location']};team={row['team']}"
        ),
        "latitude": "",
        "longitude": "",
        "source_name": "phase2_crmData",
        "source_record_id": row["id"],
        "is_synthetic": "",
        "data_version": "phase3-v1",
    }


def create_days_in_stage_record(row):
    """Create a canonical metric record for days spent in stage."""

    return {
        "record_id": f"{row['id']}_days_in_stage",
        "record_type": "crm_lead_metric",
        "observed_at": row["date"],
        "entity_id": row["id"],
        "related_entity_id": "",
        "entity_name": "",
        "category": row["product"],
        "subcategory": row["source"],
        "status": row["stage"],
        "stage": row["stage"],
        "metric_name": "days_in_stage",
        "metric_value": row["daysInStage"],
        "metric_unit": "days",
        "text_value": (
            f"location={row['location']};team={row['team']}"
        ),
        "latitude": "",
        "longitude": "",
        "source_name": "phase2_crmData",
        "source_record_id": row["id"],
        "is_synthetic": "",
        "data_version": "phase3-v1",
    }


def main():
    if not SOURCE_FILE.exists():
        raise FileNotFoundError(
            f"Source file not found: {SOURCE_FILE}"
        )

    with SOURCE_FILE.open(
        "r",
        newline="",
        encoding="utf-8",
    ) as file:
        reader = csv.DictReader(file)
        source_rows = list(reader)

    if not source_rows:
        raise RuntimeError(
            "Source CSV contains no records."
        )

    canonical_rows = []

    for row in source_rows:
        canonical_rows.append(
            create_lead_record(row)
        )

        canonical_rows.append(
            create_days_in_stage_record(row)
        )

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
            fieldnames=CANONICAL_COLUMNS,
        )

        writer.writeheader()
        writer.writerows(canonical_rows)

    print(
        f"Source records processed: {len(source_rows)}"
    )
    print(
        f"Canonical records created: {len(canonical_rows)}"
    )
    print(
        f"Canonical columns: {len(CANONICAL_COLUMNS)}"
    )
    print(
        f"Output: {OUTPUT_FILE}"
    )


if __name__ == "__main__":
    main()