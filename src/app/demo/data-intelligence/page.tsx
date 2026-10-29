
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import rawSummary from "../../../../data/demo/phase3-demo-v1/analytics/intelligence_summary.json";
import { demoCrmData } from "@/data/demoCrmData";
import DemoDataAssistant from "@/components/DemoDataAssistant";

type MetricRow = {
  stage?: string;
  product?: string;
  source?: string;
  team?: string;
  location?: string;
  lead_count: number;
  total_lead_value: number;
  average_lead_value: number;
  average_days_in_stage: number;
  median_days_in_stage: number;
  value_share_percent: number;
};

type DimensionKey = "stage" | "product" | "source" | "team" | "location";

type DemoSummary = {
  project: string;
  dataset_classification: string;
  data_version: string;
  random_seed: number;
  observation_window: {
    start: string;
    end: string;
    calendar_months: number;
  };
  overall_summary: {
    source_leads_analyzed: number;
    canonical_rows_processed: number;
    total_lead_value: number;
    average_lead_value: number;
    average_days_in_stage: number;
    median_days_in_stage: number;
  };
  highest_observed_groups: {
    highest_value_stage: {
      stage: string;
      total_lead_value: number;
    };
    highest_value_product: {
      product: string;
      total_lead_value: number;
    };
    highest_value_source: {
      source: string;
      total_lead_value: number;
    };
    highest_average_age_stage: {
      stage: string;
      average_days_in_stage: number;
    };
  };
  dimensions: Record<DimensionKey, MetricRow[]>;
  interpretation: string[];
  limitations: string[];
};

type DemoLead = (typeof demoCrmData)[number];

const summary = rawSummary as DemoSummary;

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(n);

const dimensions: {
  key: DimensionKey;
  label: string;
  field: DimensionKey;
}[] = [
  { key: "stage", label: "Stage", field: "stage" },
  { key: "product", label: "Product", field: "product" },
  { key: "source", label: "Acquisition source", field: "source" },
  { key: "team", label: "Team", field: "team" },
  { key: "location", label: "Location", field: "location" },
];

const metricOptions = [
  { key: "lead_count", label: "Lead count", unit: "leads" },
  {
    key: "total_lead_value",
    label: "Total observed value",
    unit: "unspecified units",
  },
  {
    key: "average_lead_value",
    label: "Average lead value",
    unit: "unspecified units / lead",
  },
  {
    key: "average_days_in_stage",
    label: "Mean days in current stage",
    unit: "days",
  },
] as const;

type MetricKey = (typeof metricOptions)[number]["key"];

type Finding = {
  id: string;
  title: string;
  dimension: DimensionKey;
  group: string;
  summary: string;
  review: string;
  metric: MetricKey;
};

function groupValue(row: MetricRow, key: DimensionKey) {
  return String(row[key] ?? "Unknown");
}

function getRows(key: DimensionKey) {
  return summary.dimensions[key] ?? [];
}

function rowMetric(row: MetricRow, key: MetricKey) {
  return row[key];
}

