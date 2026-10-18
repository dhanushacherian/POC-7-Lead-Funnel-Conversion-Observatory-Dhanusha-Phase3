# Phase 3 Docker Security Mitigation Review

## Status
Proposed mitigation; release-owner review and security disposition pending.
This document does not authorize a release or declare the underlying dependency vulnerability fixed.

## Baseline
- Proposed baseline commit: `061dbabdfc51d96b4b92a74d224f7433353a540b`
- Review branch: `security/docker-production-runtime`
- Test image: `lead-funnel-observatory-security-review:061dbab`
- Test container: `phase3-security-review`

## Original Finding
The previously recorded dependency audit identified five high-severity findings in the ESLint development dependency chain, including the reported path through `eslint-config-next`, `@next/eslint-plugin-next`, `fast-glob`, `micromatch`, and `braces@3.0.3`.

The recorded advisory was `GHSA-vfj7-8cjw-p6xm`, relating to stack exhaustion from deeply nested patterns. The previous review recorded that `npm audit fix --force` proposed a breaking downgrade of `eslint-config-next` to `14.2.35`. That downgrade was not applied.

## Proposed Mitigation
- Enabled Next.js standalone output in `next.config.ts`.
- Replaced the single-stage Docker build with separate builder and runtime stages.
- Kept Python and `npm ci` in the builder stage for build-time tasks.
- Copied the standalone server, traced dependencies, static assets, and public assets into the runtime stage.
- Configured the runtime to run as non-root user `nextjs` (UID 1001).

## Verification Results
- Docker image build: passed.
- Container startup: passed.
- Main dashboard `/`: HTTP 200.
- Data Intelligence page `/data-intelligence`: HTTP 200.
- Valid assistant POST using PowerShell JSON serialization: returned `SUPPORTED` with evidence and limitations.
- Assistant POST with an empty JSON object: HTTP 400, `MISSING_PARAMETER`.
- Runtime identity: UID 1001, non-root.
- Runtime Python check: `python3-not-found`.
- Runtime ESLint check: `eslint-not-found`.
- Next.js runtime dependency and standalone server checks: passed.
- Searches for `braces/package.json`, `micromatch/package.json`, and `eslint-config-next/package.json` under runtime `node_modules` returned no paths.
- `git diff --check`: no whitespace errors; Git printed line-ending conversion warnings.

The initial `curl.exe` valid-question test returned HTTP 500 because the request body was malformed by command-line quoting. The corrected PowerShell-native JSON request returned a supported deterministic answer. This initial 500 should not be reported as a confirmed application or container defect.

## Residual Risk and Limitations
This mitigation reduces exposure in the final runtime image by excluding the audited ESLint packages found in the original dependency chain. It does not patch the vulnerable package or remove it from the builder environment, where development dependencies are still installed.

The original dependency audit should be retained and rerun as required. The final runtime image should be audited independently where tooling permits. Confirm the package/advisory status with the authorized security or release owner and obtain an explicit disposition before release.

## Release Controls
- No dependency downgrade or override was made as part of this proposal.
- No production deployment was made as part of this local test.
- Do not merge or tag this mitigation as an approved release until review, required compliance gates, and release-owner disposition are complete.
