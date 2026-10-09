

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
  explanation?: string | null;
  explanation_status?: "AVAILABLE" | "UNAVAILABLE";
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

    setLoading(true);
    setError("");
    setReply(null);
    setQuestion(submittedQuestion);

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

      if (!response.ok && data.status === "UNAVAILABLE") {
        setError(
          "The assistant service is currently unavailable. Review the response and try again later.",
        );
      }
    } catch {
      setError(
        "Unable to contact the assistant. Check that the development server is running and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Grounded Data Assistant
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Ask questions about approved Track A results. Answers are based on
          validated descriptive evidence; Gemini may provide an optional
          explanation.
        </p>
      </div>

      <form
        onSubmit={(event) => void submitQuestion(event)}
        className="space-y-3"
      >
        <label
          htmlFor="assistant-question"
          className="block text-sm font-medium text-slate-800"
        >
          Your question
        </label>
        <textarea
          id="assistant-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Ask about the approved results..."
          disabled={loading}
          className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            {question.length}/500 characters
          </p>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Thinking..." : "Ask assistant"}
          </button>
        </div>
      </form>

      <div>
        <h3 className="text-sm font-semibold text-slate-900">
          Suggested questions
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={loading}
              onClick={() => void submitQuestion(undefined, suggestion)}
              className="rounded-full border border-slate-300 px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div
          role="status"
          className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600"
        >
          Checking approved results and preparing the response...
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
        >
          {error}
        </div>
      )}

      {reply && (
        <div className="space-y-5 border-t border-slate-200 pt-5">
          <div className="flex flex-wrap items-center gap-2">
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
            <h3 className="text-sm font-semibold text-slate-900">
              Deterministic answer
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {reply.answer}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">
                Gemini explanation
              </h3>
              <span className="rounded-full border border-slate-300 px-2 py-1 text-xs text-slate-700">
                {reply.explanation_status ?? "UNAVAILABLE"}
              </span>
            </div>
            {reply.explanation_status === "AVAILABLE" && reply.explanation ? (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {reply.explanation}
              </p>
            ) : (
              <p className="mt-2 text-sm leading-6 text-slate-600">
                An optional Gemini explanation is unavailable. The
                deterministic answer and approved evidence remain the primary
                response.
              </p>
            )}
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
                            <dd className="break-words text-slate-800">
                              {evidence.group}
                            </dd>
                          </div>
                        )}
                        {evidence.metric && (
                          <div>
                            <dt className="text-slate-500">Metric</dt>
                            <dd className="break-words text-slate-800">
                              {evidence.metric}
                            </dd>
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
                          <dd className="text-slate-800">
                            {evidence.data_version}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-slate-500">Method version</dt>
                          <dd className="text-slate-800">
                            {evidence.method_version}
                          </dd>
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
