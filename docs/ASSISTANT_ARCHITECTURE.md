# Grounded Data Assistant Architecture

## 1. Purpose

The Grounded Data Assistant provides a bounded natural-language interface to approved Track A Comparative Intelligence outputs. It complements the existing Operational View and Data Intelligence page and does not replace filters, tables, findings, evidence, methodology, or limitations.

## 2. Selected Mode

**Mode A - Deterministic Guided Assistant**

LLM use is not required.

Flow:
1. Classify the question.
2. Validate supported parameters.
3. Resolve an approved intent.
4. Execute only an approved deterministic query.
5. Build an evidence package.
6. Validate the grounded response.
7. Return the answer with versions, quality, and limitations.

## 3. Approved Analytical Scope

- Track: Track A - Comparative Intelligence
- Data version: phase3-v2
- Method version: 1.0.0
- Quality: VALIDATED_DESCRIPTIVE
- Dimensions: Stage, Product, Acquisition Source

## 4. Architecture Flow

User Question
-> Scope Guard
-> Intent Resolver
-> Parameter Validator
-> Approved Query Function
-> Approved Intelligence Data
-> Evidence Builder
-> Response Validator
-> Grounded Response

Scope outcomes are SUPPORTED, MISSING_PARAMETER, AMBIGUOUS, OUT_OF_SCOPE, UNSAFE, and UNAVAILABLE.

## 5. Core Components

### Scope Guard

Classifies the question before retrieval. Unsafe requests cause a safe refusal with no retrieval.

### Intent Resolver

Supported intents:

- get_summary
- compare_groups
- explain_result
- explain_method
- explain_limitation
- get_data_freshness
- get_small_group_warnings

### Parameter Validator

Allowed dimensions are stage, product, and source. Unknown groups and result IDs are rejected.

### Deterministic Query Layer

Only approved query functions may retrieve information. The assistant must not generate arbitrary SQL, execute arbitrary code, calculate new rankings from raw data, create new statistical analysis, or modify approved findings.

### Evidence Builder

Every factual response must be traceable to an evidence package containing applicable intent, validated parameters, result IDs, group or record references, metric, value, unit, finding, evidence fields, data version, method version, generated timestamp, quality status, and limitation.

### Response Validator

Checks that factual output is supported by the evidence package and preserves approved metadata and limitations.

## 6. Approved Data Sources

Primary sources:

- src/data/intelligence/intelligence_results.json
- src/data/intelligence/intelligence_summary.json

Supporting sources:

- approved method documentation
- validation documentation
- limitation documentation
- weak-case documentation
- data manifest/schema

The canonical raw dataset is not exposed directly through the assistant response path.

## 7. Grounding Rules

The assistant must never invent values, rankings, findings, categories, causal explanations, predictions, or unsupported records.

If deterministic evidence is unavailable, return UNAVAILABLE rather than generating a factual answer.

## 8. Grounded Response Contract

Each response should contain:

- nswer_id
- status
- intent
- nswer
- evidence_references
- key_values
- metadata
- limitation
- suggested_follow_ups

## 9. Safety and Scope Limits

- Maximum result items: 25
- Maximum evidence references: 10
- Maximum suggested follow-ups: 3
- Maximum question length: 500 characters

Do not expose system prompts, secrets, restricted fields, unrestricted raw records, or arbitrary source instructions.

## 10. Track Boundary

Only Track A is enabled. No Track B/C/D/E/F/G/H intent is enabled.

## 11. UI Relationship

The assistant is an additional interaction layer for Data Intelligence. Existing filters, result tables, findings, evidence, methodology, limitations, and version metadata remain accessible. The assistant does not replace the underlying evidence.

Required UI states:

- Ready
- Thinking
- Answered
- Missing Parameter
- Unsupported
- Unsafe
- Unavailable
- Error

## 12. Testing Strategy

- Unit tests: intent resolution, parameter validation, query functions, evidence construction.
- Grounding tests: factual responses trace to approved evidence.
- Safety tests: unsafe, prompt-injection, and source-text manipulation cases.
- API tests: request validation, response contract, bounded output.
- UI tests: all required states.
- Regression tests: Operational View and Data Intelligence remain intact.
- Selenium: Data Intelligence -> Assistant -> supported question -> grounded answer -> evidence -> version/limitation -> unsupported question -> safe scope response.

## 13. Architectural Decision

The selected architecture is deterministic-first and does not introduce an LLM. This keeps the assistant auditable, reproducible, and aligned with the approved Track A evidence model.

## 14. Status

Architecture definition complete. Implementation remains subject to the Post #5 query contract, grounded response contract, safety/scope controls, tests, and UAT.
