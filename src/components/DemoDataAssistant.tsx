
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

type SelectedFinding = {
  title: string;
  dimension: string;
  group: string;
  metric: string;
  summary: string;
  review: string;
};

type DemoDataAssistantProps = {
  selectedFinding?: SelectedFinding | null;
};

export default function DemoDataAssistant({
  selectedFinding = null,
}: DemoDataAssistantProps) {
  const [question, setQuestion] = useState(() => {
    if (!selectedFinding) return "";
    if (selectedFinding.metric === "average_days_in_stage") {
      return "Which stage has the highest average age?";
    }
    if (selectedFinding.dimension === "stage") {
      return "Which stage has the highest total lead value?";
    }
    if (selectedFinding.dimension === "product") {
      return "Which product has the highest total lead value?";
    }
    return "Which source has the highest total lead value?";
  });
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
        body: JSON.stringify({ question: submitted, selectedFinding }),
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
        "Unable to contact the demo Assistant. Check that the server is running.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-6 overflow-hidden rounded-2xl border border-[#DFE6F0] bg-white p-5 text-[#172B4D] shadow-sm md:p-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#52647B]">
          Phase 3 · Demo Intelligence
        </p>

        <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#172B4D] md:text-2xl">
          Grounded Demo Assistant
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#52647B]">
          Ask questions about the synthetic demo dataset. Answers use the
          phase3-demo-v1 analytical summary and include supporting evidence
          where available.
        </p>

        <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-wider">
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-medium text-emerald-800">
            Deterministic answers
          </span>

          <span className="rounded-full border border-[#DFE6F0] bg-[#F8FAFC] px-3 py-1.5 text-[#52647B]">
            Synthetic data · phase3-demo-v1
          </span>
        </div>
      </div>

      <form
        onSubmit={(event) => void submitQuestion(event)}
        className="space-y-3"
      >
        <label
          htmlFor="demo-assistant-question"
          className="block text-sm font-semibold text-[#334155]"
        >
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
          className="w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-3 text-sm leading-6 text-[#172B4D] outline-none placeholder:text-[#64748B] focus:border-[#345ED7] focus:ring-2 focus:ring-[#345ED7]/15 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p
            aria-live="polite"
            className="text-xs text-[#64748B]"
          >
            {question.length}/500 characters
          </p>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-[#345ED7] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2749B8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#345ED7] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Checking evidence..." : "Ask demo Assistant"}
          </button>
        </div>
      </form>

      <div>
        <h3 className="text-sm font-semibold text-[#172B4D]">
          Suggested questions
        </h3>

        <div className="mt-3 flex flex-wrap gap-2">
          {questions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={loading}
              onClick={() => void submitQuestion(undefined, suggestion)}
              className="rounded-full border border-[#DFE6F0] bg-white px-3 py-2 text-left text-xs text-[#334155] transition hover:border-[#345ED7] hover:bg-[#F1F5FF] hover:text-[#2749B8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#345ED7] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
        >
          {error}
        </div>
      )}

      {reply && (
        <div
          aria-live="polite"
          className="space-y-4 border-t border-[#DFE6F0] pt-5"
        >
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-800">
                {reply.status}
              </span>

              <span className="text-xs text-[#64748B]">
                {reply.metadata?.data_version ?? "Demo version"}
              </span>
            </div>

            <h3 className="mt-3 text-sm font-semibold text-[#172B4D]">
              Answer
            </h3>

            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[#334155]">
              {reply.answer}
            </p>
          </div>

          {reply.explanation ? (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
              <h3 className="text-sm font-semibold text-indigo-900">
                Gemini explanation
              </h3>

              <p className="mt-2 text-sm leading-7 text-[#334155]">
                {reply.explanation}
              </p>
            </div>
          ) : reply.explanation_status === "UNAVAILABLE" ? (
            <p className="text-xs leading-5 text-[#52647B]">
              Gemini explanation unavailable. The deterministic answer and
              supporting evidence remain available.
            </p>
          ) : null}

          {reply.evidence_references &&
            reply.evidence_references.length > 0 && (
              <div className="rounded-xl border border-[#DFE6F0] bg-[#F8FAFC] p-4">
                <h3 className="text-sm font-semibold text-[#172B4D]">
                  Supporting evidence
                </h3>

                <div className="mt-3 space-y-3">
                  {reply.evidence_references.map((evidence, index) => (
                    <div
                      key={`${evidence.source_id}-${index}`}
                      className="border-t border-[#DFE6F0] pt-3 first:border-0 first:pt-0"
                    >
                      <p className="text-sm leading-6 text-[#334155]">
                        {evidence.finding}
                      </p>

                      <p className="mt-1 break-all text-[10px] leading-5 text-[#64748B]">
                        Source: {evidence.source_id}
                        {evidence.metric
                          ? ` · Metric: ${evidence.metric}`
                          : ""}
                        {evidence.value !== undefined
                          ? ` · Value: ${evidence.value}`
                          : ""}
                        {evidence.unit ? ` ${evidence.unit}` : ""}
                      </p>

                      <p className="text-[10px] leading-5 text-[#64748B]">
                        Version: {evidence.data_version} · Method:{" "}
                        {evidence.method_version}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {reply.metadata && (
            <p className="break-words text-[10px] leading-5 text-[#64748B]">
              Assistant: {reply.metadata.assistant_id} · Mode:{" "}
              {reply.metadata.mode} · LLM enabled:{" "}
              {String(reply.metadata.llm_enabled)}
            </p>
          )}

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-900">
              Data limitation
            </p>

            <p className="mt-2 text-xs leading-6 text-[#52647B]">
              {reply.limitation ??
                "Synthetic snapshot data is descriptive and does not establish conversion rates or historical stage transitions."}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
