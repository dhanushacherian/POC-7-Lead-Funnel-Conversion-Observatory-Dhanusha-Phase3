# Analytical Method Report

## 1. Project

- PoC ID: POC-7
- PoC Title: Lead Funnel Conversion Observatory
- Phase: Phase 3
- Approved Primary Track: Track A — Comparative Intelligence
- Data Archetype: Process Lifecycle
- Data Version: phase3-v2
- Method Version: 1.0.0

## 2. Analytical Objective

The purpose of the Track A analysis is to compare observed lead value and days in stage across the approved CRM funnel dimensions within the available synthetic lead sample.

The analysis is descriptive and is intended to support operational review of observed differences between groups.

It does not establish causation, forecast future outcomes, or perform predictive lead scoring.

## 3. Primary Analytical Question

How do lead value and days in stage vary across CRM funnel stages, acquisition sources and products within the available synthetic lead sample?

## 4. Analytical Unit

The analytical unit is one source CRM lead.

The canonical dataset contains 60 records representing 30 source CRM leads.

Each source lead has:

- one CRM lead record containing lead value
- one CRM lead metric record containing days in stage

The records are linked using `source_record_id`.

## 5. Canonical Data

The analysis reads directly from:

`data/canonical/intelligence_data.csv`

Expected data version:

`phase3-v2`

No alternate dataset is permitted.

## 6. Analytical Measures

For each approved comparison group, the method calculates:

### Lead count

Number of unique source CRM leads in the group.

### Total observed lead value

Sum of observed lead values for the group's source CRM leads.

### Average observed lead value

Mean observed lead value for the group's source CRM leads.

### Average days in stage

Mean observed days in stage for the group's source CRM leads.

### Median days in stage

Median observed days in stage for the group's source CRM leads.

### Value share percentage

The group's total observed lead value divided by the total observed lead value across the analytical dataset, multiplied by 100.

## 7. Approved Comparison Dimensions

The method performs comparisons across:

### Funnel stage

Canonical field:

`stage`

### Product

Canonical field:

`category`

### Acquisition source

Canonical field:

`subcategory`

No additional comparison dimensions are introduced.

## 8. Baseline Method

The baseline is the overall descriptive result across all eligible source CRM leads before group comparison.

Baseline measures are:

- total observed lead value
- average observed lead value
- average days in stage
- median days in stage

The baseline provides the overall reference point against which group-level results are interpreted.

## 9. Group Ranking

For Track A, groups are primarily ranked by:

1. total observed lead value, descending

Additional comparisons may rank groups by:

1. average days in stage, descending

Ranking must use deterministic secondary ordering when primary metric values are tied.

Group counts must always be reported alongside rankings.

## 10. Minimum Group Size

Group size must be explicitly reported.

Groups with small sample sizes must not be interpreted as equally stable to larger groups.

The validation workflow will assess the effect of a minimum-group-size rule and will document sparse groups rather than silently removing them from the descriptive results.

The current dataset contains particularly small groups including:

- Lost stage: 3 leads
- Lead stage: 3 leads
- Partner acquisition source: 5 leads

These groups require explicit weak-case review.

## 11. Missing Values

Rows lacking required lead value or days-in-stage values are excluded from calculations that require both measures.

Missing comparison dimensions must be identified during validation.

Missing groups must not be silently omitted without being documented.

## 12. Leakage Controls

The method uses only approved canonical fields.

It does not use:

- external information
- future external information
- predictive model outputs
- validation-derived features
- manually edited datasets
- notebook-only transformations

The analysis is descriptive and does not construct predictive features.

## 13. Independent Calculation Requirement

Validation will independently recalculate selected Track A results from the canonical dataset rather than relying only on the primary analysis output.

The independent calculation must verify:

- lead counts
- total lead value
- average lead value
- average days in stage
- selected ranking results

## 14. Ranking Stability

Validation will examine whether major group rankings remain stable under approved sensitivity checks.

Sensitivity analysis will pay particular attention to sparse groups.

Any unstable ranking must be documented rather than presented as a robust finding.

## 15. Deterministic Tie Handling

Rankings must use deterministic ordering.

Where groups have equal primary metric values, a secondary deterministic ordering will be applied so that repeated execution produces the same order.

## 16. Small-Group Sensitivity

The validation workflow will compare the full descriptive results with results after applying the documented minimum-group-size sensitivity rule.

The purpose is not to hide small groups but to determine whether headline rankings depend strongly on sparse groups.

## 17. Missing-Group Effects

Validation will identify:

- groups present in the canonical data
- groups with missing analytical values
- groups excluded from calculations
- any change in rankings caused by exclusions

## 18. Interpretation Rules

The following language is permitted:

- observed
- descriptive
- comparative
- higher in the available sample
- lower in the available sample
- associated with the observed sample

The following claims are not permitted:

- causes
- predicts
- guarantees
- proves
- representative of all CRM leads
- production-ready prediction

## 19. Reproducibility

The method must be implemented in reusable Python scripts.

The same canonical dataset, method version and approved method rules must reproduce the same results.

No manual spreadsheet editing is part of the method.

## 20. Standard Method Outputs

The completed Track A workflow will contribute to:

- `intelligence_results.json`
- `intelligence_summary.json`
- `validation_metrics.json`
- `weak_case_review.json`

Supporting outputs include:

- `track_a_analysis_dataset.csv`
- `track_a_stage_comparison.csv`
- `track_a_product_comparison.csv`
- `track_a_source_comparison.csv`

## 21. Limitations

The dataset is synthetic and contains 30 source CRM leads.

The findings describe the available sample.

The results cannot be generalized to a larger CRM population without additional evidence.

The analysis does not establish causation or perform predictive modelling.

Team and location are not dedicated canonical analytical fields.

## 22. Current Validation Status

The existing descriptive Track A calculation has been successfully executed from the repository and its headline results have been independently inspected against the generated comparison outputs.

Formal Post #3 validation remains pending.

The final analytical-track status will only be determined after:

- independent validation
- minimum-group-size assessment
- ranking stability assessment
- small-group sensitivity analysis
- missing-group assessment
- weak-case review
- standard output validation
- reproducibility verification
