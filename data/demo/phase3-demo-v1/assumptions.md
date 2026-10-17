# Phase 3 Demo Dataset Assumptions — phase3-demo-v1

**Classification:** SYNTHETIC DEMONSTRATION DATA - NOT REAL CUSTOMER DATA

## Purpose and isolation
This is a reproducible synthetic demonstration dataset. It does not represent actual customers, actual transactions, or measured business outcomes. It is stored under `data/demo/phase3-demo-v1/` and does not overwrite the `phase3-v2` baseline files.

## Dataset and reproducibility
- Source leads: 600; fixed random seed: `20261017`.
- Observation dates are sampled across the 12-calendar-month window 2025-10-01 through 2026-09-30.
- Each source lead generates exactly two canonical rows: `lead_value` and `days_in_stage`.
- Expected canonical rows: 1200; canonical schema uses the same 20 columns and order as the baseline.
- All source and canonical records carry `is_synthetic=true` and `data_version=phase3-demo-v1`. Each source row also carries a synthetic-data notice.

## Generation assumptions (invented for demonstration, not empirical estimates)
- Stage weights: `{"Lead": 0.18, "Lost": 0.1, "Opportunity": 0.2, "Proposal": 0.16, "Qualified": 0.2, "Won": 0.16}`.
- Product weights: `{"Analytics": 0.33, "Payments": 0.42, "Security": 0.25}`.
- Acquisition-source weights: `{"Campaign": 0.26, "Partner": 0.16, "Referral": 0.24, "Website": 0.34}`.
- Team weights: `{"Enterprise": 0.35, "Growth": 0.25, "SMB": 0.4}`.
- Location weights: `{"Bangalore": 0.24, "Chennai": 0.15, "Delhi": 0.17, "Hyderabad": 0.14, "Mumbai": 0.2, "Pune": 0.1}`.
- Lead value starts from a product-specific range (Payments 25,000–175,000; Analytics 20,000–130,000; Security 15,000–100,000), is scaled by team (Enterprise 1.35, Growth 1.0, SMB 0.75), and rounded to the nearest 1,000. Values have unspecified currency units.
- Days-in-stage ranges depend on current stage: Lead 1–12; Qualified 3–20; Opportunity 5–35; Proposal 4–30; Won 2–25; Lost 5–45.
- Dates, stages, products, sources, teams, locations, and values are independently randomized within the documented rules. No stage-transition history is generated; this snapshot must not be used to claim conversion probabilities, causal effects, or predictive performance.

## Limitations
Distributions are designed to create varied demonstration scenarios, not to estimate a real sales population. Comparisons are descriptive only. Month-level lead counts reflect the seeded random draw, not seasonality.
