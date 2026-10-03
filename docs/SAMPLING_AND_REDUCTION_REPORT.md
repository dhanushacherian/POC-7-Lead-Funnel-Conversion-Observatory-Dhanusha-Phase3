# Sampling and Reduction Report

## 1. Purpose

This document records the sampling and reduction decision used to create the Phase 3 controlled data package.

The source data is the Phase 2 CRM dataset located at:

`src/data/crmData.ts`

The extracted source sample is:

`data/source-sample/source_sample.csv`

## 2. Source Dataset

The Phase 2 source contains:

- Records: 30
- Source fields: 9
- Source format: Static TypeScript application data
- Source application: Phase 2 Lead Funnel Conversion Observatory
- Synthetic-data status: Confirmed synthetic

The source fields are:

- `id`
- `date`
- `location`
- `team`
- `product`
- `source`
- `stage`
- `daysInStage`
- `value`

## 3. Sampling Decision

All available source records were retained.

No random sampling was required because the source contains only 30 records and is already substantially below the Phase 3 default limit of 10,000 rows.

### Sampling result

| Measure | Result |
|---|---:|
| Source records | 30 |
| Records retained | 30 |
| Records removed | 0 |
| Sampling method | Full retention |
| Random sampling | No |
| Random seed | Not applicable |

## 4. Reason for Retention

The complete source dataset was retained to avoid unnecessary loss of information.

Keeping all 30 records preserves the available:

- Lead identifiers
- Dates
- Locations
- Teams
- Products
- Lead sources
- Funnel stages
- Days in stage
- Lead values

## 5. Category and Funnel Coverage

The retained dataset preserves the funnel stages present in the Phase 2 source:

- Lead
- Qualified
- Opportunity
- Proposal
- Won
- Lost

The available source also contains multiple locations, teams, products, and lead sources.

No category-based records were intentionally removed.

## 6. Date Coverage

The source records span:

`2026-01-05` to `2026-03-20`

The complete available date range is retained.

## 7. Reduction

No source-record reduction was performed.

The source sample therefore remains a complete representation of the available Phase 2 application dataset.

The Phase 3 standardization step transforms these retained source records into the canonical schema.

## 8. Canonical Transformation

The 30 retained source records produce 60 canonical records.

Each source lead produces:

1. One `crm_lead` record representing the lead value.
2. One `crm_lead_metric` record representing `days_in_stage`.

Therefore:

`30 source records -> 60 canonical records`

The additional canonical records are transformation outputs and do not represent additional source records.

## 9. Reproducibility

The sampling process is deterministic.

No random selection is performed.

The controlled source sample is read by:

`scripts/data_pipeline/sample_data.py`

The same source sample therefore produces the same retention decision.

## 10. Data Limits

The source dataset is below the Phase 3 default limits for:

- Number of rows
- Number of columns
- Controlled local data-package size

The exact generated file sizes are checked during package validation.

## 11. Provenance

The Phase 2 repository documents the CRM dataset as synthetic data.

Therefore, the Phase 3 canonical records carry:

`is_synthetic = true`

The synthetic-data status is confirmed and does not require further provenance confirmation.

## 12. Sampling Status

**SAMPLING COMPLETE**

All 30 available source records were retained.

No source records were discarded during sampling or reduction.