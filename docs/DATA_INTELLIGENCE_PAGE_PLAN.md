\# Data Intelligence Page Plan



\## 1. Purpose



Create a separate Data Intelligence page for Phase 3 Post #4 that presents the approved Track A - Comparative Intelligence results.



The new page will provide descriptive operational intelligence from the approved intelligence outputs without reproducing or recalculating analytical logic in the frontend.



The existing operational dashboard at `/` must remain intact and functional.



\## 2. Existing Operational Page Protection



The existing operational page will not be replaced or redesigned.



Existing files and components remain unchanged unless a later integration requirement explicitly requires a minimal shared change.



The existing operational dashboard continues to use the existing CRM frontend data and operational calculations.



The Data Intelligence page is a separate route:



`/data-intelligence`



\## 3. Approved Analytical Track



Project: POC-7 Lead Funnel Conversion Observatory



Approved track: Track A - Comparative Intelligence



Primary analytical question:



"How do lead value and days in stage vary across CRM funnel stages, acquisition sources and products within the available synthetic lead sample?"



Supported decision:



Descriptive operational review of observed differences within the available synthetic sample.



The page must not present the analysis as causal, predictive, statistically significant, or as production decision automation.



\## 4. Approved Data and Intelligence Sources



Canonical analytical dataset:



`/data/canonical/intelligence\_data.csv`



Approved intelligence results:



`/data-science/outputs/intelligence\_results.json`



Approved intelligence summary:



`/data-science/outputs/intelligence\_summary.json`



Approved validation metadata:



`/data-science/outputs/validation\_metrics.json`



The frontend must consume the approved intelligence outputs rather than independently recalculating the analytical results from the CRM frontend dataset.



\## 5. Integration Pattern



Use a static generated JSON integration pattern.



The approved intelligence output will be made available to the frontend through a controlled application data/loader layer.



The frontend may:



\- display approved values

\- filter approved results

\- sort approved results

\- paginate results where appropriate

\- format values for presentation

\- display approved findings and evidence

\- display approved limitations and metadata



The frontend must not:



\- recalculate analytical metrics

\- create new analytical findings

\- change analytical thresholds

\- change group definitions

\- change ranking logic

\- change approved limitations

\- generate unsupported recommendations

\- use an LLM assistant for analytical interpretation



\## 6. Route



Primary route:



`/data-intelligence`



The route will be implemented as a separate Next.js App Router page.



The existing `/` route must continue to function without regression.



\## 7. Page Header



The page header will identify:



\- Lead Funnel Conversion Observatory

\- Data Intelligence

\- Track A - Comparative Intelligence

\- data version: `phase3-v2`

\- method version: `1.0.0`

\- validation status: `PASS`

\- quality status: `VALIDATED\_DESCRIPTIVE`



Generated timestamp will be displayed from the approved output metadata.



\## 8. Summary Cards



Provide approximately 3-6 summary cards using approved intelligence values.



Initial cards:



1\. Total observed lead value

2\. Average lead value

3\. Average days in stage

4\. Source lead count

5\. Highest observed-value stage

6\. Highest observed-value product/source where appropriate



The cards must use values already present in the approved outputs.



No new calculations will be introduced solely for presentation.



\## 9. Track A Comparative Intelligence



The primary intelligence area will contain three comparison dimensions:



\### Funnel Stage



Display all approved stage comparison results:



\- Won

\- Proposal

\- Opportunity

\- Qualified

\- Lost

\- Lead



Show:



\- group

\- lead count

\- total observed lead value

\- average lead value

\- average days in stage

\- priority rank

\- quality/limitation status



\### Product



Display:



\- Payments

\- Analytics

\- Security



Show the same approved evidence fields where available.



\### Acquisition Source



Display:



\- Website

\- Partner

\- Referral

\- Campaign



Show the same approved evidence fields where available.



\## 10. Ranking and Comparison Visuals



Use approved priority ranks to order comparative results.



Visual comparison may include:



\- horizontal comparison bars

\- ranking tables

\- group contribution/value comparison

\- performance-gap presentation based on approved values



The visual layer must not independently derive a different ranking.



The primary displayed ranking must remain consistent with the approved analytical output.



\## 11. Minimum Group Size Warning



The approved minimum group-size threshold is 5 records.



Groups below 5 must remain visible.



The page must clearly identify small groups and disclose that their comparison requires caution.



Known small stage groups:



\- Proposal: 4 leads

\- Lost: 3 leads

\- Lead: 3 leads



Adequately sized groups must not be presented as equally reliable to groups below the approved sensitivity threshold.



\## 12. Results and Priority Table



Provide a detailed results table using the approved intelligence results.



Recommended fields:



\- Priority

\- Dimension

\- Group

\- Metric

\- Result value

\- Lead count

\- Average lead value

\- Average days in stage

\- Quality status

\- Limitation



The table may support:



\- filtering

\- sorting

\- pagination



These interactions must only operate on approved results.



\## 13. Key Findings



Display the approved key findings from the intelligence summary.



Do not rewrite findings into stronger claims.



The page must preserve the descriptive nature of the approved findings.



\## 14. Evidence



Provide an evidence section showing the structured numerical evidence associated with comparative results.



Evidence must remain traceable to the approved analytical output.



Do not fabricate identifiers or unsupported metrics.



\## 15. Methodology



Provide a concise methodology section explaining:



\- canonical analytical dataset

\- approved Track A dimensions

