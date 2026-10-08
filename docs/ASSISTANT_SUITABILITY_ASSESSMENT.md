# Assistant Suitability Assessment

## Target User

The target user is a business or operations reviewer using the Lead Funnel Conversion Observatory to understand funnel performance and make evidence-based comparisons across stages, products and acquisition sources.

The relevant workflow is reviewing approved intelligence results and asking focused natural-language questions without manually navigating between multiple views, filters and evidence panels.

## Existing Operational and Intelligence Experience

The existing application provides:

- Operational View for the existing funnel dashboard.
- Data Intelligence page at `/data-intelligence`.
- Stage, Product and Source comparative views.
- Search/filter controls.
- Summary KPI cards.
- Approved findings and evidence.
- Methodology and limitation information.
- Data and method version metadata.
- Small-group warnings.
- Validated Track A comparative intelligence outputs.

The existing interface is functional and must remain unchanged as the operational experience.

## User Questions Not Solved Conveniently Today

The existing filters and tables answer the underlying questions, but a bounded natural-language interface can provide a more convenient question-and-answer path for users who want to ask the same approved comparisons in different wording.

Examples include:

1. Which stage has the highest total lead value?
2. Which product has the highest average lead value?
3. Which acquisition source has the highest average lead value?
4. How does Proposal compare with Won?
5. Explain the approved result for Payments.
6. What is the approved executive summary?
7. What are the current data and method versions?
8. What limitations apply to this intelligence output?
9. Which groups have fewer than five leads?
10. How was the approved comparative intelligence produced?

These questions can be answered from the approved intelligence summary and results without generating new analytical findings.

## Proposed Supported Questions

The initial supported question catalog will contain at least the following meaningful questions:

| Question Pattern | Intent | Deterministic Retrieval |
|---|---|---|
| What is the approved summary? | get_summary | intelligence_summary |
| Which stage has the highest total lead value? | compare_groups | stage comparison results |
| Which product has the highest average lead value? | compare_groups | product comparison results |
| Which acquisition source has the highest average lead value? | compare_groups | source comparison results |
| Compare two approved groups. | compare_groups | matching approved group results |
| Explain this approved intelligence result. | explain_result | result ID/group result evidence |
| How was the analysis performed? | explain_method | approved method and validation information |
| What are the limitations? | explain_limitation | approved limitation fields |
| What data version is being used? | get_data_freshness | intelligence metadata |
| Which groups have fewer than five leads? | explain_result | approved result evidence and group-size warning |

## Deterministic Retrieval Mapping

Every supported question will map to a fixed query function.

The assistant will not generate arbitrary queries from user text.

Approved sources are:

- `data-science/outputs/intelligence_results.json`
- `data-science/outputs/intelligence_summary.json`
- `data-science/outputs/validation_metrics.json`
- Approved canonical fields from `data/canonical/intelligence_data.csv` only when record-level evidence is required.
- Approved manifest/schema metadata where required.

The assistant will return structured evidence, data version, method version, quality status and limitation.

## Evidence Availability

Evidence is available through the approved intelligence results.

Evidence can include:

- `result_id`
- `result_type`
- `group_key`
- `metric_name`
- `result_value`
- `result_unit`
- `result_category`
- `priority_rank` where applicable
- approved finding
- approved evidence fields
- `data_version`
- `method_version`
- `generated_at`
- `quality_status`
- approved limitation

The assistant must not produce a factual answer when deterministic evidence is unavailable.

## Security and Privacy

The assistant will use a bounded deterministic architecture.

Controls:

- No unrestricted access to the filesystem.
- No user-controlled file paths.
- No arbitrary SQL.
- No arbitrary code execution.
- No unrestricted canonical-data download.
- No secrets in browser bundles.
- No sensitive conversation logs.
- No persistent sensitive conversation memory.
- Maximum result and evidence limits will be enforced.
- Source data will be treated as evidence, not instructions.
- Unsafe requests will be rejected before retrieval.

The full canonical dataset will never be sent to an LLM because an LLM is not required for this implementation.

## Deployment Feasibility

The existing application is a Next.js frontend with static generated intelligence data and deterministic loader validation.

The assistant can be integrated as a bounded component within the existing Data Intelligence experience without replacing the Operational View or Data Intelligence page.

The implementation will preserve the existing routes and approved intelligence outputs.

## Value Beyond Filters and Tables

The assistant adds value by providing a controlled natural-language entry point to approved questions.

Users can ask supported comparative questions using different natural-language wording instead of manually selecting the relevant intelligence view and interpreting multiple tables.

The assistant remains complementary to the Data Intelligence page. It does not replace the existing summary, filters, result tables, evidence, methodology or limitations.

## Deterministic Versus LLM Decision

A deterministic implementation is preferred.

The approved Track A output is descriptive comparative intelligence with a small, stable set of supported dimensions:

- Stage
- Product
- Acquisition Source
- Summary
- Method
- Limitations
- Data freshness

The required questions can be answered using deterministic retrieval and response templates.

An LLM is therefore not required to calculate, rank, classify or explain the approved results.

Avoiding an LLM also reduces hallucination, prompt-injection and unsupported-inference risk.

## Approved Assistant Mode

DETERMINISTIC GUIDED ASSISTANT

Architecture:

User Question
↓
Input Length and Safety Check
↓
Scope Guard
↓
Approved Intent Classification
↓
Parameter Validation
↓
Approved Query Function
↓
Evidence Package
↓
Grounded Response
↓
Answer + Evidence + Limitation + Versions

There is no direct LLM-to-data path.

## Why Mode A Is Appropriate

The approved question set is bounded and stable.

The answers can be generated from approved intelligence outputs.

Numbers, rankings and findings already exist in validated outputs.

The assistant does not need to calculate new analytical results.

A deterministic implementation is therefore more reliable and easier to validate than introducing an unnecessary LLM.

## Skip Rationale

An approved skip is not selected.

The project has more than five meaningful supported questions and the assistant can provide a bounded natural-language interface while preserving the existing Data Intelligence experience.

## Result

DETERMINISTIC ASSISTANT SUITABLE — LLM NOT REQUIRED
