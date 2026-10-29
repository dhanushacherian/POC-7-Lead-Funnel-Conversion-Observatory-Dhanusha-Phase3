"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import type { CRMLead } from "@/types/crm";

type DemoCohortHeatmapProps = {
  data: CRMLead[];
};

const stages = [
  "Lead",
  "Qualified",
  "Opportunity",
  "Proposal",
  "Won",
  "Lost",
];

export default function DemoCohortHeatmap({
  data,
}: DemoCohortHeatmapProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = chartRef.current;
    if (!container) return;

    const chart = echarts.init(container);

    // Full year-month keys keep different years separate.
    const cohortKeys = Array.from(
      new Set(data.map((lead) => lead.date.slice(0, 7))
    ).values()).sort();

    const monthLabels = cohortKeys.map((key) => {
      const [year, month] = key.split("-").map(Number);
      const date = new Date(year, month - 1, 1);
      const monthName = date.toLocaleDateString("en-US", {
        month: "short",
      });
      return `${monthName} '${String(year).slice(-2)}`;
    });

    const heatmapData: [number, number, number][] = [];

    cohortKeys.forEach((key, monthIndex) => {
      const monthRecords = data.filter(
        (lead) => lead.date.slice(0, 7) === key
      );

      stages.forEach((stage, stageIndex) => {
        const count = monthRecords.filter(
          (lead) => lead.stage === stage
        ).length;

        const percentage = monthRecords.length
          ? Number(((count / monthRecords.length) * 100).toFixed(1))
          : 0;

        heatmapData.push([monthIndex, stageIndex, percentage]);
      });
    });

    const option: echarts.EChartsOption = {
      backgroundColor: "transparent",
      tooltip: {
        position: "top",
        backgroundColor: "rgba(7, 9, 18, 0.96)",
        borderColor: "rgba(255,255,255,0.1)",
        textStyle: { color: "#ffffff" },
        formatter: (params: unknown) => {
          const item = params as {
            value: [number, number, number];
          };
          const [monthIndex, stageIndex, percentage] = item.value;
          return `<strong>${monthLabels[monthIndex]} - ${stages[stageIndex]}</strong><br/>${percentage}% of that month's records`;
        },
      },
      grid: {
        left: "10%",
        right: "2%",
        top: "8%",
        bottom: "23%",
      },
      xAxis: {
        type: "category",
        data: monthLabels,
        axisLabel: {
          color: "#475569",
          fontSize: 8,
          rotate: 35,
          hideOverlap: true,
        },
        axisLine: {
          lineStyle: { color: "rgba(255,255,255,0.08)" },
        },
      },
      yAxis: {
        type: "category",
        data: stages,
        axisLabel: { color: "#475569" },
        axisLine: {
          lineStyle: { color: "rgba(255,255,255,0.08)" },
        },
      },
      visualMap: {
        min: 0,
        max: 100,
        calculable: false,
        orient: "horizontal",
        left: "center",
        bottom: "0%",
        textStyle: { color: "rgba(255,255,255,0.45)" },
      },
      series: [
        {
          name: "Current-stage distribution",
          type: "heatmap",
          data: heatmapData,
          label: {
            show: true,
            color: "#1e293b",
            fontSize: 8,
            formatter: (params: unknown) => {
              const item = params as {
                value: [number, number, number];
              };
              return `${item.value[2]}%`;
            },
          },
          itemStyle: {
            borderColor: "rgba(7,9,18,0.8)",
            borderWidth: 2,
            borderRadius: 3,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 12,
              shadowColor: "rgba(124,140,255,0.3)",
            },
          },
        },
      ],
    };

    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
    };
  }, [data]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-indigo-700">
          Cohort Signal
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
          Monthly Lead Cohort Stage Distribution
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Current-stage distribution by lead creation month; not a transition history.
        </p>
      </div>

      <div
        ref={chartRef}
        className="h-[420px] w-full md:h-[460px]"
        aria-label="Monthly lead cohort stage distribution including Lost"
      />

      <div className="border-t border-slate-200 pt-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600">
          Synthetic demonstration data ? Percentages show the stage distribution within each month
        </p>
      </div>
    </section>
  );
}
