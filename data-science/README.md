# Phase 3 Post #2 - Canonical Data Validation, Profiling & Analytical Readiness

## Purpose

This workspace validates and profiles the approved canonical dataset and determines what analytical directions the current data can genuinely support.

The mandatory analytical source is:

`data/canonical/intelligence_data.csv`

No alternate cleaned, analysis, model, or manually edited dataset is used.

## Scope

This workspace covers:

- Structural revalidation
- Canonical data profiling
- Data-quality assessment
- Representativeness assessment
- Data-archetype confirmation
- Analytical-track readiness
- Pipeline-based corrections when required

This workspace does not introduce:

- New maps or charts
- Dashboard redesign
- Feature engineering
- Forecasting
- Classification
- Regression
- Clustering
- Anomaly-model implementation
- Risk-score implementation
- Natural-language assistant development

## Required Workspace

```text
data-science/
├── README.md
├── notebooks/
│   └── 01_canonical_data_validation_and_readiness.ipynb
├── scripts/
│   ├── profile_canonical_data.py
│   ├── assess_data_quality.py
│   ├── assess_representativeness.py
│   └── assess_analytical_readiness.py
└── outputs/
    ├── canonical_profile.json
    ├── quality_assessment.json
    ├── representativeness_assessment.json
    └── analytical_readiness.json