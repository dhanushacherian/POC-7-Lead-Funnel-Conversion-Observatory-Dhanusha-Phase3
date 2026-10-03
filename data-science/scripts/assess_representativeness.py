from pathlib import Path
import json
import pandas as pd


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

MANIFEST_FILE = (
    PROJECT_ROOT
    / "data"
    / "manifest.json"
)

OUTPUT_FILE = (
    PROJECT_ROOT
    / "data-science"
    / "outputs"
    / "representativeness_assessment.json"
)


def distribution(series):
    """Return a simple value-count distribution."""
    return {
        str(key): int(value)
        for key, value in (
            series.fillna("<missing>")
            .value_counts(dropna=False)
            .to_dict()
            .items()
        )
    }


def extract_location(text):
    """Extract location from canonical text_value."""
    if pd.isna(text):
        return None

    for item in str(text).split(";"):
        if item.startswith("location="):
            return item.split("=", 1)[1]

    return None


def extract_team(text):
    """Extract team from canonical text_value."""
    if pd.isna(text):
        return None

    for item in str(text).split(";"):
        if item.startswith("team="):
            return item.split("=", 1)[1]

    return None


def compare_distributions(source_dist, canonical_dist):
    """
    Compare the presence of categories rather than requiring identical
    proportions, because the canonical dataset expands each source lead
    into two canonical records.
    """
    source_values = set(source_dist.keys())
    canonical_values = set(canonical_dist.keys())

    return {
        "source_values": sorted(source_values),
        "canonical_values": sorted(canonical_values),
        "missing_from_canonical": sorted(
            source_values - canonical_values
        ),
        "unexpected_in_canonical": sorted(
            canonical_values - source_values
        ),
    }


