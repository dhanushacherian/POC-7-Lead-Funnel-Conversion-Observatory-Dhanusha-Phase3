
# Clean Clone Validation Report

## Result

**PASS — clean-clone validation completed successfully against the latest verified repository commit.**

The repository was cloned into a separate directory. Dependency installation, canonical data validation, intelligence contract tests, lint, production build, grounded assistant tests, Gemini fallback tests, assistant API fallback tests, and browser regression tests all passed.

## Exact Commit

- Repository: `https://github.com/dhanushacherian/POC-7-Lead-Funnel-Conversion-Observatory-Dhanusha-Phase3`
- Branch: `main`
- Commit: `b0582876eba75589cdac5aa7279efd9d7f213099`
- Commit message: `Update Phase 3 release manifest with production evidence`
- Clean-clone directory: `C:\Users\LENOVO\POC-7-Phase3-CleanClone`
- Checkout verification: PASS
- Initial clean-clone working tree: clean

## Clean-Clone Validation Results

| Check | Result | Details |
|---|---|---|
| `git clone` | PASS | Fresh clone from the remote repository |
| `git rev-parse HEAD` | PASS | Matched the exact commit listed above |
| `git status --short --branch` | PASS | Clean working tree; synchronized with `origin/main` |
| `npm ci` | PASS | 405 packages installed |
| `npm run data:validate` | PASS | 60 canonical records and 20 columns |
| `npm run test:intelligence` | PASS | 7/7 contract checks |
| `npm run lint` | PASS | No lint errors reported |
| `npm run build` | PASS | Next.js 16.4.2 production build completed |
| Grounded assistant service tests | PASS | 12/12 tests |
| Gemini fallback tests | PASS | Missing API key, HTTP 429, HTTP 503 with exactly one retry, and HTTP 504 |
| Assistant API fallback tests | PASS | 4/4 reported checks |
| Browser regression tests | PASS | 36/36 tests in 19.7 seconds |

## Data and Intelligence Verification

- Data package version: `phase3-v2`.
- Method version: `1.0.0`.
- Intelligence result count: 16.
- Quality status: `VALIDATED_DESCRIPTIVE`.
- Canonical dataset validation: PASS.
- Published JSON generation during the production build: PASS.
- Published dataset size: 60 records.

## Assistant Safety and Fallback Verification

- Supported questions preserve approved deterministic answers: PASS.
- Approved evidence and version metadata are preserved: PASS.
- Missing question and non-string input handling: PASS.
- Unsupported prediction requests are rejected: PASS.
- Attempts to override assistant instructions are rejected: PASS.
- Arbitrary code execution requests are rejected: PASS.
- Prompt-injection and safety checks: PASS.
- Gemini failures preserve approved deterministic results: PASS.
- Gemini failure metadata reports `llm_enabled: false`: PASS.
- Out-of-scope responses report `llm_enabled: false`: PASS.

## Dependency Audit and Remaining Risk

- Production dependency audit: previously reported PASS with zero vulnerabilities.
- Full dependency audit: NOT CLEAN.
- `npm ci` reported five high-severity vulnerabilities in the development dependency chain.
- The reviewed advisory is `GHSA-vfj7-8cjw-p6xm`, associated with `braces@3.0.3`.
- The security disposition remains **UNRESOLVED; release owner review required.**
- `npm audit fix --force` was not applied because it proposed a breaking downgrade.
- Installation also reported pending install-script approvals for four packages. These warnings did not prevent the listed validation checks from passing.

## Scope and Limitations

This report confirms the listed clean-clone checks against commit `b0582876eba75589cdac5aa7279efd9d7f213099`.

It does not independently certify the public deployment, establish release-owner acceptance of the security risk, or authorize a final release tag.

The clean-clone build and tests passed, but the full dependency audit is not clean and the security disposition remains unresolved.

## Release Decision

**PHASE 3 FINAL CHANGES REQUIRED — RELEASE NOT CERTIFIED.**

Remaining gates include:

1. Obtain and record the release owner's disposition for the five high-severity development-dependency findings, or resolve them through a verified compatible update.
2. Complete the final evidence and handover review.
3. Generate the final Repomix after all required repository changes are committed.
4. Verify that every mandatory Post #6 release gate is satisfied.
5. Create a release tag only after all mandatory gates pass and the security disposition is approved.
