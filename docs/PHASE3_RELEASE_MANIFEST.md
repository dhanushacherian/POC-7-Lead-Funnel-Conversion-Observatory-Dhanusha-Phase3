# Phase 3 Release Manifest

## Release Identity

- Project: POC-7 Lead Funnel Conversion Observatory
- Phase: 3 - Grounded Data Assistant
- Data package version: `phase3-v2`
- Manifest status: `IN PROGRESS - RELEASE NOT CERTIFIED`
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

- Canonical data validation: PASS; 60 canonical records and 20 columns.
- Data quality assessment: PASS; zero blocking issues.
- Representativeness assessment: PASS; 8/8 core coverage checks.
- Analytical readiness: PASS.
- Analytical track validation: PASS.
- Intelligence contract tests: 7/7 PASS.
- Grounded assistant service tests: 12/12 PASS.
- Gemini fallback tests: PASS, including missing API key, HTTP 429, HTTP 503 with one retry, and HTTP 504.
- Assistant API fallback tests: PASS.
- Browser tests: 36/36 PASS in the latest clean-clone run.
- ESLint: PASS.
- Production build: PASS.
- Production dependency audit: PASS; zero reported vulnerabilities.
- Manual dashboard, filters, downloads, navigation, and assistant checks: verified during local testing.
- Latest-commit clean-clone validation: PASS against `b0582876eba75589cdac5aa7279efd9d7f213099`.
- Clean-clone validation report: `docs/CLEAN_CLONE_VALIDATION_REPORT.md`; report committed in `aa6544b`.

## Public Deployment and Production Evidence

- Deployment platform: Render.
- Service: `poc-7-lead-funnel-conversion-observatory-phase3`.
- Public application URL: https://poc-7-lead-funnel-conversion-observatory-mll2.onrender.com
- Deployment status: LIVE; production smoke tests were performed.
- Production deployment commit verified: `baa1d6a` (Render dashboard confirmed Live on 2026-10-17).
- Production evidence record subsequently committed in: `40a3192`.
- Home route: HTTP 200 during production validation.
- Data Intelligence route: HTTP 200 during production validation.
- Assistant API: POST endpoint tested in production.
- Supported question: PASS; the product comparison returned a deterministic answer identifying Payments as the highest-value product, with total lead value 942000 and 12 leads.
- Out-of-scope question: PASS; returned `OUT_OF_SCOPE`, with `metadata.llm_enabled: false` and no evidence references.
- Gemini explanation: UNAVAILABLE during the recorded production test; the deterministic supported answer still succeeded.
- GET request to the POST-only assistant endpoint: HTTP 405 expected.
- Production evidence file: `final-evidence/production/LIVE_API_VALIDATION.json`.

## Docker Validation

- Docker image build: PASS for `lead-funnel-observatory-phase3:release-candidate`.
- Docker container startup: PASS during recorded validation.
- Dashboard and Data Intelligence routes: HTTP 200.
- Supported assistant question: PASS; deterministic response returned `SUPPORTED`.
- Missing-question handling: PASS; HTTP 400 with `MISSING_PARAMETER`.
- Docker runtime evidence: `final-evidence/DOCKER_RUNTIME_VALIDATION.md`.
- Docker validation is supporting evidence and does not replace production deployment validation.

## Repository and Clean-Clone Validation

- Repository: `https://github.com/dhanushacherian/POC-7-Lead-Funnel-Conversion-Observatory-Dhanusha-Phase3`
- Latest production-metadata fix commit: `aace1f8`.
- Production evidence commit: `40a3192` - `Record production metadata fix verification`.
- Clean-clone report commit: `aa6544b` - `Update clean-clone validation report for latest commit`.
- Clean-clone validation target: `b0582876eba75589cdac5aa7279efd9d7f213099`.
- Clean-clone validation report: `docs/CLEAN_CLONE_VALIDATION_REPORT.md`.
- Clean-clone report confirms data validation, intelligence tests, lint, build, assistant tests, fallback tests, API fallback tests, and browser tests passed against the target commit.
- The report-only commit `aa6544b` was made after that validation target; the code and dependencies were not changed by that report-only commit.
- Final evidence and handover review: IN PROGRESS; technical deliverables accepted, final certification gates remain.
- Final Repomix generation: COMPLETE; `repomix-phase3-final.md` regenerated after documentation alignment.
- Final release commit and tag: NOT CREATED.

## Post-Dependency-Update Validation - 2026-10-16

### Updated Dependencies

