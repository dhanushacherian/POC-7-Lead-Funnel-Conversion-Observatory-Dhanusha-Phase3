\# Track A — Comparative Analysis



\## Project



\*\*Project:\*\* Lead Funnel Conversion Observatory  

\*\*Phase:\*\* Phase 3  

\*\*Analytical Track:\*\* Track A — Comparative  

\*\*Data Version:\*\* phase3-v2  

\*\*Source:\*\* phase2\_crmData  



\---



\## 1. Analytical Question



How do lead value and days in stage vary across CRM funnel stages, acquisition sources and products within the available synthetic lead sample?



\---



\## 2. Dataset Used



The analysis uses the Phase 3 canonical dataset:



`data/canonical/intelligence\_data.csv`



The analysis includes:



\- 30 source CRM leads

\- 30 lead-value records

\- 30 days-in-stage records

\- 60 canonical analytical records

\- Synthetic data

\- Data version: `phase3-v2`



\---



\## 3. Measures



Two numerical measures were compared:



\### Lead Value



Represents the value associated with each CRM lead.



\### Days in Stage



Represents the number of days associated with the lead's current funnel stage.



\---



\## 4. Comparison Dimensions



The analysis compares the measures across:



\- CRM funnel stage

\- Product

\- Acquisition source



The canonical representation preserves:



\- Product through `category`

\- Acquisition source through `subcategory`

\- Funnel stage through `stage` and `status`



Team and location are not available as separate canonical fields and therefore were not included in the Track A comparison.



\---



\## 5. Overall Results



| Measure | Result |

|---|---:|

| Source leads analyzed | 30 |

| Total observed lead value | 2,023,000 |

| Average lead value | 67,433.33 |

| Average days in stage | 13.1 |



\---



\## 6. Stage Comparison



The stage comparison examines total lead value, average lead value and stage ageing across the CRM funnel stages.



The stage with the highest total observed lead value in the available sample was:



\*\*Won\*\*



The stage with the highest average days in stage was:



\*\*Lost\*\*



The detailed results are available in:



`data-science/outputs/track\_a\_stage\_comparison.csv`



\---



\## 7. Product Comparison



The product comparison examines the distribution of lead value and stage ageing across product categories.



The product category with the highest total observed lead value was:



\*\*Payments\*\*



Detailed results are available in:



`data-science/outputs/track\_a\_product\_comparison.csv`



\---



\## 8. Acquisition Source Comparison



The acquisition-source comparison examines lead value and stage ageing across acquisition sources.



The acquisition source with the highest total observed lead value was:



\*\*Website\*\*



Detailed results are available in:



`data-science/outputs/track\_a\_source\_comparison.csv`



\---



\## 9. Interpretation



The comparative analysis shows that lead value and stage ageing are distributed differently across the available CRM groups.



The available sample contains a total observed lead value of 2,023,000 and an average lead value of 67,433.33.



The `Won` stage contains the highest total observed lead value in this sample, while the `Lost` stage has the highest average days in stage.



Among product categories, `Payments` has the highest total observed lead value.



Among acquisition sources, `Website` has the highest total observed lead value.



These findings describe the observed synthetic sample. They do not establish that a particular stage, product or acquisition source causes higher lead value or longer stage duration.



\---



\## 10. Decision Use



The analysis can support an operational review of the existing lead funnel by showing where lead value and stage ageing are concentrated across the available CRM groups.



The results can be used as descriptive evidence for further investigation rather than as causal or predictive conclusions.



\---



\## 11. Limitations



1\. The analysis uses 30 source CRM leads.

2\. The dataset is synthetic.

3\. The results describe the available sample and should not be generalized to a larger CRM population without additional evidence.

4\. Comparative associations do not establish causation.

5\. Team and location are not available as separate canonical fields.

6\. The analysis does not perform predictive modeling.

7\. The dataset does not establish repeated longitudinal measurements for the same entities.



\---



\## 12. Reproducibility



The analysis script is:



`scripts/data-science/track\_a\_comparative\_analysis.py`



The generated outputs are:



\- `track\_a\_analysis\_dataset.csv`

\- `track\_a\_stage\_comparison.csv`

\- `track\_a\_product\_comparison.csv`

\- `track\_a\_source\_comparison.csv`

\- `track\_a\_comparative\_analysis.json`



All outputs are stored under:



`data-science/outputs/`



\---



\## 13. Analytical Readiness Link



The Phase 3 analytical-readiness assessment identified:



\*\*Primary archetype:\*\* Process Lifecycle



\*\*Primary analytical track:\*\* Track A — Comparative



\*\*Final readiness result:\*\* DATA READY FOR ANALYTICAL TRACK DEVELOPMENT



\---



\## 14. Conclusion



Track A — Comparative analysis was successfully completed using the Phase 3 canonical dataset.



The analysis provides descriptive comparisons of lead value and days in stage across CRM funnel stages, products and acquisition sources.



The findings provide a documented analytical foundation for the next Phase 3 development stage while preserving the limitations of the synthetic dataset.

