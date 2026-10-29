"use client";
import Link from "next/link";

import { useMemo, useState } from "react";

import { downloadCSV, downloadJSON } from "@/lib/download";

import DemoCohortHeatmap from "@/components/DemoCohortHeatmap";
import FilterBar from "@/components/FilterBar";
import DemoStageDistribution from "@/components/DemoStageDistribution";
import DemoProductStageMix from "@/components/DemoProductStageMix";
import DemoKPISection from "@/components/DemoKPISection";
import MetadataModal from "@/components/MetadataModal";
import DemoStageAging from "@/components/DemoStageAging";
import DemoDataAssistant from "@/components/DemoDataAssistant";

import {
  demoCrmData as crmData,
  demoLocations as locations,
  demoProducts as products,
  demoTeams as teams,
} from "@/data/demoCrmData";

export default function Home() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("All");
  const [team, setTeam] = useState("All");
  const [product, setProduct] = useState("All");

  const [isMetadataOpen, setIsMetadataOpen] =
    useState(false);

  const filteredData = useMemo(() => {
    return crmData.filter((lead) => {
      const matchesStartDate =
        !startDate || lead.date >= startDate;

      const matchesEndDate =
        !endDate || lead.date <= endDate;

      const matchesLocation =
        location === "All" ||
        lead.location === location;

      const matchesTeam =
        team === "All" ||
        lead.team === team;

      const matchesProduct =
        product === "All" ||
        lead.product === product;

      return (
        matchesStartDate &&
        matchesEndDate &&
        matchesLocation &&
        matchesTeam &&
        matchesProduct
      );
    });
  }, [
    startDate,
    endDate,
    location,
    team,
    product,
  ]);

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setLocation("All");
    setTeam("All");
    setProduct("All");
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-[#172B4D]">

      {/* Atmospheric Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

        <div className="absolute left-1/2 top-[-300px] h-[700px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-500/[0.07] blur-[140px]" />

        <div className="absolute bottom-[-300px] right-[-200px] h-[600px] w-[600px] rounded-full bg-violet-500/[0.05] blur-[140px]" />

        <div className="absolute left-[-200px] top-[40%] h-[500px] w-[500px] rounded-full bg-slate-500/[0.04] blur-[130px]" />

      </div>

      {/* LeadScope sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden md:block w-56 flex-col bg-[#142844] px-5 py-6 text-white md:flex">
        <Link href="/demo" className="text-xl font-bold tracking-tight">
          LeadScope <span className="text-blue-400">◆</span>
        </Link>
        <p className="mt-1 text-xs text-slate-300">Conversion Observatory</p>

        <nav aria-label="Main navigation" className="mt-8 space-y-2">
          <Link href="/demo" className="flex items-center rounded-lg bg-blue-700 px-3 py-3 text-sm font-semibold text-white">
            <span className="mr-3" aria-hidden="true">▦</span> Overview
          </Link>
          <Link href="/demo/data-intelligence" className="flex items-center rounded-lg px-3 py-3 text-sm text-slate-200 transition hover:bg-white/10">
            <span className="mr-3" aria-hidden="true">◈</span> Data Intelligence
          </Link>
          <a href="#demo-assistant" className="flex items-center rounded-lg px-3 py-3 text-sm text-slate-200 transition hover:bg-white/10">
            <span className="mr-3" aria-hidden="true">✦</span> Ask Assistant
          </a>
        </nav>

        <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs font-semibold text-white">Synthetic dataset</p>
          <p className="mt-1 text-xs text-slate-300">phase3-demo-v1</p>
          <p className="mt-2 text-xs text-emerald-300">● 600 synthetic leads</p>
        </div>
      </aside>
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#070912]/80 backdrop-blur-2xl">

        <div className="mx-auto flex w-full min-w-0 max-w-[1600px] flex-wrap items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4 sm:py-3 sm:flex-nowrap sm:justify-between md:px-6 lg:px-8 md:ml-56 md:w-[calc(100%_-_14rem)]">

          <div className="min-w-0 flex-1 basis-full sm:basis-auto">

            <div className="flex items-center gap-3">

              <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.7)]" />

              <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-white/35">
                Infocreon Internship
              </p>

            </div>

            <h1 className="mt-2 break-words break-words text-base font-semibold leading-tight tracking-tight text-white sm:truncate sm:text-2xl">
              Lead Funnel Conversion Observatory
            </h1>

            <p className="mt-1 hidden text-xs text-white/35 sm:block">
              Lead value and stage aging | monthly activity
            </p>

          </div>

          <Link href="/demo/data-intelligence" className="inline-flex shrink-0 whitespace-nowrap rounded-xl border border-indigo-300/20 bg-indigo-300/[0.06] px-2 py-2 text-[11px] font-medium text-indigo-100/80 transition hover:bg-indigo-300/[0.12] hover:text-white sm:px-3 sm:text-xs">Demo Data Intelligence</Link>
          <button
            type="button"
            onClick={() => setIsMetadataOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-sm font-medium text-white/60 transition hover:border-white/[0.15] hover:bg-white/[0.07] hover:text-white"
            aria-label="Open developer information"
          >
            i
          </button>

        </div>

      </header>

      {/* Main */}
      <main data-demo-ui="true" className="relative mx-auto min-h-screen w-full max-w-[1600px] overflow-x-clip px-3 py-3 sm:px-4 sm:py-3 lg:px-6 md:ml-56 md:w-[calc(100%_-_14rem)]">

        {/* Observatory Source */}
        <section className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">

          <div>

            <p className="text-[10px] uppercase tracking-wide text-slate-500">
              Observatory Source
            </p>

            <p className="text-sm font-medium text-slate-800">
              Synthetic Demo Dataset | phase3-demo-v1
            </p>

            <p className="text-xs text-slate-600">
              600 synthetic leads | 12 months | not real customer data
            </p>

          </div>

          <div className="flex items-center gap-2 self-start rounded-full border border-emerald-300/[0.12] bg-emerald-300/[0.04] px-3 py-1.5 md:self-auto">

            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

            <span className="text-[10px] uppercase tracking-wider text-emerald-200/60">
              Data Ready
            </span>

          </div>

        </section>

        {/* Filters */}
        {/* Filters */}
        <FilterBar
          startDate={startDate}
          endDate={endDate}
          location={location}
          team={team}
          product={product}
          locations={locations}
          teams={teams}
          products={products}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onLocationChange={setLocation}
          onTeamChange={setTeam}
          onProductChange={setProduct}
          onReset={resetFilters}
        />

        {/* KPI Section */}
        <section className="mt-3">
          <DemoKPISection data={filteredData} />
        </section>

        {/* Primary charts */}
        <section className="print-primary-charts mt-3 grid min-w-0 items-stretch gap-3 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="min-w-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3">
            <DemoStageDistribution data={filteredData} />
          </div>
          <div className="min-w-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3">

            <DemoProductStageMix data={filteredData} />
          </div>
        </section>
{/* Active Scope */}
        <div className="mt-2 flex flex-wrap items-center gap-2">

          <span className="text-[10px] uppercase tracking-[0.25em] text-white/25">
            Active Scope
          </span>

          <span className="rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1 text-[10px] text-white/40">
            {filteredData.length} records
          </span>

          {location !== "All" && (
            <span className="rounded-full border border-indigo-300/[0.12] bg-indigo-300/[0.04] px-3 py-1 text-[10px] text-indigo-200/60">
              Location: {location}
            </span>
          )}

          {team !== "All" && (
            <span className="rounded-full border border-indigo-300/[0.12] bg-indigo-300/[0.04] px-3 py-1 text-[10px] text-indigo-200/60">
              Team: {team}
            </span>
          )}

          {product !== "All" && (
            <span className="rounded-full border border-indigo-300/[0.12] bg-indigo-300/[0.04] px-3 py-1 text-[10px] text-indigo-200/60">
              Product: {product}
            </span>
          )}

          {(startDate || endDate) && (
            <span className="rounded-full border border-indigo-300/[0.12] bg-indigo-300/[0.04] px-3 py-1 text-[10px] text-indigo-200/60">
              Date range active
            </span>
          )}

        </div>

        {/* Data Export */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">

          <div>

            <p className="text-[10px] uppercase tracking-[0.25em] text-white/25">
              Data Export
            </p>

            <p className="text-xs text-slate-600">
              Download the currently filtered CRM records
            </p>

          </div>

          <div className="flex gap-2">

            <button
              type="button"
              onClick={() => downloadCSV(filteredData)}
              className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/60 transition hover:border-white/[0.15] hover:bg-white/[0.08] hover:text-white"
            >
              Download CSV
            </button>

            <button
              type="button"
              onClick={() => downloadJSON(filteredData)}
              className="rounded-xl border border-indigo-300/[0.12] bg-indigo-300/[0.05] px-4 py-2 text-xs font-medium text-indigo-100/70 transition hover:border-indigo-300/[0.25] hover:bg-indigo-300/[0.10] hover:text-white"
            >
              Download JSON
            </button>

          </div>

        </div>

        {/* Secondary Visualizations */}
        <section className="print-secondary-charts mt-4 grid min-w-0 items-stretch gap-3 lg:grid-cols-2">
          <div className="min-w-0">
            <DemoCohortHeatmap data={filteredData} />
          </div>
          <div className="min-w-0">
            <DemoStageAging data={filteredData} />
          </div>
        </section>
        {/* Demo Grounded Assistant */}
        <section id="demo-assistant" className="mt-3">
          <DemoDataAssistant />
        </section>
        {/* Footer */}
        <footer className="mt-10 border-t border-white/[0.06] py-6">

          <div className="flex flex-col justify-between gap-2 text-[10px] uppercase tracking-[0.2em] text-white/20 sm:flex-row">

            <span>
              Lead Funnel Conversion Observatory | PoC-7
            </span>

            <span>
              Synthetic Data | Decision Support Interface
            </span>

          </div>

        </footer>

      </main>

      {/* Developer Metadata */}
      <MetadataModal
        isOpen={isMetadataOpen}
        onClose={() =>
          setIsMetadataOpen(false)
        }
      />

    </div>
  );
}
