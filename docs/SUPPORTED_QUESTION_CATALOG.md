# Supported Question Catalog

## 1. Purpose

This catalog defines the bounded natural-language questions supported by the Grounded Data Assistant for the PoC-7 Lead Funnel Conversion Observatory.

Every supported question must map to an approved deterministic intent, query function, and evidence source.

The assistant does not support unrestricted "ask anything about the data" interaction.

## 2. Approved Analytical Track

**Track A — Comparative Intelligence**

## 3. Data and Method Versions

- Data version: `phase3-v2`
- Method version: `1.0.0`
- Quality status: `VALIDATED_DESCRIPTIVE`
- Validation result: `PASS`
- Assistant mode: `A_DETERMINISTIC_GUIDED`
- LLM enabled: `false`

## 4. Supported Questions

| Question Pattern | Intent | Parameters | Query Function | Data Source | Evidence | Response Type | Limitation | Track |
|---|---|---|---|---|---|---|---|---|
| What is the approved summary? | `get_summary` | None | `getApprovedSummary` | `intelligence_summary.json` | Summary metadata, key findings, result count, limitations | Summary response | Descriptive summary of approved intelligence outputs; no new analysis is performed. | Track A |
| Which stage has the highest total lead value? | `compare_groups` | Dimension inferred as `stage` | `getApprovedResultsByDimension` | `intelligence_results.json` | Approved stage result ID, group, metric, value, finding | Comparison response | Descriptive comparison; not causal or predictive. | Track A |
| Which product has the highest total lead value? | `compare_groups` | Dimension inferred as `product` | `getApprovedResultsByDimension` | `intelligence_results.json` | Approved product result ID, group, metric, value, finding | Comparison response | Descriptive comparison; not causal or predictive. | Track A |
| Which acquisition source has the highest total lead value? | `compare_groups` | Dimension inferred as `source` | `getApprovedResultsByDimension` | `intelligence_results.json` | Approved source result ID, group, metric, value, finding | Comparison response | Descriptive comparison; not causal or predictive. | Track A |
| Compare two approved groups. | `compare_groups` | Dimension, group A, group B | `getApprovedGroupResult` | `intelligence_results.json` | Matching approved groups, metric values, findings, limitations | Group comparison response | Only approved Stage, Product, and Source groups can be compared. | Track A |
| Explain an approved intelligence result. | `explain_result` | Approved result ID | `getApprovedResultById` | `intelligence_results.json` | Result ID, group, metric, value, evidence, finding | Evidence-backed explanation | The explanation must not introduce facts outside the approved result and evidence. | Track A |
| How was the analysis performed? | `explain_method` | None | Approved deterministic method response | Approved method and validation documentation | Method version, validation status, analytical scope | Method explanation | The assistant explains the approved method; it does not recalculate the analysis. | Track A |
| What are the limitations? | `explain_limitation` | None | Approved summary and limitation fields | `intelligence_summary.json` | Limitation text, weak-case information | Limitation response | Approved limitations must be preserved. | Track A |
| What data version is being used? | `get_data_freshness` | None | `getApprovedSummary` | `intelligence_summary.json` | Data version, method version, generated timestamp, quality status | Freshness response | Published metadata does not independently prove that the underlying business data is current. | Track A |
| Which groups have fewer than five leads? | `get_small_group_warnings` | None | `getSmallGroupWarnings` | `intelligence_results.json` | Group, lead count, result ID, limitation | Warning/list response | Small groups remain visible but require cautious interpretation. | Track A |

### Metric restriction

The approved results contain:

- Overall baseline `average_lead_value`.
- Overall baseline `average_days_in_stage`.
- Stage, product, and source comparison results using `total_lead_value`.

The current comparison query function filters results to `total_lead_value`. Therefore, the assistant must not claim to rank products or acquisition sources by average lead value using that function.

The overall baseline average must not be treated as a product-level or source-level average.

