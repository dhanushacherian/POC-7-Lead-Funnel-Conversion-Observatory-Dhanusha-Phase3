import Link from "next/link";
import rawSummary from "../../../../data/demo/phase3-demo-v1/analytics/intelligence_summary.json";

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

type DemoSummary = {
  project: string;
  edition: string;
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
    highest_value_stage: { stage: string; total_lead_value: number };
    highest_value_product: { product: string; total_lead_value: number };
    highest_value_source: { source: string; total_lead_value: number };
    highest_average_age_stage: {
      stage: string;
      average_days_in_stage: number;
    };
  };
  dimensions: {
    stage: MetricRow[];
    product: MetricRow[];
    source: MetricRow[];
    team: MetricRow[];
    location: MetricRow[];
  };
  interpretation: string[];
  limitations: string[];
};

const summary = rawSummary as DemoSummary;

const numberFormat = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
});

function formatNumber(value: number) {
  return numberFormat.format(value);
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
      <p className="text-xs uppercase tracking-wider text-white/45">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-white/45">{detail}</p>
    </div>
  );
}

function DimensionTable({
  title,
  labelKey,
  rows,
}: {
  title: string;
  labelKey: "stage" | "product" | "source" | "team" | "location";
  rows: MetricRow[];
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
      <div className="border-b border-white/10 px-5 py-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm text-white/45">
          Descriptive comparison of the synthetic current-stage snapshot.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="bg-white/[0.035] text-xs uppercase tracking-wider text-white/45">
            <tr>
              <th className="px-5 py-3">Group</th>
              <th className="px-4 py-3 text-right">Leads</th>
              <th className="px-4 py-3 text-right">Total value*</th>
              <th className="px-4 py-3 text-right">Average age</th>
              <th className="px-4 py-3 text-right">Median age</th>
              <th className="px-5 py-3 text-right">Value share</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={String(row[labelKey])}
                className="border-t border-white/[0.06] text-white/75"
              >
                <td className="px-5 py-3 font-medium text-white">
                  {row[labelKey]}
                </td>
                <td className="px-4 py-3 text-right">
                  {formatNumber(row.lead_count)}
                </td>
                <td className="px-4 py-3 text-right">
                  {formatNumber(row.total_lead_value)}
                </td>
                <td className="px-4 py-3 text-right">
                  {formatNumber(row.average_days_in_stage)} days
                </td>
                <td className="px-4 py-3 text-right">
                  {formatNumber(row.median_days_in_stage)} days
                </td>
                <td className="px-5 py-3 text-right">
                  {formatNumber(row.value_share_percent)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function DemoDataIntelligencePage() {
  const dimensions = [
    { title: "Stage Comparison", labelKey: "stage" as const, rows: summary.dimensions.stage },
    { title: "Product Comparison", labelKey: "product" as const, rows: summary.dimensions.product },
    { title: "Acquisition Source Comparison", labelKey: "source" as const, rows: summary.dimensions.source },
    { title: "Team Comparison", labelKey: "team" as const, rows: summary.dimensions.team },
    { title: "Location Comparison", labelKey: "location" as const, rows: summary.dimensions.location },
  ];

  return (
    <main className="min-h-screen bg-[#080a12] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="space-y-5">
          <Link
            href="/demo"
            className="inline-flex text-sm text-indigo-300 transition hover:text-indigo-200"
          >
            ← Back to Demo Dashboard
          </Link>

          <div className="rounded-2xl border border-amber-300/20 bg-amber-200/[0.05] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
              Synthetic demonstration data
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Demo Data Intelligence
            </h1>
            <p className="mt-2 text-sm leading-6 text-white/65">
              {summary.dataset_classification}
            </p>
            <p className="mt-3 text-xs text-white/45">
              Version: {summary.data_version} · Seed: {summary.random_seed} ·
              Observation window: {summary.observation_window.start} to{" "}
              {summary.observation_window.end}
            </p>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            label="Source Leads"
            value={formatNumber(summary.overall_summary.source_leads_analyzed)}
            detail="Unique synthetic source leads"
          />
          <MetricCard
            label="Canonical Rows"
            value={formatNumber(summary.overall_summary.canonical_rows_processed)}
            detail="Value and days-in-stage records"
          />
          <MetricCard
            label="Total Observed Value*"
            value={formatNumber(summary.overall_summary.total_lead_value)}
            detail="Currency is unspecified"
          />
          <MetricCard
            label="Average Lead Value*"
            value={formatNumber(summary.overall_summary.average_lead_value)}
            detail="Per source lead"
          />
          <MetricCard
            label="Mean Current-Stage Age"
            value={`${formatNumber(summary.overall_summary.average_days_in_stage)} days`}
            detail="Across current-stage records"
          />
          <MetricCard
            label="Median Current-Stage Age"
            value={`${formatNumber(summary.overall_summary.median_days_in_stage)} days`}
            detail="Across current-stage records"
          />
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <h2 className="text-xl font-semibold">Key Observations</h2>
          <p className="mt-1 text-sm text-white/45">
            Descriptive findings within this generated sample only.
          </p>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-6 text-white/75">
            {summary.interpretation.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold">Comparison Tables</h2>
            <p className="mt-1 text-sm text-white/45">
              Group metrics derived from the demo analytical outputs.
            </p>
          </div>
          {dimensions.map((dimension) => (
            <DimensionTable
              key={dimension.title}
              title={dimension.title}
              labelKey={dimension.labelKey}
              rows={dimension.rows}
            />
          ))}
        </section>

        <section className="rounded-2xl border border-amber-200/15 bg-amber-100/[0.035] p-5">
          <h2 className="text-xl font-semibold">Interpretation and Limitations</h2>
          <p className="mt-2 text-sm leading-6 text-white/60">
            *Value metrics use currency-unspecified units. They should not be
            interpreted as a particular currency.
          </p>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-6 text-white/70">
            {summary.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-5 text-white/45">
            These data are synthetic and are not evidence of actual customer
            behaviour or business outcomes. Current-stage counts do not
            establish conversion rates, stage transitions, causation,
            seasonality, or future performance.
          </p>
        </section>

        <footer className="border-t border-white/10 py-5 text-xs text-white/35">
          {summary.project} · {summary.data_version} · Expanded demo edition ·{" "}
          {summary.observation_window.calendar_months} calendar months
        </footer>
      </div>
    </main>
  );
}

