from pathlib import Path
import json
import pandas as pd


ROOT = Path(__file__).resolve().parents[2]

CANONICAL_PATH = ROOT / "data" / "canonical" / "intelligence_data.csv"
OUTPUT_DIR = ROOT / "data-science" / "outputs"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------
# LOAD CANONICAL DATA
# ---------------------------------------------------------

df = pd.read_csv(CANONICAL_PATH)

# Use one CRM lead record per source lead.
leads = df[
    df["record_type"].astype(str).eq("crm_lead")
].copy()


# ---------------------------------------------------------
# NUMERIC CONVERSION
# ---------------------------------------------------------

leads["lead_value"] = pd.to_numeric(
    leads["metric_value"],
    errors="coerce"
)


# Days-in-stage records are stored separately.
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


# ---------------------------------------------------------
# COMBINE LEAD VALUE + DAYS IN STAGE
# ---------------------------------------------------------

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


# ---------------------------------------------------------
# REMOVE INVALID ANALYTICAL RECORDS
# ---------------------------------------------------------

analysis_df = analysis_df.dropna(
    subset=[
        "lead_value",
        "days_in_stage"
    ]
).copy()


# ---------------------------------------------------------
# HELPER FUNCTION
# ---------------------------------------------------------

def summarize_by(group_column):

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
        "total_lead_value",
        ascending=False
    )


# ---------------------------------------------------------
# COMPARATIVE TABLES
# ---------------------------------------------------------

stage_summary = summarize_by("stage")

product_summary = summarize_by("category")

source_summary = summarize_by("subcategory")


# ---------------------------------------------------------
# OVERALL SUMMARY
# ---------------------------------------------------------

overall_summary = {
    "source_leads_analyzed": int(
        analysis_df["source_record_id"].nunique()
    ),

    "total_lead_value": float(
        analysis_df["lead_value"].sum()
    ),

    "average_lead_value": float(
        analysis_df["lead_value"].mean()
    ),

    "average_days_in_stage": float(
        analysis_df["days_in_stage"].mean()
    ),

    "median_days_in_stage": float(
        analysis_df["days_in_stage"].median()
    ),
}


# ---------------------------------------------------------
# IDENTIFY HIGHEST OBSERVED GROUPS
# ---------------------------------------------------------

highest_value_stage = stage_summary.iloc[0]

highest_value_product = product_summary.iloc[0]

highest_value_source = source_summary.iloc[0]

highest_age_stage = (
    stage_summary
    .sort_values(
        "average_days_in_stage",
        ascending=False
    )
    .iloc[0]
)


# ---------------------------------------------------------
# INTERPRETATION
# ---------------------------------------------------------

interpretation = [
    (
        f"The analysis covers "
        f"{overall_summary['source_leads_analyzed']} source CRM leads."
    ),

    (
        f"The total observed lead value is "
        f"{overall_summary['total_lead_value']:.2f}."
    ),

    (
        f"The overall average lead value is "
        f"{overall_summary['average_lead_value']:.2f}."
    ),

    (
        f"The overall average days in stage is "
        f"{overall_summary['average_days_in_stage']:.2f}."
    ),

    (
        f"The stage with the highest total observed lead value is "
        f"{highest_value_stage['stage']}."
    ),

    (
        f"The product category with the highest total observed lead value is "
        f"{highest_value_product['category']}."
    ),

    (
        f"The acquisition source with the highest total observed lead value is "
        f"{highest_value_source['subcategory']}."
    ),

    (
        f"The stage with the highest average days in stage is "
        f"{highest_age_stage['stage']}."
    ),
]


# ---------------------------------------------------------
# LIMITATIONS
# ---------------------------------------------------------

limitations = [
    "The analysis uses 30 source CRM leads.",
    "The dataset is synthetic.",
    "Results describe the available sample and should not be generalized to a larger CRM population without additional evidence.",
    "Comparative associations do not establish causation.",
    "Team and location are not available as separate canonical fields.",
    "The analysis does not perform predictive modeling.",
]


# ---------------------------------------------------------
# SAVE CSV TABLES
# ---------------------------------------------------------

stage_summary.to_csv(
    OUTPUT_DIR / "track_a_stage_comparison.csv",
    index=False
)

product_summary.to_csv(
    OUTPUT_DIR / "track_a_product_comparison.csv",
    index=False
)

source_summary.to_csv(
    OUTPUT_DIR / "track_a_source_comparison.csv",
    index=False
)

analysis_df.to_csv(
    OUTPUT_DIR / "track_a_analysis_dataset.csv",
    index=False
)


# ---------------------------------------------------------
# SAVE JSON REPORT
# ---------------------------------------------------------

report = {
    "project": "Lead Funnel Conversion Observatory",
    "phase": "Phase 3",
    "track": "Track A — Comparative",
    "data_version": "phase3-v2",

    "analytical_question": (
        "How do lead value and days in stage vary across CRM funnel "
        "stages, acquisition sources and products within the available "
        "synthetic lead sample?"
    ),

    "overall_summary": overall_summary,

    "highest_observed_groups": {
        "highest_value_stage": {
            "stage": str(highest_value_stage["stage"]),
            "total_lead_value": float(
                highest_value_stage["total_lead_value"]
            ),
        },

        "highest_value_product": {
            "product": str(highest_value_product["category"]),
            "total_lead_value": float(
                highest_value_product["total_lead_value"]
            ),
        },

        "highest_value_source": {
            "source": str(highest_value_source["subcategory"]),
            "total_lead_value": float(
                highest_value_source["total_lead_value"]
            ),
        },

        "highest_average_age_stage": {
            "stage": str(highest_age_stage["stage"]),
            "average_days_in_stage": float(
                highest_age_stage["average_days_in_stage"]
            ),
        },
    },

    "interpretation": interpretation,

    "limitations": limitations,

    "outputs": [
        "track_a_analysis_dataset.csv",
        "track_a_stage_comparison.csv",
        "track_a_product_comparison.csv",
        "track_a_source_comparison.csv",
        "track_a_comparative_analysis.json",
    ],
}


with open(
    OUTPUT_DIR / "track_a_comparative_analysis.json",
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        report,
        file,
        indent=2,
        ensure_ascii=True
    )


# ---------------------------------------------------------
# TERMINAL SUMMARY
# ---------------------------------------------------------

print("TRACK A COMPARATIVE ANALYSIS GENERATED")
print("Source leads analyzed:", overall_summary["source_leads_analyzed"])
print(
    "Total lead value:",
    round(overall_summary["total_lead_value"], 2)
)
print(
    "Average lead value:",
    round(overall_summary["average_lead_value"], 2)
)
print(
    "Average days in stage:",
    round(overall_summary["average_days_in_stage"], 2)
)
print(
    "Highest value stage:",
    highest_value_stage["stage"]
)
print(
    "Highest value product:",
    highest_value_product["category"]
)
print(
    "Highest value source:",
    highest_value_source["subcategory"]
)
print(
    "Highest average-age stage:",
    highest_age_stage["stage"]
)

print("Output directory:", OUTPUT_DIR)