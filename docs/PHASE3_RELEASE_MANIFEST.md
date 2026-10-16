# Phase 3 Release Manifest

## Release Identity
- Project: POC-7 Lead Funnel Conversion Observatory
- Phase: 3 — Grounded Data Assistant
- Data package version: `phase3-v2`
- Manifest status: `IN PROGRESS — RELEASE NOT CERTIFIED`
- Git repository: https://github.com/dhanushacherian/POC-7-Lead-Funnel-Conversion-Observatory-Dhanusha-Phase3

## Canonical Data Package
- Source application: Phase 2 Lead Funnel Conversion Observatory
- Source path: `src/data/crmData.ts`
- Source sample: `data/source-sample/source_sample.csv`
- Source records: 30
- Sampling method: Full retention
- Records retained: 30
- Records removed: 0
- Random sampling: No
- Canonical dataset: `data/canonical/intelligence_data.csv`
- Canonical records: 60
- Canonical columns: 20
- Schema: `data/schema.json`
- Published dataset: `data/published/intelligence_data.json`
- Quality profile: `data/quality/data_profile.json`
- Validation report: `data/quality/validation_report.json`
- Synthetic status: Confirmed

## Data Pipeline
1. Extract: `scripts/data_pipeline/extract_data.py`
2. Sample: `scripts/data_pipeline/sample_data.py`
3. Standardize: `scripts/data_pipeline/standardize_data.py`
4. Validate: `scripts/data_pipeline/validate_data.py`
5. Publish: `scripts/data_pipeline/publish_data.py`

## Verified Validation Evidence
- Canonical data validation: PASS
- Data quality assessment: PASS; zero blocking issues
- Representativeness assessment: PASS; 8/8 core coverage checks
- Analytical readiness: PASS
- Analytical track validation: PASS
- Intelligence contract tests: 7/7 PASS
- Browser tests: 36/36 PASS
- ESLint: PASS
- Production build: PASS
- Assistant API fallback tests: PASS
- Manual dashboard, filters, downloads, navigation, and assistant checks: verified during local testing

## Release Limitations and Outstanding Checks
- Public deployment: Not verified; no confirmed public deployment URL.
- Docker image build: PASS for `lead-funnel-observatory-phase3:release-candidate`.
- Docker container startup: PASS; container remained running during validation.
- Dashboard and Data Intelligence routes: HTTP 200.
- Assistant API valid-question test: PASS; response status `SUPPORTED`, metadata validation `PASS`.
- Docker runtime evidence: `final-evidence/DOCKER_RUNTIME_VALIDATION.md`.
- Final clean-clone validation: Not yet documented.
- Final reports, handover guide, and initial evidence files: Present; final evidence review and clean-clone validation remain pending.
- Final release commit and tag: Not yet created.

## Release Decision
This manifest records the known Phase 3 package identity and validation evidence. It does **not** certify the project as fully released. Final release approval requires completion and verification of the remaining checks and documentation.

## Latest Known Commit at Manifest Preparation
- Commit: `8507f59316dd0a558383c5ec8db2dd1d46ed52e7`
- Message: `Complete grounded assistant fallback validation`

The commit above is the latest known commit at preparation time, not the final release commit.


## Post-Dependency-Update Validation — 2026-10-16

### Updated Dependencies
- Next.js: 16.4.2
- eslint-config-next: 16.4.2
- Production dependency audit: PASS; zero reported vulnerabilities.
- Full development dependency audit: OUTSTANDING; high-severity findings remain in the ESLint dependency chain. See npm audit output before release approval.

### Post-Update Automated Checks
- Canonical data validation: PASS.
- Intelligence contract tests: 7/7 PASS.
- Grounded assistant service tests: 12/12 PASS.
- Gemini fallback tests: PASS, including missing key, HTTP 429, HTTP 503 with one retry, and HTTP 504.
- Assistant API fallback tests: PASS.
- ESLint: PASS.
- Production build: PASS.
- Browser regression: first run 33 passed and 3 timed out; subsequent run 36/36 passed in 28.1 seconds. Both results are retained in the validation history.

### Fresh Docker Validation
- Image build using the updated dependencies: PASS.
- Fresh container startup: PASS.
- Homepage and Data Intelligence page: HTTP 200.
- Supported assistant question: PASS; deterministic response returned `SUPPORTED`.
- Missing-question handling: PASS; HTTP 400 with `MISSING_PARAMETER`.
- Evidence file: `final-evidence/DOCKER_RUNTIME_VALIDATION.md`.

### Remaining Release Gates
- Full development dependency audit findings: review and document accepted risk or resolve without breaking the supported dependency set.
- Clean-clone validation of the final proposed commit: PENDING.
- Public deployment URL and remote smoke test: NOT VERIFIED.
- Final release commit and tag: NOT CREATED.
- Final release approval: PENDING.

The successful local tests and Docker checks do not certify a public deployment or a final release. Manifest status remains `IN PROGRESS — RELEASE NOT CERTIFIED`.

## Development Dependency Security Assessment — 2026-10-16

- Production audit: PASS; `npm audit --omit=dev` reports zero vulnerabilities.
- Full development audit: OUTSTANDING; npm reports five high-severity findings associated with `braces@3.0.3`.
- Dependency path: `eslint-config-next@16.4.2` -> `@next/eslint-plugin-next@16.4.2` -> `fast-glob@3.3.1` -> `micromatch@4.0.8` -> `braces@3.0.3`.
- Advisory: GHSA-vfj7-8cjw-p6xm; stack-exhaustion denial of service through deeply nested patterns.
- The advisory currently lists no patched version.
- `npm audit fix --force` proposes a breaking downgrade to `eslint-config-next@14.2.35`; this was not applied.
- No unofficial fork or unverified override was applied.
- Disposition: UNRESOLVED; release owner review required. Do not represent the full dependency audit as clean.
