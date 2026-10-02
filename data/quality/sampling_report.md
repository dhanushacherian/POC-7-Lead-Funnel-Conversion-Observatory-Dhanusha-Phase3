# Sampling and Reduction Report

## 1. Source Dataset

The Phase 2 CRM source is located at:

`src/data/crmData.ts`

The extracted source sample is:

`data/source-sample/source_sample.csv`

The source contains **30 CRM lead records**.

## 2. Sampling Decision

No statistical or random sampling was applied.

All 30 available source records were retained because the source dataset is already substantially below the Phase 3 default limit of 10,000 rows.

Therefore:

- Source records available: 30
- Records retained: 30
- Records removed: 0
- Sampling method: Full retention
- Random seed: Not applicable

## 3. Reason for Full Retention

Reducing the dataset further would unnecessarily remove available project data.

The complete source dataset is small enough to remain within the Phase 3 data-package limits while preserving the existing Phase 2 coverage.

## 4. Coverage Preserved

The retained records preserve the source dimensions available in the Phase 2 application, including:

- Lead identifiers
- Observation dates
- Locations
- Teams
- Products
- Lead sources
- Funnel stages
- Days in stage
- Lead values

Observed funnel stages include:

- Lead
- Qualified
- Opportunity
- Proposal
- Won
- Lost

## 5. Date Range

The source records currently span:

**2026-01-05 to 2026-03-20**

The complete date range is retained.

## 6. Canonical Expansion

The 30 retained source records are transformed into canonical records during standardization.

Each source lead produces:

1. One `crm_lead` record representing the lead value.
2. One `crm_lead_metric` record representing `days_in_stage`.

Therefore:

- Source records: 30
- Canonical records after transformation: 60

This is a transformation of the retained source records, not additional source data.

## 7. Reduction Result

No source records were discarded during sampling or reduction.

The canonical transformation preserves the important source fields through the canonical mapping documented in:

`docs/CANONICAL_DATA_MAPPING.md`

## 8. Limitations

The source dataset contains only 30 records.

The repository also does not document whether the source data is synthetic, anonymized, or derived from a real operational system.

This provenance status must be confirmed before final canonical-package approval.

## 9. Reproducibility

The sampling decision is deterministic.

The sampling pipeline reads the controlled source sample and retains all available records.

No random selection is performed.

## 10. Status

**SAMPLING COMPLETE — ALL AVAILABLE SOURCE RECORDS RETAINED**