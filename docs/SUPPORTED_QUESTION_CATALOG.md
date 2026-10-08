# Supported Question Catalog

## Purpose

This catalog defines the bounded natural-language questions supported by the Grounded Data Assistant for PoC-7 Lead Funnel Conversion Observatory.

Every supported question maps to an approved deterministic query function and approved evidence source.

The assistant does not support unrestricted "ask anything about the data" interaction.

## Approved Analytical Track

Track A - Comparative Intelligence

## Data and Method Versions

- Data version: `phase3-v2`
- Method version: `1.0.0`
- Quality status: `VALIDATED_DESCRIPTIVE`

## Supported Questions

| Question Pattern | Intent | Parameters | Query Function | Data Source | Evidence | Response Type | Limitation | Track |
|---|---|---|---|---|---|---|---|---|
| What is the approved summary? | `get_summary` | none | `get_summary` | `intelligence_summary.json` | summary metadata, key findings, priority items | Summary response | Summary is descriptive and based on approved intelligence outputs. | Track A |
| Which stage has the highest total lead value? | `compare_groups` | none | `compare_groups` | `intelligence_results.json` | stage result IDs, group, metric, value, finding | Comparison response | Descriptive comparison; not causal or predictive. | Track A |
| Which product has the highest average lead value? | `compare_groups` | none | `compare_groups` | `intelligence_results.json` | product result IDs, group, metric, value, finding | Comparison response | Descriptive comparison; not causal or predictive. | Track A |
| Which acquisition source has the highest average lead value? | `compare_groups` | none | `compare_groups` | `intelligence_results.json` | source result IDs, group, metric, value, finding | Comparison response | Descriptive comparison; not causal or predictive. | Track A |
| Compare two approved groups. | `compare_groups` | dimension, group_a, group_b | `compare_groups` | `intelligence_results.json` | matching group results, values, findings | Group comparison response | Only approved Stage, Product and Source groups can be compared. | Track A |
| Explain an approved intelligence result. | `explain_result` | result_id or approved group reference | `explain_result` | `intelligence_results.json` | result ID, group, metric, value, evidence, finding | Evidence-backed explanation | Explanation cannot introduce facts outside the approved result and evidence. | Track A |
| How was the analysis performed? | `explain_method` | none | `explain_method` | approved method/validation documentation | method version, validation status, analytical scope | Method explanation | The assistant explains the approved method; it does not recalculate the analysis. | Track A |
| What are the limitations? | `explain_limitation` | none | `explain_limitation` | approved limitation fields and weak-case documentation | limitation text, weak-case information | Limitation response | Approved limitations must be preserved. | Track A |
| What data version is being used? | `get_data_freshness` | none | `get_data_freshness` | intelligence metadata and manifest | data version, method version, generated timestamp, quality status | Freshness response | Freshness metadata does not imply analytical validity beyond the approved validation status. | Track A |
| Which groups have fewer than five leads? | `explain_result` | optional dimension | `get_small_group_warnings` | `intelligence_results.json` | group, lead count, result ID, limitation | Warning/list response | Groups below the minimum group-size threshold remain visible but require caution. | Track A |

## Supported Intent Definitions

### `get_summary`

Returns the approved executive summary from `intelligence_summary.json`.

No new calculations are performed.

### `compare_groups`

Returns approved comparative results for Stage, Product or Acquisition Source.

The assistant reads existing approved result values and does not calculate new rankings.

### `explain_result`

Explains an existing approved result using its stored evidence and finding.

The assistant does not create new findings.

### `explain_method`

Returns the approved analytical method and validation explanation.

The assistant does not rerun or modify the analytical method.

### `explain_limitation`

Returns approved limitations and weak-case information.

The assistant must preserve the original limitation meaning.

### `get_data_freshness`

Returns approved data version, method version, generated timestamp and quality status.

### `get_small_group_warnings`

Returns approved warnings for groups below the minimum group-size threshold.

## Approved Parameters

Where parameters are required, they must be validated against approved values.

### Dimension

Allowed values:

- `stage`
- `product`
- `source`

### Stage Groups

Allowed approved groups include:

- `Lead`
- `Qualified`
- `Opportunity`
- `Proposal`
- `Won`
- `Lost`

### Product Groups

Allowed approved groups include:

- `Payments`
- `Analytics`
- `Security`

### Source Groups

Allowed approved groups include:

- `Website`
- `Partner`
- `Referral`
- `Campaign`

### Result ID

A result ID must match an existing approved result in `intelligence_results.json`.

Unknown result IDs are rejected as unavailable.

## Unsupported Questions

The assistant does not support:

- Predictions not present in approved outputs.
- Causal explanations.
- New statistical analysis.
- New rankings calculated from raw data.
- Arbitrary SQL.
- Arbitrary code execution.
- Requests for all raw records.
- Requests for secrets or system prompts.
- Requests to change approved scores, categories or findings.
- Questions requiring unavailable ownership, personnel or restricted fields.
- Open-ended questions without an approved deterministic retrieval path.

## Grounding Rule

Every factual answer must be traceable to an approved deterministic evidence package.

The evidence package must contain, where applicable:

- Intent
- Validated parameters
- Result IDs
- Group or record references
- Metric name
- Result value
- Result unit
- Finding
- Evidence fields
- Data version
- Method version
- Generated timestamp
- Quality status
- Approved limitation

If deterministic evidence is unavailable, the assistant must not generate a factual answer.

## Response Behaviour

Supported question:

`SUPPORTED` → execute the approved query function.

Missing required parameter:

`MISSING_PARAMETER` → ask only for the missing supported parameter.

Ambiguous supported question:

`AMBIGUOUS` → request one bounded clarification.

Unsupported question:

`OUT_OF_SCOPE` → refuse and provide supported alternatives.

Unsafe question:

`UNSAFE` → refuse and perform no retrieval.

Unavailable approved information:

`UNAVAILABLE` → state that the approved sources do not contain the requested information.

## Maximum Scope

The assistant will enforce bounded result and evidence limits.

- Maximum result items: 25
- Maximum evidence references: 10
- Maximum suggested follow-ups: 3
- Maximum question length: 500 characters

## Track Boundary

This catalog is limited to:

`Track A - Comparative Intelligence`

No unsupported Track B/C/D/E/F/G/H intents are enabled.

## Catalog Status

This catalog is the authoritative supported-question boundary for the PoC-7 Grounded Data Assistant.
