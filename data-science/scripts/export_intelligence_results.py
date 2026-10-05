from pathlib import Path
import json
from datetime import datetime, timezone

import pandas as pd


ROOT = Path(__file__).resolve().parents[2]

CANONICAL_PATH = ROOT / "data" / "canonical" / "intelligence_data.csv"
OUTPUT_DIR = ROOT / "data-science" / "outputs"

RESULTS_PATH = OUTPUT_DIR / "intelligence_results.json"
SUMMARY_PATH = OUTPUT_DIR / "intelligence_summary.json"
VALIDATION_PATH = OUTPUT_DIR / "validation_metrics.json"
WEAK_CASE_PATH = OUTPUT_DIR / "weak_case_review.json"

DATA_VERSION = "phase3-v2"
METHOD_VERSION = "1.0.0"
PROJECT_ID = "POC-7"
POC_TITLE = "Lead Funnel Conversion Observatory"

APPROVED_TRACK = "Track A - Comparative Intelligence"

PRIMARY_QUESTION = (
    "How do lead value and days in stage vary across CRM funnel stages, "
    "acquisition sources and products within the available synthetic lead sample?"
)

DECISION = (
    "Support descriptive operational review of observed differences across "
    "funnel stages, products and acquisition sources within the available "
    "synthetic sample."
)


def load_canonical_data():
    if not CANONICAL_PATH.exists():
        raise FileNotFoundError(
            f"Canonical dataset not found: {CANONICAL_PATH}"
        )

    df = pd.read_csv(CANONICAL_PATH)

    required_columns = {
        "record_type",
        "metric_name",
        "metric_value",
        "source_record_id",
        "category",
        "subcategory",
        "stage",
        "data_version",
        "is_synthetic",
    }

    missing = required_columns - set(df.columns)

    if missing:
        raise ValueError(
            f"Canonical dataset is missing required columns: {sorted(missing)}"
        )

    versions = set(df["data_version"].dropna().astype(str))

    if versions != {DATA_VERSION}:
        raise ValueError(
            f"Unexpected data_version values: {sorted(versions)}"
        )

    return df


def build_analysis_dataset(df):
    leads = df[
        df["record_type"].astype(str).eq("crm_lead")
    ].copy()

    leads["lead_value"] = pd.to_numeric(
        leads["metric_value"],
        errors="coerce"
    )

    days_df = df[
        df["metric_name"].astype(str).eq("days_in_stage")
    ].copy()

    days_df["days_in_stage"] = pd.to_numeric(
        days_df["metric_value"],
        errors="coerce"
    )

    days_lookup = days_df[
        ["source_record_id", "days_in_stage"]
    ].drop_duplicates(
        subset=["source_record_id"]
    )

    analysis_df = leads[
        [
            "source_record_id",
            "category",
            "subcategory",
            "status",
            "stage",
            "observed_at",
            "lead_value",
            "is_synthetic",
            "data_version",
        ]
    ].copy()

    analysis_df = analysis_df.merge(
        days_lookup,
        on="source_record_id",
        how="left"
    )

    analysis_df = analysis_df.dropna(
        subset=[
            "lead_value",
            "days_in_stage",
        ]
    ).copy()

    return analysis_df


def summarize_by(analysis_df, group_column):
    result = (
        analysis_df
        .groupby(group_column, dropna=False)
        .agg(
            lead_count=("source_record_id", "nunique"),
            total_lead_value=("lead_value", "sum"),
            average_lead_value=("lead_value", "mean"),
            average_days_in_stage=("days_in_stage", "mean"),
            median_days_in_stage=("days_in_stage", "median"),
        )
        .reset_index()
    )

    result["value_share_percent"] = (
        result["total_lead_value"]
        / result["total_lead_value"].sum()
        * 100
    )

    return result.sort_values(
        ["total_lead_value", group_column],
        ascending=[False, True]
    ).reset_index(drop=True)


