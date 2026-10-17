"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";

import type { CRMLead } from "@/types/crm";


type StageAgingProps = {
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

export default function DemoStageAging({ data }: StageAgingProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);

    const values = stages.map((stage) => {
      const records = data.filter((lead) => lead.stage === stage);
      if (records.length === 0) return 0;

      const totalAge = records.reduce(
        (sum, lead) => sum + lead.daysInStage,
        0
      );

      return Number((totalAge / records.length).toFixed(1));
    });

    const option: echarts.EChartsOption = {
      backgroundColor: "transparent",

      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        backgroundColor: "rgba(7, 9, 18, 0.96)",
        borderColor: "rgba(255,255,255,0.1)",
        textStyle: {
          color: "#ffffff",
        },
        formatter: (params: unknown) => {
          const items = params as {
            name: string;
            value: number;
          }[];

          const item = items[0];

          return `
            <div style="font-weight:600">
              ${item.name}
            </div>
            <div style="margin-top:4px;opacity:.7">
              Average age: ${item.value} days
            </div>
          `;
        },
      },

      grid: {
        left: "8%",
        right: "5%",
        top: "10%",
        bottom: "15%",
        containLabel: true,
      },

      xAxis: {
        type: "category",
        data: stages,

        axisLabel: {
          color: "rgba(255,255,255,0.5)",
          fontSize: 11,
        },

        axisLine: {
          lineStyle: {
            color: "rgba(255,255,255,0.08)",
          },
        },
      },

      yAxis: {
        type: "value",

        name: "Days",
        nameTextStyle: {
          color: "rgba(255,255,255,0.3)",
        },

        axisLabel: {
          color: "rgba(255,255,255,0.4)",
        },

        splitLine: {
          lineStyle: {
            color: "rgba(255,255,255,0.06)",
          },
        },
      },

      series: [
        {
          name: "Average Stage Age",
          type: "bar",
          data: values,

          barMaxWidth: 46,

          label: {
            show: true,
            position: "top",
            color: "rgba(255,255,255,0.65)",
            fontSize: 11,
            formatter: "{c}d",
          },

          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            opacity: 0.85,
          },

          emphasis: {
            itemStyle: {
              opacity: 1,
              shadowBlur: 20,
              shadowColor: "rgba(124,140,255,0.3)",
            },
          },
        },
      ],
    };

    chart.setOption(option);

    const handleResize = () => {
      chart.resize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
    };
  }, [data]);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 shadow-2xl backdrop-blur-xl md:p-6">
      <div className="mb-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-indigo-300/50">
            Bottleneck Signal
          </p>

          <h2 className="mt-2 text-xl font-semibold tracking-tight text-white md:text-2xl">
            Stage Aging
          </h2>

          <p className="mt-1 text-sm text-white/40">
            Average recorded age of leads currently in each stage
          </p>
        </div>

        <div className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5">
          <span className="text-[10px] uppercase tracking-wider text-white/35">
            Aging Analysis
          </span>
        </div>
      </div>

      <div
        ref={chartRef}
        className="h-[380px] w-full md:h-[420px]"
        aria-label="Average stage aging chart"
      />

      <div className="border-t border-white/[0.06] pt-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
          Synthetic demo data - descriptive age by current stage; not a transition history
        </p>
      </div>
    </div>
  );
}