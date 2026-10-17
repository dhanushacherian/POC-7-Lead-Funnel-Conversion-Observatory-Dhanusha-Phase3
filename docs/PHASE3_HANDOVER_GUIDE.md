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
- Recorded Docker build and runtime validation passed; see `final-evidence/DOCKER_RUNTIME_VALIDATION.md`. The image installs development dependencies, so the unresolved dependency findings must be considered in the authorized security decision.

## Final release checklist
- [ ] Rerun data and analytical validation.
- [ ] Rerun lint, intelligence tests, build, and browser tests.
- [ ] Review README and release documents.
- [ ] Review evidence for completeness and secrets.
- [x] Regenerated `repomix-phase3-final.md` after final documentation and evidence changes; excluded the stale `repomix-output.xml` snapshot.
- [ ] Review Git status and the final diff.
- [ ] Commit approved changes.
- [ ] Create and verify a release tag only after all mandatory gates, including the recorded security disposition, have passed.
- [ ] Verify public deployment separately.
- [ ] Record blocked checks and security findings.

## Release status
This checklist is not proof that the release is complete. Verify each item using evidence.

## Formal Approval References

- Track A analytical approval reference (Post #3): https://github.com/Real-Rails-Interns-Batch8-MAC/Phase3-DataScience-DecisionIntelligence/discussions/3
- Grounded Data Assistant approval reference (Post #5): https://github.com/Real-Rails-Interns-Batch8-MAC/Phase3-DataScience-DecisionIntelligence/discussions/5
- Post #6 Word guide usage: Unconfirmed; record Yes only if the guide was actually attached and used as the AI feeder.
- Security disposition: PENDING AUTHORIZED RELEASE OWNER DECISION. Record the approver, date, decision, Docker development-dependency exposure consideration, and supporting evidence before closing this gate.
