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
        bottom: "8%",
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
        nameTextStyle: { color: "rgba(255,255,255,0.45)" },
        axisLabel: { color: "rgba(255,255,255,0.5)" },
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
        splitLine: {
          lineStyle: { color: "rgba(255,255,255,0.06)" },
        },
      },
      yAxis: {
        type: "category",
        inverse: true,
        data: stages,
        axisLabel: { color: "rgba(255,255,255,0.65)" },
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
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
            color: "rgba(255,255,255,0.75)",
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
    <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 shadow-2xl backdrop-blur-xl md:p-6">
      <div className="mb-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-indigo-300/50">
          Primary Signal
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-white md:text-2xl">
          Current-Stage Distribution
        </h2>
        <p className="mt-1 text-sm text-white/45">
          Count of synthetic leads currently recorded in each stage.
        </p>
      </div>

      <div
        ref={chartRef}
        className="h-[420px] w-full md:h-[460px]"
        aria-label="Current-stage distribution for six lead stages"
      />

      <div className="border-t border-white/[0.06] pt-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
          Synthetic demonstration data · Snapshot counts, not transition history or conversion rates
        </p>
      </div>
    </section>
  );
}
