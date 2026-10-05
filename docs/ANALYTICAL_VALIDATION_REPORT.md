\# Analytical Validation Report



\## 1. Document Control



| Field | Value |

|---|---|

| Project ID | POC-7 |

| PoC Title | Lead Funnel Conversion Observatory |

| Phase | Phase 3 |

| Approved Analytical Track | Track A - Comparative Intelligence |

| Data Version | phase3-v2 |

| Method Version | 1.0.0 |

| Canonical Dataset | `/data/canonical/intelligence\_data.csv` |

| Validation Status | PASS |



\---



\## 2. Purpose



This report documents the validation of the approved Track A Comparative Intelligence analytical track for the POC-7 Lead Funnel Conversion Observatory.



The purpose of validation is to confirm that the analytical results are reproducible from the canonical dataset, that the existing Track A results are numerically correct, and that the required Track A sensitivity and weak-case checks have been completed.



The validation uses the canonical dataset:



`/data/canonical/intelligence\_data.csv`



The canonical data version used for validation is:



`phase3-v2`



\---



\## 3. Analytical Unit



The analytical unit is one source lead.



The canonical dataset contains 60 canonical records representing 30 source leads. Each source lead contributes the approved lead-value and days-in-stage information used to construct the analytical dataset.



The independent validation process reconstructed 30 analytical lead records from the canonical dataset.



\---



\## 4. Independent Reconstruction



The validation script independently:



1\. Loaded the canonical dataset.

2\. Verified the required canonical columns.

3\. Verified that the canonical data version is `phase3-v2`.

4\. Selected `crm\_lead` records for lead-level analysis.

5\. Selected `days\_in\_stage` metric records.

6\. Converted the required metric values to numeric form.

7\. Joined lead-value and days-in-stage information using `source\_record\_id`.

8\. Removed records missing required analytical measures.

9\. Reconstructed the 30-lead analytical dataset independently.



Result:



\*\*Independent analytical dataset: PASS\*\*



Number of analytical leads reconstructed:



\*\*30\*\*



\---



\## 5. Baseline Validation



The independently calculated baseline is:



| Metric | Result |

|---|---:|

| Lead count | 30 |

| Total observed lead value | 2,023,000.00 |

| Average lead value | 67,433.33 |

| Average days in stage | 13.10 |

| Median days in stage | 10.00 |



The baseline provides the simple descriptive reference against which the comparative Track A results are interpreted.



\---



\## 6. Calculation Accuracy



The independently reconstructed Track A results were compared with the existing Track A output files.



The following dimensions were independently recalculated and compared:



\- Funnel stage

\- Product/category

\- Acquisition source/subcategory



\### Stage comparison



Result:



\*\*PASS\*\*



The independently calculated stage-level values matched the existing Track A output.



\### Product comparison



Result:



\*\*PASS\*\*



The independently calculated product-level values matched the existing Track A output.



\### Source comparison



Result:



\*\*PASS\*\*



The independently calculated source-level values matched the existing Track A output.



\### Analytical dataset comparison



The independently reconstructed analytical dataset was also compared with the existing Track A analytical dataset.



Result:



\*\*PASS\*\*



\### Discrepancies



Total numerical or dimensional discrepancies:



\*\*0\*\*



Therefore:



\*\*Calculation Accuracy: PASS\*\*



\---



\## 7. Ranking Validation



Track A rankings were calculated using deterministic ordering.



The primary ranking measure is total observed lead value in descending order. Group names provide deterministic secondary ordering when required.



\### Highest observed value by stage



\*\*Won — 949,000.00\*\*



\### Highest observed value by product



\*\*Payments — 942,000.00\*\*



\### Highest observed value by acquisition source



\*\*Website — 689,000.00\*\*



The ranking calculations were independently reproduced from the canonical dataset.



\---



\## 8. Minimum Group Size and Small-Group Sensitivity



A minimum group-size threshold of 5 observations was used for sensitivity analysis.



This threshold is used as a sensitivity check and does not replace the full descriptive Track A analysis.



\### Stage groups



The following groups contain fewer than 5 observations:



| Stage | Lead count |

|---|---:|

| Proposal | 4 |

| Lost | 3 |

| Lead | 3 |



\### Product groups



All product groups meet the sensitivity threshold.



| Product | Lead count |

|---|---:|

| Payments | 12 |

| Analytics | 9 |

| Security | 9 |



\### Source groups



All acquisition-source groups meet the sensitivity threshold.



| Source | Lead count |

|---|---:|

| Website | 11 |

| Partner | 5 |

| Referral | 7 |

| Campaign | 7 |



\---



\## 9. Ranking Stability



Ranking stability was tested by comparing the full descriptive ranking with the ranking after excluding groups below the sensitivity threshold.



\### Stage



The full ranking is:



1\. Won

2\. Proposal

3\. Opportunity

4\. Qualified

5\. Lost

6\. Lead



