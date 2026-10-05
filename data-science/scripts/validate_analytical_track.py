from pathlib import Path
import json
import math
from datetime import datetime, timezone

import pandas as pd


# ============================================================
# CONFIGURATION
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

CANONICAL_PATH = PROJECT_ROOT / "data" / "canonical" / "intelligence_data.csv"
EXISTING_ANALYSIS_PATH = (
    PROJECT_ROOT
    / "data-science"
    / "outputs"
    / "track_a_analysis_dataset.csv"
)

STAGE_OUTPUT = (
    PROJECT_ROOT
    / "data-science"
    / "outputs"
    / "track_a_stage_comparison.csv"
)

PRODUCT_OUTPUT = (
    PROJECT_ROOT
    / "data-science"
    / "outputs"
    / "track_a_product_comparison.csv"
)

SOURCE_OUTPUT = (
    PROJECT_ROOT
    / "data-science"
    / "outputs"
    / "track_a_source_comparison.csv"
)

OUTPUT_DIR = PROJECT_ROOT / "data-science" / "outputs"

EXPECTED_DATA_VERSION = "phase3-v2"
METHOD_VERSION = "1.0.0"

# Sensitivity threshold only.
# This does NOT replace the full Track A analysis.
MIN_GROUP_SIZE = 5


# ============================================================
# HELPERS
# ============================================================

def fail(message):
    raise RuntimeError(message)


def clean_numeric(series):
    return pd.to_numeric(series, errors="coerce")


def values_match(a, b, tolerance=1e-9):
    if pd.isna(a) and pd.isna(b):
        return True

    if pd.isna(a) or pd.isna(b):
        return False

    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return math.isclose(
            float(a),
            float(b),
            rel_tol=tolerance,
            abs_tol=tolerance,
        )

    return str(a) == str(b)


def compare_dataframes(expected, actual, key_columns, numeric_columns):
    """
    Compare independently generated analytical results with
    the previously generated Track A outputs.

    Returns a structured discrepancy report.
    """

    discrepancies = []

    expected = expected.copy()
    actual = actual.copy()

    # Check columns
    missing_expected = [
        c for c in expected.columns
        if c not in actual.columns
    ]

    if missing_expected:
        discrepancies.append(
            {
                "type": "missing_columns",
                "columns": missing_expected,
            }
        )

    if discrepancies:
        return discrepancies

    # Check row counts
    if len(expected) != len(actual):
        discrepancies.append(
            {
                "type": "row_count_mismatch",
                "expected": len(expected),
                "actual": len(actual),
            }
        )

    # Check key values
    for key in key_columns:
        expected_values = set(expected[key].astype(str))
        actual_values = set(actual[key].astype(str))

        if expected_values != actual_values:
            discrepancies.append(
                {
                    "type": "key_value_mismatch",
                    "column": key,
                    "expected": sorted(expected_values),
                    "actual": sorted(actual_values),
                }
            )

    # Merge for numerical comparison
    try:
        merged = expected.merge(
            actual,
            on=key_columns,
            how="outer",
            suffixes=("_expected", "_actual"),
            indicator=True,
        )
    except Exception as exc:
        discrepancies.append(
            {
                "type": "merge_error",
                "message": str(exc),
            }
        )
        return discrepancies

    # Check missing rows after merge
    if (merged["_merge"] != "both").any():
        discrepancies.append(
            {
                "type": "unmatched_rows",
                "rows": merged.loc[
                    merged["_merge"] != "both"
                ].to_dict("records"),
            }
        )

    # Compare numerical fields
    for column in numeric_columns:
        expected_column = f"{column}_expected"
        actual_column = f"{column}_actual"

        if expected_column not in merged.columns:
            continue

        if actual_column not in merged.columns:
            discrepancies.append(
                {
                    "type": "missing_actual_column",
                    "column": column,
                }
            )
            continue

        for index, row in merged.iterrows():

            if row["_merge"] != "both":
                continue

            expected_value = row[expected_column]
            actual_value = row[actual_column]

            if not values_match(expected_value, actual_value):
                discrepancies.append(
                    {
                        "type": "numeric_mismatch",
                        "column": column,
                        "key": {
                            key: row[key]
                            for key in key_columns
                        },
                        "expected": expected_value,
                        "actual": actual_value,
                    }
                )

    return discrepancies


