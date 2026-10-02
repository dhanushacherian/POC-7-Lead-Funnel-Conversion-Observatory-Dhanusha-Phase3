\# Data Archetype Confirmation



\## Project



\*\*POC-7 — Lead Funnel Conversion Observatory\*\*



\## Canonical Data Version



\*\*phase3-v2\*\*



\## What One Canonical Record Represents



The canonical dataset represents CRM lead records derived from the Phase 2

`crmData` source.



Each source lead produces two canonical records:



1\. A `crm\_lead` record representing the lead and its lead value.

2\. A `crm\_lead\_metric` record representing the number of days spent in the

&#x20;  current stage.



The canonical dataset therefore contains 60 records derived from 30 source

CRM leads.



\## Primary Archetype



\*\*Process Lifecycle\*\*



\## Secondary Archetype



\*\*Entity / Snapshot\*\*



\## Evidence for Primary Archetype



The dataset contains meaningful lifecycle information through:



\- `stage`

\- `status`

\- `days\_in\_stage`

\- `metric\_name`

\- `metric\_value`

\- `observed\_at`

\- outcome stages such as `Won` and `Lost`



The data therefore represents leads moving through or being observed within

a CRM funnel process.



The presence of stage, status, ageing information and outcomes is consistent

with the Process Lifecycle archetype defined in the Phase 3 analytical

readiness guide.



\## Populated Canonical Fields Supporting the Archetype



The following fields provide the main lifecycle evidence:



| Canonical Field | Role |

|---|---|

| `record\_id` | Stable canonical record identifier |

| `record\_type` | Distinguishes lead records from lead-metric records |

| `observed\_at` | Date associated with the source CRM observation |

| `entity\_id` | Identifies the CRM lead |

| `category` | Product associated with the lead |

| `subcategory` | Acquisition source associated with the lead |

| `status` | Current CRM status |

| `stage` | Current funnel stage |

| `metric\_name` | Identifies the measured lead value or days in stage |

| `metric\_value` | Numeric metric value |

| `metric\_unit` | Unit associated with the metric |

| `text\_value` | Structured location and team information |

| `source\_name` | Identifies the Phase 2 CRM source |

| `source\_record\_id` | Links the canonical record to the source lead |

| `is\_synthetic` | Confirmed synthetic-data indicator |

| `data\_version` | Canonical package version |



\## Time Behaviour



The dataset contains `observed\_at` dates covering the source sample period.



The date field is useful for describing the distribution of observed CRM

records across the available period.



However, the dataset should not automatically be treated as a full

time-series measurement dataset because the available observations do not

provide repeated measurements for the same lead across an ordered sequence

of periods.



Therefore:



\- Temporal distribution analysis is supported.

\- True longitudinal forecasting is not established by the date field alone.

\- Any trend analysis must respect the available sample and observation

&#x20; structure.



\## Entity Behaviour



The `entity\_id` identifies individual CRM leads.



Each source lead is represented by a lead record and a corresponding

days-in-stage metric record.



This provides an entity-oriented view of current lead attributes and

associated metrics.



The dataset therefore has a secondary \*\*Entity / Snapshot\*\* characteristic.



\## Relationship Behaviour



Relationships are limited.



The canonical structure preserves the relationship between:



\- the canonical record

\- the CRM lead entity

\- the original source record



The dataset does not represent a graph or network of interconnected entities.



\## Text Behaviour



`text\_value` contains structured information for:



\- location

\- team



It is not a substantial free-text field containing issue descriptions,

comments, ratings, or narrative CRM notes.



Therefore the dataset should not be treated as a Text-Enriched dataset for

natural-language theme analysis.



\## Geographic Behaviour



Location information is preserved through the structured `text\_value` field.



Latitude and longitude are not populated because the source dataset does not

provide coordinate values.



Therefore geographic coverage can be assessed using the supplied location

categories, but coordinate-based spatial analysis is not established.



\## Severity / Scenario Behaviour



The source does not contain a dedicated severity field or scenario parameter.



Therefore:



\- Severity-based analytical interpretation should not be assumed.

\- Simulation/scenario analysis is not supported by the current data structure.



\## Archetypes Considered but Rejected



\### Event / Transaction



Rejected as the primary archetype because the records describe CRM lead

states and lifecycle stages rather than independent financial or operational

transactions.



\### Time-Series Measurement



Rejected as the primary archetype because dates are present, but repeated

measurements of the same entities across ordered periods are not sufficiently

established.



\### Simulation / Scenario



Rejected because the dataset contains observed CRM records rather than

controlled scenario inputs and outputs.



\### Network / Relationship



Rejected because the data does not provide a node-and-edge network structure.



\### Text-Enriched



Rejected because the available text is structured location/team information

rather than substantial decision-relevant free text.



\### Hybrid



Not selected as the primary archetype because the Process Lifecycle

interpretation is sufficient to describe the core analytical structure.

Entity/Snapshot behaviour is treated as a secondary characteristic.



\## Final Confirmation



\*\*Primary Archetype: Process Lifecycle\*\*



\*\*Secondary Archetype: Entity / Snapshot\*\*



The canonical dataset is primarily a CRM process-lifecycle dataset in which

lead stage, status, ageing, value and outcome-related states are meaningful.

It also retains entity-level lead information through `entity\_id` and

source-record linkage.



Future analytical readiness decisions should therefore focus on the CRM

funnel lifecycle, stage distribution, ageing, lead value, source, product,

team and location coverage while respecting the limitations of the available

sample.

