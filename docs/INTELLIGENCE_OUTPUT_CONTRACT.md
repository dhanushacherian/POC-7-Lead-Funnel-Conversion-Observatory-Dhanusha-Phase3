\# POC-7 Lead Funnel Conversion Observatory

\# Intelligence Output Contract



\## 1. Document Control



Project: POC-7 Lead Funnel Conversion Observatory



Approved Analytical Track: Track A - Comparative Intelligence



Data Version: phase3-v2



Method Version: 1.0.0



Canonical Dataset:



/data/canonical/intelligence\_data.csv



This contract defines the standard intelligence outputs for Post #3 Analytical Track Development, Validation and Intelligence Output.



This contract does not constitute final analytical approval.



\---



\## 2. Analytical Objective



The objective is to provide descriptive comparative intelligence about observed differences across:



\- funnel stages

\- products

\- acquisition sources



within the available synthetic lead sample.



The approved primary analytical question is:



How do lead value and days in stage vary across CRM funnel stages, acquisition sources and products within the available synthetic lead sample?



The supported decision is descriptive operational review of observed differences.



\---



\## 3. Approved Analytical Unit



The analytical unit is one source lead.



The canonical dataset contains 60 canonical records representing 30 source leads.



Each source lead is represented through the approved canonical transformation.



The intelligence outputs must not treat the 60 canonical rows as 60 independent leads.



\---



\## 4. Approved Analytical Dimensions



The approved Track A dimensions are:



1\. Funnel stage

2\. Product

3\. Acquisition source



Canonical analytical mappings:



\- stage → stage

\- product → category

\- acquisition source → subcategory



Team and location are not separate analytical dimensions because they are embedded in text\_value.



\---



\## 5. Required Output Files



The Track A intelligence output must contain:



/data-science/outputs/intelligence\_results.json



/data-science/outputs/intelligence\_summary.json



\---



\## 6. Intelligence Results Contract



The primary intelligence output file is:



/data-science/outputs/intelligence\_results.json



Each result object must use the following standard fields:



\- result\_id

\- result\_type

\- record\_id (conditional)

\- entity\_id (conditional)

\- group\_key (conditional)

\- period\_start

\- period\_end

\- metric\_name

\- result\_value

\- result\_unit

\- result\_category

\- priority\_rank

\- finding

\- evidence

\- method\_version

\- data\_version

\- generated\_at

\- quality\_status

\- limitation



The output must contain only results generated from the approved Track A analytical workflow.



\---



\## 7. Result Identification



result\_id must uniquely identify each intelligence result.



For Track A group-level results, group\_key identifies the compared group.



Examples:



\- stage: Won

\- product: Payments

\- source: Website



No fabricated identifiers may be introduced.



\---



\## 8. Result Types



Approved result types for this Track A implementation include:



\- stage\_comparison

\- product\_comparison

\- source\_comparison

\- baseline\_summary



Result types must remain aligned with the approved comparative intelligence track.



\---



\## 9. Metric Contract



Approved metrics include:



\- total\_lead\_value

\- average\_lead\_value

\- average\_days\_in\_stage

\- median\_days\_in\_stage

\- lead\_count

\- value\_share\_percent



Metrics must be calculated from the canonical analytical dataset.



\---



\## 10. Evidence Contract



The evidence field must provide structured numerical support for the finding.



Example:



{

&#x20; "group": "Won",

&#x20; "lead\_count": 10,

&#x20; "total\_lead\_value": 949000.0,

&#x20; "average\_lead\_value": 94900.0,

&#x20; "average\_days\_in\_stage": 8.9

}



Evidence must be traceable to the analytical calculation and must not contain unsupported claims.



\---



\## 11. Finding Contract



The finding field must provide a concise descriptive interpretation of the numerical evidence.



Findings must remain descriptive.



They must not claim:



\- causation

\- prediction

\- statistical significance unless explicitly calculated

\- business certainty

\- production decision recommendations unsupported by the analysis



\---



\## 12. Priority Contract



priority\_rank may be used to order important comparative findings.



Ranking must follow the deterministic ranking rules defined in the analytical method.



Ties must be handled deterministically.



Priority does not imply causal importance or business certainty.



\---



\## 13. Baseline Contract



The intelligence output must include the approved baseline result.



Baseline values are based on the overall canonical analytical dataset:



\- lead count: 30

\- total observed lead value: 2,023,000

\- average lead value: 67,433.33

\- average days in stage: 13.10

\- median days in stage: 10.00



The baseline provides context for Track A group comparisons.



\---



\## 14. Track A Comparison Contract



