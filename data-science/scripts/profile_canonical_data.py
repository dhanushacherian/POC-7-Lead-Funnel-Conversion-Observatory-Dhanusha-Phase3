from pathlib import Path
import csv
import json
import math
from datetime import datetime
from statistics import mean, median, stdev


PROJECT_ROOT = Path(__file__).resolve().parents[2]

SOURCE = (
    PROJECT_ROOT
    / "data"
    / "canonical"
    / "intelligence_data.csv"
)

OUTPUT = (
    PROJECT_ROOT
    / "data-science"
    / "outputs"
    / "canonical_profile.json"
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

NUMERIC_COLUMNS = {
    "metric_value",
    "latitude",
    "longitude",
}

EXPECTED_ROLES = {
    "record_id": "Unique canonical record identifier",
    "record_type": "Canonical record type",
    "observed_at": "Observation date or timestamp",
    "entity_id": "Primary entity identifier",
    "related_entity_id": "Related entity identifier",
    "entity_name": "Human-readable entity name",
    "category": "Primary category",
    "subcategory": "Secondary category",
    "status": "Operational status",
    "stage": "Lifecycle or funnel stage",
    "metric_name": "Metric definition",
    "metric_value": "Numeric metric value",
    "metric_unit": "Metric unit",
    "text_value": "Contextual text value",
    "latitude": "Geographic latitude",
    "longitude": "Geographic longitude",
    "source_name": "Source system identifier",
    "source_record_id": "Original source record identifier",
    "is_synthetic": "Synthetic-data provenance flag",
    "data_version": "Canonical data version",
}


def clean(value):
    if value is None:
        return ""
    return str(value).strip()


def is_missing(value):
    return clean(value) == ""


def safe_float(value):
    try:
        number = float(value)
        if math.isfinite(number):
            return number
    except (TypeError, ValueError):
        pass
    return None


def parse_datetime(value):
    value = clean(value)

    if not value:
        return None

    try:
        return datetime.fromisoformat(
            value.replace("Z", "+00:00")
        )
    except ValueError:
        return None


def distribution(rows, column):
    counts = {}

    for row in rows:
        value = clean(row.get(column, ""))

        if not value:
            value = "<missing>"

        counts[value] = counts.get(value, 0) + 1

    return dict(
        sorted(
            counts.items(),
            key=lambda item: (-item[1], item[0])
        )
    )


def numeric_summary(rows, column):
    values = []

    for row in rows:
        number = safe_float(row.get(column, ""))

        if number is not None:
            values.append(number)

    invalid_count = 0

    for row in rows:
        raw = clean(row.get(column, ""))

        if raw and safe_float(raw) is None:
            invalid_count += 1

    if not values:
        return {
            "non_null_count": 0,
            "minimum": None,
            "maximum": None,
            "mean": None,
            "median": None,
            "standard_deviation": None,
            "invalid_count": invalid_count,
        }

    standard_deviation = (
        stdev(values)
        if len(values) > 1
        else 0.0
    )

    return {
        "non_null_count": len(values),
        "minimum": min(values),
        "maximum": max(values),
        "mean": mean(values),
        "median": median(values),
        "standard_deviation": standard_deviation,
        "invalid_count": invalid_count,
    }


def main():

    if not SOURCE.exists():
        raise FileNotFoundError(
            f"Canonical dataset not found: {SOURCE}"
        )

    with SOURCE.open(
        "r",
        newline="",
        encoding="utf-8",
    ) as file:

        reader = csv.DictReader(file)
        rows = list(reader)
        columns = reader.fieldnames or []

    record_count = len(rows)
    column_count = len(columns)
    file_size_bytes = SOURCE.stat().st_size

    profile = {
        "profile_version": "post2-v1",
        "source_of_truth": str(
            SOURCE.relative_to(PROJECT_ROOT)
        ),
        "dataset_structure": {
            "record_count": record_count,
            "column_count": column_count,
            "file_size_bytes": file_size_bytes,
            "file_size_mb": round(
                file_size_bytes / 1024 / 1024,
                4,
            ),
            "data_versions": sorted(
                {
                    clean(row.get("data_version", ""))
                    for row in rows
                    if not is_missing(row.get("data_version", ""))
                }
            ),
            "source_record_count": len(
                {
                    clean(row.get("source_record_id", ""))
                    for row in rows
                    if not is_missing(row.get("source_record_id", ""))
                }
            ),
        },
        "record_type_distribution": distribution(
            rows,
            "record_type",
        ),
        "source_distribution": distribution(
            rows,
            "source_name",
        ),
        "synthetic_distribution": distribution(
            rows,
            "is_synthetic",
        ),
        "columns": {},
        "numerical_coverage": {},
        "date_time_coverage": {},
        "categorical_coverage": {},
        "geographic_coverage": {},
        "text_coverage": {},
        "observations": [],
    }

    for column in columns:

        values = [
            clean(row.get(column, ""))
            for row in rows
        ]

        non_null = [
            value
            for value in values
            if value != ""
        ]

        unique_values = sorted(set(non_null))

        profile["columns"][column] = {
            "dtype_observed": (
                "numeric"
                if column in NUMERIC_COLUMNS
                else "string"
            ),
            "non_null_count": len(non_null),
            "null_count": len(values) - len(non_null),
            "null_percentage": round(
                (
                    (len(values) - len(non_null))
                    / len(values)
                    * 100
                )
                if values
                else 0.0,
                2,
            ),
            "unique_count": len(unique_values),
            "example_values": unique_values[:5],
            "expected_role": EXPECTED_ROLES.get(
                column,
                "Canonical field",
            ),
        }

    for column in NUMERIC_COLUMNS:
        profile["numerical_coverage"][column] = (
            numeric_summary(rows, column)
        )

    parsed_dates = [
        parse_datetime(row.get("observed_at", ""))
        for row in rows
        if not is_missing(row.get("observed_at", ""))
    ]

    valid_dates = [
        value
        for value in parsed_dates
        if value is not None
    ]

    earliest = (
        min(valid_dates).isoformat()
        if valid_dates
        else None
    )

    latest = (
        max(valid_dates).isoformat()
        if valid_dates
        else None
    )

    unique_dates = sorted(
        {
            value.date().isoformat()
            for value in valid_dates
        }
    )

    unique_months = sorted(
        {
            value.strftime("%Y-%m")
            for value in valid_dates
        }
    )

    profile["date_time_coverage"] = {
        "non_null_date_count": len(parsed_dates),
        "parseable_date_count": len(valid_dates),
        "parse_success_rate": round(
            (
                len(valid_dates)
                / len(parsed_dates)
                * 100
            )
            if parsed_dates
            else 0.0,
            2,
        ),
        "earliest": earliest,
        "latest": latest,
        "unique_dates": len(unique_dates),
        "unique_months": len(unique_months),
        "unique_date_values": unique_dates,
        "unique_month_values": unique_months,
        "timezone_consistency_note": (
            "Source dates are date-only values; "
            "no timezone is explicitly documented."
        ),
    }

    for column in [
        "category",
        "subcategory",
        "status",
        "stage",
        "metric_name",
        "metric_unit",
        "record_type",
    ]:
        profile["categorical_coverage"][column] = (
            distribution(rows, column)
        )

    valid_latitudes = []
    invalid_latitudes = 0
    valid_longitudes = []
    invalid_longitudes = 0

    for row in rows:

        latitude_raw = clean(row.get("latitude", ""))
        longitude_raw = clean(row.get("longitude", ""))

        if latitude_raw:
            latitude = safe_float(latitude_raw)

            if (
                latitude is not None
                and -90 <= latitude <= 90
            ):
                valid_latitudes.append(latitude)
            else:
                invalid_latitudes += 1

        if longitude_raw:
            longitude = safe_float(longitude_raw)

            if (
                longitude is not None
                and -180 <= longitude <= 180
            ):
                valid_longitudes.append(longitude)
            else:
                invalid_longitudes += 1

    profile["geographic_coverage"] = {
        "valid_latitude_count": len(valid_latitudes),
        "invalid_latitude_count": invalid_latitudes,
        "valid_longitude_count": len(valid_longitudes),
        "invalid_longitude_count": invalid_longitudes,
        "latitude_range": (
            [
                min(valid_latitudes),
                max(valid_latitudes),
            ]
            if valid_latitudes
            else None
        ),
        "longitude_range": (
            [
                min(valid_longitudes),
                max(valid_longitudes),
            ]
            if valid_longitudes
            else None
        ),
        "coordinate_pair_count": sum(
            bool(
                clean(row.get("latitude", ""))
                and clean(row.get("longitude", ""))
            )
            for row in rows
        ),
    }

    text_values = [
        clean(row.get("text_value", ""))
        for row in rows
    ]

    non_empty_text = [
        value
        for value in text_values
        if value
    ]

    text_lengths = [
        len(value)
        for value in non_empty_text
    ]

    profile["text_coverage"] = {
        "non_null_count": len(non_empty_text),
        "empty_count": len(text_values) - len(non_empty_text),
        "average_length": round(
            mean(text_lengths),
            2,
        )
        if text_lengths
        else 0,
        "maximum_length": max(text_lengths)
        if text_lengths
        else 0,
        "possible_truncation_count": sum(
            length >= 500
            for length in text_lengths
        ),
    }

    record_ids = [
        clean(row.get("record_id", ""))
        for row in rows
    ]

    duplicate_count = (
        len(record_ids)
        - len(set(record_ids))
    )

    profile["uniqueness"] = {
        "record_id_count": len(record_ids),
        "unique_record_id_count": len(set(record_ids)),
        "duplicate_record_id_count": duplicate_count,
        "empty_record_id_count": sum(
            not value
            for value in record_ids
        ),
        "unique_entity_id_count": len(
            {
                clean(row.get("entity_id", ""))
                for row in rows
                if not is_missing(row.get("entity_id", ""))
            }
        ),
        "unique_related_entity_id_count": len(
            {
                clean(row.get("related_entity_id", ""))
                for row in rows
                if not is_missing(
                    row.get("related_entity_id", "")
                )
            }
        ),
    }

    synthetic_values = [
        clean(row.get("is_synthetic", ""))
        for row in rows
    ]

    synthetic_true_count = sum(
        value.lower() == "true"
        for value in synthetic_values
    )

    synthetic_false_count = sum(
        value.lower() == "false"
        for value in synthetic_values
    )

    synthetic_unknown_count = (
        record_count
        - synthetic_true_count
        - synthetic_false_count
    )

    metric_units = {}

    for row in rows:

        metric_name = clean(
            row.get("metric_name", "")
        )

        metric_unit = clean(
            row.get("metric_unit", "")
        )

        if metric_name:

            metric_units.setdefault(
                metric_name,
                set(),
            )

            if metric_unit:
                metric_units[metric_name].add(
                    metric_unit
                )

    profile["metric_unit_consistency"] = {
        metric: sorted(units)
        for metric, units in metric_units.items()
    }

    profile["provenance"] = {
        "synthetic_record_count": synthetic_true_count,
        "non_synthetic_record_count": synthetic_false_count,
        "undocumented_or_missing_provenance_count": (
            synthetic_unknown_count
        ),
        "source_names": sorted(
            {
                clean(row.get("source_name", ""))
                for row in rows
                if not is_missing(row.get("source_name", ""))
            }
        ),
        "provenance_note": (
            "The Phase 2 repository does not document "
            "whether the CRM records are synthetic, "
            "anonymized, or derived from real operational data."
        ),
    }

    profile["observations"] = [
        (
            f"The canonical dataset contains "
            f"{record_count} records across "
            f"{column_count} columns."
        ),
        (
            "The record-type distribution contains "
            f"{profile['record_type_distribution']}."
        ),
        (
            "The dataset spans "
            f"{profile['date_time_coverage']['earliest']} "
            "to "
            f"{profile['date_time_coverage']['latest']}."
        ),
        (
            "Latitude and longitude are blank for the "
            "available canonical records because the "
            "Phase 2 source does not provide coordinate data."
        ),
        (
            "Synthetic-data status is undocumented in the "
            "available Phase 2 repository."
        ),
    ]

    OUTPUT.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    OUTPUT.write_text(
        json.dumps(
            profile,
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    print("PROFILE GENERATED")
    print(f"Canonical records: {record_count}")
    print(f"Canonical columns: {column_count}")
    print(
        f"Output: {OUTPUT}"
    )


if __name__ == "__main__":
    main()