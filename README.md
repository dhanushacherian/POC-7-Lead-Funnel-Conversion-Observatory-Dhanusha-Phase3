# POC-7 Lead Funnel Conversion Observatory - Phase 3

## Overview
Phase 3 adds a canonical data foundation, analytical validation, a Data Intelligence dashboard, and a grounded assistant.

## Application Capabilities
- CRM dashboard with lead records, filters, navigation, and CSV/JSON exports.
- Data Intelligence page with analytical results, evidence, methodology, and limitations.
- Grounded assistant API with fallback handling when Gemini explanations are unavailable.
- Synthetic data only; findings are descriptive, not causal or predictive.

## Data and Analytics
- Canonical dataset: data/canonical/intelligence_data.csv
- Dataset version: phase3-v2
- Canonical dataset size: 60 records and 20 columns.
- Independent source-lead analysis: 30 leads.
- Analytical outputs: data-science/outputs/
- Analytical report: docs/ANALYTICAL_VALIDATION_REPORT.md

## Application Routes
- / — CRM dashboard
- /data-intelligence — Data Intelligence page
- /api/assistant — assistant API

## Setup and Validation
Run from the repository root:
```powershell
npm.cmd ci
npm.cmd run data:validate
python .\data-science\scripts\run_analytical_track.py
python .\data-science\scripts\validate_analytical_track.py
npm.cmd run test:intelligence
npm.cmd run lint
npm.cmd run build
npm.cmd run test:browser -- --timeout=90000 --workers=1
npx.cmd tsx .\tests\assistant-api-fallback-test.ts
```

## Documentation
- docs/PHASE3_RELEASE_MANIFEST.md — release details and status
- docs/FINAL_ANALYTICAL_REVALIDATION.md — analytical revalidation
- docs/BUILD_AND_ENVIRONMENT_VALIDATION.md — build and environment checks
- docs/FINAL_OPERATIONAL_REGRESSION_REPORT.md — operational regression
- docs/FINAL_DATA_INTELLIGENCE_VALIDATION.md — Data Intelligence checks
- docs/FINAL_ASSISTANT_VALIDATION.md — assistant validation
- docs/FINAL_AUTOMATED_TEST_REPORT.md — automated tests
- docs/PHASE3_FINAL_UAT.md — user acceptance testing
- docs/PHASE3_HANDOVER_GUIDE.md — handover instructions

## Limitations
- The dataset is synthetic and contains 30 source leads.
- Small stage groups require cautious interpretation.
- Findings describe the available data; they do not establish causation or predict future outcomes.

## Deployment Status
Public deployment has not been verified. Certification remains pending until deployment evidence, final clean-clone validation, the evidence pack, and release tag are verified.

## Release Checklist
- [ ] Final clean-clone validation completed against the release commit.
- [ ] Required evidence and screenshots reviewed.
- [ ] Deployment URL verified, or deployment limitation explicitly accepted.
- [ ] Final Repomix generated after final documentation and evidence changes.
- [ ] Release manifest SHA and release tag match.
- [ ] Final certification decision recorded.
