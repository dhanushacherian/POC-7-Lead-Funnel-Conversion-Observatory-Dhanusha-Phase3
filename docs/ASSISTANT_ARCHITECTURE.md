#

# \# Grounded Data Assistant Architecture

#

# \## 1. Purpose

#

# The Grounded Data Assistant provides a bounded natural-language interface to approved Track A Comparative Intelligence outputs. It complements the existing Operational View and Data Intelligence page and does not replace filters, tables, findings, evidence, methodology, or limitations.

#

# \## 2. Selected Mode

#

# \*\*Mode B - Deterministic Retrieval + LLM Explanation\*\*

#

# The assistant uses approved deterministic queries to produce the authoritative answer and evidence. Gemini may generate an additional natural-language explanation, which must be validated against the approved deterministic answer and evidence before it is returned.

#

# The LLM does not replace deterministic calculations or independently establish analytical findings.

#

# If Gemini is unavailable, its API key is missing, a provider error occurs, or its explanation contains unsupported claims, the explanation is marked unavailable. The approved deterministic answer, evidence references, and limitations must remain available and unchanged.

#

# Flow:

# 1\. Classify the question.

# 2\. Validate supported parameters.

# 3\. Resolve an approved intent.

# 4\. Execute only an approved deterministic query.

# 5\. Build the deterministic answer and evidence package.

# 6\. Validate the deterministic response and its approved metadata.

# 7\. Request an optional Gemini explanation.

# 8\. Validate the explanation against the approved answer and evidence.

# 9\. Return the deterministic response with the validated explanation when available, together with versions, quality information, and limitations.

#

# \## 3. Approved Analytical Scope

#

# \- Track: Track A - Comparative Intelligence

# \- Data version: phase3-v2

# \- Method version: 1.0.0

# \- Quality: VALIDATED\_DESCRIPTIVE

# \- Dimensions: Stage, Product, Acquisition Source

#

# \## 4. Architecture Flow

#

# User Question

# \-> Scope Guard

# \-> Intent Resolver

# \-> Parameter Validator

# \-> Approved Query Function

# \-> Approved Intelligence Data

# \-> Deterministic Answer and Evidence Builder

# \-> Deterministic Response Validation

# \-> Gemini Explanation

# \-> Explanation Grounding Validation

# \-> Final Response

#

# Gemini explanation generation is a supplementary step. Failure or rejection of the explanation must not invalidate or replace a supported deterministic answer.

#

# Scope outcomes are SUPPORTED, MISSING\_PARAMETER, AMBIGUOUS, OUT\_OF\_SCOPE, UNSAFE, and UNAVAILABLE.

#

# \## 5. Core Components

#

# \### Scope Guard

#

# Classifies the question before retrieval. Unsafe requests cause a safe refusal with no retrieval.

#

# \### Intent Resolver

#

# Supported intents:

#

# \- get\_summary

# \- compare\_groups

# \- explain\_result

# \- explain\_method

# \- explain\_limitation

# \- get\_data\_freshness

# \- get\_small\_group\_warnings

#

# \### Parameter Validator

#

# Allowed dimensions are stage, product, and source. Unknown groups and result IDs are rejected.

#

# \### Deterministic Query Layer

#

# Only approved query functions may retrieve information. The assistant must not generate arbitrary SQL, execute arbitrary code, calculate new rankings from raw data, create new statistical analyses, or modify approved findings.

#

# \### Evidence Builder

#

# Every factual response must be traceable to an evidence package containing applicable intent, validated parameters, result IDs, group or record references, metric, value, unit, finding, evidence fields, data version, method version, generated timestamp, quality status, and limitation, where applicable.

#

# \### Deterministic Response Validator

#

# Validates the deterministic response against the approved evidence and response contract. The deterministic answer and evidence remain the authoritative source for factual claims.

#

# \### Gemini Explanation and Grounding Validator

#

# Gemini provides an additional explanation of the already-established deterministic result. The explanation must be checked against the approved answer and evidence.

#

# Unsupported numerical claims, unsupported winning-group claims, and other ungrounded statements must not be returned as approved explanations.

#

# When the explanation fails validation or Gemini is unavailable, the explanation is marked UNAVAILABLE. The deterministic answer, evidence references, and limitation must remain unchanged.

