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

canonical_records = int(len(df))
canonical_columns = int(len(df.columns))


# ---------------------------------------------------------
# REQUIRED CANONICAL COLUMNS
# ---------------------------------------------------------

required_columns = [
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

missing_columns = [
    column
    for column in required_columns
    if column not in df.columns
]


# ---------------------------------------------------------
# METADATA VALIDATION
# ---------------------------------------------------------

synthetic_values = (
    df["is_synthetic"]
    .astype(str)
    .str.lower()
    .unique()
    .tolist()
)

data_versions = (
    df["data_version"]
    .astype(str)
    .unique()
    .tolist()
)


# ---------------------------------------------------------
# ANALYTICAL MEASURES
# ---------------------------------------------------------

lead_value_records = df[
    df["metric_name"].astype(str).eq("lead_value")
].copy()

days_records = df[
    df["metric_name"].astype(str).eq("days_in_stage")
].copy()


lead_value_numeric = pd.to_numeric(
    lead_value_records["metric_value"],
    errors="coerce"
)

days_numeric = pd.to_numeric(
    days_records["metric_value"],
    errors="coerce"
)


lead_value_valid = bool(
    len(lead_value_records) > 0
    and bool(lead_value_numeric.notna().all())
)

days_valid = bool(
    len(days_records) > 0
    and bool(days_numeric.notna().all())
)


# ---------------------------------------------------------
# SOURCE CRM LEADS
# ---------------------------------------------------------

crm_leads = df[
    df["record_type"].astype(str).eq("crm_lead")
].copy()

source_lead_count = int(
    crm_leads["source_record_id"].nunique()
)


# ---------------------------------------------------------
# CANONICAL DIMENSIONS
# ---------------------------------------------------------

products = sorted(
    crm_leads["category"]
    .dropna()
    .astype(str)
    .unique()
    .tolist()
)

sources = sorted(
    crm_leads["subcategory"]
    .dropna()
    .astype(str)
    .unique()
    .tolist()
)

stages = sorted(
    crm_leads["stage"]
    .dropna()
    .astype(str)
    .unique()
    .tolist()
)


# ---------------------------------------------------------
# PRIMARY ARCHETYPE
# ---------------------------------------------------------

primary_archetype = "Process Lifecycle"

secondary_archetype = "Entity / Snapshot"

archetype_evidence = [
    "CRM funnel stages are explicitly represented.",
    "Days in stage provides process-ageing information.",
    "Won and Lost provide outcome stages.",
    "Product and acquisition-source categories are preserved.",
    "Dates provide temporal context but do not establish repeated longitudinal measurements.",
]


# ---------------------------------------------------------
# ANALYTICAL TRACKS
# ---------------------------------------------------------

track_status = {
    "Track A — Comparative": "SUPPORTED",
    "Track B — Trend": "CONDITIONAL",
    "Track C — Risk & Priority": "CONDITIONAL",
    "Track D — Anomaly": "CONDITIONAL",
    "Track E — Segmentation": "SUPPORTED",
    "Track F — Predictive": "NOT SUPPORTED",
    "Track G — Simulation": "NOT SUPPORTED",
    "Track H — Text & Theme": "NOT SUPPORTED",
}

primary_track = "Track A — Comparative"

optional_supporting_track = "Track C — Risk & Priority"


# ---------------------------------------------------------
# PRIMARY ANALYTICAL QUESTION
# ---------------------------------------------------------

primary_question = (
    "How do lead value and days in stage vary across CRM funnel "
    "stages, acquisition sources and products within the available "
    "synthetic lead sample?"
)

decision_use = (
    "Operational review of the existing lead funnel by identifying "
    "where lead value and stage ageing are concentrated across "
    "available CRM groups."
)


# ---------------------------------------------------------
# LIMITATIONS
# ---------------------------------------------------------

limitations = [
    "The source dataset contains 30 CRM leads.",
    "The dataset is synthetic.",
    "The canonical dataset contains 60 standardized analytical records derived from the 30 source leads.",
    "Dates do not establish repeated longitudinal measurements.",
    "The canonical schema does not preserve team and location as separate canonical fields.",
    "No geographic coordinates are available.",
    "No substantial free-text field is available for text/theme analysis.",
    "No scenario parameters are available for simulation analysis.",
    "The sample should not be interpreted as representative of a larger real-world CRM population without additional evidence.",
]


# ---------------------------------------------------------
# FINAL READINESS CHECKS
# ---------------------------------------------------------

structural_pass = bool(
    len(missing_columns) == 0
)

metadata_pass = bool(
    "true" in synthetic_values
    and "phase3-v2" in data_versions
)

measure_pass = bool(
    lead_value_valid
    and days_valid
)

coverage_pass = bool(
    source_lead_count == 30
)


if (
    structural_pass
    and metadata_pass
    and measure_pass
    and coverage_pass
):
    final_result = "DATA READY FOR ANALYTICAL TRACK DEVELOPMENT"
else:
    final_result = "CHANGES REQUIRED"


# ---------------------------------------------------------
# FINAL ASSESSMENT OBJECT
# ---------------------------------------------------------

assessment = {
    "project": "Lead Funnel Conversion Observatory",
    "phase": "Phase 3",
    "data_version": "phase3-v2",
    "source_name": "phase2_crmData",

    "canonical_records": canonical_records,
    "canonical_columns": canonical_columns,
    "source_leads": source_lead_count,

    "structural_validation": {
        "status": "PASS" if structural_pass else "FAIL",
        "missing_columns": missing_columns,
    },

    "metadata_validation": {
        "status": "PASS" if metadata_pass else "FAIL",
        "synthetic_values": synthetic_values,
        "data_versions": data_versions,
    },

    "measure_validation": {
        "status": "PASS" if measure_pass else "FAIL",
        "lead_value_records": int(len(lead_value_records)),
        "lead_value_numeric": bool(lead_value_valid),
        "days_in_stage_records": int(len(days_records)),
        "days_in_stage_numeric": bool(days_valid),
    },

    "coverage_validation": {
        "status": "PASS" if coverage_pass else "FAIL",
        "source_leads": source_lead_count,
    },

    "primary_archetype": primary_archetype,

    "secondary_archetype": secondary_archetype,

    "archetype_evidence": archetype_evidence,

    "tracks": track_status,

    "primary_track": primary_track,

    "optional_supporting_track": optional_supporting_track,

    "primary_analytical_question": primary_question,

    "decision_use": decision_use,

    "available_dimensions": {
        "stages": stages,
        "products": products,
        "sources": sources,
    },

    "limitations": limitations,

    "final_result": final_result,
}


# ---------------------------------------------------------
# SAVE OUTPUT
# ---------------------------------------------------------

output_path = (
    OUTPUT_DIR / "analytical_readiness.json"
)

with open(
    output_path,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        assessment,
        file,
        indent=2,
        ensure_ascii=True
    )


# ---------------------------------------------------------
# TERMINAL SUMMARY
# ---------------------------------------------------------

print("ANALYTICAL READINESS ASSESSMENT GENERATED")
print("Final result:", final_result)
print("Primary archetype:", primary_archetype)
print("Primary track:", primary_track)
print("Lead value records:", len(lead_value_records))
print("Days-in-stage records:", len(days_records))
print("Source leads:", source_lead_count)
print("Output:", output_path)