# ============================================================
# LOAD CANONICAL DATA
# ============================================================

print("=" * 70)
print("TRACK A ANALYTICAL VALIDATION")
print("=" * 70)

print("\n[1] Loading canonical dataset...")

if not CANONICAL_PATH.exists():
    fail(f"Canonical dataset not found: {CANONICAL_PATH}")

df = pd.read_csv(CANONICAL_PATH)

print(f"Canonical rows: {len(df)}")
print(f"Canonical columns: {len(df.columns)}")


# ============================================================
# CANONICAL SCHEMA VALIDATION
# ============================================================

print("\n[2] Validating canonical schema...")

required_columns = [
    "record_id",
    "record_type",
    "observed_at",
    "entity_id",
    "category",
    "subcategory",
    "status",
    "stage",
    "metric_name",
    "metric_value",
    "source_record_id",
    "is_synthetic",
    "data_version",
]

missing_columns = [
    column
    for column in required_columns
    if column not in df.columns
]

if missing_columns:
    fail(
        "Missing required canonical columns: "
        + ", ".join(missing_columns)
    )

print("Required canonical columns: PASS")


# ============================================================
# DATA VERSION VALIDATION
# ============================================================

print("\n[3] Validating data version...")

versions = (
    df["data_version"]
    .dropna()
    .astype(str)
    .unique()
    .tolist()
)

print(f"Observed data versions: {versions}")

if versions != [EXPECTED_DATA_VERSION]:
    fail(
        "Canonical data version mismatch. "
        f"Expected {EXPECTED_DATA_VERSION}, "
        f"found {versions}"
    )

print(
    f"Data version {EXPECTED_DATA_VERSION}: PASS"
)


# ============================================================
# INDEPENDENT ANALYTICAL DATASET
# ============================================================

print("\n[4] Building independent analytical dataset...")

lead_rows = df[
    df["record_type"].astype(str).eq("crm_lead")
].copy()

metric_rows = df[
    df["metric_name"].astype(str).eq("days_in_stage")
].copy()

lead_rows["lead_value"] = clean_numeric(
    lead_rows["metric_value"]
)

metric_rows["days_in_stage"] = clean_numeric(
    metric_rows["metric_value"]
)

days_lookup = (
    metric_rows[
        ["source_record_id", "days_in_stage"]
    ]
    .drop_duplicates(
        subset=["source_record_id"]
    )
)

analytical = lead_rows[
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
].merge(
    days_lookup,
    on="source_record_id",
    how="left",
)

analytical = analytical.dropna(
    subset=[
        "lead_value",
        "days_in_stage",
    ]
).copy()

analytical = analytical.sort_values(
    "source_record_id"
).reset_index(drop=True)

print(
    f"Independent analytical rows: {len(analytical)}"
)

if len(analytical) != 30:
    fail(
        "Expected 30 source leads in the analytical dataset, "
        f"found {len(analytical)}"
    )

print("Expected 30 source leads: PASS")


# ============================================================
# BASELINE
# ============================================================

print("\n[5] Calculating independent baseline...")

baseline = {
    "lead_count": int(len(analytical)),
    "total_lead_value": float(
        analytical["lead_value"].sum()
    ),
    "average_lead_value": float(
        analytical["lead_value"].mean()
    ),
    "average_days_in_stage": float(
        analytical["days_in_stage"].mean()
    ),
    "median_days_in_stage": float(
        analytical["days_in_stage"].median()
    ),
}

