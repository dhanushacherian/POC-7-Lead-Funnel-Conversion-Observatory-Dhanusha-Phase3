# Analytical Track Execution Plan

## 1. Project

- PoC ID: POC-7
- PoC Title: Lead Funnel Conversion Observatory
- Phase: Phase 3
- Analytical Track: Track A — Comparative Intelligence
- Method Version: 1.0.0
- Data Version: phase3-v2

## 2. Canonical Data Source

All analytical execution must use:

`data/canonical/intelligence_data.csv`

No alternate, manually edited, synthetic replacement, notebook-only, or secondary analytical dataset may be used.

The canonical dataset contains 60 records representing 30 source CRM leads. Each source lead is represented by a lead-value record and a days-in-stage metric record.

## 3. Data Archetype

Primary data archetype:

**Process Lifecycle**

The analysis focuses on CRM funnel lifecycle characteristics including:

- funnel stage
- status
- lead value
- days in stage
- acquisition source
- product/category

## 4. Primary Analytical Question

How do lead value and days in stage vary across CRM funnel stages, acquisition sources and products within the available synthetic lead sample?

## 5. Decision to Be Supported

Support descriptive operational review of observed differences in lead value and stage ageing across CRM funnel groups.

The analysis is descriptive and does not establish causation or provide predictive recommendations.

## 6. Analytical Inputs

Required analytical fields include:

- source_record_id
- category
- subcategory
- status
- stage
- observed_at
- metric_name
- metric_value
- data_version
- is_synthetic

Derived analytical measures:

- lead_value
- days_in_stage

## 7. Approved Comparative Dimensions

Track A comparisons will be performed across:

1. CRM funnel stage
2. Product/category
3. Acquisition source/subcategory

Team and location will not be treated as primary comparison dimensions because they are encoded within text_value rather than represented as separate canonical analytical fields.

## 8. Analytical Measures

Primary measures:

- Total observed lead value
- Average observed lead value
- Average days in stage
- Median days in stage
- Value share percentage

## 9. Baseline

The baseline will be the overall descriptive result calculated across all eligible source CRM leads before group comparison.

The baseline will include:

- total observed lead value
- average observed lead value
- average days in stage
- median days in stage

The Track A comparative results will then be compared against this baseline.

## 10. Execution Sequence

The analytical execution must follow this order:

1. Load canonical CSV.
2. Verify the canonical data version.
3. Validate required input fields.
4. Confirm the analytical dataset contains the expected source-lead records.
5. Apply only approved transformations.
6. Run the descriptive baseline.
7. Run Track A comparative analysis.
8. Generate stage, product and acquisition-source comparisons.
9. Validate analytical calculations.
10. Apply minimum group-size checks.
11. Assess ranking stability.
12. Assess sensitivity to small groups.
13. Assess missing-group effects.
14. Review weak and questionable cases.
15. Export standard intelligence outputs.
16. Record limitations and validation status.

## 11. Track A Validation

Validation must include:

- independent recalculation of selected results
- minimum group-size assessment
- deterministic ranking and tie handling
- sensitivity to small groups
- ranking stability
- missing-group effects
- review of sparse or questionable groups

Particular attention will be given to small groups such as:

- Lost stage
- Lead stage
- Partner acquisition source

## 12. Reproducibility

Core analytical logic must be implemented in reusable Python scripts.

The final workflow must not depend on hidden notebook-only calculations or manual spreadsheet edits.

The analytical track must be executable from the repository using the canonical dataset.

## 13. Standard Outputs

The completed analytical track must produce:

- intelligence_results.json
- intelligence_summary.json
- validation_metrics.json
- weak_case_review.json

Supporting comparative outputs may include:

- stage comparison
- product comparison
- acquisition-source comparison
- analytical dataset

## 14. Limitations

The dataset is synthetic and contains 30 source CRM leads.

Results describe the available sample and should not be generalized to a larger CRM population without additional evidence.

Comparative associations do not establish causation.

The analysis does not perform predictive modelling.

The available canonical structure does not provide dedicated team and location analytical fields.

## 15. Method Version

Method version: `1.0.0`

Any change to analytical rules, thresholds, weights, features, ranking logic, taxonomy or other substantive methodological parameters must result in an updated method version.

## 16. Approval Gate

The analytical track will only be considered ready for review after:

- successful reproducible execution
- validation evidence is generated
- weak cases are reviewed
- standard intelligence outputs are produced
- limitations are documented
- existing operational functionality remains intact

Final status must be one of:

- ANALYTICAL TRACK OUTPUT APPROVED
- ANALYTICAL TRACK CHANGES REQUIRED
- APPROVED TRACK NOT VIABLE