- Next.js: 16.4.2.
- `eslint-config-next`: 16.4.2.
- Production dependency audit: PASS; `npm audit --omit=dev` reports zero vulnerabilities.
- Full development dependency audit: five high-severity findings remain in the ESLint dependency chain; the disposition is unresolved.

### Post-Update Automated Checks

- Canonical data validation: PASS.
- Intelligence contract tests: 7/7 PASS.
- Grounded assistant service tests: 12/12 PASS.
- Gemini fallback tests: PASS.
- Assistant API fallback tests: PASS.
- ESLint: PASS.
- Production build: PASS.
- Browser regression: the latest clean-clone run passed 36/36 tests. An earlier run had 33 passes and 3 timeouts; both results remain part of the validation history.

## Development Dependency Security Assessment - 2026-10-16

- Production audit: PASS; `npm audit --omit=dev` reports zero vulnerabilities.
- Full development dependency audit: NOT CLEAN; five high-severity findings are reported.
- Affected dependency: `braces@3.0.3`.
- Dependency path: `eslint-config-next@16.4.2` -> `@next/eslint-plugin-next@16.4.2` -> `fast-glob@3.3.1` -> `micromatch@4.0.8` -> `braces@3.0.3`.
- Advisory: `GHSA-vfj7-8cjw-p6xm`; stack-exhaustion denial of service through deeply nested patterns.
- The reviewed advisory listed no patched version at the time of assessment.
- `npm audit fix --force` proposed a breaking downgrade to `eslint-config-next@14.2.35`; this was not applied.
- No unofficial fork or unverified override was applied.
- Disposition: PENDING RELEASE OWNER DECISION. No exception or risk acceptance has been approved or recorded. Do not represent the full dependency audit as clean.


## Production API Recheck - 2026-10-17

- Supported assistant query: PASS; HTTP 200; status SUPPORTED.
- Production data version: phase3-v2; method version: 1.0.0; validation: PASS.
- Highest-value product: Payments; total lead value: 942,000 across 12 leads.
- Deterministic answer and evidence: PASS. External Gemini explanation remained unavailable; the deterministic answer succeeded.
- Out-of-scope query: PASS; HTTP 200; status OUT_OF_SCOPE; zero evidence references; llm_enabled: false.
- Evidence files: `final-evidence/production/LIVE_API_RECHECK_2026-10-17.json` and `final-evidence/production/OUT_OF_SCOPE_RECHECK_2026-10-17.json`.
- Deployed Git commit verification: VERIFIED on 2026-10-17 in Render; source commit `baa1d6a`, status `Live`.
- Release certification: PENDING; this recheck does not waive the security disposition, handover review, final Repomix, or other release gates.
## Remaining Release Gates

1. Obtain and record the release owner's security-risk disposition for the five high-severity development-dependency findings, or resolve them using a verified compatible dependency update.
2. Complete the final evidence and handover review against the mandatory Post #6 requirements.
3. Complete and commit any remaining documentation and evidence updates.
4. Generate the final Repomix after the final source, documentation, and evidence changes are committed.
5. Verify the final repository state and all required release gates.
6. Create a release tag only after all mandatory gates pass and the security disposition is approved.

## Release Decision

**Current decision: PHASE 3 FINAL CHANGES REQUIRED - RELEASE NOT CERTIFIED.**

The public deployment and recorded production smoke tests are verified. The recorded automated, clean-clone, and Docker checks provide supporting evidence. The final Markdown Repomix was regenerated after the documentation-alignment pass and is published as `repomix-phase3-final.md`. Reviewer outcome: PHASE 3 TECHNICAL DELIVERABLES ACCEPTED — FINAL CERTIFICATION PENDING. The authorized security disposition and final release-owner certification remain outstanding.

The full development dependency audit is not clean, and its disposition is pending a release-owner decision. This manifest does not certify Phase 3 as released. Do not create a final release tag or represent the project as certified until all required gates pass and the security disposition is approved.

## Formal Approval References

- Track A analytical approval reference (Post #3): https://github.com/Real-Rails-Interns-Batch8-MAC/Phase3-DataScience-DecisionIntelligence/discussions/3
- Grounded Data Assistant approval reference (Post #5): https://github.com/Real-Rails-Interns-Batch8-MAC/Phase3-DataScience-DecisionIntelligence/discussions/5
- Post #6 Word guide usage: Unconfirmed; record Yes only if the guide was actually attached and used as the AI feeder.
- Security disposition: PENDING AUTHORIZED RELEASE OWNER DECISION. Record the approver, date, decision, Docker development-dependency exposure consideration, and supporting evidence before closing this gate.