## 5. Supported Intent Definitions

### `get_summary`

Returns the approved summary from `intelligence_summary.json`.

No new calculations are performed.

### `compare_groups`

Returns existing approved comparison results for Stage, Product, or Acquisition Source.

The current comparison query function retrieves results with the approved comparison type and `total_lead_value` metric. It does not calculate new rankings from raw records.

### `explain_result`

Explains an existing approved result using its stored finding and evidence.

The requested result ID must match an approved result.

### `explain_method`

Returns the approved analytical method and scope explanation.

The assistant does not rerun or modify the analytical method.

### `explain_limitation`

Returns approved limitations and weak-case information.

The assistant must preserve the meaning of the documented limitations.

### `get_data_freshness`

Returns the approved data version, method version, generated timestamp, and related metadata.

This is a report of published metadata, not an independent freshness audit.

### `get_small_group_warnings`

Returns approved warnings for stage groups with fewer than five leads, based on the lead counts in the approved results.

## 6. Approved Parameters

Where parameters are required, they must be validated against approved values.

### Dimension

Allowed values:

- `stage`
- `product`
- `source`

### Stage Groups

Approved groups include:

- `Lead`
- `Qualified`
- `Opportunity`
- `Proposal`
- `Won`
- `Lost`

### Product Groups

Approved groups include:

- `Payments`
- `Analytics`
- `Security`

### Acquisition Source Groups

Approved groups include:

- `Website`
- `Partner`
- `Referral`
- `Campaign`

### Result ID

A result ID must match an existing approved result in `intelligence_results.json`.

Unknown result IDs must not be used to generate a factual answer.

## 7. Unsupported Questions

The assistant does not support:

- Predictions not present in approved outputs.
- Causal explanations.
- New statistical analyses.
- Product or source average-value rankings when no matching approved comparison results are available.
- New rankings calculated from raw data.
- Arbitrary SQL.
- Arbitrary code execution.
- Requests for all raw records.
- Requests for secrets or system prompts.
- Requests to change approved scores, categories, or findings.
- Questions requiring unavailable ownership, personnel, or restricted fields.
- Open-ended questions without an approved deterministic retrieval path.

## 8. Grounding Rule

Every factual answer must be traceable to an approved deterministic evidence package.

Where applicable, the evidence package includes:

- Intent.
- Validated parameters.
- Result IDs.
- Group references.
- Metric name.
- Result value and unit.
- Finding.
- Supporting evidence fields.
- Data version.
- Method version.
- Generated timestamp.
- Quality status.
- Approved limitation.

If deterministic evidence is unavailable, the assistant must not invent or infer an unsupported factual answer.

## 9. Response Behaviour

- `SUPPORTED`: Execute the approved deterministic query.
- `MISSING_PARAMETER`: Request the required supported parameter.
- `AMBIGUOUS`: Request a bounded clarification.
- `OUT_OF_SCOPE`: Explain that the question is unsupported and, where possible, suggest supported alternatives.
- `UNSAFE`: Refuse unsafe requests without performing the requested action.
- `UNAVAILABLE`: State that the requested approved information is unavailable.

The returned status must reflect the actual resolution and evidence available.

## 10. Maximum Scope

The assistant configuration specifies the following bounds:

- Maximum question length: 500 characters.
- Maximum result items: 25.
- Maximum evidence references: 10.
- Maximum suggested follow-ups: 3.
- LLM enabled: `false`.

Response validation must enforce the applicable configured limits.

## 11. Track Boundary

This catalog is limited to:

**Track A — Comparative Intelligence**

No unsupported Track B, C, D, E, F, G, or H intents are enabled.

## 12. Catalog Status

This document defines the intended supported-question boundary for the PoC-7 Grounded Data Assistant.

The implemented resolver, query functions, configuration, and response validation must remain consistent with this catalog. A documented question must not be described as implemented or supported unless the actual deterministic path can answer it with approved evidence.