Track A must produce comparative results for:



1\. Funnel stage

2\. Product

3\. Acquisition source



The approved analytical dimensions are:



\- stage

\- category

\- subcategory



Team and location are not treated as separate analytical dimensions because they are embedded in text\_value.



\---



\## 15. Minimum Group Size Contract



A minimum group-size threshold of 5 records is used for sensitivity assessment.



Groups below this threshold must remain visible when they are part of the descriptive comparison, but their small sample size must be disclosed.



Small groups must not be presented as equally reliable to adequately sized groups.



\---



\## 16. Ranking Stability Contract



Ranking results must be validated independently.



The validation must assess whether the ordering of adequately sized groups remains stable when groups below the minimum sensitivity threshold are excluded.



Ranking stability results must be recorded in:



/data-science/outputs/validation\_metrics.json



\---



\## 17. Missing Group Contract



The analytical workflow must check for missing values in all approved comparison dimensions.



Missing-group effects must be documented.



No missing-group result may be silently removed without being recorded.



\---



\## 18. Weak-Case Contract



Weak or questionable analytical cases must be recorded in:



/data-science/outputs/weak\_case\_review.json



The review must consider:



\- sparse groups

\- unstable rankings

\- missing-value effects

\- unusually small groups

\- limitations caused by the synthetic sample

\- limitations caused by the available temporal information



\---



\## 19. Intelligence Summary Contract



The secondary output file is:



/data-science/outputs/intelligence\_summary.json



It must contain:



\- project\_id

\- data\_version

\- method\_version

\- approved\_track

\- primary\_question

\- decision

\- result\_count

\- key\_findings

\- priority\_items

\- validation\_result

\- limitations

\- generated\_at



The summary must agree with intelligence\_results.json.



\---



\## 20. Validation Contract



The intelligence output may be generated only after analytical validation.



Required validation evidence includes:



\- calculation accuracy

\- minimum group-size assessment

\- ranking stability

\- missing-group effects

\- weak-case review

\- reproducibility



Current validation status:



PASS



Validation evidence is stored in:



/data-science/outputs/validation\_metrics.json



\---



\## 21. Data Version Contract



All intelligence outputs must identify:



data\_version: phase3-v2



The intelligence output must be generated from:



/data/canonical/intelligence\_data.csv



No alternate analytical dataset is permitted.



\---



\## 22. Method Version Contract



Current analytical method version:



1.0.0



Changes to:



\- thresholds

\- weights

\- features

\- taxonomy

\- calculation logic

\- model parameters



require an appropriate method-version update.



\---



\## 23. Reproducibility Contract



The intelligence results must be reproducible from the repository using the approved scripts.



No hidden manual calculations or manually edited result files are permitted.



The analytical workflow must use the canonical dataset and documented method.



\---



\## 24. Limitation Contract



The intelligence output must explicitly acknowledge the following limitations:



\- the dataset is synthetic

\- the available sample contains 30 source leads

\- the analysis is descriptive

\- the analysis is not causal

\- the analysis is not predictive

\- the temporal data does not constitute a full longitudinal time series

\- team and location are not represented as dedicated analytical fields

\- small stage groups reduce confidence in comparisons involving those groups



\---



\## 25. Unsupported Uses



The Track A intelligence output must not be used as:



\- a predictive lead-conversion model

\- a causal explanation of conversion behaviour

\- a production decision-automation system

\- a ranking system claiming statistical significance without appropriate testing

\- evidence for business outcomes beyond the available synthetic sample



\---



\## 26. Output Quality Status



Each result must include an appropriate quality\_status.



Validated Track A results may use:



VALIDATED\_DESCRIPTIVE



Results affected by important limitations must disclose those limitations through the limitation field.



\---



\## 27. Output Generation Rule



intelligence\_results.json and intelligence\_summary.json must be generated through the reusable analytical workflow.



The generation sequence is:



1\. Load canonical CSV.

2\. Verify data version.

3\. Validate required fields.

4\. Apply approved transformations.

5\. Run baseline.

6\. Run approved Track A analysis.

7\. Validate analytical results.

8\. Review weak cases.

9\. Export standard intelligence results.

10\. Export intelligence summary.



\---



\## 28. Final Contract Status



This Intelligence Output Contract defines the required structure and controls for the POC-7 Track A Comparative Intelligence output.



Current status:



READY FOR INTELLIGENCE OUTPUT GENERATION



The contract does not by itself constitute final Post #3 approval.



Final Post #3 approval requires successful execution, validation, reproducibility checks, notebook verification, operational regression verification, and completion of the official Phase 3 submission requirements.

