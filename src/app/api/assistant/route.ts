
import { NextResponse } from "next/server";
import { answerQuestion } from "../../../../assistant/core/assistant-service";
import { explainWithGemini } from "../../../../assistant/core/gemini-explainer";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("question" in body)
    ) {
      return NextResponse.json(
        {
          status: "MISSING_PARAMETER",
          answer: "Please provide a question.",
          explanation: null,
          explanation_status: "UNAVAILABLE",
        },
        { status: 400 },
      );
    }

    const question = (body as { question: unknown }).question;
    const response = answerQuestion(question);

    // Keep the approved deterministic answer even if Gemini is slow.
    if (
      response.status === "SUPPORTED" &&
      response.evidence_references.length > 0 &&
      typeof question === "string"
    ) {
      let timeoutId: ReturnType<typeof setTimeout> | undefined;

      const gemini = await Promise.race([
        explainWithGemini({
          question,
          deterministicAnswer: response.answer,
          evidenceReferences: response.evidence_references,
          limitation: response.limitation,
        }),
        new Promise<{
          explanation: null;
          explanation_status: "UNAVAILABLE";
        }>((resolve) => {
          timeoutId = setTimeout(
            () =>
              resolve({
                explanation: null,
                explanation_status: "UNAVAILABLE",
              }),
            8000,
          );
        }),
      ]).finally(() => {
        if (timeoutId) clearTimeout(timeoutId);
      });

      response.explanation = gemini.explanation;
      response.metadata.llm_enabled =
        gemini.explanation_status === "AVAILABLE";
      response.explanation_status = gemini.explanation_status;
    }

    return NextResponse.json(response, {
      status: response.status === "UNAVAILABLE" ? 503 : 200,
    });
  } catch (error) {
    console.error("[Assistant API]", error);

    return NextResponse.json(
      {
        status: "UNAVAILABLE",
        answer:
          "The assistant could not process this request. Please try an approved question again.",
        explanation: null,
        explanation_status: "UNAVAILABLE",
      },
      { status: 500 },
    );
  }
}
