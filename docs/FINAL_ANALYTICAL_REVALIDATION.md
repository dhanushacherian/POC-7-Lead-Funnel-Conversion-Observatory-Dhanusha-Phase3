# Final Analytical Revalidation Report

## 1. Release Context
- Project: POC-7 Lead Funnel Conversion Observatory
- Phase: Phase 3
- Data version: `phase3-v2`
- Method version: `1.0.0`
- Analytical track: Track A — Comparative Intelligence
- Canonical dataset: `data/canonical/intelligence_data.csv`

## 2. Revalidation Basis
The existing `docs/ANALYTICAL_VALIDATION_REPORT.md` records successful independent reconstruction and comparison of Track A analytical results. The latest clean-clone production build also passed canonical data validation and publication.

## 3. Analytical Results
| Measure | Verified result |
|---|---:|
| Canonical records | 60 |
| Canonical columns | 20 |
| Source leads analysed | 30 |
| Total observed lead value | 2,023,000.00 |
| Average lead value | 67,433.33 |
| Average days in stage | 13.10 |
| Median days in stage | 10.00 |
| Numerical or dimensional discrepancies in documented validation | 0 |

## 4. Comparative Findings
- Highest observed value by stage: Won — 949,000.00.
- Highest observed value by product: Payments — 942,000.00.
- Highest observed value by acquisition source: Website — 689,000.00.
- Missing group values: 0 for stage, product, and source.
- Weak-case items identified: 4.
- Minimum group-size sensitivity threshold: 5 observations.
- The documented validation reported stable rankings among groups retained after sensitivity filtering.

## 5. Validation Evidence
The existing analytical validation report documents PASS results for:
- Canonical schema and data version.
- Independent reconstruction of 30 analytical leads.
- Stage, product, and source calculation accuracy.
- Analytical dataset comparison.
- Ranking stability and missing-group review.
- Weak-case review.

The reusable validation script is `data-science/scripts/validate_analytical_track.py`. Its historical execution is documented in `docs/ANALYTICAL_VALIDATION_REPORT.md`.

## 6. Revalidation Status and Scope
The latest clean-clone build passed canonical validation (60 records, 20 columns), published 60 records, and completed the production build successfully.

This report consolidates existing analytical validation evidence. It does not claim that the analytical validation script was rerun during preparation of this document. The current final-release outputs must be rechecked before release approval.

## 7. Limitations
- The dataset is synthetic and represents 30 source leads.
- Results are descriptive and comparative, not causal or predictive.
- Some funnel-stage groups contain fewer than five leads.
- Team and location are embedded in `text_value`, not dedicated analytical fields.
- The available data is not a complete longitudinal time series.
- Small-group findings require caution.

## 8. Final Decision
**Documented analytical validation: PASS.**

**Final-release analytical revalidation: PENDING** until the latest release outputs are regenerated or checked and the validation script is executed against the intended final-release working tree.