print(
    f"Lead count: {baseline['lead_count']}"
)
print(
    f"Total lead value: {baseline['total_lead_value']}"
)
print(
    f"Average lead value: "
    f"{baseline['average_lead_value']:.2f}"
)
print(
    f"Average days in stage: "
    f"{baseline['average_days_in_stage']:.2f}"
)
print(
    f"Median days in stage: "
    f"{baseline['median_days_in_stage']:.2f}"
)


# ============================================================
# TRACK A GROUP SUMMARIES
# ============================================================

print("\n[6] Calculating independent Track A group summaries...")


def summarize_by(group_column):

    grouped = (
        analytical
        .groupby(group_column, dropna=False)
        .agg(
            lead_count=("source_record_id", "count"),
            total_lead_value=("lead_value", "sum"),
            average_lead_value=("lead_value", "mean"),
            average_days_in_stage=("days_in_stage", "mean"),
            median_days_in_stage=("days_in_stage", "median"),
        )
        .reset_index()
    )

    total_value = grouped[
        "total_lead_value"
    ].sum()

    if total_value != 0:
        grouped["value_share_percent"] = (
            grouped["total_lead_value"]
            / total_value
            * 100
        )
    else:
        grouped["value_share_percent"] = 0.0

    # Deterministic ranking:
    # 1. total lead value descending
    # 2. group name ascending
    grouped = grouped.sort_values(
        by=[
            "total_lead_value",
            group_column,
        ],
        ascending=[
            False,
            True,
        ],
        kind="mergesort",
    ).reset_index(drop=True)

    return grouped


stage_summary = summarize_by("stage")
product_summary = summarize_by("category")
source_summary = summarize_by("subcategory")


# ============================================================
# COMPARE WITH EXISTING TRACK A OUTPUTS
# ============================================================

print("\n[7] Comparing independent calculations with existing outputs...")


comparison_specs = [
    (
        "stage",
        stage_summary,
        STAGE_OUTPUT,
        ["stage"],
    ),
    (
        "product",
        product_summary,
        PRODUCT_OUTPUT,
        ["category"],
    ),
    (
        "source",
        source_summary,
        SOURCE_OUTPUT,
        ["subcategory"],
    ),
]

all_discrepancies = []

numeric_columns = [
    "lead_count",
    "total_lead_value",
    "average_lead_value",
    "average_days_in_stage",
    "median_days_in_stage",
    "value_share_percent",
]

comparison_results = {}

for name, independent_result, existing_path, key_columns in comparison_specs:

    print(f"\nChecking {name} comparison...")

    if not existing_path.exists():
        fail(
            f"Existing Track A output not found: "
            f"{existing_path}"
        )

    existing_result = pd.read_csv(existing_path)

    discrepancies = compare_dataframes(
        independent_result,
        existing_result,
        key_columns,
        numeric_columns,
    )

    comparison_results[name] = {
        "rows_expected": len(independent_result),
        "rows_existing": len(existing_result),
        "discrepancies": discrepancies,
    }

    if discrepancies:
        print(
            f"{name}: FAIL — "
            f"{len(discrepancies)} discrepancy item(s)"
        )

        all_discrepancies.extend(
            [
                {
                    "dimension": name,
                    **item,
                }
                for item in discrepancies
            ]
        )

    else:
        print(
            f"{name}: PASS — "
            "independent values match existing output"
        )


# ============================================================
# COMPARE ANALYTICAL DATASET
# ============================================================

print("\n[8] Comparing independent analytical dataset...")

if not EXISTING_ANALYSIS_PATH.exists():
    fail(
        f"Existing analytical dataset not found: "
        f"{EXISTING_ANALYSIS_PATH}"
    )

existing_analytical = pd.read_csv(
    EXISTING_ANALYSIS_PATH
)

analytical_key = ["source_record_id"]

analytical_columns = [
    "category",
    "subcategory",
    "status",
    "stage",
    "observed_at",
    "lead_value",
    "is_synthetic",
    "data_version",
    "days_in_stage",
]

