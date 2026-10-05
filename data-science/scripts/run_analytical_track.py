"""
POC-7 Phase 3
Run Analytical Track

Approved analytical track:
Track A - Comparative Intelligence

This script provides the reproducible execution entry point for the
approved analytical workflow.
"""

from pathlib import Path
import subprocess
import sys
import json
import pandas as pd


# ---------------------------------------------------------------------
# PROJECT PATHS
# ---------------------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]

CANONICAL_PATH = (
    PROJECT_ROOT
    / "data"
    / "canonical"
    / "intelligence_data.csv"
)

MANIFEST_PATH = PROJECT_ROOT / "data" / "manifest.json"

TRACK_SCRIPT = (
    PROJECT_ROOT
    / "data-science"
    / "scripts"
    / "track_a_comparative_analysis.py"
)

VALIDATION_SCRIPT = (
    PROJECT_ROOT
    / "data-science"
    / "scripts"
    / "validate_analytical_track.py"
)

EXPORT_SCRIPT = (
    PROJECT_ROOT
    / "data-science"
    / "scripts"
    / "export_intelligence_results.py"
)

EXPECTED_DATA_VERSION = "phase3-v2"
EXPECTED_METHOD_VERSION = "1.0.0"


# ---------------------------------------------------------------------
# HELPER
# ---------------------------------------------------------------------

def run_command(script_path, label):
    """Run a Python script and stop if it fails."""

    print()
    print("=" * 70)
    print(label)
    print("=" * 70)

    result = subprocess.run(
        [sys.executable, str(script_path)],
        cwd=PROJECT_ROOT,
        check=False
    )

    if result.returncode != 0:
        raise RuntimeError(
            f"{label} failed with exit code {result.returncode}."
        )

    print(f"{label}: PASS")


# ---------------------------------------------------------------------
# STEP 1 — LOAD CANONICAL DATA
# ---------------------------------------------------------------------

print("=" * 70)
print("POC-7 PHASE 3 ANALYTICAL TRACK EXECUTION")
print("=" * 70)

print()
print("STEP 1 — Loading canonical dataset")

if not CANONICAL_PATH.exists():
    raise FileNotFoundError(
        f"Canonical dataset not found: {CANONICAL_PATH}"
    )

df = pd.read_csv(CANONICAL_PATH)

print(f"Canonical path: {CANONICAL_PATH}")
print(f"Rows: {len(df)}")
print(f"Columns: {len(df.columns)}")


# ---------------------------------------------------------------------
# STEP 2 — VERIFY DATA VERSION
# ---------------------------------------------------------------------

print()
print("STEP 2 — Verifying data version")

if not MANIFEST_PATH.exists():
    raise FileNotFoundError(
        f"Manifest not found: {MANIFEST_PATH}"
    )

with open(MANIFEST_PATH, "r", encoding="utf-8") as file:
    manifest = json.load(file)

actual_data_version = manifest.get("data_version")

print(f"Expected data version: {EXPECTED_DATA_VERSION}")
print(f"Actual data version:   {actual_data_version}")

if actual_data_version != EXPECTED_DATA_VERSION:
    raise ValueError(
        "Data version mismatch. "
        f"Expected {EXPECTED_DATA_VERSION}, "
        f"found {actual_data_version}."
    )

print("Data version verification: PASS")


# ---------------------------------------------------------------------
# STEP 3 — VALIDATE REQUIRED ANALYTICAL INPUTS
# ---------------------------------------------------------------------

print()
print("STEP 3 — Validating analytical inputs")

required_columns = [
    "record_id",
    "record_type",
    "observed_at",
    "entity_id",
    "category",
    "subcategory",
    "stage",
    "metric_name",
    "metric_value",
    "text_value",
    "is_synthetic",
    "data_version",
]

missing_columns = [
    column
    for column in required_columns
    if column not in df.columns
]

if missing_columns:
    raise ValueError(
        "Required analytical columns are missing: "
        + ", ".join(missing_columns)
    )

dataset_versions = (
    df["data_version"]
    .dropna()
    .astype(str)
    .unique()
    .tolist()
)

if dataset_versions != [EXPECTED_DATA_VERSION]:
    raise ValueError(
        "Canonical dataset contains an unexpected data version: "
        + str(dataset_versions)
    )

print("Required analytical columns: PASS")
print("Canonical row data version: PASS")


# ---------------------------------------------------------------------
# STEP 4 — RUN APPROVED TRACK
# ---------------------------------------------------------------------

run_command(
    TRACK_SCRIPT,
    "STEP 4 — Running approved Track A comparative analysis"
)


# ---------------------------------------------------------------------
# STEP 5 — VALIDATE ANALYTICAL TRACK
# ---------------------------------------------------------------------

run_command(
    VALIDATION_SCRIPT,
    "STEP 5 — Validating Track A analytical results"
)


# ---------------------------------------------------------------------
# STEP 6 — EXPORT INTELLIGENCE OUTPUTS
# ---------------------------------------------------------------------

run_command(
    EXPORT_SCRIPT,
    "STEP 6 — Exporting intelligence outputs"
)


# ---------------------------------------------------------------------
# STEP 7 — VERIFY STANDARD OUTPUT FILES
# ---------------------------------------------------------------------

print()
print("=" * 70)
print("STEP 7 — Verifying standard intelligence outputs")
print("=" * 70)

output_files = [
    PROJECT_ROOT / "data-science" / "outputs" / "intelligence_results.json",
    PROJECT_ROOT / "data-science" / "outputs" / "intelligence_summary.json",
    PROJECT_ROOT / "data-science" / "outputs" / "validation_metrics.json",
    PROJECT_ROOT / "data-science" / "outputs" / "weak_case_review.json",
]

for output_file in output_files:
    if not output_file.exists():
        raise FileNotFoundError(
            f"Required output not found: {output_file}"
        )

    print(
        f"PASS: {output_file.relative_to(PROJECT_ROOT)}"
    )


# ---------------------------------------------------------------------
# FINAL STATUS
# ---------------------------------------------------------------------

print()
print("=" * 70)
print("ANALYTICAL TRACK EXECUTION COMPLETED")
print("=" * 70)

print("Project: POC-7")
print("Approved track: Track A - Comparative Intelligence")
print(f"Data version: {EXPECTED_DATA_VERSION}")
print(f"Method version: {EXPECTED_METHOD_VERSION}")
print("Execution status: PASS")
print()