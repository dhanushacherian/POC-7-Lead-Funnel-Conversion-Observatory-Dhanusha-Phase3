# Canonical Data Package Validation

## 1. Purpose

This document records the validation status of the Phase 3 canonical data package.

The package is intended to provide a controlled, standardized, deployment-safe local data foundation for future Phase 3 analysis.

## 2. Data Package

The canonical package contains:

- Source sample: `data/source-sample/source_sample.csv`
- Canonical dataset: `data/canonical/intelligence_data.csv`
- Published dataset: `data/published/intelligence_data.json`
- Schema: `data/schema.json`
- Manifest: `data/manifest.json`
- Data profile: `data/quality/data_profile.json`
- Validation report: `data/quality/validation_report.json`

## 3. Required Canonical Columns

The canonical dataset is expected to contain the following 20 columns in this exact order:

1. `record_id`
2. `record_type`
3. `observed_at`
4. `entity_id`
5. `related_entity_id`
6. `entity_name`
7. `category`
8. `subcategory`
9. `status`
10. `stage`
11. `metric_name`
12. `metric_value`
13. `metric_unit`
14. `text_value`
15. `latitude`
16. `longitude`
17. `source_name`
18. `source_record_id`
19. `is_synthetic`
20. `data_version`

## 4. Current Dataset

Current source records:

`30`

Current canonical records:

`60`

Current canonical columns:

`20`

The canonical dataset is generated from the retained Phase 2 source sample.

## 5. Validation Checks

The following checks are required:

- Required files exist.
- Canonical columns are present.
- Canonical columns are in the required order.
- Record IDs are present and unique.
- Dates are valid.
- Numeric fields contain valid numeric values.
- Boolean fields use valid boolean values.
- Source information is present.
- Data version is present.
- File-size limits are respected.
- Row and column limits are respected.
- Manifest values match the generated package.
- Published JSON matches the canonical CSV.
- No restricted or personal data is included.

## 6. Current Findings

The source sample and canonical dataset have been generated successfully.

The source contains 30 records and all 30 records have been retained