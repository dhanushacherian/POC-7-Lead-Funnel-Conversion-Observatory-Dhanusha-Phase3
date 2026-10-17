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

export default function DemoProductStageMix({ data }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = chartRef.current;
    if (!container) return;

    const chart = echarts.init(container);
    const products = [...new Set(data.map((lead) => lead.product))].sort();

    const option: echarts.EChartsOption = {
      backgroundColor: "transparent",
      color: ["#7d92ee", "#62b6a7", "#e6b567", "#a98be8", "#5ca7e8", "#d87989"],
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: "rgba(7, 9, 18, 0.96)",
        borderColor: "rgba(255,255,255,0.1)",
        textStyle: { color: "#ffffff" },
      },
      legend: {
        bottom: 0,
        textStyle: { color: "rgba(255,255,255,0.6)" },
        itemWidth: 10,
        itemHeight: 10,
      },
      grid: {
        left: "3%",
        right: "4%",
        top: "8%",
        bottom: "18%",
        containLabel: true,
      },
      xAxis: {
        type: "value",
        min: 0,
        name: "Lead count",
        nameTextStyle: { color: "rgba(255,255,255,0.45)" },
        axisLabel: { color: "rgba(255,255,255,0.5)" },
        splitLine: {
          lineStyle: { color: "rgba(255,255,255,0.06)" },
        },
      },
      yAxis: {
        type: "category",
        data: products,
        axisLabel: { color: "rgba(255,255,255,0.65)" },
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
      },
      series: stages.map((stage) => ({
        name: stage,
        type: "bar",
        stack: "current-stage",
        emphasis: { focus: "series" },
        data: products.map(
          (product) =>
            data.filter(
              (lead) => lead.product === product && lead.stage === stage
            ).length
        ),
      })),
    };

    chart.setOption(option);

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
          Product Intelligence
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-white md:text-2xl">
          Current-Stage Mix by Product
        </h2>
        <p className="mt-1 text-sm text-white/45">
          Compares current lead counts across products and stages.
        </p>
      </div>

      <div
        ref={chartRef}
        className="h-[400px] w-full md:h-[450px]"
        aria-label="Current-stage lead counts by product"
      />

      <div className="border-t border-white/[0.06] pt-3">
        <p className="text-[10px] uppercase tracking-[0.16em] text-white/30">
          Synthetic snapshot · Descriptive counts only, not stage transitions
        </p>
      </div>
    </section>
  );
}