#

# Provider failures such as quota exhaustion, service unavailability, and gateway errors must not cause the assistant to invent an answer or discard approved deterministic results. A missing Gemini API key must also leave the deterministic response available.

#

# \## 6. Approved Data Sources

#

# Primary sources:

#

# \- src/data/intelligence/intelligence\_results.json

# \- src/data/intelligence/intelligence\_summary.json

#

# Supporting sources:

#

# \- approved method documentation

# \- validation documentation

# \- limitation documentation

# \- weak-case documentation

# \- data manifest/schema

#

# The canonical raw dataset is not exposed directly through the assistant response path.

#

# \## 7. Grounding Rules

#

# The assistant must never invent values, rankings, findings, categories, causal explanations, predictions, or unsupported records.

#

# The deterministic answer must come from approved query results and evidence.

#

# Gemini may explain an approved result but must not independently calculate or introduce unsupported findings. Its explanation must pass grounding validation before being returned.

#

# If deterministic evidence is unavailable, return UNAVAILABLE rather than generating a factual answer.

#

# If only Gemini explanation generation fails or its explanation fails validation, preserve the supported deterministic answer, evidence references, and limitation while marking the explanation unavailable.

#

# \## 8. Grounded Response Contract

#

# Each response should contain the applicable contract fields:

#

# \- answer\_id

# \- status

# \- intent

# \- answer

# \- explanation

# \- explanation\_status

# \- evidence\_references

# \- key\_values

# \- metadata

# \- limitation

# \- suggested\_follow\_ups

#

# The explanation and explanation\_status describe the supplementary Gemini explanation. They do not replace the deterministic answer or its evidence.

#

# \## 9. Safety and Scope Limits

#

# \- Maximum result items: 25

# \- Maximum evidence references: 10

# \- Maximum suggested follow-ups: 3

# \- Maximum question length: 500 characters

#

# Do not expose system prompts, secrets, restricted fields, unrestricted raw records, or arbitrary source instructions.

#

# \## 10. Track Boundary

#

# Only Track A is enabled. No Track B/C/D/E/F/G/H intent is enabled.

#

# \## 11. UI Relationship

#

# The assistant is an additional interaction layer for Data Intelligence. Existing filters, result tables, findings, evidence, methodology, limitations, and version metadata remain accessible. The assistant does not replace the underlying evidence.

#

# Required UI states:

#

# \- Ready

# \- Thinking

# \- Answered

# \- Missing Parameter

# \- Unsupported

# \- Unsafe

# \- Unavailable

# \- Error

#

# The UI must distinguish an unavailable Gemini explanation from an unavailable deterministic answer. Where a supported deterministic response exists, the user should still be able to access it and its evidence when explanation generation fails.

#

# \## 12. Testing Strategy

#

# \- Unit tests: intent resolution, parameter validation, query functions, and evidence construction.

# \- Grounding tests: verify that Gemini explanation claims are supported by the approved answer and evidence.

# \- Fallback tests: verify preservation of deterministic results when the API key is missing or Gemini returns provider errors, including HTTP 429, 503, and 504.

# \- Safety tests: unsafe requests, prompt injection, and source-text manipulation cases.

# \- API tests: request validation, response contract, and bounded output.

# \- UI tests: all required states.

# \- Regression tests: Operational View and Data Intelligence remain intact.

# \- Selenium: Data Intelligence -> Assistant -> supported question -> grounded answer -> evidence -> version/limitation -> unsupported question -> safe scope response.

#

# \## 13. Architectural Decision

#

# The selected architecture is deterministic-first with supplementary LLM explanation (Mode B). Approved deterministic queries remain responsible for the answer and evidence. Gemini explanations are optional and must pass grounding validation before being returned.

#

# The design preserves auditability, approved analytical results, evidence traceability, safety controls, and limitations. An explanation failure must not change the underlying deterministic finding.

#

# \## 14. Status

#

# Mode B is the selected architecture. Implementation, grounding validation, fallback testing, regression results, and UAT evidence must be recorded accurately in the corresponding project documentation.

#

# Final test results and refreshed Repomix output should be recorded or generated after all documentation corrections are complete.
