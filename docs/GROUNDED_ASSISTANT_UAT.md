
# Grounded Data Assistant â€” User Acceptance Testing (UAT)

## 1. Purpose

Validate the Post #5 Grounded Natural-Language Data Assistant integrated into the Lead Funnel Conversion Observatory, including deterministic answers, optional Gemini explanations, evidence references, limitations, and safe handling of unsupported requests.

## 2. Implementation Summary

- **Mode:** B â€” Deterministic Retrieval + LLM Explanation
- **Assistant configuration:** `B_DETERMINISTIC_RETRIEVAL_LLM_EXPLANATION`
- **LLM integration:** Gemini supplementary explanation enabled
- **Data version:** `phase3-v2`
- **Method version:** `1.0.0`
- **Quality status:** `VALIDATED_DESCRIPTIVE`
- **Browser automation:** Playwright with Chromium

The assistant retrieves approved intelligence results through deterministic query functions. It does not generate new statistical analyses, predictions, or causal conclusions.

Gemini provides an optional natural-language explanation of an already-established deterministic answer. The explanation must pass grounding validation against the approved answer and evidence. The deterministic answer, evidence references, and limitations remain authoritative.

If Gemini is unavailable, the API key is missing, a provider error occurs, or an explanation fails grounding validation, the explanation is marked unavailable. A supported deterministic answer and its approved evidence must remain unchanged.

## 3. Test Results

| Test | Result |
|---|---|
| Grounded summary response | PASS â€” previously recorded service test |
| Approved data and method versions | PASS â€” previously recorded service test |
| Approved analytical method explanation | PASS â€” previously recorded service test |
| Documented limitations | PASS â€” previously recorded service test |
| Small-group warnings with evidence | PASS â€” previously recorded service test |
| Supported product ranking | PASS â€” previously recorded service test |
| Missing question handled safely | PASS â€” previously recorded service test |
| Unsupported prediction rejected | PASS â€” service and browser tests |
| Prompt-injection attempt rejected | PASS â€” previously recorded service test |
| Arbitrary code execution request rejected | PASS â€” previously recorded service test |
| Oversized question rejected | PASS â€” previously recorded service test |
| Non-string input handled safely | PASS â€” previously recorded service test |
| Supported-question browser test | PASS â€” previously recorded Playwright/Chromium test |
| Unsupported-prediction browser test | PASS â€” previously recorded Playwright/Chromium test |
| TypeScript compilation | PASS â€” previously recorded |
| ESLint | PASS â€” rerun on 13 October 2026 |
| Intelligence contract validation | PASS â€” previously recorded |
| Production build | PASS â€” verified on 13 October 2026 |
| API supported-question response | PASS â€” previously manually verified |
| Missing Gemini API key fallback test | PASS â€” dedicated fallback test |
| HTTP 429 quota-error fallback test | PASS â€” dedicated fallback test |
| HTTP 503 provider-error fallback test | PASS â€” dedicated fallback test; one retry verified |
| HTTP 504 gateway-error fallback test | PASS â€” dedicated fallback test |
| Preservation of deterministic answer, evidence, and limitation in fallback tests | PASS â€” dedicated fallback test |
| Gemini-unavailable browser fallback | NOT YET VERIFIED |
| Full operational-page regression after final documentation edits | NOT YET VERIFIED |

The dedicated fallback tests exercise `explainWithGemini` with mocked provider failures and verify that the deterministic response remains unchanged. They do not independently exercise the full API route for every failure scenario.

## 4. Browser UAT Evidence

Browser tests are implemented in:

`tests/browser/assistant-uat.spec.ts`

Playwright configuration:

`playwright.config.ts`

Browser test command:

```powershell
npm.cmd run test:browser -- --timeout=90000 --workers=1
```

Previously recorded execution result:

```text
Running 2 tests using 1 worker

âœ“ supported question displays grounded answer and Gemini status
âœ“ unsupported prediction request is safely rejected

2 passed (2.6s)
```

### Test 1: Supported question

Question:

`Which stage has the highest total lead value?`

Previously verified UI behavior:

- Response status: `SUPPORTED`
- Intent: `compare_groups`
- Deterministic answer identifies the Won stage.
- Recorded total lead value: `949000`
- Gemini explanation status: `AVAILABLE`
- Evidence reference: `stage_won_total_value`
- Data version: `phase3-v2`
- Method version: `1.0.0`
- Quality status: `VALIDATED_DESCRIPTIVE`
- Limitation disclosure is displayed.

### Test 2: Unsupported prediction

Question:

`Predict next year's revenue using a machine learning model`

Previously verified UI behavior:

- Response status: `OUT_OF_SCOPE`
- The request is rejected rather than treated as an approved prediction.

## 5. API Verification

A previously recorded direct POST request to `/api/assistant` with the supported stage-comparison question returned a successful JSON response.

Recorded response fields:

- Status: `SUPPORTED`
- Intent: `compare_groups`
- Validation result: `PASS`
- LLM enabled: `true`
- Explanation status: `AVAILABLE`
- Data version: `phase3-v2`
- Method version: `1.0.0`
- Evidence references: Present
- Limitation: Present
- Suggested follow-ups: Present

The approved result identifies Won as the highest-ranked stage for total lead value, with a recorded value of `949000` across 10 leads.

