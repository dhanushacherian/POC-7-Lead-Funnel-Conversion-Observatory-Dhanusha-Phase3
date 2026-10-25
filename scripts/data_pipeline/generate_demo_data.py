"""Generate an isolated 600-lead synthetic demonstration dataset for POC-7.

Install at scripts/data_pipeline/generate_demo_data.py in the demo worktree,
then run with Python. This script never writes to baseline data paths.
"""
from __future__ import annotations

import csv
import json
import random
from collections import Counter
from datetime import date, timedelta
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEMO_ROOT = PROJECT_ROOT / "data" / "demo" / "phase3-demo-v1"
SOURCE_FILE = DEMO_ROOT / "source" / "source_leads.csv"
CANONICAL_FILE = DEMO_ROOT / "canonical" / "intelligence_data.csv"
PUBLISHED_FILE = DEMO_ROOT / "published" / "intelligence_data.json"
MANIFEST_FILE = DEMO_ROOT / "manifest.json"
ASSUMPTIONS_FILE = DEMO_ROOT / "assumptions.md"
VALIDATION_FILE = DEMO_ROOT / "validation_report.json"

SEED = 20261017
LEAD_COUNT = 600
DATA_VERSION = "phase3-demo-v1"
SOURCE_NAME = "phase3_demo_synthetic_generator"
SYNTHETIC_NOTICE = "SYNTHETIC DEMONSTRATION DATA - NOT REAL CUSTOMER DATA"
START_DATE = date(2025, 10, 1)
END_DATE = date(2026, 9, 30)

SOURCE_COLUMNS = [
    "id", "date", "location", "team", "product", "source", "stage",
    "daysInStage", "value", "is_synthetic", "data_version", "synthetic_notice",
]
CANONICAL_COLUMNS = [
    "record_id", "record_type", "observed_at", "entity_id", "related_entity_id",
    "entity_name", "category", "subcategory", "status", "stage", "metric_name",
    "metric_value", "metric_unit", "text_value", "latitude", "longitude",
    "source_name", "source_record_id", "is_synthetic", "data_version",
]
STAGE_WEIGHTS = {
    "Lead": 0.18, "Qualified": 0.20, "Opportunity": 0.20,
    "Proposal": 0.16, "Won": 0.16, "Lost": 0.10,
}
PRODUCT_WEIGHTS = {"Payments": 0.42, "Analytics": 0.33, "Security": 0.25}
SOURCE_WEIGHTS = {"Website": 0.34, "Referral": 0.24, "Partner": 0.16, "Campaign": 0.26}
TEAM_WEIGHTS = {"Enterprise": 0.35, "SMB": 0.40, "Growth": 0.25}
LOCATION_WEIGHTS = {
    "Bangalore": 0.24, "Mumbai": 0.20, "Delhi": 0.17,
    "Chennai": 0.15, "Hyderabad": 0.14, "Pune": 0.10,
}
TEAM_VALUE_MULTIPLIER = {"Enterprise": 1.35, "SMB": 0.75, "Growth": 1.0}
PRODUCT_VALUE_RANGE = {
    "Payments": (25_000, 175_000),
    "Analytics": (20_000, 130_000),
    "Security": (15_000, 100_000),
}
STAGE_DAY_RANGE = {
    "Lead": (1, 12), "Qualified": (3, 20), "Opportunity": (5, 35),
    "Proposal": (4, 30), "Won": (2, 25), "Lost": (5, 45),
}


def weighted_choice(rng: random.Random, choices: dict[str, float]) -> str:
    labels = list(choices)
    return rng.choices(labels, weights=[choices[x] for x in labels], k=1)[0]


def canonical_rows(leads: list[dict[str, object]]) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for lead in leads:
        common = {
            "observed_at": str(lead["date"]),
            "entity_id": str(lead["id"]),
            "related_entity_id": "",
            "entity_name": "",
            "category": str(lead["product"]),
            "subcategory": str(lead["source"]),
            "status": str(lead["stage"]),
            "stage": str(lead["stage"]),
            "text_value": f"location={lead['location']};team={lead['team']}",
            "latitude": "",
            "longitude": "",
            "source_name": SOURCE_NAME,
            "source_record_id": str(lead["id"]),
            "is_synthetic": "true",
            "data_version": DATA_VERSION,
        }
        value_row = dict(common)
        value_row.update({
            "record_id": str(lead["id"]), "record_type": "crm_lead",
            "metric_name": "lead_value", "metric_value": str(lead["value"]),
            "metric_unit": "currency_unspecified",
        })
        days_row = dict(common)
        days_row.update({
            "record_id": f"{lead['id']}_days_in_stage", "record_type": "crm_lead_metric",
            "metric_name": "days_in_stage", "metric_value": str(lead["daysInStage"]),
            "metric_unit": "days",
        })
        rows.extend([{c: str(value_row.get(c, "")) for c in CANONICAL_COLUMNS},
                     {c: str(days_row.get(c, "")) for c in CANONICAL_COLUMNS}])
    return rows


