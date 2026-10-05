# Existing Operational Page Regression Evidence

## Project

- **PoC ID:** POC-7
- **PoC Title:** Lead Funnel Conversion Observatory
- **Phase:** Phase 3 Post #3
- **Analytical Track:** Track A - Comparative Intelligence

## Purpose

This document records evidence that the existing operational application remains functional after the Phase 3 Post #3 analytical-track changes.

The Post #3 analytical work does not intentionally modify the existing operational page.

## Regression Checks

### 1. Production Build

Command executed:

npm.cmd run build

Observed result:

VALIDATION PASSED
Canonical records: 60
Canonical columns: 20
Published JSON generated successfully.
Records published: 60
Compiled successfully
Finished TypeScript
Collecting page data
Generating static pages
Finalizing page optimization

Build result:

PASS

### 2. Existing Operational Page HTTP Check

The existing / page was started using the production application and requested locally.

Request:

http://127.0.0.1:3000/

Observed result:

Operational page HTTP check: PASS
Status code: 200
Content length: 27777

The application returned HTTP status code 200, confirming that the existing operational page remained reachable after the Post #3 changes.

Regression result:

PASS

### 3. Scope of Regression Check

The regression evidence covers:

- Existing production build completion
- Existing application startup
- Existing / route availability
- HTTP response status
- Preservation of the existing operational application boundary

No new Data Intelligence page, chatbot, new operational dashboard, or production analytical API was introduced as part of this Post #3 analytical work.

### 4. Analytical Correction Consistency

After the reviewer-requested correction to preserve the canonical lead-value unit, the canonical unit is:

currency_unspecified

The analytical exporter was corrected to preserve this canonical unit rather than replacing it with the generic value currency.

The corrected intelligence outputs were regenerated.

The generated intelligence results were independently checked and confirmed:

Lead-value unit check: PASS
Units found: ['currency_unspecified']
Incorrect results: []
Total results: 16

The complete analytical execution was then rerun successfully.

Latest analytical execution confirmed:

Calculation accuracy: PASS
Ranking stability: PASS
Missing-group review: PASS
Weak cases reviewed: 4
Overall validation: PASS
Lead-value unit: currency_unspecified
Execution status: PASS

### 5. Output and Repomix Regeneration

Following the analytical correction:

1. Intelligence outputs were regenerated.
2. The corrected intelligence_results.json and intelligence_summary.json were produced.
3. The full analytical pipeline was rerun.
4. Notebook 02 was re-executed from the first cell with visible outputs.
5. A fresh Repomix was generated after the corrections.

Fresh Repomix generation result:

Repomix v1.18.1
Packing completed successfully
Security: No suspicious files detected

### 6. Notebook Evidence

The required analytical notebook is:

data-science/notebooks/02_analytical_track_development_and_validation.ipynb

It was executed in place from the first cell after the reviewer-requested corrections.

Verification result:

Notebook execution errors: []
Code cells with outputs: 8
Notebook clean execution: PASS
Visible outputs: PASS

The executed notebook with visible outputs is committed to the repository.

### 7. GitHub Repository Evidence

The reviewer-requested corrections were committed and pushed to the Phase 3 repository.

Latest correction commit:

d0d87a8
Preserve canonical metric units in intelligence outputs

The repository was then verified with:

On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean

### 8. Existing Operational Page Regression Result

Based on the production build and existing / route HTTP check:

Existing Operational Page Regression: PASS

### 9. Evidence Limitation

This document records build-level and HTTP-route regression evidence for the existing operational page.

It does not claim that every browser-side visual interaction or every individual UI control was exhaustively tested in this regression check.

## Final Evidence Statement

The existing operational application remained buildable and reachable after the Phase 3 Post #3 analytical changes.

The reviewer-requested analytical correction was applied, affected intelligence outputs were regenerated, Notebook 02 was re-executed with visible outputs, and Repomix was regenerated afterward.

Existing Operational Page Regression: PASS
