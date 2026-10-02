\# Representativeness Assessment



\## Project and Case-Study Purpose



\*\*POC-7 — Lead Funnel Conversion Observatory\*\*



The case study focuses on a CRM lead funnel containing lead value, funnel

stage, stage ageing, acquisition source, product, team and location

information.



The purpose of this assessment is to verify whether the approved canonical

dataset preserves the important characteristics of the supplied CRM source

sample for future Phase 3 analytical work.



\## Canonical Data Version



\*\*phase3-v2\*\*



\## Data Source



The canonical dataset is generated from the approved Phase 2 CRM source:



`src/data/crmData.ts`



The source repository history identifies the records as a \*\*Synthetic CRM

Dataset / Synthetic CRM records\*\*.



\## Original Sampling Method



The approved source sample contains the complete set of 30 CRM records used by

the Phase 2 application.



Because the source application contains 30 records, the Phase 3 source sample

contains those 30 records rather than selecting a smaller subset.



The canonical pipeline preserves all 30 source records and transforms each

source lead into two canonical records.



\## Source Sample Summary



| Measure | Value |

|---|---:|

| Source records | 30 |

| Source columns | 9 |

| Source sample file | `/data/source-sample/source\_sample.csv` |



The source contains CRM fields describing:



\- Lead ID

\- Date

\- Location

\- Team

\- Product

\- Acquisition source

\- Funnel stage

\- Days in stage

\- Lead value



\## Canonical Record Summary



| Measure | Value |

|---|---:|

| Canonical records | 60 |

| Canonical columns | 20 |

| Canonical lead records | 30 |

| Data version | phase3-v2 |

| Synthetic flag | `true` |



Each source lead produces:



1\. One `crm\_lead` record.

2\. One `crm\_lead\_metric` record for `days\_in\_stage`.



\## Identity Preservation



All source CRM lead identifiers are preserved through the canonical

`source\_record\_id` field.



The representativeness assessment confirmed that the source-level lead

identities are preserved in the canonical dataset.



\### Result



\*\*All source IDs preserved: PASS\*\*



No source lead was identified as missing from the corresponding canonical

lead records.



\## Coverage Assessment



\### Categories



The product categories in the source sample are preserved through the

canonical `category` field.



Observed product categories:



\- Payments

\- Analytics

\- Security



\### Result



\*\*Product category coverage: PASS\*\*



All source product categories are represented in the canonical lead records.



\### Acquisition Sources



The source acquisition channels are preserved through the canonical

`subcategory` field.



Observed acquisition sources:



\- Website

\- Referral

\- Campaign

\- Partner



\### Result



\*\*Acquisition-source coverage: PASS\*\*



All source acquisition-source categories are represented in the canonical

dataset.



\### Status and Process Stages



The CRM funnel states are preserved through the canonical `stage` and

`status` fields.



Observed funnel stages include:



\- Lead

\- Qualified

\- Opportunity

\- Proposal

\- Won

\- Lost



\### Result



\*\*Stage coverage: PASS\*\*



All source funnel stages are represented in the canonical lead records.



This preserves the main process-lifecycle behaviour required by the case

study.



\### Geography



Named location information is preserved in the structured `text\_value`

field.



Observed locations:



\- Bangalore

\- Mumbai

\- Delhi

\- Chennai

\- Hyderabad



\### Result



\*\*Location-category coverage: PASS\*\*



All source locations are represented.



Latitude and longitude are not populated because the source dataset does not

provide coordinate values.



Therefore:



\- Location-category comparisons are supported.

\- Coordinate-based spatial analysis is not supported by the current source.



\### Team Coverage



Team information is preserved in the structured `text\_value` field.



Observed teams:



\- Enterprise

\- SMB

\- Growth



\### Result



\*\*Team coverage: PASS\*\*



All source team categories are represented in the canonical lead records.



\## Time Periods



The source CRM dates extend from:



\*\*2026-01-05\*\*



through:



\*\*2026-03-20\*\*



The canonical dataset preserves this date range through `observed\_at`.



The source and canonical lead records cover multiple calendar months.