def make_result(
    result_id,
    result_type,
    group_key,
    metric_name,
    result_value,
    result_unit,
    result_category,
    priority_rank,
    finding,
    evidence,
    limitation,
    generated_at,
):
    return {
        "result_id": result_id,
        "result_type": result_type,
        "record_id": None,
        "entity_id": None,
        "group_key": group_key,
        "period_start": None,
        "period_end": None,
        "metric_name": metric_name,
        "result_value": float(result_value),
        "result_unit": result_unit,
        "result_category": result_category,
        "priority_rank": priority_rank,
        "finding": finding,
        "evidence": evidence,
        "method_version": METHOD_VERSION,
        "data_version": DATA_VERSION,
        "generated_at": generated_at,
        "quality_status": "VALIDATED_DESCRIPTIVE",
        "limitation": limitation,
    }


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    df = load_canonical_data()
    analysis_df = build_analysis_dataset(df)

    if analysis_df.empty:
        raise ValueError("Analytical dataset is empty.")

    generated_at = datetime.now(timezone.utc).isoformat()

    total_lead_value = float(
        analysis_df["lead_value"].sum()
    )

    average_lead_value = float(
        analysis_df["lead_value"].mean()
    )

    average_days = float(
        analysis_df["days_in_stage"].mean()
    )

    median_days = float(
        analysis_df["days_in_stage"].median()
    )

    lead_count = int(
        analysis_df["source_record_id"].nunique()
    )

    stage_summary = summarize_by(
        analysis_df,
        "stage"
    )

    product_summary = summarize_by(
        analysis_df,
        "category"
    )

    source_summary = summarize_by(
        analysis_df,
        "subcategory"
    )

    results = []

    # ---------------------------------------------------------
    # BASELINE
    # ---------------------------------------------------------

    results.append(
        make_result(
            result_id="baseline_total_lead_value",
            result_type="baseline_summary",
            group_key="overall",
            metric_name="total_lead_value",
            result_value=total_lead_value,
            result_unit="currency",
            result_category="baseline",
            priority_rank=1,
            finding=(
                f"The available sample contains {lead_count} source CRM leads "
                f"with total observed lead value of {total_lead_value:.2f}."
            ),
            evidence={
                "lead_count": lead_count,
                "total_lead_value": total_lead_value,
            },
            limitation=(
                "Synthetic sample; descriptive result only."
            ),
            generated_at=generated_at,
        )
    )

    results.append(
        make_result(
            result_id="baseline_average_lead_value",
            result_type="baseline_summary",
            group_key="overall",
            metric_name="average_lead_value",
            result_value=average_lead_value,
            result_unit="currency",
            result_category="baseline",
            priority_rank=2,
            finding=(
                f"The overall average observed lead value is "
                f"{average_lead_value:.2f}."
            ),
            evidence={
                "lead_count": lead_count,
                "average_lead_value": average_lead_value,
            },
            limitation=(
                "Synthetic sample; descriptive result only."
            ),
            generated_at=generated_at,
        )
    )

    results.append(
        make_result(
            result_id="baseline_average_days_in_stage",
            result_type="baseline_summary",
            group_key="overall",
            metric_name="average_days_in_stage",
            result_value=average_days,
            result_unit="days",
            result_category="baseline",
            priority_rank=3,
            finding=(
                f"The overall average observed days in stage is "
                f"{average_days:.2f}."
            ),
            evidence={
                "lead_count": lead_count,
                "average_days_in_stage": average_days,
            },
            limitation=(
                "Available temporal information is descriptive and does not "
                "constitute a full longitudinal time series."
            ),
            generated_at=generated_at,
        )
    )

    # ---------------------------------------------------------
    # STAGE RESULTS
    # ---------------------------------------------------------

    for rank, row in enumerate(
        stage_summary.itertuples(index=False),
        start=1
    ):
        stage = str(row.stage)

        results.append(
            make_result(
                result_id=f"stage_{stage.lower()}_total_value",
                result_type="stage_comparison",
                group_key=stage,
                metric_name="total_lead_value",
                result_value=row.total_lead_value,
                result_unit="currency",
                result_category="stage_comparison",
                priority_rank=rank,
                finding=(
                    f"The {stage} stage has observed total lead value of "
                    f"{row.total_lead_value:.2f} across "
                    f"{int(row.lead_count)} leads."
                ),
                evidence={
                    "group": stage,
                    "lead_count": int(row.lead_count),
                    "total_lead_value": float(row.total_lead_value),
                    "average_lead_value": float(row.average_lead_value),
                    "average_days_in_stage": float(
                        row.average_days_in_stage
                    ),
                },
                limitation=(
                    "Descriptive comparison within the available synthetic "
                    "sample; small stage groups require caution."
                ),
                generated_at=generated_at,
            )
        )

    # ---------------------------------------------------------
    # PRODUCT RESULTS
    # ---------------------------------------------------------

    for rank, row in enumerate(
        product_summary.itertuples(index=False),
        start=1
    ):
        product = str(row.category)

        results.append(
            make_result(
                result_id=f"product_{product.lower()}_total_value",
                result_type="product_comparison",
                group_key=product,
                metric_name="total_lead_value",
                result_value=row.total_lead_value,
                result_unit="currency",
                result_category="product_comparison",
                priority_rank=rank,
                finding=(
                    f"The {product} product category has observed total "
                    f"lead value of {row.total_lead_value:.2f} across "
                    f"{int(row.lead_count)} leads."
                ),
                evidence={
                    "group": product,
                    "lead_count": int(row.lead_count),
                    "total_lead_value": float(row.total_lead_value),
                    "average_lead_value": float(row.average_lead_value),
                    "average_days_in_stage": float(
                        row.average_days_in_stage
                    ),
                },
                limitation=(
                    "Descriptive comparison within the available synthetic "
                    "sample."
                ),
                generated_at=generated_at,
            )
        )

    # ---------------------------------------------------------
    # SOURCE RESULTS
    # ---------------------------------------------------------

    for rank, row in enumerate(
        source_summary.itertuples(index=False),
        start=1
    ):
        source = str(row.subcategory)

        results.append(
            make_result(
                result_id=f"source_{source.lower()}_total_value",
                result_type="source_comparison",
                group_key=source,
                metric_name="total_lead_value",
                result_value=row.total_lead_value,
                result_unit="currency",
                result_category="source_comparison",
                priority_rank=rank,
                finding=(
                    f"The {source} acquisition source has observed total "
                    f"lead value of {row.total_lead_value:.2f} across "
                    f"{int(row.lead_count)} leads."
                ),
                evidence={
                    "group": source,
                    "lead_count": int(row.lead_count),
                    "total_lead_value": float(row.total_lead_value),
                    "average_lead_value": float(row.average_lead_value),
                    "average_days_in_stage": float(
                        row.average_days_in_stage
                    ),
                },
                limitation=(
                    "Descriptive comparison within the available synthetic "
                    "sample."
                ),
                generated_at=generated_at,
            )
        )

    # ---------------------------------------------------------
    # VALIDATION EVIDENCE
    # ---------------------------------------------------------

    validation_status = "NOT_AVAILABLE"

    if VALIDATION_PATH.exists():
        with open(
            VALIDATION_PATH,
            "r",
            encoding="utf-8"
        ) as file:
            validation_data = json.load(file)

        validation_status = validation_data.get(
            "validation_status",
            "NOT_AVAILABLE"
        )

    # ---------------------------------------------------------
    # WEAK-CASE EVIDENCE
    # ---------------------------------------------------------

    weak_case_count = 0

    if WEAK_CASE_PATH.exists():
        with open(
            WEAK_CASE_PATH,
            "r",
            encoding="utf-8"
        ) as file:
            weak_case_data = json.load(file)

        weak_case_count = len(
            weak_case_data.get("weak_cases", [])
        )

    # ---------------------------------------------------------
    # SAVE INTELLIGENCE RESULTS
    # ---------------------------------------------------------

    results_payload = {
        "project_id": PROJECT_ID,
        "poc_title": POC_TITLE,
        "approved_track": APPROVED_TRACK,
        "data_version": DATA_VERSION,
        "method_version": METHOD_VERSION,
        "generated_at": generated_at,
        "result_count": len(results),
        "results": results,
    }

    with open(
        RESULTS_PATH,
        "w",
        encoding="utf-8"
    ) as file:
        json.dump(
            results_payload,
            file,
            indent=2,
            ensure_ascii=False
        )

    # ---------------------------------------------------------
    # KEY FINDINGS
    # ---------------------------------------------------------

    highest_stage = stage_summary.iloc[0]
    highest_product = product_summary.iloc[0]
    highest_source = source_summary.iloc[0]

    key_findings = [
        (
            f"Won is the highest observed-value funnel stage with "
            f"{float(highest_stage['total_lead_value']):.2f}."
        ),
        (
            f"Payments is the highest observed-value product category with "
            f"{float(highest_product['total_lead_value']):.2f}."
        ),
        (
            f"Website is the highest observed-value acquisition source with "
            f"{float(highest_source['total_lead_value']):.2f}."
        ),
    ]

    limitations = [
        "The dataset is synthetic.",
        "The available analytical sample contains 30 source CRM leads.",
        "The analysis is descriptive and does not establish causation.",
        "The analysis is not predictive.",
        "Team and location are not represented as separate canonical fields.",
        "The available temporal information does not constitute a full longitudinal time series.",
        "Small stage groups require cautious interpretation.",
    ]

    # ---------------------------------------------------------
    # SAVE INTELLIGENCE SUMMARY
    # ---------------------------------------------------------

    summary_payload = {
        "project_id": PROJECT_ID,
        "poc_title": POC_TITLE,
        "data_version": DATA_VERSION,
        "method_version": METHOD_VERSION,
        "approved_track": APPROVED_TRACK,
        "primary_question": PRIMARY_QUESTION,
        "decision": DECISION,
        "result_count": len(results),
        "key_findings": key_findings,
        "priority_items": [
            {
                "rank": 1,
                "dimension": "stage",
                "group": str(highest_stage["stage"]),
                "metric": "total_lead_value",
                "value": float(highest_stage["total_lead_value"]),
            },
            {
                "rank": 2,
                "dimension": "product",
                "group": str(highest_product["category"]),
                "metric": "total_lead_value",
                "value": float(highest_product["total_lead_value"]),
            },
            {
                "rank": 3,
                "dimension": "source",
                "group": str(highest_source["subcategory"]),
                "metric": "total_lead_value",
                "value": float(highest_source["total_lead_value"]),
            },
        ],
        "validation_result": validation_status,
        "weak_case_count": weak_case_count,
        "limitations": limitations,
        "generated_at": generated_at,
    }

    with open(
        SUMMARY_PATH,
        "w",
        encoding="utf-8"
    ) as file:
        json.dump(
            summary_payload,
            file,
            indent=2,
            ensure_ascii=False
        )

    print("INTELLIGENCE OUTPUTS GENERATED")
    print("Data version:", DATA_VERSION)
    print("Method version:", METHOD_VERSION)
    print("Approved track:", APPROVED_TRACK)
    print("Source leads:", lead_count)
    print("Result count:", len(results))
    print("Validation status:", validation_status)
    print("Weak cases:", weak_case_count)
    print("Results:", RESULTS_PATH)
    print("Summary:", SUMMARY_PATH)


if __name__ == "__main__":
    main()