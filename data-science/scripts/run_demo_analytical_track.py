"""Analyze the isolated phase3-demo-v1 canonical dataset.

All inputs and outputs remain under data/demo/phase3-demo-v1/.
Uses only Python's standard library and never edits baseline analytics.
"""
from __future__ import annotations

import csv
import json
import statistics
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEMO_ROOT = PROJECT_ROOT / "data" / "demo" / "phase3-demo-v1"
CANONICAL_FILE = DEMO_ROOT / "canonical" / "intelligence_data.csv"
MANIFEST_FILE = DEMO_ROOT / "manifest.json"
OUTPUT_DIR = DEMO_ROOT / "analytics"
DATA_VERSION = "phase3-demo-v1"
SYNTHETIC_NOTICE = "SYNTHETIC DEMONSTRATION DATA - NOT REAL CUSTOMER DATA"

CANONICAL_COLUMNS = [
    "record_id", "record_type", "observed_at", "entity_id", "related_entity_id",
    "entity_name", "category", "subcategory", "status", "stage", "metric_name",
    "metric_value", "metric_unit", "text_value", "latitude", "longitude",
    "source_name", "source_record_id", "is_synthetic", "data_version",
]
ANALYSIS_COLUMNS = [
    "source_record_id", "date", "location", "team", "product", "source",
    "stage", "days_in_stage", "lead_value", "is_synthetic", "data_version",
    "synthetic_notice",
]
STAGE_ORDER = ["Lead", "Qualified", "Opportunity", "Proposal", "Won", "Lost"]