\- approved analytical unit

\- method version `1.0.0`

\- data version `phase3-v2`

\- descriptive comparative analysis

\- validation status



The methodology section will describe the approved process without reproducing the analytical calculations.



\## 16. Limitations



Display the approved limitations.



At minimum include:



\- dataset is synthetic

\- available sample contains 30 source leads

\- analysis is descriptive

\- analysis is not causal

\- analysis is not predictive

\- temporal information is not a full longitudinal time series

\- team and location are not represented as dedicated analytical fields

\- small stage groups reduce confidence in comparisons involving those groups



\## 17. Freshness and Metadata



Display:



\- generated timestamp

\- data version

\- method version

\- validation status

\- approved track



Freshness must be derived from the approved output metadata.



The page must not invent timestamps.



\## 18. Contract Validation



Before rendering intelligence results, validate the loaded output against the project intelligence contract.



Validation must check:



\- required top-level fields

\- result count

\- result object structure

\- result identifiers

\- supported result types

\- required metric fields

\- evidence structure

\- data version

\- method version

\- quality status

\- generated timestamp

\- duplicate result IDs

\- contract consistency



The approved quality status for validated Track A results is:



`VALIDATED\_DESCRIPTIVE`



The expected data version is:



`phase3-v2`



The expected method version is:



`1.0.0`



\## 19. Safe Failure Behaviour



The page must fail safely when:



\- JSON cannot be loaded

\- JSON is malformed

\- required fields are missing

\- result count does not match

\- duplicate result IDs exist

\- data version is unexpected

\- method version is unexpected

\- timestamp is invalid

\- unsupported quality status is encountered

\- result type is unsupported

\- contract validation fails



The page must display a clear error state rather than silently displaying invalid intelligence.



\## 20. Loading State



Provide a visible loading state while the intelligence output is being loaded.



The loading state must prevent the user from interpreting incomplete data as final intelligence.



\## 21. Empty State



If valid intelligence data contains no displayable results, show a clear empty state.



Do not invent replacement results.



\## 22. Stale or Version-Mismatch State



If the loaded intelligence output does not match the expected approved data version or method version, do not present it as current approved intelligence.



Display a clear stale/version-mismatch state.



Expected:



\- data version: `phase3-v2`

\- method version: `1.0.0`



\## 23. Frontend Responsibilities



The frontend is responsible for:



\- presentation

\- navigation

\- filtering

\- sorting

\- pagination

\- formatting

\- responsive layout

\- loading/error/empty/stale states

\- contract validation before presentation



The analytical pipeline remains responsible for:



\- calculations

\- group definitions

\- ranking

\- thresholds

\- findings

\- validation

\- limitations

\- approved output generation



\## 24. Testing Plan



Tests will cover:



\### Contract tests



Verify valid approved intelligence output is accepted.



Verify malformed or incompatible output is rejected safely.



\### Loader/API tests



Verify the intelligence output can be loaded correctly.



Verify loading failures are handled safely.



\### UI tests



Verify:



\- page renders

\- summary cards display

\- Track A sections display

\- small-group warnings display

\- filters work

\- sorting works

\- evidence displays

\- methodology displays

\- limitations display

\- error state displays

\- stale/version mismatch state displays



\### Regression tests



Verify the existing operational `/` page continues to:



\- load

\- display its existing dashboard

\- retain existing filters

\- retain existing charts

\- retain existing intelligence panel

\- retain existing data export behaviour



\## 25. Acceptance Criteria



The Data Intelligence page is acceptable only when:



1\. `/data-intelligence` loads successfully.

2\. Existing `/` operational functionality remains intact.

3\. Approved intelligence results are consumed without frontend analytical recalculation.

4\. Data version `phase3-v2` is validated.

5\. Method version `1.0.0` is validated.

6\. Quality status `VALIDATED\_DESCRIPTIVE` is accepted.

7\. Result count is validated.

8\. Duplicate result IDs are rejected.

9\. Contract failures are handled safely.

10\. Track A stage, product and source comparisons are displayed.

11\. Small groups below 5 leads are visibly disclosed.

12\. Approved findings are displayed without unsupported interpretation.

13\. Evidence is traceable to approved outputs.

14\. Methodology and limitations are displayed.

15\. Loading, error, empty and stale states are implemented.

16\. Operational-page regression checks pass.

17\. Required documentation and test evidence are completed.



\## 26. Implementation Order



Implementation will follow this order:



1\. Complete and review this page plan.

2\. Create intelligence TypeScript types.

3\. Create contract validator.

4\. Create intelligence loader/adapter.

5\. Create `/data-intelligence` route.

6\. Implement page shell and metadata.

7\. Implement summary cards.

8\. Implement Track A comparison sections.

9\. Implement results table and filters.

10\. Implement evidence, methodology and limitations.

11\. Implement loading, error, empty and stale states.

12\. Add contract and UI tests.

13\. Run operational regression tests.

14\. Run production/build checks.

15\. Capture evidence/screenshots.

16\. Commit and push the completed Post #4 implementation.



\## 27. Final Approval Condition



The final Post #4 result must be one of:



\- `DATA INTELLIGENCE PAGE APPROVED`

\- `DATA INTELLIGENCE PAGE CHANGES REQUIRED`

\- `INTELLIGENCE INTEGRATION BLOCKED`



No final approval will be claimed until implementation, validation, testing and operational regression evidence are complete.

