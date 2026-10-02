from pathlib import Path
import csv
import json
import math
from datetime import datetime


PROJECT_ROOT = Path(__file__).resolve().parents[2]

CANONICAL_FILE = (
    PROJECT_ROOT
    / "data"
    / "canonical"
    / "intelligence_data.csv"
)

SOURCE_SAMPLE_FILE = (
    PROJECT_ROOT
    / "data"
    / "source-sample"
    / "source_sample.csv"
)

OUTPUT_FILE = (
    PROJECT_ROOT
    / "data-science"
    / "outputs"
    / "quality_assessment.json"
)

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

NUMERIC_FIELDS = {
    "metric_value",
    "latitude",
    "longitude",
}

REQUIRED_NON_NULL_FIELDS = {
    "record_id",
    "record_type",
    "source_name",
    "is_synthetic",
    "data_version",
}


def clean(value):
    if value is None:
        return ""
    return str(value).strip()


def is_missing(value):
    return clean(value) == ""


def parse_number(value):
    value = clean(value)

    if not value:
        return None

    try:
        number = float(value)

        if math.isfinite(number):
            return number

    except (TypeError, ValueError):
        pass

    return None


def parse_date(value):
    value = clean(value)

    if not value:
        return None

    try:
        return datetime.fromisoformat(
            value.replace("Z", "+00:00")
        )
    except ValueError:
        return None


def distribution(rows, field):
    counts = {}

    for row in rows:
        value = clean(row.get(field, ""))

        if not value:
            value = "<missing>"

        counts[value] = counts.get(value, 0) + 1

    return dict(
        sorted(
            counts.items(),
            key=lambda item: (-item[1], item[0])
        )
    )


def add_issue(
    issues,
    severity,
    field,
    issue,
    evidence=None,
):
    item = {
        "severity": severity,
        "field": field,
        "issue": issue,
    }

    if evidence is not None:
        item["evidence"] = evidence

    issues.append(item)