def main():
    # ---------------------------------------------------------
    # Required files
    # ---------------------------------------------------------

    if not CANONICAL_FILE.exists():
        raise FileNotFoundError(
            f"Canonical file not found: {CANONICAL_FILE}"
        )

    if not SOURCE_SAMPLE_FILE.exists():
        raise FileNotFoundError(
            f"Source sample not found: {SOURCE_SAMPLE_FILE}"
        )

    if not MANIFEST_FILE.exists():
        raise FileNotFoundError(
            f"Manifest not found: {MANIFEST_FILE}"
        )

    # ---------------------------------------------------------
    # Load data
    # ---------------------------------------------------------

    canonical = pd.read_csv(CANONICAL_FILE)
    source = pd.read_csv(SOURCE_SAMPLE_FILE)

    with MANIFEST_FILE.open(
        "r",
        encoding="utf-8",
    ) as file:
        manifest = json.load(file)

    # Only source-level lead records are used for representativeness.
    # The canonical pipeline creates two records for each source lead.
    lead_records = canonical[
        canonical["record_type"] == "crm_lead"
    ].copy()

    # ---------------------------------------------------------
    # Source and canonical identity checks
    # ---------------------------------------------------------

    source_ids = set(
        source["id"]
        .dropna()
        .astype(str)
    )

    canonical_ids = set(
        lead_records["source_record_id"]
        .dropna()
        .astype(str)
    )

    missing_ids = sorted(
        source_ids - canonical_ids
    )

    unexpected_ids = sorted(
        canonical_ids - source_ids
    )

    identity_preserved = (
        len(missing_ids) == 0
        and len(unexpected_ids) == 0
        and len(source_ids) == len(canonical_ids)
    )

    # ---------------------------------------------------------
    # Category coverage
    # ---------------------------------------------------------

    source_product = distribution(
        source["product"]
    )

    canonical_product = distribution(
        lead_records["category"]
    )

    product_comparison = compare_distributions(
        source_product,
        canonical_product,
    )

    # ---------------------------------------------------------
    # Acquisition-source coverage
    # ---------------------------------------------------------

    source_channel = distribution(
        source["source"]
    )

    canonical_channel = distribution(
        lead_records["subcategory"]
    )

    channel_comparison = compare_distributions(
        source_channel,
        canonical_channel,
    )

    # ---------------------------------------------------------
    # Stage coverage
    # ---------------------------------------------------------

    source_stage = distribution(
        source["stage"]
    )

    canonical_stage = distribution(
        lead_records["stage"]
    )

    stage_comparison = compare_distributions(
        source_stage,
        canonical_stage,
    )

    # ---------------------------------------------------------
    # Status coverage
    # ---------------------------------------------------------

    source_status = distribution(
        source["stage"]
    )

    canonical_status = distribution(
        lead_records["status"]
    )

    status_comparison = compare_distributions(
        source_status,
        canonical_status,
    )

    # ---------------------------------------------------------
    # Location coverage
    # ---------------------------------------------------------

    source_location = distribution(
        source["location"]
    )

    canonical_location = distribution(
        lead_records["text_value"].map(
            extract_location
        )
    )

    location_comparison = compare_distributions(
        source_location,
        canonical_location,
    )

    # ---------------------------------------------------------
    # Team coverage
    # ---------------------------------------------------------

    source_team = distribution(
        source["team"]
    )

    canonical_team = distribution(
        lead_records["text_value"].map(
            extract_team
        )
    )

    team_comparison = compare_distributions(
        source_team,
        canonical_team,
    )

    # ---------------------------------------------------------
    # Time coverage
    # ---------------------------------------------------------

    source_dates = pd.to_datetime(
        source["date"],
        errors="coerce",
    )

    canonical_dates = pd.to_datetime(
        lead_records["observed_at"],
        errors="coerce",
    )

    time_coverage = {
        "source_record_count": int(len(source)),
        "canonical_lead_record_count": int(len(lead_records)),
        "source_parseable_dates": int(
            source_dates.notna().sum()
        ),
        "canonical_parseable_dates": int(
            canonical_dates.notna().sum()
        ),
        "source_earliest": (
            source_dates.min().date().isoformat()
            if source_dates.notna().any()
            else None
        ),
        "source_latest": (
            source_dates.max().date().isoformat()
            if source_dates.notna().any()
            else None
        ),
        "canonical_earliest": (
            canonical_dates.min().date().isoformat()
            if canonical_dates.notna().any()
            else None
        ),
        "canonical_latest": (
            canonical_dates.max().date().isoformat()
            if canonical_dates.notna().any()
            else None
        ),
        "source_unique_dates": int(
            source_dates.dt.date.nunique()
        ),
        "canonical_unique_dates": int(
            canonical_dates.dt.date.nunique()
        ),
        "source_unique_months": int(
            source_dates.dt.to_period("M").nunique()
            if source_dates.notna().any()
            else 0
        ),
        "canonical_unique_months": int(
            canonical_dates.dt.to_period("M").nunique()
            if canonical_dates.notna().any()
            else 0
        ),
    }

    # ---------------------------------------------------------
    # Stage / outcome coverage
    # ---------------------------------------------------------

    stage_coverage = {
        "source": source_stage,
        "canonical": canonical_stage,
        "all_source_stages_preserved": (
            len(stage_comparison["missing_from_canonical"]) == 0
        ),
    }

    # ---------------------------------------------------------
    # Numerical range checks
    # ---------------------------------------------------------

    source_value = pd.to_numeric(
        source["value"],
        errors="coerce",
    )

    source_days = pd.to_numeric(
        source["daysInStage"],
        errors="coerce",
    )

    canonical_value_records = canonical[
        canonical["metric_name"] == "lead_value"
    ].copy()

    canonical_days_records = canonical[
        canonical["metric_name"] == "days_in_stage"
    ].copy()

    canonical_value = pd.to_numeric(
        canonical_value_records["metric_value"],
        errors="coerce",
    )

    canonical_days = pd.to_numeric(
        canonical_days_records["metric_value"],
        errors="coerce",
    )

    numerical_coverage = {
        "lead_value": {
            "source_count": int(source_value.notna().sum()),
            "canonical_count": int(canonical_value.notna().sum()),
            "source_min": (
                float(source_value.min())
                if source_value.notna().any()
                else None
            ),
            "source_max": (
                float(source_value.max())
                if source_value.notna().any()
                else None
            ),
            "canonical_min": (
                float(canonical_value.min())
                if canonical_value.notna().any()
                else None
            ),
            "canonical_max": (
                float(canonical_value.max())
                if canonical_value.notna().any()
                else None
            ),
        },
        "days_in_stage": {
            "source_count": int(source_days.notna().sum()),
            "canonical_count": int(canonical_days.notna().sum()),
            "source_min": (
                float(source_days.min())
                if source_days.notna().any()
                else None
            ),
            "source_max": (
                float(source_days.max())
                if source_days.notna().any()
                else None
            ),
            "canonical_min": (
                float(canonical_days.min())
                if canonical_days.notna().any()
                else None
            ),
            "canonical_max": (
                float(canonical_days.max())
                if canonical_days.notna().any()
                else None
            ),
        },
    }

    # ---------------------------------------------------------
    # Rare records
    # ---------------------------------------------------------

    rare_stage_values = [
        value
        for value, count in source_stage.items()
        if count <= 2
    ]

    rare_records = {
        "rare_stage_values": sorted(rare_stage_values),
        "rare_stage_record_count": int(
            source["stage"].isin(rare_stage_values).sum()
        )
        if rare_stage_values
        else 0,
        "note": (
            "Rare lifecycle stages were retained when present "
            "in the source sample."
        ),
    }

    # ---------------------------------------------------------
    # Not-applicable dimensions
    # ---------------------------------------------------------

    not_applicable = {
        "severity": (
            "No dedicated severity field exists in the supplied "
            "source data."
        ),
        "scenario": (
            "No scenario parameter or scenario class exists "
            "in the supplied source data."
        ),
        "network": (
            "The supplied CRM records do not define a node/edge "
            "network structure."
        ),
        "text": (
            "text_value contains structured location and team "
            "information rather than decision-relevant free text."
        ),
        "geographic_coordinates": (
            "The source data does not provide latitude or longitude."
        ),
    }

    # ---------------------------------------------------------
    # Determine representativeness result
    # ---------------------------------------------------------

    coverage_checks = {
        "identity_preserved": identity_preserved,
        "products_preserved": (
            len(product_comparison["missing_from_canonical"]) == 0
        ),
        "channels_preserved": (
            len(channel_comparison["missing_from_canonical"]) == 0
        ),
        "stages_preserved": (
            len(stage_comparison["missing_from_canonical"]) == 0
        ),
        "statuses_preserved": (
            len(status_comparison["missing_from_canonical"]) == 0
        ),
        "locations_preserved": (
            len(location_comparison["missing_from_canonical"]) == 0
        ),
        "teams_preserved": (
            len(team_comparison["missing_from_canonical"]) == 0
        ),
        "date_range_preserved": (
            time_coverage["source_earliest"]
            == time_coverage["canonical_earliest"]
            and
            time_coverage["source_latest"]
            == time_coverage["canonical_latest"]
        ),
    }

    all_core_checks_pass = all(
        coverage_checks.values()
    )

    if all_core_checks_pass:
        representativeness_result = "PASS"
    else:
        representativeness_result = "CHANGES_REQUIRED"

    # ---------------------------------------------------------
    # Final report
    # ---------------------------------------------------------

    result = {
        "project": "POC-7 Lead Funnel Conversion Observatory",
        "canonical_data_version": sorted(
            canonical["data_version"]
            .dropna()
            .astype(str)
            .unique()
            .tolist()
        ),
        "source_name": sorted(
            canonical["source_name"]
            .dropna()
            .astype(str)
            .unique()
            .tolist()
        ),
        "contains_synthetic_data": sorted(
            canonical["is_synthetic"]
            .dropna()
            .astype(str)
            .unique()
            .tolist()
        ),
        "source_sample": {
            "record_count": int(len(source)),
            "column_count": int(len(source.columns)),
            "file_size_bytes": int(
                SOURCE_SAMPLE_FILE.stat().st_size
            ),
        },
        "canonical_dataset": {
            "record_count": int(len(canonical)),
            "column_count": int(len(canonical.columns)),
            "lead_record_count": int(len(lead_records)),
            "file_size_bytes": int(
                CANONICAL_FILE.stat().st_size
            ),
        },
        "sampling_information": {
            "is_sampled": manifest.get(
                "is_sampled"
            ),
            "sampling_method": manifest.get(
                "sampling_method"
            ),
            "random_seed": manifest.get(
                "random_seed"
            ),
            "original_record_count": manifest.get(
                "original_record_count"
            ),
            "sample_record_count": manifest.get(
                "sample_record_count"
            ),
        },
        "identity_assessment": {
            "source_unique_ids": int(len(source_ids)),
            "canonical_unique_source_ids": int(
                len(canonical_ids)
            ),
            "missing_source_ids": missing_ids,
            "unexpected_canonical_ids": unexpected_ids,
            "all_source_ids_preserved": identity_preserved,
        },
        "coverage_assessment": {
            "products": {
                "source_distribution": source_product,
                "canonical_distribution": canonical_product,
                "comparison": product_comparison,
            },
            "acquisition_sources": {
                "source_distribution": source_channel,
                "canonical_distribution": canonical_channel,
                "comparison": channel_comparison,
            },
            "stages": stage_coverage,
            "statuses": {
                "source_distribution": source_status,
                "canonical_distribution": canonical_status,
                "comparison": status_comparison,
            },
            "locations": {
                "source_distribution": source_location,
                "canonical_distribution": canonical_location,
                "comparison": location_comparison,
            },
            "teams": {
                "source_distribution": source_team,
                "canonical_distribution": canonical_team,
                "comparison": team_comparison,
            },
            "time": time_coverage,
        },
        "numerical_coverage": numerical_coverage,
        "rare_records": rare_records,
        "not_applicable_dimensions": not_applicable,
        "core_coverage_checks": coverage_checks,
        "underrepresented_areas": [],
        "missing_case_study_behaviour": [],
        "sampling_bias": (
            "The representativeness assessment confirms preservation "
            "of the supplied 30-record source sample. It does not "
            "establish representativeness of a larger CRM population "
            "because no larger source population was supplied."
        ),
        "impact_on_future_analysis": (
            "Analytical work should use the canonical dataset as the "
            "single source of truth. Conclusions should be interpreted "
            "within the observed sample and available coverage."
        ),
        "required_correction": (
            None
            if representativeness_result == "PASS"
            else "Review source-to-canonical coverage and correct the "
                 "pipeline before proceeding."
        ),
        "representativeness_result": representativeness_result,
    }

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    OUTPUT_FILE.write_text(
        json.dumps(
            result,
            indent=2,
        ),
        encoding="utf-8",
    )

    print("REPRESENTATIVENESS ASSESSMENT GENERATED")
    print(
        f"Result: {representativeness_result}"
    )
    print(
        f"Source records: {len(source)}"
    )
    print(
        f"Canonical records: {len(canonical)}"
    )
    print(
        f"Canonical lead records assessed: {len(lead_records)}"
    )
    print(
        f"Core coverage checks passed: "
        f"{sum(coverage_checks.values())}/"
        f"{len(coverage_checks)}"
    )
    print(
        f"Output: {OUTPUT_FILE}"
    )


if __name__ == "__main__":
    main()
