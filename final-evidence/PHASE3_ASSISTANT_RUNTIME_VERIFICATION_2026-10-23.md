# Phase 3 Assistant Runtime Verification

- Test date: 2026-10-23 22:13:23 +05:30
- Endpoint: POST /api/demo/assistant
- HTTP status: 200
- Assistant status: SUPPORTED
- Intent: get_highest_value_product
- Mode: deterministic_fallback
- LLM enabled: False
- Data version: phase3-demo-v1
- Quality status: SYNTHETIC_DEMO_DESCRIPTIVE
- Evidence references returned: 1
- Result: PASS — deterministic fallback response verified.

## Question

Which product has the highest total lead value?

## Answer

Payments has the highest observed total lead value by product: 2,14,27,000 currency-unspecified units in this synthetic sample.

## Response JSON

``json
{
    "answer_id":  "demo-assistant-1792773803669",
    "status":  "SUPPORTED",
    "intent":  "get_highest_value_product",
    "answer":  "Payments has the highest observed total lead value by product: 2,14,27,000 currency-unspecified units in this synthetic sample.",
    "explanation":  "Payments has the highest observed total lead value by product: 2,14,27,000 currency-unspecified units in this synthetic sample. All figures come from synthetic demonstration data. Results are descriptive, use currency-unspecified units, and do not establish causation, real-world outcomes, stage transitions, conversion rates, or seasonality.",
    "explanation_status":  "GENERATED",
    "evidence_references":  [
                                {
                                    "source_id":  "demo-summary-highest-value-product",
                                    "source_type":  "demo_intelligence_summary",
                                    "group":  "Payments",
                                    "metric":  "total_lead_value",
                                    "value":  21427000,
                                    "unit":  "currency-unspecified units",
                                    "finding":  "Payments has the highest observed total lead value by product: 2,14,27,000 currency-unspecified units in this synthetic sample.",
                                    "data_version":  "phase3-demo-v1",
                                    "method_version":  "demo-assistant-rules-1.0.0",
                                    "generated_at":  "2026-10-23T16:43:23.669Z",
                                    "quality_status":  "SYNTHETIC_DEMO_DESCRIPTIVE",
                                    "limitation":  "All figures come from synthetic demonstration data. Results are descriptive, use currency-unspecified units, and do not establish causation, real-world outcomes, stage transitions, conversion rates, or seasonality."
                                }
                            ],
    "key_values":  {
                       "product":  "Payments",
                       "total_lead_value":  21427000
                   },
    "metadata":  {
                     "assistant_id":  "phase3-demo-grounded-assistant",
                     "assistant_version":  "1.0.0",
                     "mode":  "deterministic_fallback",
                     "llm_enabled":  false,
                     "data_version":  "phase3-demo-v1",
                     "method_version":  "demo-assistant-rules-1.0.0",
                     "quality_status":  "SYNTHETIC_DEMO_DESCRIPTIVE",
                     "generated_at":  "2026-10-23T16:43:23.669Z"
                 },
    "limitation":  "All figures come from synthetic demonstration data. Results are descriptive, use currency-unspecified units, and do not establish causation, real-world outcomes, stage transitions, conversion rates, or seasonality.",
    "suggested_follow_ups":  [
                                 "Which stage has the highest total lead value?",
                                 "Which product has the highest total lead value?",
                                 "Compare Won and Lost stages.",
                                 "What are the limitations?"
                             ]
}
``

## Scope and limitations

This test verifies the local API response and deterministic fallback path only.
It does not certify the live Gemini path, production deployment, or overall release readiness.
