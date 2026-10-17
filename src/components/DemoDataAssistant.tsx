"use client";

import { useState, type FormEvent } from "react";

type EvidenceReference = {
  source_id: string;
  source_type: string;
  group?: string;
  metric?: string;
  value?: number;
  unit?: string;
  finding: string;
  data_version: string;
  method_version: string;
  generated_at: string;
  quality_status: string;
  limitation: string;
};

type DemoReply = {
  status: string;
  answer: string;
  explanation?: string | null;
  explanation_status?: string;
  evidence_references?: EvidenceReference[];
  metadata?: {
    assistant_id: string;
    assistant_version: string;
    mode: string;
    llm_enabled: boolean;
    data_version: string;
    method_version: string;
    quality_status: string;
    generated_at: string;
  };
  limitation?: string | null;
};

const questions = [
  "What is the approved summary?",
  "Which stage has the highest total lead value?",
  "Which product has the highest total lead value?",
  "Which acquisition source has the highest total lead value?",
  "Compare Won and Lost stages.",
  "Which stage has the highest average age?",
  "What are the limitations?",
  "What data version is being used?",
];

export default function DemoDataAssistant() {
  const [question, setQuestion] = useState("");
  const [reply, setReply] = useState<DemoReply | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submitQuestion(
    event?: FormEvent<HTMLFormElement>,
    suggested?: string,
  ) {
    event?.preventDefault();

    const submitted = (suggested ?? question).trim();

    if (!submitted) {
      setError("Enter a question or choose one of the suggestions.");
      return;
    }

    if (submitted.length > 500) {
      setError("Questions must be 500 characters or fewer.");
      return;
    }

    setQuestion(submitted);
    setLoading(true);
    setError("");
    setReply(null);

    try {
      const response = await fetch("/api/demo/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: submitted }),
      });

      const data = (await response.json()) as DemoReply;

      if (!data || typeof data.answer !== "string") {
        throw new Error("The demo Assistant returned an invalid response.");
      }

      setReply(data);

      if (!response.ok) {
        setError(data.answer);
      }
    } catch {
      setError(
        "Unable to contact the demo Assistant. Check that the development server is running.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-6 overflow-hidden rounded-2xl border border-indigo-300/15 bg-white/[0.025] p-5 shadow-2xl backdrop-blur-xl md:p-6">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-indigo-300/60">
          Phase 3 · Demo Intelligence
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-white md:text-2xl">
          Grounded Demo Assistant
        </h2>
        <p className="mt-2 text-sm leading-6 text-white/50">
          Ask questions about the synthetic demo dataset. Answers use the
          phase3-demo-v1 analytical summary and include supporting evidence
          where available.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-wider">
          <span className="rounded-full border border-emerald-300/20 bg-emerald-300/[0.06] px-3 py-1.5 text-emerald-200/80">
            Deterministic answers
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-white/50">
            Synthetic data · phase3-demo-v1
          </span>
        </div>
      </div>

      <form onSubmit={(event) => void submitQuestion(event)} className="space-y-3">
        <label htmlFor="demo-assistant-question" className="block text-sm font-medium text-white/80">
          Your question
        </label>
        <textarea
          id="demo-assistant-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Ask about the demo summary, product value, stage age, or limitations..."
          disabled={loading}
          className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-indigo-300/40 focus:ring-2 focus:ring-indigo-300/10 disabled:opacity-50"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-white/35">{question.length}/500 characters</p>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl border border-indigo-300/20 bg-indigo-300/[0.12] px-4 py-2.5 text-sm font-medium text-indigo-100 transition hover:bg-indigo-300/[0.2] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Checking evidence..." : "Ask demo Assistant"}
          </button>
        </div>
      </form>

      <div>
        <h3 className="text-sm font-semibold text-white/75">Suggested questions</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {questions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={loading}
              onClick={() => void submitQuestion(undefined, suggestion)}
              className="rounded-full border border-white/10 bg-white/[0.025] px-3 py-2 text-left text-xs text-white/55 transition hover:border-indigo-300/25 hover:bg-indigo-300/[0.06] hover:text-white disabled:opacity-40"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-300/15 bg-rose-300/[0.05] p-3 text-sm text-rose-200/80">
          {error}
        </div>
      )}

      {reply && (
        <div aria-live="polite" className="space-y-4 border-t border-white/10 pt-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-emerald-300/20 bg-emerald-300/[0.06] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-200">
                {reply.status}
              </span>
              <span className="text-xs text-white/35">
                {reply.metadata?.data_version ?? "Demo version"}
              </span>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-white/75">Answer</h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-white/75">
              {reply.answer}
            </p>
          </div>

          {reply.evidence_references && reply.evidence_references.length > 0 && (
            <div className="rounded-xl border border-white/[0.08] bg-black/10 p-4">
              <h3 className="text-sm font-semibold text-white/75">Supporting evidence</h3>
              <div className="mt-3 space-y-3">
                {reply.evidence_references.map((evidence, index) => (
                  <div key={`${evidence.source_id}-${index}`} className="border-t border-white/[0.07] pt-3 first:border-0 first:pt-0">
                    <p className="text-sm text-white/70">{evidence.finding}</p>
                    <p className="mt-1 break-all text-[10px] leading-5 text-white/35">
                      Source: {evidence.source_id}
                      {evidence.metric ? ` · Metric: ${evidence.metric}` : ""}
                      {evidence.value !== undefined ? ` · Value: ${evidence.value}` : ""}
                      {evidence.unit ? ` ${evidence.unit}` : ""}
                    </p>
                    <p className="text-[10px] text-white/30">
                      Version: {evidence.data_version} · Method: {evidence.method_version}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reply.metadata && (
            <p className="text-[10px] leading-5 text-white/35">
              Assistant: {reply.metadata.assistant_id} · Mode: {reply.metadata.mode}
              {" · LLM enabled: "}
              {String(reply.metadata.llm_enabled)}
            </p>
          )}

          <div className="rounded-xl border border-amber-200/10 bg-amber-100/[0.025] p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-100/65">
              Data limitation
            </p>
            <p className="mt-2 text-xs leading-6 text-white/50">
              {reply.limitation ??
                "Synthetic snapshot data is descriptive and does not establish conversion rates or historical stage transitions."}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
