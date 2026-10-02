\# Analytical Readiness Report



\## Project



\*\*POC-7 — Lead Funnel Conversion Observatory\*\*



\## Phase 3 Post



\*\*Post #2 — Canonical Data Validation, Profiling and Analytical Readiness\*\*



\## Canonical Data Version



\*\*phase3-v2\*\*



\## Analytical Source of Truth



All analytical-readiness assessment is based on:



`/data/canonical/intelligence\_data.csv`



The canonical dataset contains:



\- 60 canonical records

\- 30 source CRM leads

\- 20 canonical columns

\- `is\_synthetic = true`

\- `data\_version = phase3-v2`



\## Validation Status



\### Structural Validation



Command:



```text

python .\\scripts\\data\_pipeline\\validate\_data.py