def read_csv(path: Path) -> tuple[list[str], list[dict[str, str]]]:
    with path.open("r", newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        return list(reader.fieldnames or []), list(reader)


def write_csv(path: Path, columns: list[str], rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=columns, extrasaction="raise")
        writer.writeheader()
        writer.writerows(rows)


def write_json(path: Path, obj: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def parse_text_fields(value: str) -> dict[str, str]:
    out: dict[str, str] = {}
    for part in (value or "").split(";"):
        if "=" in part:
            key, val = part.split("=", 1)
            out[key.strip()] = val.strip()
    return out


def num(value: str, label: str) -> float:
    try:
        result = float(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"{label} must be numeric; found {value!r}") from exc
    if result != result or result in (float("inf"), float("-inf")):
        raise ValueError(f"{label} must be finite")
    return result


def build_analysis(canonical: list[dict[str, str]]) -> tuple[list[dict[str, Any]], list[str]]:
    errors: list[str] = []
    leads = [r for r in canonical if r.get("record_type") == "crm_lead" and r.get("metric_name") == "lead_value"]
    days_rows = [r for r in canonical if r.get("record_type") == "crm_lead_metric" and r.get("metric_name") == "days_in_stage"]

    days_by_id: dict[str, dict[str, str]] = {}
    for row in days_rows:
        source_id = row.get("source_record_id", "")
        if not source_id:
            errors.append("A days_in_stage record has no source_record_id.")
            continue
        if source_id in days_by_id:
            errors.append(f"Duplicate days_in_stage metric for lead {source_id}.")
        days_by_id[source_id] = row

    lead_ids = [r.get("source_record_id", "") for r in leads]
    if not all(lead_ids):
        errors.append("One or more lead-value records have no source_record_id.")
    if len(lead_ids) != len(set(lead_ids)):
        errors.append("Duplicate lead-value records detected.")

    lead_id_set = set(lead_ids)
    if lead_id_set != set(days_by_id):
        errors.append("Lead-value and days-in-stage source IDs do not match exactly.")

    analysis: list[dict[str, Any]] = []
    for lead in leads:
        source_id = lead.get("source_record_id", "")
        metric = days_by_id.get(source_id)
        if metric is None:
            continue
        try:
            lead_value = num(lead.get("metric_value", ""), f"{source_id}.lead_value")
            days_value = num(metric.get("metric_value", ""), f"{source_id}.days_in_stage")
            if lead_value <= 0:
                errors.append(f"{source_id} has a non-positive lead value.")
            if days_value <= 0 or not days_value.is_integer():
                errors.append(f"{source_id} has invalid days_in_stage.")
            date.fromisoformat(lead.get("observed_at", ""))
            if lead.get("observed_at") != metric.get("observed_at"):
                errors.append(f"Date mismatch between metric records for {source_id}.")
            for column in ("category", "subcategory", "stage", "status", "is_synthetic", "data_version", "source_name", "text_value"):
                if lead.get(column, "") != metric.get(column, ""):
                    errors.append(f"{column} mismatch between metric records for {source_id}.")
            if lead.get("is_synthetic") != "true" or metric.get("is_synthetic") != "true":
                errors.append(f"{source_id} is not marked synthetic in both canonical records.")
            if lead.get("data_version") != DATA_VERSION or metric.get("data_version") != DATA_VERSION:
                errors.append(f"{source_id} contains an unexpected data version.")
            fields = parse_text_fields(lead.get("text_value", ""))
            location, team = fields.get("location", ""), fields.get("team", "")
            if not location or not team:
                errors.append(f"{source_id} is missing location/team metadata in text_value.")
            analysis.append({
                "source_record_id": source_id,
                "date": lead["observed_at"],
                "location": location,
                "team": team,
                "product": lead.get("category", ""),
                "source": lead.get("subcategory", ""),
                "stage": lead.get("stage", ""),
                "days_in_stage": int(days_value),
                "lead_value": int(lead_value) if lead_value.is_integer() else lead_value,
                "is_synthetic": "true",
                "data_version": DATA_VERSION,
                "synthetic_notice": SYNTHETIC_NOTICE,
            })
        except ValueError as exc:
            errors.append(str(exc))

    return analysis, errors


def summary_by(analysis: list[dict[str, Any]], dimension: str) -> list[dict[str, Any]]:
    buckets: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in analysis:
        buckets[str(row[dimension])].append(row)
    total_all = sum(float(r["lead_value"]) for r in analysis)
    result: list[dict[str, Any]] = []
    for name, rows in buckets.items():
        values = [float(r["lead_value"]) for r in rows]
        days = [int(r["days_in_stage"]) for r in rows]
        total = sum(values)
        result.append({
            dimension: name,
            "lead_count": len(rows),
            "total_lead_value": round(total, 2),
            "average_lead_value": round(statistics.mean(values), 2),
            "average_days_in_stage": round(statistics.mean(days), 2),
            "median_days_in_stage": round(statistics.median(days), 2),
            "value_share_percent": round((total / total_all * 100) if total_all else 0.0, 2),
        })
    result.sort(key=lambda x: (-x["total_lead_value"], str(x[dimension]).casefold()))
    return result


def make_monthly(analysis: list[dict[str, Any]]) -> list[dict[str, Any]]:
    buckets: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in analysis:
        month = str(row["date"])[:7]
        buckets[month].append(row)
    result: list[dict[str, Any]] = []
    for month in sorted(buckets):
        rows = buckets[month]
        result.append({
            "month": month,
            "lead_count": len(rows),
            "total_lead_value": round(sum(float(r["lead_value"]) for r in rows), 2),
            "average_lead_value": round(statistics.mean(float(r["lead_value"]) for r in rows), 2),
            "average_days_in_stage": round(statistics.mean(int(r["days_in_stage"]) for r in rows), 2),
            "won_leads_snapshot_count": sum(1 for r in rows if r["stage"] == "Won"),
            "lost_leads_snapshot_count": sum(1 for r in rows if r["stage"] == "Lost"),
            "interpretation_note": "Counts describe lead records dated in this month; these are not stage-transition or conversion rates.",
        })
    return result


def make_aging(analysis: list[dict[str, Any]]) -> list[dict[str, Any]]:
    def bucket(days: int) -> str:
        if days <= 7:
            return "01-07 days"
        if days <= 14:
            return "08-14 days"
        if days <= 30:
            return "15-30 days"
        return "31+ days"

    counts: dict[tuple[str, str], int] = Counter((str(r["stage"]), bucket(int(r["days_in_stage"]))) for r in analysis)
    result: list[dict[str, Any]] = []
    for stage in STAGE_ORDER:
        stage_rows = [r for r in analysis if r["stage"] == stage]
        if not stage_rows:
            continue
        days = [int(r["days_in_stage"]) for r in stage_rows]
        for aging_bucket in ["01-07 days", "08-14 days", "15-30 days", "31+ days"]:
            result.append({
                "stage": stage,
                "lead_count": len(stage_rows),
                "average_days_in_stage": round(statistics.mean(days), 2),
                "median_days_in_stage": round(statistics.median(days), 2),
                "aging_bucket": aging_bucket,
                "bucket_lead_count": counts[(stage, aging_bucket)],
            })
    return result


def main() -> int:
    problems: list[str] = []
    if not CANONICAL_FILE.exists():
        raise FileNotFoundError(f"Demo canonical data not found: {CANONICAL_FILE}")
    if not MANIFEST_FILE.exists():
        raise FileNotFoundError(f"Demo manifest not found: {MANIFEST_FILE}")

    manifest = json.loads(MANIFEST_FILE.read_text(encoding="utf-8"))
    if manifest.get("data_version") != DATA_VERSION:
        problems.append(f"Manifest data_version must be {DATA_VERSION}.")
    if manifest.get("canonical", {}).get("record_count") != 1200:
        problems.append("Manifest must declare 1200 canonical records for phase3-demo-v1.")
    if manifest.get("source", {}).get("record_count") != 600:
        problems.append("Manifest must declare 600 source leads for phase3-demo-v1.")

    columns, canonical = read_csv(CANONICAL_FILE)
    if columns != CANONICAL_COLUMNS:
        problems.append("Canonical CSV column names/order do not match the expected 20-column schema.")
    if len(canonical) != 1200:
        problems.append(f"Expected 1200 canonical rows, found {len(canonical)}.")
    canonical_ids = [r.get("record_id", "") for r in canonical]
    if not all(canonical_ids) or len(canonical_ids) != len(set(canonical_ids)):
        problems.append("Canonical record IDs are blank or duplicated.")
    if any(r.get("data_version") != DATA_VERSION for r in canonical):
        problems.append("Some canonical rows have a mismatched data_version.")
    if any(r.get("is_synthetic") != "true" for r in canonical):
        problems.append("Every canonical row must be marked synthetic.")
    analysis, analysis_errors = build_analysis(canonical)
    problems.extend(analysis_errors)
    if len(analysis) != 600:
        problems.append(f"Expected 600 joined analytical leads, found {len(analysis)}.")

    # Aggregate checks independently confirm one value and one days record per source lead.
    metric_counts = Counter(r.get("metric_name", "") for r in canonical)
    if metric_counts != Counter({"lead_value": 600, "days_in_stage": 600}):
        problems.append(f"Unexpected canonical metric counts: {dict(metric_counts)}.")

    # Report validation results even on failure; no baseline paths are used.
    validation = {
        "report_version": DATA_VERSION,
        "status": "PASSED" if not problems else "FAILED",
        "dataset_classification": SYNTHETIC_NOTICE,
        "data_version": DATA_VERSION,
        "canonical_row_count": len(canonical),
        "analytical_lead_count": len(analysis),
        "canonical_columns": len(columns),
        "canonical_record_ids_unique": len(canonical_ids) == len(set(canonical_ids)),
        "source_metric_pairing": "PASS" if len(analysis) == 600 and not analysis_errors else "FAIL",
        "metric_counts": dict(metric_counts),
        "errors": problems,
    }
    write_json(OUTPUT_DIR / "validation_report.json", validation)
    if problems:
        print("DEMO ANALYTICS VALIDATION FAILED")
        for problem in problems:
            print(f"- {problem}")
        print(f"Report: {OUTPUT_DIR / 'validation_report.json'}")
        return 1

    stages = summary_by(analysis, "stage")
    products = summary_by(analysis, "product")
    sources = summary_by(analysis, "source")
    teams = summary_by(analysis, "team")
    locations = summary_by(analysis, "location")
    monthly = make_monthly(analysis)
    aging = make_aging(analysis)

    write_csv(OUTPUT_DIR / "analysis_dataset.csv", ANALYSIS_COLUMNS, analysis)
    for filename, rows, dimension in [
        ("stage_comparison.csv", stages, "stage"),
        ("product_comparison.csv", products, "product"),
        ("source_comparison.csv", sources, "source"),
        ("team_comparison.csv", teams, "team"),
        ("location_comparison.csv", locations, "location"),
    ]:
        columns_out = [dimension, "lead_count", "total_lead_value", "average_lead_value",
                       "average_days_in_stage", "median_days_in_stage", "value_share_percent"]
        write_csv(OUTPUT_DIR / filename, columns_out, rows)
    write_csv(OUTPUT_DIR / "monthly_activity.csv", [
        "month", "lead_count", "total_lead_value", "average_lead_value",
        "average_days_in_stage", "won_leads_snapshot_count", "lost_leads_snapshot_count",
        "interpretation_note",
    ], monthly)
    write_csv(OUTPUT_DIR / "stage_aging.csv", [
        "stage", "lead_count", "average_days_in_stage", "median_days_in_stage",
        "aging_bucket", "bucket_lead_count",
    ], aging)

    total_value = sum(float(r["lead_value"]) for r in analysis)
    lead_values = [float(r["lead_value"]) for r in analysis]
    days_values = [int(r["days_in_stage"]) for r in analysis]
    highest_average_age = sorted(
        [{"stage": row["stage"], "average_days_in_stage": row["average_days_in_stage"]}
         for row in stages],
        key=lambda x: (-x["average_days_in_stage"], str(x["stage"]).casefold()),
    )[0]
    summary = {
        "project": "Lead Funnel Conversion Observatory",
        "edition": "Expanded professional demonstration",
        "track": "Track A — Comparative Intelligence",
        "dataset_classification": SYNTHETIC_NOTICE,
        "data_version": DATA_VERSION,
        "random_seed": manifest.get("random_seed"),
        "observation_window": manifest.get("observation_window", {}),
        "analytical_unit": "One synthetic source CRM lead",
        "overall_summary": {
            "source_leads_analyzed": len(analysis),
            "canonical_rows_processed": len(canonical),
            "total_lead_value": round(total_value, 2),
            "average_lead_value": round(statistics.mean(lead_values), 2),
            "average_days_in_stage": round(statistics.mean(days_values), 2),
            "median_days_in_stage": round(statistics.median(days_values), 2),
        },
        "highest_observed_groups": {
            "highest_value_stage": {"stage": stages[0]["stage"], "total_lead_value": stages[0]["total_lead_value"]},
            "highest_value_product": {"product": products[0]["product"], "total_lead_value": products[0]["total_lead_value"]},
            "highest_value_source": {"source": sources[0]["source"], "total_lead_value": sources[0]["total_lead_value"]},
            "highest_average_age_stage": highest_average_age,
        },
        "dimensions": {
            "stage": stages,
            "product": products,
            "source": sources,
            "team": teams,
            "location": locations,
            "month_count": len(monthly),
            "aging_buckets_per_stage": ["01-07 days", "08-14 days", "15-30 days", "31+ days"],
        },
        "interpretation": [
            f"The analysis covers {len(analysis)} synthetic source CRM leads.",
            f"Total observed lead value is {total_value:.2f} currency-unspecified units.",
            f"{stages[0]['stage']} has the highest observed total value by stage in this synthetic sample.",
            f"{products[0]['product']} has the highest observed total value by product in this synthetic sample.",
            f"{sources[0]['source']} has the highest observed total value by acquisition source in this synthetic sample.",
            f"{highest_average_age['stage']} has the highest average days in stage in this snapshot.",
        ],
        "limitations": [
            "All records are generated synthetic demonstration data and do not represent actual customers or observed business outcomes.",
            "Group differences are descriptive only and do not establish causation or forecast future outcomes.",
            "The data contains current-stage snapshots, not historical stage transitions; do not interpret stage counts as conversion rates.",
            "Monthly counts reflect seeded randomized observation dates and must not be described as evidence of seasonality.",
            "Values use currency-unspecified units.",
            "Team and location dimensions are parsed from canonical text_value metadata.",
        ],
        "outputs": [
            "analysis_dataset.csv", "stage_comparison.csv", "product_comparison.csv",
            "source_comparison.csv", "team_comparison.csv", "location_comparison.csv",
            "monthly_activity.csv", "stage_aging.csv", "intelligence_summary.json",
            "validation_report.json",
        ],
    }
    # Update the report to include the analytical build's success state.
    validation["group_counts"] = {
        "stages": len(stages), "products": len(products), "sources": len(sources),
        "teams": len(teams), "locations": len(locations), "months": len(monthly),
    }
    validation["status"] = "PASSED"
    write_json(OUTPUT_DIR / "validation_report.json", validation)
    write_json(OUTPUT_DIR / "intelligence_summary.json", summary)

    print("DEMO ANALYTICAL TRACK GENERATED")
    print(f"Data version: {DATA_VERSION}")
    print(f"Source leads analyzed: {len(analysis)}")
    print(f"Canonical rows processed: {len(canonical)}")
    print(f"Total lead value: {total_value:.2f} (currency unspecified)")
    print(f"Average lead value: {statistics.mean(lead_values):.2f}")
    print(f"Average days in stage: {statistics.mean(days_values):.2f}")
    print(f"Dimensions: stages={len(stages)}, products={len(products)}, sources={len(sources)}, teams={len(teams)}, locations={len(locations)}, months={len(monthly)}")
    print("Validation: PASSED")
    print(f"Output directory: {OUTPUT_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
