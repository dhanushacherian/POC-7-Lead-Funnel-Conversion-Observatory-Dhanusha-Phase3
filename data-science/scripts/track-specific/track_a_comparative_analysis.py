"""
POC-7 Phase 3
Track A - Comparative Intelligence

Track-specific reusable analytical module.

Purpose:
Provide reusable functions for descriptive comparison of:
- Funnel stage
- Product category
- Acquisition source

The module uses one source CRM lead as the analytical unit.
"""

from __future__ import annotations

from typing import Dict, Tuple

import pandas as pd


METHOD_VERSION = "1.0.0"


def build_analytical_dataset(
    canonical_df: pd.DataFrame,
) -> pd.DataFrame:
    """
    Reconstruct one analytical row per source CRM lead.

    Expected canonical record types:
    - crm_lead
    - crm_lead_metric
    """

    source_leads = canonical_df[
        canonical_df["record_type"] == "crm_lead"
    ].copy()

    metric_records = canonical_df[
        canonical_df["record_type"] == "crm_lead_metric"
    ].copy()

    if source_leads.empty:
        raise ValueError(
            "No crm_lead records were found in the canonical dataset."
        )

    if metric_records.empty:
        raise ValueError(
            "No crm_lead_metric records were found in the canonical dataset."
        )

    # One metric record per entity containing observed days in stage.
    days_by_entity = (
        metric_records
        .set_index("entity_id")["metric_value"]
        .astype(float)
    )

    analysis = source_leads[
        [
            "entity_id",
            "stage",
            "category",
            "subcategory",
            "metric_value",
        ]
    ].copy()

    analysis = analysis.rename(
        columns={
            "metric_value": "lead_value"
        }
    )

    analysis["days_in_stage"] = (
        analysis["entity_id"]
        .map(days_by_entity)
    )

    if analysis["lead_value"].isna().any():
        raise ValueError(
            "Missing lead values detected in the analytical dataset."
        )

    if analysis["days_in_stage"].isna().any():
        raise ValueError(
            "Missing days-in-stage values detected in the analytical dataset."
        )

    return analysis.reset_index(drop=True)


def calculate_baseline(
    analysis_df: pd.DataFrame,
) -> Dict[str, float]:
    """
    Calculate the approved descriptive baseline.
    """

    return {
        "lead_count": int(len(analysis_df)),
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


def _summarize_dimension(
    analysis_df: pd.DataFrame,
    dimension: str,
) -> pd.DataFrame:
    """
    Summarize one approved comparison dimension.
    """

    summary = (
        analysis_df
        .groupby(dimension, dropna=False)
        .agg(
            lead_count=("entity_id", "count"),
            total_lead_value=("lead_value", "sum"),
            average_lead_value=("lead_value", "mean"),
            average_days_in_stage=("days_in_stage", "mean"),
            median_days_in_stage=("days_in_stage", "median"),
        )
        .reset_index()
    )

    total_value = analysis_df["lead_value"].sum()

    if total_value == 0:
        summary["value_share_percent"] = 0.0
    else:
        summary["value_share_percent"] = (
            summary["total_lead_value"] / total_value * 100.0
        )

    # Deterministic ranking:
    # primary = total observed lead value descending
    # secondary = group label ascending
    summary = summary.sort_values(
        by=[
            "total_lead_value",
            dimension,
        ],
        ascending=[
            False,
            True,
        ],
        na_position="last",
    ).reset_index(drop=True)

    summary["priority_rank"] = (
        summary.index + 1
    )

    return summary


def compare_track_a(
    analysis_df: pd.DataFrame,
) -> Dict[str, pd.DataFrame]:
    """
    Generate all approved Track A comparative summaries.
    """

    dimensions = {
        "stage": "stage",
        "product": "category",
        "source": "subcategory",
    }

    return {
        output_name: _summarize_dimension(
            analysis_df,
            column_name,
        )
        for output_name, column_name in dimensions.items()
    }


def run_track_a(
    canonical_df: pd.DataFrame,
) -> Tuple[pd.DataFrame, Dict[str, float], Dict[str, pd.DataFrame]]:
    """
    Complete reusable Track A calculation.

    Returns:
        analytical dataset
        baseline
        comparative summaries
    """

    analysis = build_analytical_dataset(
        canonical_df
    )

    baseline = calculate_baseline(
        analysis
    )

    comparisons = compare_track_a(
        analysis
    )

    return (
        analysis,
        baseline,
        comparisons,
    )


if __name__ == "__main__":
    print(
        "Track A Comparative Intelligence module loaded successfully."
    )
    print(
        f"Method version: {METHOD_VERSION}"
    )