dataset_discrepancies = compare_dataframes(
    analytical[
        analytical_key + analytical_columns
    ],
    existing_analytical[
        analytical_key + analytical_columns
    ],
    analytical_key,
    [
        "lead_value",
        "days_in_stage",
    ],
)

# Explicit categorical/text comparison
merged_dataset = analytical[
    analytical_key + analytical_columns
].merge(
    existing_analytical[
        analytical_key + analytical_columns
    ],
    on=analytical_key,
    how="outer",
    suffixes=("_expected", "_actual"),
    indicator=True,
)

for column in [
    "category",
    "subcategory",
    "status",
    "stage",
    "observed_at",
    "is_synthetic",
    "data_version",
]:

    expected_column = f"{column}_expected"
    actual_column = f"{column}_actual"

    if (
        expected_column not in merged_dataset.columns
        or actual_column not in merged_dataset.columns
    ):
        continue

    for _, row in merged_dataset.iterrows():

        if row["_merge"] != "both":
            continue

        expected_value = row[expected_column]
        actual_value = row[actual_column]

        if str(expected_value) != str(actual_value):

            dataset_discrepancies.append(
                {
                    "type": "dataset_value_mismatch",
                    "column": column,
                    "key": {
                        "source_record_id":
                        row["source_record_id"]
                    },
                    "expected": expected_value,
                    "actual": actual_value,
                }
            )

if dataset_discrepancies:

    print(
        "Analytical dataset comparison: FAIL"
    )

    all_discrepancies.extend(
        [
            {
                "dimension": "analytical_dataset",
                **item,
            }
            for item in dataset_discrepancies
        ]
    )

else:

    print(
        "Analytical dataset comparison: PASS"
    )


# ============================================================
# TOP-RANK RESULTS
# ============================================================

print("\n[9] Checking Track A rankings...")

rankings = {
    "stage": {
        "top_group": str(
            stage_summary.iloc[0]["stage"]
        ),
        "top_value": float(
            stage_summary.iloc[0]["total_lead_value"]
        ),
    },
    "product": {
        "top_group": str(
            product_summary.iloc[0]["category"]
        ),
        "top_value": float(
            product_summary.iloc[0]["total_lead_value"]
        ),
    },
    "source": {
        "top_group": str(
            source_summary.iloc[0]["subcategory"]
        ),
        "top_value": float(
            source_summary.iloc[0]["total_lead_value"]
        ),
    },
}

for dimension, result in rankings.items():

    print(
        f"{dimension}: "
        f"{result['top_group']} "
        f"({result['top_value']:.2f})"
    )


# ============================================================
# GROUP SIZE ASSESSMENT
# ============================================================

print("\n[10] Assessing group sizes...")

group_size_assessment = {}

for dimension, summary, group_column in [
    ("stage", stage_summary, "stage"),
    ("product", product_summary, "category"),
    ("source", source_summary, "subcategory"),
]:

    small_groups = summary[
        summary["lead_count"] < MIN_GROUP_SIZE
    ].copy()

    group_size_assessment[dimension] = {
        "minimum_group_size_threshold":
        MIN_GROUP_SIZE,
        "groups": summary[
            [
                group_column,
                "lead_count",
            ]
        ].to_dict("records"),
        "small_groups":
        small_groups[
            [
                group_column,
                "lead_count",
            ]
        ].to_dict("records"),
    }

    print(
        f"{dimension}: "
        f"{len(small_groups)} group(s) "
        f"below sensitivity threshold {MIN_GROUP_SIZE}"
    )


# ============================================================
# SMALL-GROUP SENSITIVITY
# ============================================================

print("\n[11] Performing small-group sensitivity analysis...")

sensitivity_results = {}

