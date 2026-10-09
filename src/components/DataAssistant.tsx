
"use client";

import { useState, type FormEvent } from "react";

type EvidenceReference = {
  source_id: string;
  source_type: string;
  result_id?: string;
  group?: string;
  metric?: string;
  value?: number;
  unit?: string;
  finding?: string;
  data_version: string;
  method_version: string;
  generated_at: string;
  quality_status?: string;
  limitation?: string;
};

type AssistantReply = {
  answer_id?: string;
  status: string;
  intent?: string | null;
  answer: string;
  evidence_references?: EvidenceReference[];
  key_values?: Record<string, string | number | boolean | null>;
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
  suggested_follow_ups?: string[];
};

const SUGGESTED_QUESTIONS = [
  "What is the approved summary?",
  "Which stage has the highest total lead value?",
  "Which product has the highest total lead value?",
  "Which acquisition source has the highest total lead value?",
  "Compare Won and Lost stages.",
  "How was the analysis performed?",
  "What are the limitations?",
  "What data version is being used?",
  "Which groups have fewer than five leads?",
];

export default function DataAssistant() {
  const [question, setQuestion] = useState("");
  const [reply, setReply] = useState<AssistantReply | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submitQuestion(
    event?: FormEvent<HTMLFormElement>,
    suggestedQuestion?: string,
  ) {
    event?.preventDefault();

    const submittedQuestion = (suggestedQuestion ?? question).trim();

    if (!submittedQuestion) {
      setError("Enter a question or choose one of the suggestions.");
      return;
    }

    if (submittedQuestion.length > 500) {
      setError("Questions must be 500 characters or fewer.");
      return;
    }

    setQuestion(submittedQuestion);
    setLoading(true);
    setError("");
    setReply(null);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: submittedQuestion }),
      });

      const data = (await response.json()) as AssistantReply;

      if (!data || typeof data.answer !== "string") {
        throw new Error("The assistant returned an invalid response.");
      }

      setReply(data);
    } catch {
      setError(
        "The assistant could not be reached. Please try again after the application is running.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      aria-labelledby="data-assistant-title"
      className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="data-assistant-title"
            className="text-xl font-semibold text-slate-900"
          >
            Grounded Data Assistant
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Ask questions about approved Track A intelligence results.
          </p>
        </div>

        <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700">
          Deterministic · No LLM
        </span>
      </div>

      <form onSubmit={(event) => submitQuestion(event)} className="space-y-3">
        <label
          htmlFor="assistant-question"
          className="block text-sm font-medium text-slate-700"
        >
          Your question
        </label>

        <textarea
          id="assistant-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Example: Which stage has the highest total lead value?"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            {question.length}/500 characters
          </span>

          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Checking approved data..." : "Ask assistant"}
          </button>
        </div>
      </form>

      <div className="mt-5">
        <h3 className="mb-2 text-sm font-semibold text-slate-800">
          Suggested questions
        </h3>

        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={loading}
              onClick={() => void submitQuestion(undefined, suggestion)}
              className="rounded-full border border-slate-300 px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}

      {reply && (
        <div
          aria-live="polite"
          className="mt-6 space-y-4 border-t border-slate-200 pt-5"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </span>
            <span className="rounded-full border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-800">
              {reply.status}
            </span>
            {reply.intent && (
              <span className="text-xs text-slate-500">
                Intent: {reply.intent}
              </span>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Answer</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {reply.answer}
            </p>
          </div>

          {reply.key_values &&
            Object.keys(reply.key_values).length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Key values
                </h3>
                <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                  {Object.entries(reply.key_values).map(([key, value]) => (
                    <div
                      key={key}
                      className="rounded-lg bg-slate-50 p-3"
                    >
                      <dt className="text-xs text-slate-500">{key}</dt>
                      <dd className="mt-1 break-words text-sm font-medium text-slate-800">
                        {value === null ? "Not available" : String(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

          {reply.evidence_references &&
            reply.evidence_references.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Evidence references
                </h3>
                <div className="mt-2 space-y-3">
                  {reply.evidence_references.map((evidence, index) => (
                    <article
                      key={`${evidence.source_id}-${index}`}
                      className="rounded-lg border border-slate-200 p-3"
                    >
                      <p className="break-words text-sm font-medium text-slate-800">
                        {evidence.source_id}
                      </p>

                      {evidence.finding && (
                        <p className="mt-1 text-sm text-slate-600">
                          {evidence.finding}
                        </p>
                      )}

                      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                        {evidence.group && (
                          <div>
                            <dt className="text-slate-500">Group</dt>
                            <dd className="text-slate-800">{evidence.group}</dd>
                          </div>
                        )}
                        {evidence.metric && (
                          <div>
                            <dt className="text-slate-500">Metric</dt>
                            <dd className="text-slate-800">{evidence.metric}</dd>
                          </div>
                        )}
                        {evidence.value !== undefined && (
                          <div>
                            <dt className="text-slate-500">Value</dt>
                            <dd className="text-slate-800">
                              {evidence.value} {evidence.unit ?? ""}
                            </dd>
                          </div>
                        )}
                        <div>
                          <dt className="text-slate-500">Data version</dt>
                          <dd className="text-slate-800">{evidence.data_version}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-500">Method version</dt>
                          <dd className="text-slate-800">{evidence.method_version}</dd>
                        </div>
                        {evidence.quality_status && (
                          <div>
                            <dt className="text-slate-500">Quality status</dt>
                            <dd className="text-slate-800">
                              {evidence.quality_status}
                            </dd>
                          </div>
                        )}
                      </dl>

                      {evidence.limitation && (
                        <p className="mt-3 text-xs leading-5 text-slate-600">
                          Limitation: {evidence.limitation}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            )}

          {reply.metadata && (
            <div className="rounded-lg bg-slate-50 p-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Response metadata
              </h3>
              <dl className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500">Data version</dt>
                  <dd className="text-slate-800">
                    {reply.metadata.data_version}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Method version</dt>
                  <dd className="text-slate-800">
                    {reply.metadata.method_version}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Quality</dt>
                  <dd className="text-slate-800">
                    {reply.metadata.quality_status}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">LLM enabled</dt>
                  <dd className="text-slate-800">
                    {reply.metadata.llm_enabled ? "Yes" : "No"}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-slate-500">Generated at</dt>
                  <dd className="break-words text-slate-800">
                    {reply.metadata.generated_at}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {reply.limitation && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Limitation
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {reply.limitation}
              </p>
            </div>
          )}

          {reply.suggested_follow_ups &&
            reply.suggested_follow_ups.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Try next
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {reply.suggested_follow_ups.map((followUp) => (
                    <button
                      key={followUp}
                      type="button"
                      disabled={loading}
                      onClick={() => void submitQuestion(undefined, followUp)}
                      className="rounded-full border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                    >
                      {followUp}
                    </button>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}
    </section>
  );
}
