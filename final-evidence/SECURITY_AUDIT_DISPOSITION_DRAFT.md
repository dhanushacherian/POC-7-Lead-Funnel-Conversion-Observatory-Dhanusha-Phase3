# Phase 3 Security Audit Disposition

Date: 2026-10-19
Project: POC-7 Lead Funnel Conversion Observatory
Branch: phase3/final-certification-review

## Evidence
- Full audit: final-evidence/npm-audit-full-2026-10-19.json
- Production-only audit command: npm.cmd audit --omit=dev
- Production-only result: found 0 vulnerabilities
- Full audit result: 5 high-severity findings, 0 critical findings
- Affected packages: eslint-config-next, @next/eslint-plugin-next, fast-glob, micromatch, braces
- The audit proposes eslint-config-next@14.2.35 as a major-version downgrade.

## Assessment
The production-only npm audit reported no vulnerabilities. The full dependency audit reported high-severity findings in the development-tool dependency chain, including braces.

The production-only result does not independently establish the security status of the complete Docker image. The Dockerfile uses npm ci without omitting development dependencies before building and starting the application.

## Required review
1. Confirm whether development dependencies are present in the deployed runtime image.
2. Ask the authorized security or release owner to assess the full-audit finding and remediation options.
3. Record the owner's decision, name or role, date, and supporting evidence.
4. Re-run the relevant audits and deployment checks after any approved remediation.

## Release decision
PENDING — NOT CERTIFIED.

No dependency downgrade or forced audit fix has been applied as part of this review.

## Additional Verification — 2026-10-19
- Current full audit saved to: final-evidence/npm-audit-current.json
- Current audit counts: 5 high, 0 critical, 5 total.
- Installed dependency chain verified:
  eslint-config-next@16.4.2 -> @next/eslint-plugin-next@16.4.2 -> fast-glob@3.3.1 -> micromatch@4.0.8 -> braces@3.0.3.
- `npm.cmd ls --omit=dev braces` returned `(empty)`.
- Dockerfile inspection confirms `npm ci` is used without `--omit=dev`, and build and runtime commands are in the same Docker stage.
- `.dockerignore` excludes `node_modules` and `final-evidence/`; this does not prevent npm from installing development dependencies inside the image.
- The audit's proposed fix is a major-version downgrade to `eslint-config-next@14.2.35`; it has not been applied.
- Limitation: the production-only dependency-tree result does not establish the contents or exploitability of the deployed runtime image.

## Outstanding Owner Decision
PENDING — authorized security/release owner review required.
Owner name or role: NOT YET RECORDED.
Decision date: NOT YET RECORDED.
Decision and supporting evidence: NOT YET RECORDED.

## Current Recheck — 2026-10-23

- Full npm audit evidence: `final-evidence/npm-audit-full-2026-10-23-recheck.json`
- Audit result: PASS; zero vulnerabilities reported across all severities.
- Vulnerability counts: 0 info, 0 low, 0 moderate, 0 high, 0 critical.
- Dependency verification: `braces@3.0.3` remains installed through `eslint-config-next` -> `@next/eslint-plugin-next` -> `fast-glob` -> `micromatch`.
- The current audit does not establish that the historical advisory has been formally resolved or accepted. The reason it no longer appears in the current audit has not been independently established.
- No forced downgrade or manual removal of `braces` was performed.
- Release decision: security disposition and final release-owner review remain pending.