export default function DemoDataIntelligencePage() {
  const [dimension, setDimension] = useState<DimensionKey>("stage");
  const [metric, setMetric] =
    useState<MetricKey>("total_lead_value");
  const [selectedGroup, setSelectedGroup] = useState("Opportunity");
  const [showRecords, setShowRecords] = useState(true);
  const [showMethodology, setShowMethodology] = useState(false);
  const [ageSort, setAgeSort] = useState<"desc" | "asc">("desc");
  const [recordQuery, setRecordQuery] = useState("");
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  const findings: Finding[] = useMemo(() => {
    const stageValue =
      summary.highest_observed_groups.highest_value_stage.stage;
    const productValue =
      summary.highest_observed_groups.highest_value_product.product;
    const sourceValue =
      summary.highest_observed_groups.highest_value_source.source;
    const ageStage =
      summary.highest_observed_groups.highest_average_age_stage.stage;

    const stageRow = getRows("stage").find(
      (r) => groupValue(r, "stage") === stageValue
    );
    const productRow = getRows("product").find(
      (r) => groupValue(r, "product") === productValue
    );
    const sourceRow = getRows("source").find(
      (r) => groupValue(r, "source") === sourceValue
    );
    const ageRow = getRows("stage").find(
      (r) => groupValue(r, "stage") === ageStage
    );

    return [
      {
        id: "stage-value",
        title: `${stageValue} has the highest observed stage value`,
        dimension: "stage",
        group: stageValue,
        summary: `${fmt(stageRow?.lead_count ?? 0)} leads | ${fmt(
          stageRow?.total_lead_value ?? 0
        )} observed value`,
        review:
          "Compare the contributing records and current-stage ages; this is descriptive, not causal.",
        metric: "total_lead_value",
      },
      {
        id: "product-value",
        title: `${productValue} has the highest observed product value`,
        dimension: "product",
        group: productValue,
        summary: `${fmt(productRow?.lead_count ?? 0)} leads | ${fmt(
          productRow?.value_share_percent ?? 0
        )}% of observed value`,
        review:
          "Compare lead count and average value before interpreting the concentration.",
        metric: "total_lead_value",
      },
      {
        id: "source-value",
        title: `${sourceValue} has the highest observed source value`,
        dimension: "source",
        group: sourceValue,
        summary: `${fmt(sourceRow?.lead_count ?? 0)} leads | ${fmt(
          sourceRow?.value_share_percent ?? 0
        )}% of observed value`,
        review:
          "Compare other source groups and their per-lead averages; no attribution is established.",
        metric: "total_lead_value",
      },
      {
        id: "stage-aging",
        title: `${ageStage} has the highest mean recorded stage age`,
        dimension: "stage",
        group: ageStage,
        summary: `${fmt(ageRow?.lead_count ?? 0)} leads | ${fmt(
          ageRow?.average_days_in_stage ?? 0
        )} days mean age`,
        review:
          "Review older records in this snapshot; this does not establish why records were lost or delayed.",
        metric: "average_days_in_stage",
      },
    ];
  }, []);

  const activeRows = getRows(dimension)
    .slice()
    .sort((a, b) => rowMetric(b, metric) - rowMetric(a, metric));

  const selectedRow =
    activeRows.find(
      (r) => groupValue(r, dimension) === selectedGroup
    ) ?? activeRows[0];

  const maxMetric = Math.max(
    1,
    ...activeRows.map((r) => rowMetric(r, metric))
  );

  const activeMetric = metricOptions.find(
    (m) => m.key === metric
  )!;

  const scopedRecords = (() => {
    if (!selectedRow) return [] as DemoLead[];

    return demoCrmData
      .filter(
        (lead) =>
          String(lead[dimension]) ===
          groupValue(selectedRow, dimension)
      )
      .filter((lead) =>
        [
          lead.id,
          lead.product,
          lead.source,
          lead.team,
          lead.location,
          lead.stage,
        ]
          .join(" ")
          .toLowerCase()
          .includes(recordQuery.toLowerCase())
      )
      .sort((a, b) =>
        ageSort === "desc"
          ? b.daysInStage - a.daysInStage
          : a.daysInStage - b.daysInStage
      );
  })();
  function chooseFinding(f: Finding) {
    setSelectedFinding(f);
    setDimension(f.dimension);
    setSelectedGroup(f.group);
    setMetric(f.metric);
    setShowRecords(true);
  }

  function chooseDimension(key: DimensionKey) {
    setDimension(key);
    const firstRow = getRows(key)[0];

    if (firstRow) {
      setSelectedGroup(groupValue(firstRow, key));
    }
  }

  return (
    <main className="min-h-screen bg-[#F4F7FB] px-4 py-5 text-[#172339] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px] space-y-5">
        <header className="rounded-2xl bg-[#142641] px-5 py-4 text-white shadow-sm sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">
                Infocreon | Synthetic demonstration
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                Lead Intelligence
              </h1>
              <p className="mt-1 text-sm text-slate-200">
                Explore observed patterns, inspect evidence, and decide
                what to investigate next.
              </p>
            </div>

            <nav
              aria-label="Demo navigation"
              className="flex flex-wrap gap-2"
            >
              <Link
                href="/demo"
                className="rounded-lg border border-white/25 px-3 py-2 text-sm font-medium text-white hover:bg-white/10"
              >
                Operational dashboard
              </Link>
              <Link
                href="/demo/data-intelligence"
                aria-current="page"
                className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#142641]"
              >
                Lead Intelligence
              </Link>
            </nav>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 border-t border-white/15 pt-3 text-xs text-slate-200">
            <span>
              Data version:{" "}
              <strong className="text-white">
                {summary.data_version}
              </strong>
            </span>
            <span>
              Seed:{" "}
              <strong className="text-white">
                {summary.random_seed}
              </strong>
            </span>
            <span>
              Window:{" "}
              <strong className="text-white">
                {summary.observation_window.start} -{" "}
                {summary.observation_window.end}
              </strong>
            </span>
            <span className="font-semibold text-amber-200">
              Synthetic data - not real customer outcomes
            </span>
          </div>
        </header>

        <section
          aria-label="Dataset summary"
          className="grid grid-cols-2 gap-3 lg:grid-cols-4"
        >
          {[
            [
              "Source leads",
              fmt(summary.overall_summary.source_leads_analyzed),
              "Unique synthetic source records",
            ],
            [
              "Total observed value",
              fmt(summary.overall_summary.total_lead_value),
              "Currency not specified",
            ],
            [
              "Average lead value",
              fmt(summary.overall_summary.average_lead_value),
              "Per source lead",
            ],
            [
              "Mean current-stage age",
              `${fmt(summary.overall_summary.average_days_in_stage)} days`,
              "Snapshot age, not transition time",
            ],
          ].map(([label, value, detail]) => (
            <article
              key={label}
              className="rounded-xl border border-[#DFE6F0] bg-white p-4 shadow-sm"
            >
              <p className="text-sm font-medium text-[#52647B]">
                {label}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-[#172339]">
                {value}
              </p>
              <p className="mt-1 text-xs leading-5 text-[#52647B]">
                {detail}
              </p>
            </article>
          ))}
        </section>

        <section
          aria-labelledby="finding-heading"
          className="space-y-3"
        >
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#345ED7]">
                Start here
              </p>
              <h2
                id="finding-heading"
                className="mt-1 text-xl font-semibold"
              >
                Findings worth investigating
              </h2>
            </div>
            <p className="max-w-xl text-sm text-[#52647B]">
              Selected from approved descriptive outputs. These are
              review candidates, not risk scores or causal conclusions.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {findings.map((f, i) => (
              <button
                key={f.id}
                type="button"
                onClick={() => chooseFinding(f)}
                className={`rounded-xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#345ED7] ${
                  selectedGroup === f.group && dimension === f.dimension
                    ? "border-[#345ED7] ring-1 ring-[#345ED7]"
                    : "border-[#DFE6F0]"
                }`}
                aria-pressed={
                  selectedGroup === f.group && dimension === f.dimension
                }
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#EAF0FF] text-sm font-semibold text-[#345ED7]">
                  {i + 1}
                </span>
                <h3 className="mt-3 text-sm font-semibold leading-5 text-[#172339]">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm font-semibold text-[#345ED7]">
                  {f.summary}
                </p>
                <p className="mt-2 text-xs leading-5 text-[#52647B]">
                  {f.review}
                </p>
                <span className="mt-3 inline-flex text-xs font-semibold text-[#345ED7]">
                  Explore evidence &rarr;
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#DFE6F0] bg-white shadow-sm">
          <div className="border-b border-[#DFE6F0] p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#345ED7]">
                  Interactive comparison
                </p>
                <h2 className="mt-1 text-xl font-semibold">
                  Compare groups
                </h2>
                <p className="mt-1 text-sm text-[#52647B]">
                  Choose one dimension and metric. Selecting a bar
                  updates the evidence record list below.
                </p>
              </div>

              <label className="flex flex-col gap-1 text-xs font-medium text-[#52647B]">
                Metric
                <select
                  value={metric}
                  onChange={(e) =>
                    setMetric(e.target.value as MetricKey)
                  }
                  className="min-h-10 rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm text-[#172339] [color-scheme:light]"
                >
                  {metricOptions.map((m) => (
                    <option key={m.key} value={m.key}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div
              role="tablist"
              aria-label="Comparison dimension"
              className="mt-4 flex flex-wrap gap-2"
            >
              {dimensions.map((d) => (
                <button
                  role="tab"
                  aria-selected={dimension === d.key}
                  key={d.key}
                  onClick={() => chooseDimension(d.key)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#345ED7] ${
                    dimension === d.key
                      ? "border-[#345ED7] bg-[#345ED7] text-white"
                      : "border-[#CBD5E1] bg-white text-[#334155] hover:bg-[#F4F7FB]"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
            <div className="p-4 sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold">
                  {dimensions.find((d) => d.key === dimension)?.label} |{" "}
                  {activeMetric.label}
                </h3>
                <span className="text-xs text-[#52647B]">
                  {activeMetric.unit}
                </span>
              </div>

              <div
                className="space-y-3"
                role="list"
                aria-label={`${activeMetric.label} by ${dimension}`}
              >
                {activeRows.map((row) => {
                  const label = groupValue(row, dimension);
                  const value = rowMetric(row, metric);
                  const selected = selectedGroup === label;

                  return (
                    <button

                      type="button"
                      key={label}
                      onClick={() => {
                        setSelectedGroup(label);
                        setShowRecords(true);
                      }}
                      aria-pressed={selected}
                      className={`block w-full rounded-lg p-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#345ED7] ${
                        selected
                          ? "bg-[#EEF3FF]"
                          : "hover:bg-[#F7F9FC]"
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                        <span
                          className={`font-medium ${
                            selected
                              ? "text-[#2348B7]"
                              : "text-[#334155]"
                          }`}
                        >
                          {label}
                        </span>
                        <span className="tabular-nums font-semibold text-[#172339]">
                          {fmt(value)}
                        </span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-[#E9EEF6]">
                        <div
                          className={`h-full rounded-full ${
                            selected ? "bg-[#345ED7]" : "bg-[#7D9BE8]"
                          }`}
                          style={{
                            width: `${Math.max(
                              2,
                              (value / maxMetric) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="mt-4 text-xs leading-5 text-[#52647B]">
                Bars use the approved summary values for{" "}
                {summary.data_version}. Value units are unspecified
                where applicable. Current-stage snapshots do not
                establish historical conversion rates.
              </p>
            </div>

            <aside className="border-t border-[#DFE6F0] bg-[#F8FAFD] p-4 sm:p-5 lg:border-l lg:border-t-0">
              <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#52647B]">
                Selected group
              </p>
              <h3 className="mt-1 text-xl font-semibold">
                {selectedRow
                  ? groupValue(selectedRow, dimension)
                  : "No group"}
              </h3>

              <dl className="mt-4 grid grid-cols-2 gap-3">
                {selectedRow &&
                  [
                    ["Leads", fmt(selectedRow.lead_count)],
                    ["Total value*", fmt(selectedRow.total_lead_value)],
                    [
                      "Average age",
                      `${fmt(selectedRow.average_days_in_stage)} d`,
                    ],
                    [
                      "Value share",
                      `${fmt(selectedRow.value_share_percent)}%`,
                    ],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="rounded-lg border border-[#DFE6F0] bg-white p-3"
                    >
                      <dt className="text-xs text-[#52647B]">{k}</dt>
                      <dd className="mt-1 font-semibold text-[#172339]">
                        {v}
                      </dd>
                    </div>
                  ))}
              </dl>

              <p className="mt-4 text-sm leading-6 text-[#52647B]">
                Review the records and compare context before drawing
                conclusions. This is synthetic demonstration data, not
                evidence of actual customer behavior.
              </p>

              <button
                type="button"
                onClick={() => setShowMethodology((v) => !v)}
                className="mt-3 rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-sm font-medium text-[#334155] hover:bg-[#F1F5F9]"
                aria-expanded={showMethodology}
              >
                {showMethodology
                  ? "Hide methodology"
                  : "View methodology & limitations"}
              </button>
            </aside>
          </div>

          {showMethodology && (
            <div className="border-t border-[#DFE6F0] bg-[#FFFCF4] p-4 sm:p-5">
              <h3 className="font-semibold">
                Methodology and limitations
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[#52647B]">
                {summary.limitations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-[#52647B]">
                Data version {summary.data_version}; seed{" "}
                {summary.random_seed}; observation window{" "}
                {summary.observation_window.start} to{" "}
                {summary.observation_window.end}. *Currency is unspecified.
              </p>
            </div>
          )}
        </section>

        <section className="print-evidence-section overflow-hidden rounded-2xl border border-[#DFE6F0] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DFE6F0] p-4 sm:p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#345ED7]">
                Source evidence
              </p>
              <h2 className="mt-1 text-xl font-semibold">
                Contributing CRM records
              </h2>
              <p className="mt-1 text-sm text-[#52647B]">
                {selectedRow
                  ? `Full demo dataset: ${demoCrmData.length} synthetic leads. Selected group: ${dimension} = ${groupValue(
                      selectedRow,
                      dimension
                    )}. Search narrows this group's records only; it does not change the approved finding or dataset-wide summary.`
                  : `Full demo dataset: ${demoCrmData.length} synthetic leads. Select a comparison group to inspect its records.`}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowRecords((v) => !v)}
              aria-expanded={showRecords}
              className="rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-sm font-medium text-[#334155]"
            >
              {showRecords ? "Hide records" : "Show records"}
            </button>
          </div>

          {showRecords && (
            <div className="p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <label className="min-w-[220px] flex-1">
                  <span className="sr-only">
                    Search contributing records
                  </span>
                  <input
                    value={recordQuery}
                    onChange={(e) => setRecordQuery(e.target.value)}
                    placeholder="Search ID, product, source, team or location"
                    className="w-full rounded-lg border border-[#CBD5E1] px-3 py-2 text-sm text-[#172339] placeholder:text-[#64748B]"
                  />
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setAgeSort((v) => (v === "desc" ? "asc" : "desc"))
                  }
                  className="rounded-lg border border-[#CBD5E1] px-3 py-2 text-sm text-[#334155]"
                >
                  Age: {ageSort === "desc" ? "oldest first" : "youngest first"}
                </button>

                <span className="text-sm text-[#52647B]">
                  {scopedRecords.length} search-matching records in this selected group
                </span>
              </div>

              <div className="print-evidence-table-wrap overflow-x-auto rounded-lg border border-[#DFE6F0]">
                <table className="print-evidence-table w-full min-w-[780px] text-left text-sm">
                  <thead className="bg-[#F4F7FB] text-xs text-[#52647B]">
                    <tr>
                      {[
                        "Lead ID",
                        "Date",
                        "Stage",
                        "Days in stage",
                        "Product",
                        "Source",
                        "Team",
                        "Location",
                        "Observed value*",
                      ].map((h) => (
                        <th
                          key={h}
                          scope="col"
                          className="whitespace-nowrap px-3 py-3 font-semibold"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {scopedRecords.slice(0, 25).map((lead) => (
                      <tr
                        key={lead.id}
                        className="border-t border-[#E7ECF3] hover:bg-[#F8FAFD]"
                      >
                        <td className="px-3 py-2 font-semibold text-[#345ED7]">
                          {lead.id}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2">
                          {lead.date}
                        </td>
                        <td className="px-3 py-2">{lead.stage}</td>
                        <td className="px-3 py-2 tabular-nums">
                          {lead.daysInStage}
                        </td>
                        <td className="px-3 py-2">{lead.product}</td>
                        <td className="px-3 py-2">{lead.source}</td>
                        <td className="px-3 py-2">{lead.team}</td>
                        <td className="px-3 py-2">{lead.location}</td>
                        <td className="px-3 py-2 tabular-nums">
                          {fmt(lead.value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-2 text-xs leading-5 text-[#52647B]">
                Showing up to 25 records at a time in this view. *Currency
                is unspecified. Search and age sort operate on the
                displayed selected group.
              </p>
            </div>
          )}
        </section>

        <section className="print-assistant-section rounded-2xl border border-[#DFE6F0] bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#345ED7]">
              Grounded explanation
            </p>
            <h2 className="mt-1 text-xl font-semibold">
              Ask about the approved demo results
            </h2>
            <p className="mt-1 text-sm text-[#52647B]">
              The existing demo assistant remains available. Its
              deterministic answer and evidence/fallback behavior are
              preserved.
            </p>
          </div>
          <DemoDataAssistant key={selectedFinding ? [selectedFinding.dimension, selectedFinding.group, selectedFinding.metric].join("-") : "default"} selectedFinding={selectedFinding} />
        </section>

        <footer className="flex flex-wrap justify-between gap-2 border-t border-[#DFE6F0] py-4 text-xs text-[#52647B]">
          <span>
            {summary.project} | {summary.data_version} | Method version 1.0.0
          </span>
          <span>
            Descriptive synthetic snapshot | no prediction or causal claims
          </span>
        </footer>
      </div>
    </main>
  );
}
