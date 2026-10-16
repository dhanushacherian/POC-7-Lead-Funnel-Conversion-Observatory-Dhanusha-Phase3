# Phase 3 Handover Guide

## Project
POC-7 Lead Funnel Conversion Observatory - Phase 3.

## Prerequisites
- Node.js and npm
- Python
- Git
- Docker Desktop if container validation is required

## Install dependencies
npm.cmd ci

## Data validation
npm.cmd run data:validate
Expected: 60 canonical records and 20 columns.

## Analytical validation
python .\data-science\scripts\validate_analytical_track.py
Expected: OVERALL VALIDATION: PASS.

## Automated checks
npm.cmd run lint
npm.cmd run test:intelligence
npm.cmd run build
npm.cmd run test:browser -- --timeout=90000 --workers=1

## Important paths
- Canonical data: data\canonical\intelligence_data.csv
- Manifest: data\manifest.json
- Published data: data\published\intelligence_data.json
- Analytical outputs: data-science\outputs\
- Tests: tests\
- Documentation: docs\
- Evidence: final-evidence\

## Limitations
- The dataset is synthetic.
- Track A independently analyzes 30 source leads.
- Three stage groups are below the sensitivity threshold of five.
- Results are descriptive, not predictive or causal.

## Security
- Never commit .env.local, API keys, tokens, or secrets.
- Review dependency audit findings before release.
- Do not claim Docker validation passed unless Docker checks succeed.

## Final release checklist
- [ ] Rerun data and analytical validation.
- [ ] Rerun lint, intelligence tests, build, and browser tests.
- [ ] Review README and release documents.
- [ ] Review evidence for completeness and secrets.
- [ ] Regenerate repomix-output.xml after final changes.
- [ ] Review Git status and the final diff.
- [ ] Commit approved changes.
- [ ] Create and verify the release tag.
- [ ] Verify public deployment separately.
- [ ] Record blocked checks and security findings.

## Release status
This checklist is not proof that the release is complete. Verify each item using evidence.
