"use client";

import type { CRMLead } from "@/types/crm";

type DemoKPISectionProps = {
  data: CRMLead[];
};

const numberFormat = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

export default function DemoKPISection({ data }: DemoKPISectionProps) {
  const totalLeads = data.length;
  const opportunities = data.filter(
    (lead) => lead.stage === "Opportunity"
  ).length;
  const wonLeads = data.filter((lead) => lead.stage === "Won");
  const wonShare = totalLeads
    ? (wonLeads.length / totalLeads) * 100
    : 0;
  const averageAge = totalLeads
    ? data.reduce((sum, lead) => sum + lead.daysInStage, 0) / totalLeads
    : 0;
  const wonValue = wonLeads.reduce((sum, lead) => sum + lead.value, 0);

  const kpis = [
    {
      label: "Total Leads",
      value: numberFormat.format(totalLeads),
      description: "Synthetic CRM records",
    },
    {
      label: "Opportunity Stage",
      value: numberFormat.format(opportunities),
      description: "Records currently in Opportunity",
    },
    {
      label: "Won Stage",
      value: numberFormat.format(wonLeads.length),
      description: "Records currently in Won",
    },
    {
      label: "Won Share of Snapshot",
      value: `${wonShare.toFixed(1)}%`,
      description: "Share currently in Won; not a conversion rate",
    },
    {
      label: "Average Stage Age",
      value: `${averageAge.toFixed(1)} days`,
      description: "Mean recorded age across current-stage records",
    },
    {
      label: "Won Lead Value",
      value: numberFormat.format(wonValue),
      description: "Currency not specified in the dataset",
    },
  ];

  return (
    <section className="grid min-w-0 grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 xl:grid-cols-6">
      {kpis.map((kpi, index) => (
        <div
          key={kpi.label}
          className="group relative min-w-0 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.035] p-2 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-indigo-300/20 hover:bg-white/[0.055] sm:p-3"
        >
          <div className="absolute right-0 top-0 h-16 w-16 rounded-full bg-indigo-400/[0.04] blur-2xl transition duration-300 group-hover:bg-indigo-400/[0.10]" />
          <div className="relative">
            <div className="flex items-center justify-between gap-2">
              <p className="break-words text-[9px] font-medium uppercase tracking-[0.08em] text-white/60 sm:text-[10px] sm:tracking-[0.15em]">
                {kpi.label}
              </p>
              <span className="text-[10px] text-white/25">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <p
              className="mt-2 break-words text-lg font-semibold tracking-tight text-white sm:truncate sm:text-2xl"
              title={kpi.value}
            >
              {kpi.value}
            </p>
            <p className="mt-1 break-words text-[10px] leading-4 text-white/70 sm:text-[11px]">
              {kpi.description}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
