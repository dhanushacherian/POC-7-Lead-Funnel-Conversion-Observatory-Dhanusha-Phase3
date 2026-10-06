\# Data Intelligence UI Specification



\## 1. Purpose



This document specifies the user interface requirements for the Phase 3 Data Intelligence page.



The page presents approved Track A - Comparative Intelligence outputs through the dedicated route:



`/data-intelligence`



The interface is a presentation and controlled integration layer. It must not reproduce analytical calculations or generate unsupported analytical conclusions.



\---



\## 2. Project Information



\- Project ID: POC-7

\- PoC Title: Lead Funnel Conversion Observatory

\- Phase: Phase 3

\- Approved Analytical Track: Track A - Comparative Intelligence

\- Data Version: phase3-v2

\- Method Version: 1.0.0

\- Integration Pattern: Static Generated JSON

\- Route: `/data-intelligence`



\---



\## 3. Existing Operational Page



The existing operational dashboard remains available at:



`/`



The Data Intelligence page is a separate route:



`/data-intelligence`



The existing operational page must remain functional and visually intact.



The Data Intelligence page must not replace the operational dashboard.



\---



\## 4. Page Structure



The page follows this structure:



```text

Data Intelligence Header

&#x20;       ↓

Metadata

&#x20;       ↓

Summary Cards

&#x20;       ↓

Track A View Selector

&#x20;       ↓

Search / Filter

&#x20;       ↓

Primary Comparison Table

&#x20;       ↓

Key Findings

&#x20;       ↓

Evidence

&#x20;       ↓

Methodology

&#x20;       ↓

Limitations

&#x20;       ↓

Freshness / Validation Metadata

