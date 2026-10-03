# Data Source Inventory

## 1. Source Overview

| Field | Details |
|---|---|
| Source name | Phase 2 CRM Lead Data |
| Source type | Static TypeScript application data |
| Current location | `src/data/crmData.ts` |
| Access method | Local repository source file |
| Current application usage | Used by the Phase 2 Lead Funnel Conversion Observatory dashboard |
| Record count | 30 lead records |
| Raw source format | TypeScript object array |
| Phase 3 target format | CSV canonical data package |
| Update pattern | Static data; no automated update mechanism documented |
| Data provenance | Synthetic dataset documented in the Phase 2 repository |
| Synthetic / real status | Confirmed synthetic |
| Sensitivity | Not documented in the repository; requires confirmation |
| Phase 3 decision | Use as the project-provided synthetic source dataset; sensitivity classification remains undocumented |

## 2. Current Source Structure

The Phase 2 application stores CRM lead records in:

`src/data/crmData.ts`

The source contains the following fields for each lead:

- `id`
- `date`
- `location`
- `team`
- `product`
- `source`
- `stage`
- `daysInStage`
- `value`

The current dataset contains 30 records, identified from `L001` through `L030`.

## 3. Observed Data Coverage

The current source contains:

- Lead identifiers
- Observation dates
- Geographic locations
- Teams
- Products
- Lead sources
- Funnel stages
- Days spent in stage
- Lead value

Observed categorical values include:

### Locations
- Bangalore
- Mumbai
- Delhi
- Chennai
- Hyderabad

### Teams
- Enterprise
- SMB
- Growth

### Products
- Payments
- Analytics
- Security

### Sources
- Website
- Referral
- Campaign
- Partner

### Funnel stages
- Lead
- Qualified
- Opportunity
- Proposal
- Won
- Lost

## 4. Date Coverage

The currently observed source records span:

**2026-01-05 to 2026-03-20**

This range is based on the records currently present in `src/data/crmData.ts`.

## 5. Numeric Measures

The source contains two numeric measures:

- `daysInStage` — number of days associated with the current funnel stage
- `value` — numeric lead value

## 6. Data Provenance and Sensitivity Note

The Phase 2 repository documents the CRM dataset as synthetic data.

Therefore, Phase 3 records use the confirmed synthetic-data classification:

`is_synthetic = true`

The sensitivity classification is not documented in the repository and remains a separate item requiring confirmation if needed.

## 7. Phase 3 Data Foundation Decision

The Phase 2 static CRM dataset is suitable as the starting source for the Phase 3 canonical data foundation because it is:

- Local to the repository
- Small and controlled
- Structured as individual records
- Already used by the existing Phase 2 application
- Available without dependence on a live external API
- Documented as synthetic data

The dataset will be extracted from the existing Phase 2 source and transformed into the required Phase 3 canonical schema.

The canonical dataset will become:

`data/canonical/intelligence_data.csv`

After approval, future Phase 3 analysis will use the canonical dataset as the single source of truth.

## 8. Source Limitations

The current source has the following limitations:

1. The dataset contains only 30 records.
2. The source is embedded directly in application code rather than maintained as a standalone data file.
3. No live data update mechanism is documented.
4. Data sensitivity classification is not documented.
5. The source value field does not document a specific currency.

The synthetic-data status is confirmed from the Phase 2 repository and is represented in the Phase 3 canonical records through `is_synthetic = true`.