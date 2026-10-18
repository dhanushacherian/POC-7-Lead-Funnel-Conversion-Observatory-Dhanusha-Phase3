
# POC-7 — Lead Funnel Conversion Observatory

## Project Overview

The Lead Funnel Conversion Observatory is a web-based application for exploring lead funnel metrics and approved comparative intelligence results.

Phase 3 introduces a grounded data assistant that answers supported questions using approved, versioned analytical results. It is designed to provide traceable answers and avoid unsupported predictions or claims.

## Phase 3 — Grounded Data Assistant

**Project:** POC-7 Lead Funnel Conversion Observatory
**Phase:** Phase 3 — Grounded Data Assistant
**Data package version:** `phase3-v2`
**Method version:** `1.0.0`
**Track:** Track A — Comparative Intelligence

### Main Features

- Lead funnel dashboard and summary metrics.
- Comparative analysis by stage, product, and lead source.
- Data Intelligence page displaying approved analytical results.
- Grounded assistant responses based on approved results.
- Evidence and version metadata for supported answers.
- Handling of missing parameters and unsupported questions.
- Small-group disclosure for results with fewer than five leads.
- Responsive assistant interface for mobile and tablet screens.
- CSV and JSON data export functionality.

## Technology Stack

- Next.js
- React
- TypeScript
- Python data-validation and analytical scripts
- Playwright browser testing
- Docker for containerized validation

Refer to `package.json` for the project's current dependencies and scripts.

## Repository Structure

```text
.
├── data/
│   ├── canonical/
│   ├── published/
│   └── schema.json
├── data-science/
│   ├── scripts/
│   └── outputs/
├── docs/
├── final-evidence/
│   └── production/
├── scripts/
│   └── data_pipeline/
├── src/
├── tests/
├── README.md
└── package.json
```

## Requirements

Install the compatible Node.js and Python versions required by the project. Use the repository's dependency configuration and documentation when setting up the environment.

## Installation

From the repository root, install the Node.js dependencies:

```powershell
npm.cmd ci
```

If dependency installation reports security findings or install-script approval warnings, review them before proceeding with release approval.

## Run the Application

Start the development server:

```powershell
npm.cmd run dev
```

Open the local URL displayed in the terminal.

## Data Validation and Publishing

Validate the canonical dataset:

```powershell
npm.cmd run data:validate
```

Expected validation summary:

- Canonical records: 60
- Canonical columns: 20

Generate the published JSON dataset:

```powershell
npm.cmd run data:publish
```

The published dataset is generated at:

`data/published/intelligence_data.json`

Run the analytical validation:

```powershell
python .\data-science\scripts\validate_analytical_track.py
```

Review the validation output and the generated files under `data-science/outputs/`.

## Automated Validation

Run lint:

```powershell
npm.cmd run lint
```

Run the intelligence contract tests:

```powershell
npm.cmd run test:intelligence
```

Build the production application:

```powershell
npm.cmd run build
```

Run the browser tests:

```powershell
npm.cmd run test:browser -- --timeout=90000 --workers=1
```

Run the assistant service tests:

```powershell
.\node_modules\.bin\tsx.cmd .\tests\assistant-service-test.ts
```

Run the Gemini fallback tests:

```powershell
.\node_modules\.bin\tsx.cmd .\tests\gemini-fallback-test.ts
```

Run the assistant API fallback tests:

```powershell
.\node_modules\.bin\tsx.cmd .\tests\assistant-api-fallback-test.ts
```

Use the exact scripts and test paths present in the current checkout if they change.

## Data and Analytical Limitations

- The current canonical dataset contains 60 records.
- Track A comparative analysis uses an independent sample of 30 leads.
- The data package version is `phase3-v2`.
- The analytical method version is `1.0.0`.
- The approved result set contains 16 results.
- The quality status is `VALIDATED_DESCRIPTIVE`.
- Three stage groups are below the minimum group-size sensitivity threshold of five.
- Results are descriptive and comparative. They do not establish causation or provide validated future-conversion predictions.
- Small-group results must be interpreted cautiously.

## Assistant Safety and Scope

The assistant should answer only questions supported by approved analytical results.

It must handle missing comparison parameters, reject unapproved group names, and avoid inventing evidence for unsupported questions. Requests for predictions or unrelated information must be handled according to the application's supported scope.

A successful test run demonstrates the behavior covered by those tests; it does not independently prove that every possible unsafe request is handled correctly.

## Documentation and Evidence

Review these files for implementation details and release status:

- `docs/PHASE3_RELEASE_MANIFEST.md`
- `docs/PHASE3_FINAL_UAT.md`
- `docs/PHASE3_HANDOVER_GUIDE.md`
- `docs/CLEAN_CLONE_VALIDATION_REPORT.md`
- `final-evidence/ASSISTANT_TEST_VALIDATION.md`
- `final-evidence/DOCKER_RUNTIME_VALIDATION.md`
- `final-evidence/production/LIVE_API_VALIDATION.json`

The release manifest is the primary reference for the recorded deployment evidence, validation status, security findings, and release decision.

## Deployment Status

The public Render deployment is live, and production smoke tests have been recorded. See `docs/PHASE3_RELEASE_MANIFEST.md` and `final-evidence/production/LIVE_API_VALIDATION.json` for the deployment details and evidence.

**Phase 3 final release certification remains pending.** The fresh pre-certification snapshot is `repomix-phase3-final.md`. The browser suite passed 36/36 tests on application commit `baa1d6a`; targeted live checks also confirmed the Data Intelligence page and assistant were working. The full development dependency audit previously reported five high-severity findings. The reported security approval must be recorded with its authorized approver and supporting evidence before certification.

No final release tag should be created until the required release gates have passed and the security disposition has been approved.

## Release Checklist

- [ ] Re-run data and analytical validation.
- [ ] Re-run lint, intelligence tests, production build, and browser tests.
- [ ] Review the release documentation and evidence for consistency and completeness.
- [ ] Confirm that evidence contains no secrets or unintended sensitive data.
- [ ] Resolve or formally approve the outstanding security findings.
- [ ] Complete final UAT against the intended release.
- [ ] Regenerate `repomix-output.xml` after approved final changes.
- [ ] Review the final Git status and diff.
- [ ] Commit approved changes.
- [ ] Create and verify the release tag only after all required gates pass.
- [ ] Verify the deployed version and record the final release decision.

A checked item must be supported by current evidence. Passing automated tests alone does not constitute release certification.

## Security

Do not commit API keys, passwords, tokens, private credentials, or populated local environment files. Review dependency audit findings and follow the release manifest's security assessment before approving a release.

## License

Refer to the repository's license file, if present, for applicable license terms.

## Current Certification Status  -  2026-10-18

**Status: PHASE 3 FINAL CHANGES REQUIRED  -  RELEASE NOT CERTIFIED.** The full development-dependency security disposition is pending, direct maintainer approval-comment links are not yet verified, and conflicting historical Render SHA records require reconciliation. Final-candidate regression/UAT and final Repomix/tag steps must not be represented as complete until their evidence is verified. See `docs/PHASE3_FINAL_CERTIFICATION_GAP_REVIEW.md` for the current gate list.
