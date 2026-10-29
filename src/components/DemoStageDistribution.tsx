"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import type { CRMLead, LeadStage } from "@/types/crm";

type Props = {
  data: CRMLead[];
};

const stages: LeadStage[] = [
  "Lead",
  "Qualified",
  "Opportunity",
  "Proposal",
  "Won",
  "Lost",
];

export default function DemoStageDistribution({ data }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = chartRef.current;
    if (!container) return;

    const chart = echarts.init(container);

    const counts = stages.map(
      (stage) => data.filter((lead) => lead.stage === stage).length
    );

    chart.setOption({
      backgroundColor: "transparent",
      grid: {
        left: "12%",
        right: "8%",
        top: "5%",
        bottom: "28%",
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: "rgba(7, 9, 18, 0.96)",
        borderColor: "rgba(255,255,255,0.1)",
        textStyle: { color: "#ffffff" },
        formatter: (params: unknown) => {
          const item = (params as { name: string; value: number }[])[0];
          return `<strong>${item.name}</strong><br/>${item.value} leads in this stage`;
        },
      },
      xAxis: {
        type: "value",
        min: 0,
        name: "Lead count",
        nameTextStyle: { color: "#475569" },
        axisLabel: { color: "#475569" },
        axisLine: { lineStyle: { color: "#cbd5e1" } },
        splitLine: {
          lineStyle: { color: "#e2e8f0" },
        },
      },
      yAxis: {
        type: "category",
        inverse: true,
        data: stages,
        axisLabel: { color: "#334155" },
        axisLine: { lineStyle: { color: "#cbd5e1" } },
      },
      series: [
        {
          name: "Current-stage lead count",
          type: "bar",
          data: counts,
          barMaxWidth: 32,
          label: {
            show: true,
            position: "right",
            color: "#334155",
          },
          itemStyle: {
            color: "#647ee8",
            borderRadius: [0, 5, 5, 0],
            opacity: 0.9,
          },
          emphasis: { itemStyle: { opacity: 1 } },
        },
      ],
    });

    const resize = () => chart.resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      chart.dispose();
    };
  }, [data]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 md:p-6">
      <div className="mb-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-indigo-300/50">
          Primary Signal
        </p>
        <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-800 md:text-2xl">
          Current-Stage Distribution
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Count of synthetic leads currently recorded in each stage.
        </p>
      </div>

      <div
        ref={chartRef}
        className="h-[300px] w-full sm:h-[340px] md:h-[460px]"
        aria-label="Current-stage distribution for six lead stages"
      />

      <div className="border-t border-white/[0.06] pt-3">
        <p className="text-[10px] uppercase tracking-[0.12em] text-slate-600">
          Synthetic demonstration data · Snapshot counts, not transition history or conversion rates
        </p>
      </div>
    </section>
  );
}