for dimension, summary, group_column in [
    ("stage", stage_summary, "stage"),
    ("product", product_summary, "category"),
    ("source", source_summary, "subcategory"),
]:

    full_order = summary[
        group_column
    ].astype(str).tolist()

    sensitivity = summary[
        summary["lead_count"] >= MIN_GROUP_SIZE
    ].copy()

    sensitivity = sensitivity.sort_values(
        by=[
            "total_lead_value",
            group_column,
        ],
        ascending=[
            False,
            True,
        ],
        kind="mergesort",
    )

    sensitivity_order = sensitivity[
        group_column
    ].astype(str).tolist()

    common_groups = [
        group
        for group in full_order
        if group in sensitivity_order
    ]

    full_common_order = [
        group
        for group in full_order
        if group in common_groups
    ]

    sensitivity_common_order = [
        group
        for group in sensitivity_order
        if group in common_groups
    ]

    sensitivity_results[dimension] = {
        "full_order": full_order,
        "sensitivity_order": sensitivity_order,
        "common_groups": common_groups,
        "common_order_stable":
        full_common_order
        == sensitivity_common_order,
        "excluded_groups":
        [
            group
            for group in full_order
            if group not in sensitivity_order
        ],
    }

    print(
        f"{dimension}: "
        f"common ranking stable = "
        f"{sensitivity_results[dimension]['common_order_stable']}"
    )


# ============================================================
# MISSING-GROUP EFFECTS
# ============================================================

print("\n[12] Assessing missing-group effects...")

missing_effects = {}

for dimension, group_column in [
    ("stage", "stage"),
    ("product", "category"),
    ("source", "subcategory"),
]:

    missing_count = int(
        analytical[group_column]
        .isna()
        .sum()
    )

    missing_effects[dimension] = {
        "missing_group_count": missing_count,
        "missing_group_present":
        missing_count > 0,
    }

    print(
        f"{dimension}: "
        f"{missing_count} missing group value(s)"
    )


# ============================================================
# WEAK-CASE REVIEW
# ============================================================

print("\n[13] Reviewing weak cases...")

weak_cases = []

for dimension, summary, group_column in [
    ("stage", stage_summary, "stage"),
    ("product", product_summary, "category"),
    ("source", source_summary, "subcategory"),
]:

    for _, row in summary.iterrows():

        group_name = str(row[group_column])
        count = int(row["lead_count"])

        if count < MIN_GROUP_SIZE:

            weak_cases.append(
                {
                    "dimension": dimension,
                    "group": group_name,
                    "lead_count": count,
                    "reason":
                    "Sparse group below sensitivity threshold",
                    "interpretation":
                    "Result is descriptive but should be "
                    "interpreted cautiously because the group "
                    "contains fewer observations than the "
                    "sensitivity threshold.",
                }
            )


# Additional descriptive weak-case:
# Lost has the highest average days in stage.

lost_rows = stage_summary[
    stage_summary["stage"].astype(str).eq("Lost")
]

if not lost_rows.empty:

    lost_row = lost_rows.iloc[0]

    weak_cases.append(
        {
            "dimension": "stage",
            "group": "Lost",
            "lead_count": int(
                lost_row["lead_count"]
            ),
            "reason":
            "Highest average days in stage",
            "interpretation":
            "Lost shows the highest observed average days "
            "in stage, but the group is small and the result "
            "is descriptive rather than causal.",
        }
    )


# Remove exact duplicates
unique_weak_cases = []

seen = set()

for case in weak_cases:

    key = (
        case["dimension"],
        case["group"],
        case["reason"],
    )

    if key not in seen:

        seen.add(key)
        unique_weak_cases.append(case)

weak_cases = unique_weak_cases

print(
    f"Weak-case items identified: {len(weak_cases)}"
)


# ============================================================
# VALIDATION STATUS
# ============================================================

print("\n[14] Evaluating validation status...")

calculation_accuracy = (
    len(all_discrepancies) == 0
)

ranking_stability = all(
    result["common_order_stable"]
    for result in sensitivity_results.values()
)

missing_group_effects_clear = all(
    not result["missing_group_present"]
    for result in missing_effects.values()
)

validation_pass = (
    calculation_accuracy
    and ranking_stability
    and missing_group_effects_clear
)