\### Result



\*\*Date-range preservation: PASS\*\*



The assessment confirms preservation of the observed source period.



However, the presence of several dates does not establish a full

longitudinal time series because repeated observations for the same lead

across multiple periods are not available.



Therefore:



\- Temporal distribution analysis is possible.

\- True longitudinal trend or forecasting analysis is limited.



\## Severity and Rare Records



The source dataset does not contain a dedicated severity field.



Therefore severity-based representativeness cannot be directly assessed.



Rare lifecycle-stage coverage was considered during the assessment, and the

source-stage categories present in the supplied sample were preserved in the

canonical dataset.



There is no evidence in the supplied source of a separate high-severity

classification.



\## Scenario Boundaries



The source CRM dataset does not contain dedicated scenario parameters or

scenario classes.



Therefore scenario-boundary representativeness is not applicable to the

current data package.



Simulation-based analytical interpretation should not be inferred from this

dataset.



\## Text Groups



The canonical `text\_value` field stores structured information:



`location=<location>;team=<team>`



This field does not contain substantial narrative CRM text such as comments,

issue descriptions or free-form notes.



Therefore text-theme representativeness is not applicable to the current

dataset.



\## Network Relationships



The source CRM data does not describe a node-and-edge network.



Relationships are limited to the CRM lead identifier and source-record

linkage.



Therefore network representativeness is not applicable.



\## Numerical Coverage



The two main metrics are:



\### Lead Value



`metric\_name = lead\_value`



\### Days in Stage



`metric\_name = days\_in\_stage`



Both metrics are preserved for the source CRM leads.



The representativeness assessment compared their source and canonical numeric

ranges and confirmed their corresponding source coverage.



\## Coverage Check Summary



The representativeness script evaluated eight core checks:



| Core Check | Result |

|---|---|

| Source identity preserved | PASS |

| Product categories preserved | PASS |

| Acquisition sources preserved | PASS |

| Funnel stages preserved | PASS |

| Status values preserved | PASS |

| Locations preserved | PASS |

| Teams preserved | PASS |

| Date range preserved | PASS |



\### Overall Core Coverage



\*\*8/8 checks passed\*\*



\## Underrepresented Areas



The assessment did not identify missing values among the core source dimensions

used for the representativeness comparison.



The following dimensions are not available in the source and therefore cannot

be evaluated directly:



\- Dedicated severity

\- Scenario parameters

\- Geographic coordinates

\- Substantial free-text content

\- Network relationships



These are source limitations rather than missing canonical transformations.



\## Missing Case-Study Behaviour



The supplied sample preserves the main CRM funnel characteristics needed for

the current case study:



\- Product

\- Acquisition source

\- Stage

\- Status

\- Team

\- Location

\- Lead value

\- Days in stage

\- Observation date



The following case-study behaviours are not represented by dedicated source

fields:



\- Severity

\- Explicit urgency or priority outcome

\- Controlled scenarios

\- Geographic coordinates

\- Narrative CRM text

\- Network structure



\## Sampling Bias



The source application contains 30 CRM records, and all 30 were retained in

the approved source sample.



Consequently, the Phase 3 package preserves the complete supplied source

sample rather than applying a further reduction to those 30 records.



However, this assessment does \*\*not\*\* establish that the 30 records are

representative of a larger real-world CRM population because no larger source

population was supplied.



\## Impact on Future Analysis



Future Phase 3 analytical work should use:



`/data/canonical/intelligence\_data.csv`



as the single source of truth.



The available coverage supports analysis of the supplied synthetic CRM sample

across:



\- Funnel stages

\- Products

\- Acquisition sources

\- Teams

\- Locations

\- Lead value

\- Days in stage



The limitations of the sample should be retained when interpreting future

results.



In particular, conclusions should not be generalized to an undocumented

larger CRM population.



\## Required Correction



\*\*None\*\*



The representativeness assessment completed all eight core coverage checks

successfully.



\## Representativeness Result



\*\*PASS\*\*



\### Execution Evidence



Command:



```text

python .\\data-science\\scripts\\assess\_representativeness.py

