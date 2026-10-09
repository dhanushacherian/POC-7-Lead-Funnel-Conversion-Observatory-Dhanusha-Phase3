\# Gemini Integration — Grounded Data Assistant



\## 1. Purpose



The Grounded Data Assistant uses deterministic logic to answer questions from approved Track A analytical results. Gemini provides an optional natural-language explanation of supported answers.



\## 2. Answer Generation



The assistant generates its deterministic answer and evidence from approved results before requesting an optional Gemini explanation. The deterministic answer remains the primary response.



\## 3. API Configuration



The Gemini API key is configured through the server-side environment variable:



`GEMINI\_API\_KEY`



Store the key in the local `.env.local` file. Never commit API keys, expose them in client-side code, or include them in repository snapshots.



\## 4. Availability and Fallback



The response includes an explanation status:



\- `AVAILABLE`: Gemini generated an explanation.

\- `UNAVAILABLE`: An optional explanation could not be provided.



If Gemini is unavailable, the assistant retains the deterministic answer and approved evidence.



\## 5. Evidence and Limitations



The assistant uses approved Track A results with data version `phase3-v2` and method version `1.0.0`. The analysis is descriptive and uses synthetic data. It does not establish causation or provide predictions. Small stage groups require cautious interpretation.



\## 6. Validation



The following checks passed after the Gemini integration changes:



\- Production build

\- ESLint

\- Grounded assistant service tests: 12/12

\- Data intelligence contract tests: 7/7

\- Live browser check: Gemini explanation returned `AVAILABLE`, with `LLM enabled: Yes`



\## 7. Security



The API key must remain server-side. Do not log the key, include it in screenshots, or commit `.env.local`. Revoke exposed keys and replace them with new keys.