**Disclosure:** The sample is synthetic, the analysis is descriptive, and small groups require cautious interpretation. The reported value must not be interpreted as a forecast or a causal conclusion.

## 6. Analytical and Security Boundaries

The assistant must:

1. Use approved intelligence results as the source of analytical claims.
2. Keep the deterministic answer separate from the optional Gemini explanation.
3. Include available evidence references and limitations.
4. Reject unsupported predictive or causal requests.
5. Reject prompt injection and arbitrary-code execution requests.
6. Avoid sending the complete canonical dataset to Gemini.
7. Keep the Gemini API key on the server, outside browser code and committed files.
8. Avoid persistent conversational memory.
9. Preserve deterministic response behavior when an optional explanation is unavailable.
10. Validate Gemini explanations against the approved deterministic answer and evidence before returning them.
11. Reject unsupported numerical claims and unsupported winning-group claims.
12. Mark a rejected or unavailable explanation as `null` with explanation status `UNAVAILABLE`, while preserving the supported deterministic answer and its approved evidence and limitation.

## 7. Acceptance Assessment

The following checks have passed at their recorded checkpoints:

- Previously recorded service tests
- Previously recorded browser UAT tests
- TypeScript compilation
- ESLint, rerun on 13 October 2026
- Intelligence contract validation
- Production build, verified on 13 October 2026
- Previously recorded direct API verification
- Dedicated Gemini fallback tests

The dedicated Gemini fallback tests passed for:

- Missing `GEMINI_API_KEY`
- HTTP 429 quota exhaustion
- HTTP 503 provider failure, including exactly one retry
- HTTP 504 gateway error

These tests verify preservation of the deterministic answer, evidence references, and limitation when the explanation is unavailable.

**Current assessment:** The recorded tests and dedicated Gemini fallback tests passed. This does not establish that every browser fallback scenario or the entire final release has been accepted.

**Remaining release checks:**

- Verify Gemini-unavailable fallback through the browser or full API integration path.
- Run the final regression checks against the final working tree.
- Regenerate `repomix-output.xml` after all documentation corrections, without including secrets.
- Review the final documentation and Git changes.
- Commit and push the completed documentation and refreshed project output.

The overall release should not be marked fully accepted until the remaining checks are completed.

## 8. Reproducibility

Run the dedicated fallback tests with:

```powershell
npx.cmd tsx .\tests\gemini-fallback-test.ts
```

Run the browser tests with:

```powershell
npm.cmd run test:browser -- --timeout=90000 --workers=1
```

Run the project checks with:

```powershell
npm.cmd run lint
npm.cmd run test:intelligence
npm.cmd run build
```

These checks should be rerun against the final working tree before release.

## 9. Final Status

**Selected architecture:** Mode B â€” Deterministic Retrieval + LLM Explanation.

**ESLint:** PASS â€” rerun on 13 October 2026.

**Dedicated Gemini fallback tests:** PASS â€” missing API key, HTTP 429, HTTP 503 with one retry, and HTTP 504.

**Production build:** PASS â€” data validation, data publishing, TypeScript checks, compilation, and page generation succeeded on 13 October 2026.

**Previously recorded browser UAT:** PASS â€” 2 of 2 tests.

**Previously recorded full Playwright suite:** PASS â€” 36/36 tests.

**Full release acceptance:** PENDING â€” final documentation review, browser/API fallback integration verification, final regression, Repomix regeneration, and Git delivery remain.

## 10. Mode B Live Integration Retest â€” 12 October 2026

**Selected mode:** `B_DETERMINISTIC_RETRIEVAL_LLM_EXPLANATION`

**Live Gemini API smoke test:** PASS â€” previously recorded.

A real supported-question API request returned `status: SUPPORTED`, `metadata.llm_enabled: true`, and `explanation_status: AVAILABLE`.

**Question:** Which stage has the highest total lead value?

**Deterministic answer:** The approved results identify Won as the highest-ranked group for total lead value in the stage comparison. The recorded value is `949000` currency_unspecified.

**Evidence:** One approved evidence reference was returned.

**Gemini explanation:** The generated explanation identified the Won stage, reported the value of `949000` across 10 leads, and retained the caution about descriptive comparisons and the synthetic sample.

**Previously recorded full Playwright browser suite:** PASS â€” 36/36 tests.

**Production build after fallback test changes:** PASS â€” verified on 13 October 2026.

**ESLint:** PASS â€” rerun on 13 October 2026.

**Provider-failure fallback observation:** Actual Gemini 503 and 504 errors were observed during earlier testing. The API retained the deterministic answer and returned `explanation_status: UNAVAILABLE` rather than inventing an explanation.

**Dedicated fallback test update:** Missing API key, HTTP 429, HTTP 503, and HTTP 504 scenarios passed in `tests/gemini-fallback-test.ts`. The HTTP 503 test verified exactly one retry. These dedicated tests use mocked provider failures and are not a substitute for full browser/API integration testing.

**Grounding validation:** The dedicated grounding test rejects an unsupported numerical claim and accepts a grounded explanation matching the approved value.

**Review status:** Pending final regression, documentation review, Repomix regeneration, browser/API fallback integration verification, and Git delivery.
