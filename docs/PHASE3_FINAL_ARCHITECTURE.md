# Phase 3 Final Architecture

## 1. Project Overview
POC-7 Lead Funnel Conversion Observatory — Phase 3 extends the existing operational dashboard with a canonical data foundation, descriptive analytical outputs, a Data Intelligence page, and a grounded assistant.

## 2. Architecture Components

### A. Source Data
- Phase 2 source application: `src/data/crmData.ts`
- Source sample: `data/source-sample/source_sample.csv`
- The source dataset contains 30 source leads.

### B. Canonical Data Foundation
- Canonical dataset: `data/canonical/intelligence_data.csv`
- Schema: `data/schema.json`
- Manifest: `data/manifest.json`
- Data version: `phase3-v2`
- Canonical dataset size: 60 records and 20 columns.
- Synthetic data status: confirmed.

### C. Data Pipeline
The pipeline scripts extract, sample, standardize, validate, and publish the canonical data:
- `scripts/data_pipeline/extract_data.py`
- `scripts/data_pipeline/sample_data.py`
- `scripts/data_pipeline/standardize_data.py`
- `scripts/data_pipeline/validate_data.py`
- `scripts/data_pipeline/publish_data.py`

The published JSON is written to `data/published/intelligence_data.json`.

### D. Analytical Track
Track A performs descriptive comparative analysis across:
- Funnel stage
- Product/category
- Acquisition source/subcategory

Relevant scripts and outputs are under `data-science/scripts/` and `data-science/outputs/`. The documented method version is `1.0.0`.

### E. Application and Intelligence UI
- Operational dashboard route: `/`
- Data Intelligence route: `/data-intelligence`
- Assistant API route: `/api/assistant`

The application is built with Next.js. The production build previously completed successfully in both the working tree and the clean clone of the then-committed version.

### F. Grounded Assistant
The assistant uses the approved analytical results and evidence contract. Previously recorded fallback tests confirmed that the approved answer, evidence, and limitations were preserved when a simulated Gemini explanation failed.

## 3. Validation and Quality Controls
- Canonical data validation is part of the build pre-step.
- Analytical readiness, quality, and representativeness assessments are implemented in `data-science/scripts/`.
- Intelligence contract tests and browser tests provide automated checks.
- Results remain descriptive and must not be presented as causal or predictive.

## 4. Known Limitations
- Data is synthetic and contains 30 source leads.
- Small funnel-stage groups require caution.
- Team and location are embedded in `text_value`, rather than dedicated analytical fields.
- The available observations are not a complete longitudinal time series.
- Public deployment has not been confirmed.
- Docker runtime validation was blocked earlier because Docker Engine was not running.

## 5. Release Status
This document describes the known architecture and previously verified behavior. It does not certify that the final release has been deployed or fully validated.

- Architecture documentation: created
- Final-release regression: pending
- Final release commit and tag: pending
