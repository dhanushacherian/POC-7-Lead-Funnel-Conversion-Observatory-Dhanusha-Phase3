# Canonical Data Mapping

## 1. Purpose

This document describes how the Phase 2 CRM source fields are mapped into the Phase 3 canonical schema.

Source:

`src/data/crmData.ts`

Extracted source:

`data/source-sample/source_sample.csv`

Canonical source of truth:

`data/canonical/intelligence_data.csv`

## 2. Source Fields

The Phase 2 CRM source contains these fields:

| Source Field | Description |
|---|---|
| `id` | Unique lead identifier |
| `date` | Lead observation date |
| `location` | Lead location |
| `team` | Responsible team |
| `product` | Product associated with the lead |
| `source` | Lead acquisition source |
| `stage` | Current funnel stage |
| `daysInStage` | Number of days in the current stage |
| `value` | Lead value |

## 3. Canonical Mapping

| Source Field | Canonical Field | Transformation |
|---|---|---|
| `id` | `entity_id` | Preserved as the lead identifier |
| `id` | `source_record_id` | Preserved as the source record identifier |
| `date` | `observed_at` | Converted to ISO date representation |
| `product` | `category` | Product value preserved |
| `source` | `subcategory` | Lead source preserved |
| `stage` | `status` | Funnel stage preserved |
| `stage` | `stage` | Funnel stage preserved |
| `value` | `metric_value` | Stored as numeric lead value |
| `daysInStage` | `metric_value` | Stored as numeric duration in a separate metric record |
| `location` | `text_value` | Preserved as part of the source context |
| `team` | `text_value` | Preserved as part of the source context |

## 4. Canonical Record Types

Each source lead generates two canonical records.

### 4.1 Lead Value Record

Record type:

`crm_lead`

This record represents the lead and its associated value.

The `metric_name` is:

`lead_value`

The `metric_unit` is:

`currency_unspecified`

The currency is not documented in the Phase 2 source, so no specific currency is inferred.

### 4.2 Days-in-Stage Record

Record type:

`crm_lead_metric`

This record represents the number of days the lead has been in its current stage.

The `metric_name` is:

`days_in_stage`

The `metric_unit` is:

`days`

## 5. Context Preservation

The canonical schema does not contain separate fields for `location` and `team`.

Therefore, these source values are preserved in `text_value` using the following format:

`location=<location>;team=<team>`

Example:

`location=Bangalore;team=Enterprise`

## 6. Canonical Fields Without Direct Source Values

The following canonical fields do not have direct values in the Phase 2 CRM source and therefore remain blank where appropriate:

- `related_entity_id`
- `entity_name`
- `latitude`
- `longitude`

No values are invented for these fields.

## 7. Source and Version Tracking

Every canonical record contains:

- `source_name = phase2_crmData`
- `source_record_id = original Phase 2 lead ID`
- `data_version = phase3-v2`

## 8. Synthetic Data Status

The Phase 2 repository documents the CRM dataset as synthetic data.

The Phase 3 canonical records therefore carry:

`is_synthetic = true`

The package provenance is confirmed and does not require further confirmation.

## 9. Transformation Summary

The transformation is:

```text
Phase 2 crmData.ts
        |
        v
source_sample.csv
        |
        v
30 retained source records
        |
        v
Canonical transformation
        |
        +--> crm_lead record
        |
        +--> crm_lead_metric record
        |
        v
60 canonical records
        |
        v
data/canonical/intelligence_data.csv