def write_csv(path: Path, columns: list[str], rows: list[dict[str, object]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=columns, extrasaction="raise")
        writer.writeheader()
        writer.writerows(rows)


def generate_leads() -> list[dict[str, object]]:
    rng = random.Random(SEED)
    span_days = (END_DATE - START_DATE).days
    leads: list[dict[str, object]] = []
    for i in range(1, LEAD_COUNT + 1):
        product = weighted_choice(rng, PRODUCT_WEIGHTS)
        team = weighted_choice(rng, TEAM_WEIGHTS)
        low, high = PRODUCT_VALUE_RANGE[product]
        raw_value = rng.randint(low, high) * TEAM_VALUE_MULTIPLIER[team]
        value = int(round(raw_value / 1000) * 1000)
        stage = weighted_choice(rng, STAGE_WEIGHTS)
        day_low, day_high = STAGE_DAY_RANGE[stage]
        observed_date = START_DATE + timedelta(days=rng.randint(0, span_days))
        leads.append({
            "id": f"D{i:04d}",
            "date": observed_date.isoformat(),
            "location": weighted_choice(rng, LOCATION_WEIGHTS),
            "team": team,
            "product": product,
            "source": weighted_choice(rng, SOURCE_WEIGHTS),
            "stage": stage,
            "daysInStage": rng.randint(day_low, day_high),
            "value": value,
            "is_synthetic": "true",
            "data_version": DATA_VERSION,
            "synthetic_notice": SYNTHETIC_NOTICE,
        })
    return leads


def validate(leads: list[dict[str, object]], rows: list[dict[str, str]]) -> dict[str, object]:
    errors: list[str] = []
    ids = [str(row["id"]) for row in leads]
    dates = [date.fromisoformat(str(row["date"])) for row in leads]
    month_counts = Counter(d.strftime("%Y-%m") for d in dates)
    lead_metric = [r for r in rows if r["metric_name"] == "lead_value"]
    days_metric = [r for r in rows if r["metric_name"] == "days_in_stage"]
    if len(leads) != LEAD_COUNT:
        errors.append(f"Expected {LEAD_COUNT} source leads; got {len(leads)}")
    if len(set(ids)) != len(ids):
        errors.append("Duplicate source lead IDs detected")
    if min(dates) < START_DATE or max(dates) > END_DATE:
        errors.append("Source date outside configured 12-month window")
    if len(month_counts) != 12:
        errors.append(f"Expected all 12 calendar months represented; got {len(month_counts)}")
    if any(row["is_synthetic"] != "true" or row["data_version"] != DATA_VERSION for row in leads):
        errors.append("Source provenance/version marker missing or invalid")
    if any(row["synthetic_notice"] != SYNTHETIC_NOTICE for row in leads):
        errors.append("Synthetic notice missing from one or more source records")
    valid_stages = set(STAGE_WEIGHTS)
    if any(str(r["stage"]) not in valid_stages for r in leads):
        errors.append("Unexpected stage value found")
    if any(int(r["daysInStage"]) <= 0 or int(r["value"]) <= 0 for r in leads):
        errors.append("Non-positive daysInStage or value found")
    if len(rows) != LEAD_COUNT * 2:
        errors.append(f"Expected {LEAD_COUNT * 2} canonical rows; got {len(rows)}")
    if len({r["record_id"] for r in rows}) != len(rows):
        errors.append("Duplicate canonical record_id detected")
    if len(lead_metric) != LEAD_COUNT or len(days_metric) != LEAD_COUNT:
        errors.append("Canonical metric split is not 600 lead_value plus 600 days_in_stage")
    if any(r["is_synthetic"] != "true" or r["data_version"] != DATA_VERSION for r in rows):
        errors.append("Canonical provenance/version marker missing or invalid")
    if any(list(r.keys()) != CANONICAL_COLUMNS for r in rows):
        errors.append("Canonical schema/column order does not match baseline schema")
    return {
        "report_version": DATA_VERSION,
        "status": "PASSED" if not errors else "FAILED",
        "source_lead_count": len(leads),
        "canonical_row_count": len(rows),
        "canonical_columns": len(CANONICAL_COLUMNS),
        "unique_source_ids": len(set(ids)),
        "unique_canonical_ids": len({r["record_id"] for r in rows}),
        "month_coverage": dict(sorted(month_counts.items())),
        "record_types": dict(Counter(r["record_type"] for r in rows)),
        "metric_counts": dict(Counter(r["metric_name"] for r in rows)),
        "all_records_marked_synthetic": all(r["is_synthetic"] == "true" for r in leads + rows),
        "all_records_use_demo_version": all(r["data_version"] == DATA_VERSION for r in leads + rows),
        "errors": errors,
    }


def main() -> None:
    leads = generate_leads()
    rows = canonical_rows(leads)
    report = validate(leads, rows)
    if report["errors"]:
        print("Demo data validation: FAILED")
        for error in report["errors"]:
            print(f"ERROR: {error}")
        raise SystemExit(1)
    # Write only into this version-specific demo directory.
    write_csv(SOURCE_FILE, SOURCE_COLUMNS, leads)
    write_csv(CANONICAL_FILE, CANONICAL_COLUMNS, rows)
    PUBLISHED_FILE.parent.mkdir(parents=True, exist_ok=True)
    PUBLISHED_FILE.write_text(json.dumps(rows, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    ASSUMPTIONS_FILE.parent.mkdir(parents=True, exist_ok=True)
    ASSUMPTIONS_FILE.write_text(f"""# Phase 3 Demo Dataset Assumptions — {DATA_VERSION}

**Classification:** {SYNTHETIC_NOTICE}

## Purpose and isolation
This is a reproducible synthetic demonstration dataset. It does not represent actual customers, actual transactions, or measured business outcomes. It is stored under `data/demo/{DATA_VERSION}/` and does not overwrite the `phase3-v2` baseline files.

## Dataset and reproducibility
- Source leads: {LEAD_COUNT}; fixed random seed: `{SEED}`.
- Observation dates are sampled across the 12-calendar-month window {START_DATE.isoformat()} through {END_DATE.isoformat()}.
- Each source lead generates exactly two canonical rows: `lead_value` and `days_in_stage`.
- Expected canonical rows: {LEAD_COUNT * 2}; canonical schema uses the same 20 columns and order as the baseline.
- All source and canonical records carry `is_synthetic=true` and `data_version={DATA_VERSION}`. Each source row also carries a synthetic-data notice.

## Generation assumptions (invented for demonstration, not empirical estimates)
- Stage weights: `{json.dumps(STAGE_WEIGHTS, sort_keys=True)}`.
- Product weights: `{json.dumps(PRODUCT_WEIGHTS, sort_keys=True)}`.
- Acquisition-source weights: `{json.dumps(SOURCE_WEIGHTS, sort_keys=True)}`.
- Team weights: `{json.dumps(TEAM_WEIGHTS, sort_keys=True)}`.
- Location weights: `{json.dumps(LOCATION_WEIGHTS, sort_keys=True)}`.
- Lead value starts from a product-specific range (Payments 25,000–175,000; Analytics 20,000–130,000; Security 15,000–100,000), is scaled by team (Enterprise 1.35, Growth 1.0, SMB 0.75), and rounded to the nearest 1,000. Values have unspecified currency units.
- Days-in-stage ranges depend on current stage: Lead 1–12; Qualified 3–20; Opportunity 5–35; Proposal 4–30; Won 2–25; Lost 5–45.
- Dates, stages, products, sources, teams, locations, and values are independently randomized within the documented rules. No stage-transition history is generated; this snapshot must not be used to claim conversion probabilities, causal effects, or predictive performance.

## Limitations
Distributions are designed to create varied demonstration scenarios, not to estimate a real sales population. Comparisons are descriptive only. Month-level lead counts reflect the seeded random draw, not seasonality.
""", encoding="utf-8")
    manifest = {
        "manifest_version": DATA_VERSION,
        "dataset_classification": SYNTHETIC_NOTICE,
        "data_version": DATA_VERSION,
        "random_seed": SEED,
        "source": {"path": str(SOURCE_FILE.relative_to(PROJECT_ROOT)).replace("\\", "/"), "record_count": len(leads), "columns": SOURCE_COLUMNS},
        "canonical": {"path": str(CANONICAL_FILE.relative_to(PROJECT_ROOT)).replace("\\", "/"), "record_count": len(rows), "column_count": len(CANONICAL_COLUMNS), "columns": CANONICAL_COLUMNS},
        "published": {"path": str(PUBLISHED_FILE.relative_to(PROJECT_ROOT)).replace("\\", "/"), "record_count": len(rows)},
        "assumptions": str(ASSUMPTIONS_FILE.relative_to(PROJECT_ROOT)).replace("\\", "/"),
        "validation_report": str(VALIDATION_FILE.relative_to(PROJECT_ROOT)).replace("\\", "/"),
        "observation_window": {"start": START_DATE.isoformat(), "end": END_DATE.isoformat(), "calendar_months": 12},
        "provenance": {"synthetic_status": "confirmed", "real_customer_data": False},
        "status": report["status"],
    }
    MANIFEST_FILE.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    VALIDATION_FILE.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(f"Demo data version: {DATA_VERSION}")
    print(f"Classification: {SYNTHETIC_NOTICE}")
    print(f"Source leads: {len(leads)}")
    print(f"Canonical rows: {len(rows)} (expected {LEAD_COUNT * 2})")
    print(f"Months represented: {len(report['month_coverage'])}/12")
    print(f"Source CSV: {SOURCE_FILE}")
    print(f"Canonical CSV: {CANONICAL_FILE}")
    print(f"Validation report: {VALIDATION_FILE}")
    print(f"Validation: {report['status']}")
    if report["errors"]:
        for error in report["errors"]:
            print(f"ERROR: {error}")
        raise SystemExit(1)


if __name__ == "__main__":
    main()
