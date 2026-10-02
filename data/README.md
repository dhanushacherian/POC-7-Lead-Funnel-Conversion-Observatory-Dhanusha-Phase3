# Phase 3 Canonical Data Package

## Purpose

This directory contains the controlled local data package created for Phase 3 of the Lead Funnel Conversion Observatory.

The package provides a standardized data foundation for future Phase 3 analysis.

## Source

The current Phase 2 application data is defined in:

`src/data/crmData.ts`

The extracted source sample is stored at:

`data/source-sample/source_sample.csv`

The source contains 30 records and 9 fields.

## Canonical Source of Truth

The single canonical source of truth for Phase 3 analysis is:

`data/canonical/intelligence_data.csv`

Future Phase 3 analysis should use this canonical dataset rather than directly reading the original Phase 2 TypeScript data.

## Package Structure

```text
data/
├── README.md
├── manifest.json
├── schema.json
├── source-sample/
│   └── source_sample.csv
├── canonical/
│   └── intelligence_data.csv
├── published/
│   └── intelligence_data.json
└── quality/
    ├── data_profile.json
    ├── validation_report.json
    └── sampling_report.md