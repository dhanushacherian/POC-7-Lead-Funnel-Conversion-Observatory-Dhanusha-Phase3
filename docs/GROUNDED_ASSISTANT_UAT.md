
# Grounded Data Assistant — User Acceptance Testing (UAT)

## 1. Purpose

Validate the Post #5 Grounded Natural-Language Data Assistant integrated into the Lead Funnel Conversion Observatory, including deterministic answers, optional Gemini explanations, evidence references, limitations, and safe handling of unsupported requests.

## 2. Implementation Summary

- **Mode:** A — Deterministic Guided Assistant
- **LLM integration:** Gemini optional explanation enabled
- **Data version:** `phase3-v2`
- **Method version:** `1.0.0`
- **Quality status:** `VALIDATED_DESCRIPTIVE`
- **Browser automation:** Playwright with Chromium

The assistant retrieves approved intelligence results and does not generate new statistical analyses, predictions, or causal conclusions. Gemini provides an optional explanation; the deterministic answer and approved evidence remain the primary response.

## 3. Test Results

| Test | Result |
|---|---|
| Grounded summary response | PASS — previously recorded service test |
| Approved data and method versions | PASS — previously recorded service test |
| Approved analytical method explanation | PASS — previously recorded service test |
| Documented limitations | PASS — previously recorded service test |
| Small-group warnings with evidence | PASS — previously recorded service test |
| Supported product ranking | PASS — previously recorded service test |
| Missing question handled safely | PASS — previously recorded service test |
| Unsupported prediction rejected | PASS — service and browser tests |
| Prompt-injection attempt rejected | PASS — previously recorded service test |
| Arbitrary code execution request rejected | PASS — previously recorded service test |
| Oversized question rejected | PASS — previously recorded service test |
| Non-string input handled safely | PASS — previously recorded service test |
| Supported-question browser test | PASS — Playwright/Chromium |
| Unsupported-prediction browser test | PASS — Playwright/Chromium |
| TypeScript compilation | PASS — previously recorded |
| ESLint | PASS — previously recorded |
| Intelligence contract validation | PASS — previously recorded |
| Production build | PASS — previously recorded |
| API supported-question response | PASS — manually verified |
| Gemini-unavailable browser fallback | NOT YET VERIFIED |
| Full operational-page regression | NOT YET VERIFIED |

## 4. Browser UAT Evidence

Browser tests were implemented in:

`tests/browser/assistant-uat.spec.ts`

Playwright configuration:

`playwright.config.ts`

Browser test command:

```powershell
npm.cmd run test:browser -- --timeout=90000 --workers=1
```

Recorded execution result:

```text
Running 2 tests using 1 worker

✓ supported question displays grounded answer and Gemini status
✓ unsupported prediction request is safely rejected

2 passed (2.6s)
```

### Test 1: Supported question

Question:

`Which stage has the highest total lead value?`

Verified UI behavior:

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

Verified UI behavior:

- Response status: `OUT_OF_SCOPE`
- Deterministic-answer section is displayed.
- The request is rejected rather than treated as an approved prediction.

## 5. API Verification

A direct POST request to `/api/assistant` with the supported stage-comparison question returned a successful JSON response.

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

## 7. Acceptance Assessment

The recorded service tests, browser UAT tests, TypeScript compilation, ESLint, intelligence contract validation, production build, and direct API verification have passed.

The supported-question and unsupported-prediction browser tests both passed in the recorded Playwright run.

**Current assessment:** The tested assistant behaviors passed.

**Remaining release checks:**

- Verify deterministic fallback when Gemini is unavailable.
- Run the final regression checks.
- Regenerate `repomix-output.xml` without secrets.
- Review the final documentation and Git changes.
- Commit and push the completed changes.

The overall release should not be marked fully accepted until the remaining checks are completed.

## 8. Reproducibility

Run the browser tests with:

```powershell
npm.cmd run test:browser -- --timeout=90000 --workers=1
```

Previously recorded project checks include:

```powershell
npm.cmd run lint
npm.cmd run test:intelligence
npm.cmd run build
```

These checks should be rerun against the final working tree before release.

## 9. Final Status

**Browser UAT:** PASS — 2 of 2 tests.

**Full release acceptance:** PENDING — fallback verification, final regression, documentation review, Repomix regeneration, and Git delivery remain.
