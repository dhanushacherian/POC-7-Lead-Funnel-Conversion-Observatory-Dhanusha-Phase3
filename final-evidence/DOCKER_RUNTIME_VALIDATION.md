# Docker Runtime Validation

Date: 2026-10-16 14:57:50 +05:30
Image: lead-funnel-observatory-phase3:release-candidate
Container: lead-funnel-release-test
Container ID: ecf823bc6ea8

## Results
- Docker image build: PASS
- Container startup: PASS
- Dashboard route (/): HTTP 200
- Data Intelligence route (/data-intelligence): HTTP 200
- Assistant API valid-question test: PASS
- Assistant response status: SUPPORTED
- Assistant metadata validation_result: PASS
- Data version: phase3-v2
- Highest-ranked product group: Payments
- Recorded total lead value: 942000
- LLM explanation: UNAVAILABLE; deterministic response succeeded

## Limitation
The assistant result is descriptive and based on the available synthetic sample.
This report records local Docker validation only; it does not establish public deployment
or clean-clone validation.

## Post-Dependency-Update Docker Validation — 2026-10-16

### Image Build
Status: PASS
- Image tag: lead-funnel-observatory-phase3:release-candidate
- Image manifest digest: sha256:00af341076a96917ef7aab95cea3f7258064ff657ce8a53d1b0bb4f2d26d3f6c
- Image configuration digest: sha256:804ed3eeb66c1f978b076b5a32b9a06a34a2b05d27df68c29a948b4aebc4c24f
- Next.js version: 16.4.2

### Fresh Container Runtime
Status: PASS
- Container: lead-funnel-release-test-v2
- Container ID: a853b684d0137dd667562025fde36b4c279f3ca3753e2cdb3fcaa0863bd49f6c
- Port mapping: 3002 -> 3000
- Server startup: Ready in 316 ms
- Homepage: HTTP 200
- Data Intelligence page: HTTP 200

### Assistant API
Status: PASS
- Supported question returned status SUPPORTED.
- Payments was identified as the highest-ranked product group for total lead value.
- Reported total lead value: 942000 across 12 leads.
- Evidence, limitation, data version phase3-v2, method version 1.0.0, and VALIDATED_DESCRIPTIVE quality status were present.
- Gemini explanation was unavailable; deterministic answer remained available.
- Missing question returned HTTP 400 with status MISSING_PARAMETER.

### Scope
These are local Docker validation results. Public deployment and clean-clone validation remain outstanding.