After applying the sensitivity threshold, the retained groups are:



1\. Won

2\. Opportunity

3\. Qualified



The ranking among the retained groups remained stable.



\*\*Stage ranking stability: PASS\*\*



\### Product



The full ranking and sensitivity ranking are identical:



1\. Payments

2\. Analytics

3\. Security



\*\*Product ranking stability: PASS\*\*



\### Source



The full ranking and sensitivity ranking are identical:



1\. Website

2\. Partner

3\. Referral

4\. Campaign



\*\*Source ranking stability: PASS\*\*



\### Overall ranking stability



\*\*PASS\*\*



\---



\## 10. Missing-Group Effects



Missing values in the approved comparison dimensions were assessed.



| Dimension | Missing group values |

|---|---:|

| Stage | 0 |

| Product | 0 |

| Source | 0 |



No missing group values were detected for the approved Track A dimensions.



\*\*Missing-group review: PASS\*\*



\---



\## 11. Weak-Case Review



The validation process identified 4 weak-case items.



The primary weak-case considerations are:



\- Sparse stage groups below the sensitivity threshold.

\- Proposal has 4 observations.

\- Lost has 3 observations.

\- Lead has 3 observations.

\- Lost also has the highest observed average days in stage, but its group size is small.



These results remain descriptive and should be interpreted cautiously.



The weak-case findings do not invalidate the Track A calculation, but they limit the strength of conclusions that can be drawn from sparse groups.



Detailed weak-case evidence is stored in:



`/data-science/outputs/weak\_case\_review.json`



\---



\## 12. Leakage and Interpretation Controls



The analytical track is descriptive comparative intelligence rather than predictive modelling.



The analysis does not claim causal relationships.



The results should not be interpreted as evidence that a product, acquisition source, or funnel stage causes higher or lower lead value or stage duration.



The analysis is limited to the information available in the canonical dataset and the approved descriptive transformations.



The analysis does not use a trained predictive model.



The analysis does not introduce post-event information beyond the approved descriptive fields used for the Track A comparison.



\---



\## 13. Validation Evidence



The machine-generated validation evidence is stored in:



`/data-science/outputs/validation\_metrics.json`



The weak-case evidence is stored in:



`/data-science/outputs/weak\_case\_review.json`



The reusable validation script is:



`/data-science/scripts/validate\_analytical\_track.py`



The validation was executed successfully against the canonical dataset.



\---



\## 14. Overall Validation Result



| Validation Area | Result |

|---|---|

| Canonical schema | PASS |

| Data version | PASS |

| Independent analytical reconstruction | PASS |

| Calculation accuracy | PASS |

| Stage comparison | PASS |

| Product comparison | PASS |

| Source comparison | PASS |

| Analytical dataset comparison | PASS |

| Ranking stability | PASS |

| Missing-group review | PASS |

| Weak-case review completed | PASS |

| Overall Track A validation | \*\*PASS\*\* |



\---



\## 15. Limitations



The following limitations apply to the validated analytical results:



1\. The dataset is synthetic.

2\. The analytical sample contains 30 source leads.

3\. The analysis is descriptive and comparative.

4\. The results do not establish causality.

5\. Some funnel-stage groups are sparse.

6\. Team and location are encoded inside `text\_value` rather than represented as dedicated canonical analytical fields.

7\. The available observations do not constitute a full longitudinal time series.

8\. The analysis should not be used as a predictive model.

9\. The analysis should not be interpreted as production decision automation.

10\. Small-group results should be interpreted cautiously.



\---



\## 16. Reproducibility



The analytical validation was implemented in a reusable Python script rather than being dependent on notebook-only calculations.



Validation was executed using:



```text

python .\\data-science\\scripts\\validate\_analytical\_track.py


The script completed successfully against the canonical dataset.

The independently reconstructed analytical dataset matched the existing Track A analytical dataset.

The independently calculated stage, product, and acquisition-source comparison results matched the existing Track A outputs with zero discrepancies.

Therefore:

**Reproducibility Result: PASS**

---

## 17. Final Validation Decision

The approved Track A Comparative Intelligence method passed the implemented validation checks:

- Canonical schema validation
- Canonical data-version validation
- Independent analytical reconstruction
- Baseline calculation
- Stage calculation accuracy
- Product calculation accuracy
- Source calculation accuracy
- Analytical dataset comparison
- Deterministic ranking validation
- Small-group sensitivity analysis
- Ranking stability
- Missing-group assessment
- Weak-case review

The overall machine-generated validation status is:

**PASS**

This validation result supports continuation to the remaining required Post #3 artifacts.

This report does **not by itself constitute final Post #3 approval**. Final approval remains dependent on completion and review of the remaining required Post #3 artifacts, including the intelligence output contract, standard intelligence outputs, notebook execution, reproducibility checks, and operational regression checks.

### Current Validation Result

**PASS � Track A validation completed successfully.**
