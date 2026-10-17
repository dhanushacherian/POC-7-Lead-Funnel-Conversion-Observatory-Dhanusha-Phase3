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

- Data is synthetic and contains 30 source leads in the approved `phase3-v2` baseline.
- Small funnel-stage groups require cautious interpretation.
- Team and location are embedded in `text_value`, rather than dedicated analytical fields.
- The observations are not a complete longitudinal time series.
- Track A results are descriptive and comparative, not causal or predictive.

## 5. Deployment and Certification Status

- Reviewer outcome: **PHASE 3 TECHNICAL DELIVERABLES ACCEPTED — FINAL CERTIFICATION PENDING**.
- Render confirmed the public application Live on 2026-10-17 for application commit `baa1d6a`.
- Commit `498ce60` and subsequent commits contain documentation, UAT, walkthrough, and Repomix updates. They are distinct from the verified deployed application commit `baa1d6a`; obtain the exact current certification candidate SHA from Git after final documentation changes.
- Docker image build, startup, dashboard/Data Intelligence routes, supported assistant request, and missing-question handling passed in the recorded validation. Evidence: `final-evidence/DOCKER_RUNTIME_VALIDATION.md`.
- The full dependency audit still reports five high-severity findings in the ESLint development dependency chain. The production-only audit reports zero vulnerabilities. The Docker image installs development dependencies, so the security disposition must explicitly consider that exposure.
- Obtain and record the authorized release owner's security decision before certification. Do not apply a breaking dependency downgrade merely to clear the audit.
- Link and verify the Track A approval and Post #5 Grounded Assistant approval. Confirm whether the Post #6 Word guide was used as the AI feeder.
- Final Markdown snapshot: `repomix-phase3-final.md`. It was refreshed after the documentation-alignment commit; regenerate it again if any further source, documentation, or evidence changes are made.
- No release tag has been created. Certification remains pending until all mandatory gates pass.

## Formal Approval References

- Track A analytical approval reference (Post #3): https://github.com/Real-Rails-Interns-Batch8-MAC/Phase3-DataScience-DecisionIntelligence/discussions/3
- Grounded Data Assistant approval reference (Post #5): https://github.com/Real-Rails-Interns-Batch8-MAC/Phase3-DataScience-DecisionIntelligence/discussions/5
- Post #6 Word guide usage: Unconfirmed; record Yes only if the guide was actually attached and used as the AI feeder.
- Security disposition: PENDING AUTHORIZED RELEASE OWNER DECISION. Record the approver, date, decision, Docker development-dependency exposure consideration, and supporting evidence before closing this gate.
