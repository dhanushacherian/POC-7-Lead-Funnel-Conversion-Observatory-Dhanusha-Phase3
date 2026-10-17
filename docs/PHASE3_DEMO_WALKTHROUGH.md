# Phase 3 Expanded Demo Guide

## Identity
- Edition: Expanded professional demonstration
- Data version: phase3-demo-v1
- Classification: Synthetic demonstration data; not real customer data
- Random seed: 20261017
- Observation window: 2025-10-01 to 2026-09-30
- Source leads: 600
- Canonical rows: 1,200

## Main routes
- Dashboard: /demo
- Data Intelligence: /demo/data-intelligence
- Demo Assistant API: POST /api/demo/assistant

## Reproducibility
Generate the synthetic dataset with:
python scripts/data_pipeline/generate_demo_data.py

Generate demo analytical outputs with:
python data-science/scripts/run_demo_analytical_track.py

The demo Assistant uses deterministic rules and demo analytical evidence.
It does not use the original baseline Assistant endpoint.

## Suggested 7-minute walkthrough
1. Open /demo and explain that the dataset is synthetic.
2. Show the KPI cards and six current-stage counts.
3. Show the product-stage comparison and monthly cohort heatmap.
4. Show stage-aging values, including Lost.
5. Open /demo/data-intelligence and review the comparison tables.
6. Ask the demo Assistant which product has the highest observed value.
7. Ask about limitations and explain why snapshot counts are not conversion rates.

## Limitations
- Records are synthetic and do not represent real customers or outcomes.
- The data contains current-stage snapshots, not historical stage transitions.
- Do not present stage counts as conversion rates.
- Seeded randomized monthly activity is not evidence of seasonality.
- Values use currency-unspecified units.
- Descriptive group differences do not establish causation or predict future results.

## Baseline separation
The original phase3-v2 Data Intelligence and Assistant remain separate.
Do not mix baseline outputs with phase3-demo-v1 results.

## Validation performed
- TypeScript check passed.
- ESLint passed.
- Production build passed.
- Tracked baseline integrity check passed.
- Demo Assistant API returned a supported, evidence-backed product answer.
