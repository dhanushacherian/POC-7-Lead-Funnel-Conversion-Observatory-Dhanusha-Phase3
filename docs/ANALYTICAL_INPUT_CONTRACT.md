# Analytical Input Contract

## 1. Purpose

This contract defines the approved inputs for the Phase 3 Track A — Comparative Intelligence analysis.

All analytical inputs must originate from:

`data/canonical/intelligence_data.csv`

Data version:

`phase3-v2`

## 2. Approved Analytical Track

- Primary track: Track A — Comparative Intelligence
- Method version: 1.0.0
- Data archetype: Process Lifecycle

## 3. Canonical Input Fields

| Field | Role | Use |
|---|---|---|
| record_id | Identifier | Record-level traceability |
| record_type | Record type | Distinguish CRM lead records from metric records |
| observed_at | Observation date | Descriptive temporal context |
| entity_id | Entity identifier | Lead-level identity |
| category | Product dimension | Approved product comparison |
| subcategory | Acquisition source | Approved source comparison |
| status | Lifecycle status | Context and lifecycle validation |
| stage | Funnel stage | Approved stage comparison |
| metric_name | Metric identifier | Identify lead value and days-in-stage |
| metric_value | Metric value | Source for analytical measures |
| metric_unit | Unit metadata | Interpret metric values |
| text_value | Structured metadata | Retained for traceability but not used as a primary comparison field |
| source_name | Provenance | Source traceability |
| source_record_id | Source identifier | Lead-level linkage |
| is_synthetic | Data-status flag | Dataset limitation and provenance |
| data_version | Version control | Required version verification |

## 4. Derived Analytical Fields

The following measures are derived from the canonical records:

### lead_value

Derived from `metric_value` for records where:

`record_type = crm_lead`

and the lead-value metric represents the observed lead value.

### days_in_stage

Derived from `metric_value` for records where:

`metric_name = days_in_stage`

The days-in-stage records are linked to source leads using `source_record_id`.

## 5. Analytical Record Construction

The analytical dataset uses one source CRM lead as the analytical unit.

The canonical dataset contains 60 records representing 30 source CRM leads.

Each source lead contributes:

1. one CRM lead record containing lead value
2. one CRM lead metric record containing days in stage

These are combined by `source_record_id`.

## 6. Approved Comparison Dimensions

Track A comparisons are limited to:

### Funnel stage

Canonical field:

`stage`

### Product

Canonical field:

`category`

### Acquisition source

Canonical field:

`subcategory`

## 7. Excluded Primary Inputs

The following are not primary analytical comparison dimensions:

### Team

Team information is embedded within `text_value` rather than represented as a dedicated canonical analytical field.

### Location

Location information is also embedded within `text_value` and is not represented as a dedicated analytical field.

### Free-text analysis

No natural-language or unstructured text analysis is part of the approved Track A method.

## 8. Outcome and Post-Event Fields

The Track A analysis is descriptive and comparative.

`status` and `stage` describe the observed CRM lifecycle state.

They are used for grouping and lifecycle comparison rather than as predictive target variables.

No predictive model is trained using future outcomes.

No post-event outcome is used to create a predictive feature.

## 9. Leakage Assessment

The analysis must not use information outside the canonical dataset.

The following controls apply:

- No alternate dataset may be substituted.
- No manually edited analytical dataset may replace the canonical CSV.
- No future external information may be introduced.
- No model-derived feature may be calculated using validation results.
- No validation result may be fed back into the analytical calculation.
- No full-dataset-derived feature is used as an individual predictive input.
- The analysis does not claim prediction or causation.

## 10. Decision-Time Availability

The approved Track A method is descriptive rather than predictive.

The analysis reports observed differences in:

- lead value
- days in stage
- funnel stage
- product
- acquisition source

These results describe the available sample and are not presented as forecasts.

## 11. Missing Values

Required analytical values must be available for a source lead to participate in the combined Track A analytical dataset.

Records with missing `lead_value` or `days_in_stage` are excluded from calculations requiring both measures.

Missingness must be reported during validation.

Groups with missing comparison values must not be silently discarded without being identified.

## 12. Data Type Requirements

The analytical workflow must validate:

- `metric_value` can be converted to numeric where required.
- `data_version` matches the expected version.
- `record_type` contains the expected canonical record types.
- `source_record_id` is available for lead linkage.
- comparison dimensions are available for eligible records.

## 13. Synthetic Data Limitation

The canonical dataset is marked:

`is_synthetic = true`

Therefore all findings must be interpreted as observations from the available synthetic sample.

They must not be represented as evidence about a real-world CRM population without additional supporting evidence.

## 14. Reproducibility Requirement

The analytical workflow must load the canonical CSV directly.

No manual spreadsheet transformation is permitted.

Derived analytical fields must be created programmatically.

The same canonical dataset and method version must reproduce the same analytical results.

## 15. Approved Measures

Track A may report:

- total observed lead value
- average observed lead value
- median observed lead value where implemented
- average days in stage
- median days in stage
- value share percentage
- group lead count

## 16. Validation Requirements

The input contract supports the following Track A validation activities:

- independent recalculation
- minimum group-size assessment
- deterministic tie handling
- ranking stability
- small-group sensitivity
- missing-group effects
- weak-case review

## 17. Unsupported Uses

The approved inputs and Track A method do not support:

- causal inference
- predictive modelling
- forecasting
- individual lead scoring
- automated operational decisions
- claims about real-world CRM populations
- use of unapproved external data

## 18. Version Control

Data version:

`phase3-v2`

Method version:

`1.0.0`

Any change to the approved inputs, transformations, analytical dimensions, thresholds, ranking logic or methodology must be documented and appropriately versioned.
