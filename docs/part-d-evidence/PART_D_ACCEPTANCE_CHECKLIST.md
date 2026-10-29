# Part D — Final Acceptance Checklist

Statuses: NOT TESTED, PASS, FAIL.
Do not mark PASS without recorded evidence.

## P0 — Release-blocking

- [ ] Navigation: Dashboard ↔ Intelligence; active state; shared shell.
- [ ] First fold: 1440x900 header, filters, KPIs, first-chart content visible without scrolling.
- [ ] Filter footprint: desktop toolbar <= 88px in normal state.
- [ ] Filter behavior: filtering, reset, export and empty states preserve correct data.
- [ ] Chart grid: aligned charts; logical secondary grouping; no clipping or excessive blank space.
- [ ] Intelligence UX: chart-led dimension explorer; one active dimension table; no five-table report scroll.
- [ ] Data correctness: all values match approved phase3-demo-v1 source/analytics; no hardcoded preview values.
- [ ] Gemini safety: deterministic answer, evidence, status and limitation preserved.
- [ ] Contrast: readable text and controls; target WCAG AA contrast; no essential tiny/faint text.
- [ ] Responsive: test 1440x900, 1366x768, 1280x800, 768x1024, 390x844, 320x720.
- [ ] No horizontal overflow or clipped chart legends at any required viewport.

## P1 — Accessibility and polish

- [ ] Visible keyboard focus; labelled controls; keyboard-usable tabs.
- [ ] Charts have accessible descriptions; tables have headers.
- [ ] Consistent spacing, units, titles, tooltips, hover states.
- [ ] Export and loading feedback are clear and consistent.

## Evidence

- [ ] Before/after desktop and mobile screenshots.
- [ ] Build, lint, data, assistant and browser test logs.
- [ ] Opportunity record count independently reconciled to 123.
- [ ] Aging buckets independently reconciled: 14 + 25 + 68 + 16 = 123.
- [ ] Selected comparison matches displayed source records.
- [ ] Original phase3-v2 baseline preserved.
- [ ] Updated demo walkthrough.
- [ ] Exact final commit SHA recorded.
- [ ] Live deployed commit independently verified.
- [ ] Public demo and intelligence URLs verified.
- [ ] Fresh Repomix generated from the final committed state.
- [ ] Known limitations and outstanding approvals documented.

## Review rule

A prior successful test is not a current PASS.
Record command, exit code, date, and evidence for each executed check.
Formal certification approvals must remain separate from technical test results.