validation_status = (
    "PASS"
    if validation_pass
    else "FAIL"
)

print(
    f"Calculation accuracy: "
    f"{'PASS' if calculation_accuracy else 'FAIL'}"
)

print(
    f"Ranking stability: "
    f"{'PASS' if ranking_stability else 'FAIL'}"
)

print(
    f"Missing-group effects: "
    f"{'PASS' if missing_group_effects_clear else 'REVIEW'}"
)

print(
    f"OVERALL VALIDATION: {validation_status}"
)


# ============================================================
# VALIDATION METRICS OUTPUT
# ============================================================

print("\n[15] Writing validation_metrics.json...")

validation_metrics = {

    "project_id":
    "POC-7",

    "poc_title":
    "Lead Funnel Conversion Observatory",

    "approved_track":
    "Track A - Comparative Intelligence",

    "data_version":
    EXPECTED_DATA_VERSION,

    "method_version":
    METHOD_VERSION,

    "generated_at":
    datetime.now(timezone.utc).isoformat(),

    "baseline":
    baseline,

    "calculation_accuracy":
    {
        "status":
        "PASS"
        if calculation_accuracy
        else "FAIL",

        "discrepancy_count":
        len(all_discrepancies),

        "discrepancies":
        all_discrepancies,
    },

    "group_size_assessment":
    group_size_assessment,

    "small_group_sensitivity":
    sensitivity_results,

    "missing_group_effects":
    missing_effects,

    "ranking_results":
    rankings,

    "weak_case_count":
    len(weak_cases),

    "validation_status":
    validation_status,
}

validation_metrics_path = (
    OUTPUT_DIR / "validation_metrics.json"
)

with open(
    validation_metrics_path,
    "w",
    encoding="utf-8",
) as file:

    json.dump(
        validation_metrics,
        file,
        indent=2,
    )


# ============================================================
# WEAK CASE OUTPUT
# ============================================================

print(
    "\n[16] Writing weak_case_review.json..."
)

weak_case_output = {

    "project_id":
    "POC-7",

    "approved_track":
    "Track A - Comparative Intelligence",

    "data_version":
    EXPECTED_DATA_VERSION,

    "method_version":
    METHOD_VERSION,

    "generated_at":
    datetime.now(timezone.utc).isoformat(),

    "minimum_group_size_sensitivity":
    MIN_GROUP_SIZE,

    "weak_cases":
    weak_cases,

    "summary":
    (
        "Weak cases include sparse groups, "
        "ranking sensitivity considerations, "
        "and descriptive findings that require "
        "cautious interpretation."
    ),
}

weak_case_path = (
    OUTPUT_DIR / "weak_case_review.json"
)

with open(
    weak_case_path,
    "w",
    encoding="utf-8",
) as file:

    json.dump(
        weak_case_output,
        file,
        indent=2,
    )


# ============================================================
# FINAL TERMINAL SUMMARY
# ============================================================

print("\n" + "=" * 70)
print("TRACK A VALIDATION SUMMARY")
print("=" * 70)

print(
    f"Canonical data version : "
    f"{EXPECTED_DATA_VERSION}"
)

print(
    f"Method version         : "
    f"{METHOD_VERSION}"
)

print(
    f"Analytical rows        : "
    f"{len(analytical)}"
)

print(
    f"Calculation accuracy   : "
    f"{'PASS' if calculation_accuracy else 'FAIL'}"
)

print(
    f"Ranking stability      : "
    f"{'PASS' if ranking_stability else 'FAIL'}"
)

print(
    f"Missing-group review   : "
    f"{'PASS' if missing_group_effects_clear else 'REVIEW'}"
)

print(
    f"Weak cases reviewed    : "
    f"{len(weak_cases)}"
)

print(
    f"Overall validation     : "
    f"{validation_status}"
)

print(
    f"\nValidation metrics: "
    f"{validation_metrics_path}"
)

print(
    f"Weak-case review: "
    f"{weak_case_path}"
)

print("=" * 70)