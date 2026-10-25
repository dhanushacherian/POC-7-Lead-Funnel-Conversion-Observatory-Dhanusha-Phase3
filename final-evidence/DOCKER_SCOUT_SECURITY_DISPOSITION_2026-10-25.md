# Phase 3 Docker Security Disposition

Date: 2026-10-25
Image: lead-funnel-observatory-phase3:security-fixed-v4
Image metadata: ID=sha256:a70fdd7d39ad2c57c2c2c1dd495edb9555105e83b5944024287497ca766472e0; Size=1079878590; ConfigUser=node

## Verification results
- Docker Scout: zero critical and zero high findings.
- Residual findings: one medium and one unspecified-severity advisory.
- Non-root runtime check previously passed: uid=1000(node).
- HTTP smoke test previously passed: HTTP 200.
- Full scan captured in: docker-scout-phase3-v4-full-2026-10-25.txt

## Residual findings
1. CVE-2025-60876 — BusyBox 1.37.0-r30. Docker Scout reports medium severity and no fixed version.
2. CVE-2026-58055 — nghttp2 1.69.0-r0. Docker Scout reports unspecified severity and no fixed version. The advisory describes an nghttpx proxy request-smuggling scenario.

These findings have not been represented as fixed. They require release-owner assessment of runtime applicability and acceptance or further mitigation.

## Release-owner decision — REQUIRED
Decision: PENDING
Approver: PENDING
Approval date: PENDING
Rationale / conditions: PENDING

Do not treat this record as release-owner approval or final Part A certification.