def main():

    if not CANONICAL_FILE.exists():
        raise FileNotFoundError(
            f"Canonical dataset not found: {CANONICAL_FILE}"
        )

    with CANONICAL_FILE.open(
        "r",
        newline="",
        encoding="utf-8",
    ) as file:

        reader = csv.DictReader(file)
        rows = list(reader)
        actual_columns = reader.fieldnames or []

    issues = []
    warnings = []

    row_count = len(rows)
    column_count = len(actual_columns)
    file_size_bytes = CANONICAL_FILE.stat().st_size

    # ---------------------------------------------------------
    # 1. Structural checks
    # ---------------------------------------------------------

    if actual_columns != EXPECTED_COLUMNS:
        add_issue(
            issues,
            "blocking",
            "schema",
            "Canonical columns do not match the required order.",
            {
                "expected": EXPECTED_COLUMNS,
                "actual": actual_columns,
            },
        )

    if row_count > 10000:
        add_issue(
            issues,
            "blocking",
            "row_count",
            f"Canonical row count exceeds 10,000: {row_count}",
        )

    if column_count > 50:
        add_issue(
            issues,
            "blocking",
            "column_count",
            f"Canonical column count exceeds 50: {column_count}",
        )

    # ---------------------------------------------------------
    # 2. Completeness
    # ---------------------------------------------------------

    completeness = {}

    for column in EXPECTED_COLUMNS:

        values = [
            row.get(column, "")
            for row in rows
        ]

        non_null_count = sum(
            not is_missing(value)
            for value in values
        )

        null_count = row_count - non_null_count

        completeness[column] = {
            "non_null_count": non_null_count,
            "null_count": null_count,
            "null_percentage": round(
                (
                    null_count / row_count * 100
                )
                if row_count
                else 0,
                2,
            ),
            "unique_count": len(
                {
                    clean(value)
                    for value in values
                    if not is_missing(value)
                }
            ),
        }

    for field in REQUIRED_NON_NULL_FIELDS:

        missing_count = completeness[field]["null_count"]

        if missing_count:
            add_issue(
                issues,
                "blocking",
                field,
                f"{missing_count} missing values",
            )

    # ---------------------------------------------------------
    # 3. Record ID uniqueness
    # ---------------------------------------------------------

    record_ids = [
        clean(row.get("record_id", ""))
        for row in rows
    ]

    empty_id_count = sum(
        not value
        for value in record_ids
    )

    duplicate_id_count = (
        len(record_ids)
        - len(set(record_ids))
    )

    uniqueness = {
        "total_record_ids": len(record_ids),
        "unique_record_ids": len(set(record_ids)),
        "empty_record_ids": empty_id_count,
        "duplicate_record_ids": duplicate_id_count,
    }

    if empty_id_count:
        add_issue(
            issues,
            "blocking",
            "record_id",
            f"{empty_id_count} empty record IDs",
        )

    if duplicate_id_count:
        add_issue(
            issues,
            "blocking",
            "record_id",
            f"{duplicate_id_count} duplicate record IDs",
        )

    # ---------------------------------------------------------
    # 4. Date validity
    # ---------------------------------------------------------

    date_total = 0
    date_parseable = 0
    invalid_date_count = 0

    for row in rows:

        raw = clean(row.get("observed_at", ""))

        if not raw:
            continue

        date_total += 1

        if parse_date(raw) is not None:
            date_parseable += 1
        else:
            invalid_date_count += 1

    temporal = {
        "non_null_date_count": date_total,
        "parseable_date_count": date_parseable,
        "invalid_date_count": invalid_date_count,
        "parse_success_rate": round(
            (
                date_parseable / date_total * 100
            )
            if date_total
            else 0,
            2,
        ),
    }

    if invalid_date_count:
        add_issue(
            issues,
            "blocking",
            "observed_at",
            f"{invalid_date_count} non-null dates cannot be parsed",
        )

    # ---------------------------------------------------------
    # 5. Numeric validity
    # ---------------------------------------------------------

    numeric_checks = {}

    for field in NUMERIC_FIELDS:

        non_null_count = 0
        invalid_count = 0

        for row in rows:

            raw = clean(row.get(field, ""))

            if not raw:
                continue

            non_null_count += 1

            if parse_number(raw) is None:
                invalid_count += 1

        numeric_checks[field] = {
            "non_null_count": non_null_count,
            "invalid_count": invalid_count,
        }

        if invalid_count:

            add_issue(
                issues,
                "blocking",
                field,
                f"{invalid_count} non-null values are invalid",
            )

    # ---------------------------------------------------------
    # 6. Coordinate range checks
    # ---------------------------------------------------------

    coordinate_checks = {
        "latitude": {
            "minimum": -90,
            "maximum": 90,
            "invalid_count": 0,
        },
        "longitude": {
            "minimum": -180,
            "maximum": 180,
            "invalid_count": 0,
        },
    }

    for row in rows:

        for field, limits in coordinate_checks.items():

            raw = clean(row.get(field, ""))

            if not raw:
                continue

            number = parse_number(raw)

            if (
                number is None
                or number < limits["minimum"]
                or number > limits["maximum"]
            ):
                limits["invalid_count"] += 1

    for field, result in coordinate_checks.items():

        if result["invalid_count"]:

            add_issue(
                issues,
                "blocking",
                field,
                (
                    f"{result['invalid_count']} values are "
                    "outside the valid coordinate range"
                ),
            )

    # ---------------------------------------------------------
    # 7. Metric unit consistency
    # ---------------------------------------------------------

    metric_units = {}

    for row in rows:

        metric_name = clean(
            row.get("metric_name", "")
        )

        metric_unit = clean(
            row.get("metric_unit", "")
        )

        if not metric_name:
            continue

        metric_units.setdefault(
            metric_name,
            set(),
        )

        if metric_unit:
            metric_units[metric_name].add(
                metric_unit
            )

    metric_units_clean = {
        metric: sorted(units)
        for metric, units in metric_units.items()
    }

    mixed_units = {
        metric: units
        for metric, units in metric_units_clean.items()
        if len(units) > 1
    }

    for metric, units in mixed_units.items():

        add_issue(
            issues,
            "blocking",
            "metric_unit",
            (
                f"Metric '{metric}' uses multiple units: "
                f"{units}"
            ),
        )

    # ---------------------------------------------------------
    # 8. Provenance and synthetic status
    # ---------------------------------------------------------

    synthetic_distribution = distribution(
        rows,
        "is_synthetic",
    )

    missing_synthetic = sum(
        is_missing(row.get("is_synthetic", ""))
        for row in rows
    )

    invalid_synthetic = sum(
        clean(row.get("is_synthetic", "")).lower()
        not in {"", "true", "false"}
        for row in rows
    )

    if missing_synthetic:

        add_issue(
            issues,
            "blocking",
            "is_synthetic",
            (
                f"{missing_synthetic} records do not have "
                "a confirmed synthetic-data flag"
            ),
            {
                "required_values": [
                    "true",
                    "false",
                ]
            },
        )

    if invalid_synthetic:

        add_issue(
            issues,
            "blocking",
            "is_synthetic",
            (
                f"{invalid_synthetic} records contain "
                "invalid boolean values"
            ),
        )

    # ---------------------------------------------------------
    # 9. Source traceability
    # ---------------------------------------------------------

    missing_source_record_id = sum(
        is_missing(row.get("source_record_id", ""))
        for row in rows
    )

    if missing_source_record_id:

        add_issue(
            issues,
            "blocking",
            "source_record_id",
            (
                f"{missing_source_record_id} records are "
                "missing source_record_id"
            ),
        )

    # ---------------------------------------------------------
    # 10. Text safety / size
    # ---------------------------------------------------------

    text_lengths = [
        len(
            clean(row.get("text_value", ""))
        )
        for row in rows
    ]

    text_over_limit = sum(
        length > 500
        for length in text_lengths
    )

    text_summary = {
        "non_empty_count": sum(
            length > 0
            for length in text_lengths
        ),
        "empty_count": sum(
            length == 0
            for length in text_lengths
        ),
        "average_length": round(
            (
                sum(text_lengths)
                / len(text_lengths)
            )
            if text_lengths
            else 0,
            2,
        ),
        "maximum_length": max(text_lengths)
        if text_lengths
        else 0,
        "over_500_characters": text_over_limit,
    }

    if text_over_limit:

        add_issue(
            issues,
            "blocking",
            "text_value",
            (
                f"{text_over_limit} records exceed "
                "the 500-character text limit"
            ),
        )

    # ---------------------------------------------------------
    # 11. Category and stage consistency
    # ---------------------------------------------------------

    category_distributions = {
        field: distribution(rows, field)
        for field in [
            "category",
            "subcategory",
            "status",
            "stage",
            "record_type",
            "metric_name",
            "metric_unit",
        ]
    }

    # ---------------------------------------------------------
    # 12. Source sample accuracy check
    # ---------------------------------------------------------

    source_comparison = {
        "source_sample_available": SOURCE_SAMPLE_FILE.exists(),
        "source_sample_record_count": None,
        "canonical_source_record_count": len(
            {
                clean(row.get("source_record_id", ""))
                for row in rows
                if not is_missing(
                    row.get("source_record_id", "")
                )
            }
        ),
    }

    if SOURCE_SAMPLE_FILE.exists():

        with SOURCE_SAMPLE_FILE.open(
            "r",
            newline="",
            encoding="utf-8",
        ) as file:

            source_rows = list(
                csv.DictReader(file)
            )

        source_comparison[
            "source_sample_record_count"
        ] = len(source_rows)

        source_ids = {
            clean(row.get("id", ""))
            for row in source_rows
            if not is_missing(row.get("id", ""))
        }

        canonical_source_ids = {
            clean(row.get("source_record_id", ""))
            for row in rows
            if not is_missing(
                row.get("source_record_id", "")
            )
        }

        source_comparison[
            "all_source_ids_present_in_canonical"
        ] = source_ids.issubset(
            canonical_source_ids
        )

        source_comparison[
            "source_ids_missing_from_canonical"
        ] = sorted(
            source_ids - canonical_source_ids
        )

    # ---------------------------------------------------------
    # 13. Final assessment
    # ---------------------------------------------------------

    blocking_issues = [
        issue
        for issue in issues
        if issue["severity"] == "blocking"
    ]

    result_status = (
        "PASS"
        if not blocking_issues
        else "CHANGES_REQUIRED"
    )

    report = {
        "assessment_version": "post2-v1",
        "source_of_truth": str(
            CANONICAL_FILE.relative_to(PROJECT_ROOT)
        ),
        "result": result_status,
        "dataset": {
            "record_count": row_count,
            "column_count": column_count,
            "file_size_bytes": file_size_bytes,
            "file_size_mb": round(
                file_size_bytes / 1024 / 1024,
                4,
            ),
        },
        "completeness": completeness,
        "uniqueness": uniqueness,
        "temporal": temporal,
        "numeric": numeric_checks,
        "coordinates": coordinate_checks,
        "metric_units": metric_units_clean,
        "mixed_metric_units": mixed_units,
        "categories": category_distributions,
        "synthetic_distribution": synthetic_distribution,
        "text": text_summary,
        "source_accuracy_check": source_comparison,
        "blocking_issues": blocking_issues,
        "warnings": warnings,
        "notes": [
            (
                "Post #2 uses only the approved canonical CSV "
                "as the analytical source."
            ),
            (
                "The source repository does not document "
                "whether the CRM records are synthetic."
            ),
            (
                "Latitude and longitude are empty because "
                "the Phase 2 source does not provide coordinates."
            ),
        ],
    }

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    OUTPUT_FILE.write_text(
        json.dumps(
            report,
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    print("QUALITY ASSESSMENT GENERATED")
    print(f"Result: {result_status}")
    print(f"Canonical records: {row_count}")
    print(f"Canonical columns: {column_count}")
    print(f"Blocking issues: {len(blocking_issues)}")
    print(f"Output: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()