# Assistant Test Validation

## Grounded Assistant Service
Status: PASS
- 12 service checks passed.
- Supported answers and approved evidence were verified.
- Unsupported prediction and prompt-injection requests were rejected.
- Invalid inputs and configured question-length limits were handled safely.

## Gemini Fallback
Status: PASS
- Missing API key preserves approved results.
- HTTP 429 quota failure preserves approved results.
- HTTP 503 provider failure preserves approved results.
- HTTP 503 retry behavior was verified.
- HTTP 504 gateway failure preserves approved results.

## Assistant API Fallback
Status: PASS
- Normal API route preserves the approved answer.
- Simulated Gemini failure preserves the answer.
- Evidence and limitations remain available.

## Related Browser Validation
- Playwright run 1: 36/36 passed.
- Playwright run 2: 36/36 passed.
- A Gemini timeout was logged during browser tests; deterministic fallback tests passed.

## Scope
These are local test results. They do not certify public deployment or final clean-clone validation.

## Post-Dependency-Update Validation — 2026-10-16

### Grounded Assistant Service
Status: PASS
- 12/12 service checks passed after the dependency update.

### Gemini Fallback
Status: PASS
- Missing API key, HTTP 429, HTTP 503 with one retry, and HTTP 504 cases passed.

### Assistant API Fallback
Status: PASS
- Normal API response passed.
- Simulated Gemini failure preserved the approved answer.
- Evidence and limitations remained available.

### Browser Regression
- First post-update run: 33 passed; 3 tests timed out.
- Second post-update run: 36/36 passed in 28.1 seconds.
- The successful rerun covered numeric fidelity, mobile responsiveness, supported answers, and deterministic fallback.
- The initial timeouts are retained in the validation history rather than omitted.

### Release Scope
These results confirm local validation only. Public deployment, fresh Docker validation after the dependency update, and clean-clone validation remain separate release checks.
