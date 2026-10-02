\# Canonical Data Profile



\## Project



\*\*PoC:\*\* Lead Funnel Conversion Observatory  

\*\*Phase:\*\* Phase 3  

\*\*Data Version:\*\* phase3-v2  

\*\*Source Name:\*\* phase2\_crmData  



\## Canonical Dataset



The canonical dataset is stored at:



`data/canonical/intelligence\_data.csv`



The Phase 3 canonical dataset contains:



\- \*\*60 canonical records\*\*

\- \*\*20 columns\*\*

\- \*\*30 source CRM lead records\*\*

\- Two canonical metric records per source lead

\- Synthetic-data flag: `true`

\- Data version: `phase3-v2`



\## Source Structure



The source CRM dataset contains 30 lead records with the following fields:



\- `id`

\- `date`

\- `location`

\- `team`

\- `product`

\- `source`

\- `stage`

\- `daysInStage`

\- `value`



\## Canonical Structure



The canonical representation preserves the source CRM information while expressing analytical measures through standardized metric records.



Important canonical fields include:



\- `record\_id`

\- `source\_name`

\- `record\_type`

\- `metric\_name`

\- `metric\_value`

\- `metric\_unit`

\- `stage`

\- `location`

\- `team`

\- `product`

\- `source`

\- `date`

\- `is\_synthetic`

\- `data\_version`



\## Numerical Measures



The canonical dataset provides two main numerical measures:



\### Lead Value



`lead\_value`



Represents the value associated with a CRM lead.



\### Days in Stage



`days\_in\_stage`



Represents the number of days associated with the lead's current funnel stage.



These measures support comparative analysis of value concentration and stage ageing.



\## Categorical Dimensions



The dataset contains structured categorical dimensions including:



\- CRM funnel stage

\- Acquisition source

\- Product

\- Team

\- Location



The available funnel stages include:



\- Lead

\- Qualified

\- Opportunity

\- Proposal

\- Won

\- Lost



\## Date Coverage



The source records contain dates ranging from:



\*\*2026-01-05 to 2026-03-20\*\*



The presence of dates provides temporal context, but the dataset is not treated as a longitudinal time-series dataset because repeated measurements of the same entities over time are not established.



\## Geographic Coverage



The source records contain the following locations:



\- Bangalore

\- Mumbai

\- Delhi

\- Chennai

\- Hyderabad



No geographic coordinates are present in the canonical dataset.



\## Data Provenance



The source CRM dataset is documented as synthetic.



The synthetic-data status is represented in the canonical dataset using:



`is\_synthetic = true`



The canonical pipeline also records:



`data\_version = phase3-v2`



\## Analytical Relevance



The dataset is primarily suitable for a \*\*Process Lifecycle\*\* analytical archetype because the records contain:



\- Funnel stages

\- Stage ageing information

\- Outcome stages

\- Structured CRM dimensions

\- Lead value



The dataset can therefore support comparative examination of CRM funnel characteristics.



\## Limitations



The canonical dataset has the following limitations:



1\. It contains 30 source CRM leads.

2\. The records are synthetic.

3\. The 60 canonical records represent standardized analytical records derived from the 30 source leads.

4\. The available dates do not establish repeated longitudinal measurements.

5\. No geographic coordinates are available.

6\. No substantial free-text field is available for text/theme analysis.

7\. No scenario parameters are available for simulation analysis.

8\. The dataset should not be interpreted as representative of a larger real-world CRM population without additional evidence.



\## Profile Output



The machine-readable profile is available at:



`data-science/outputs/canonical\_profile.json`



This profile is generated from the canonical dataset and forms part of the Phase 3 analytical-readiness evidence package.

