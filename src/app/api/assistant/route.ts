
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

    // Only supported answers with approved evidence are sent for explanation.
    if (
      response.status === "SUPPORTED" &&
      response.evidence_references.length > 0 &&
      typeof question === "string"
    ) {
      const gemini = await explainWithGemini({
        question,
        deterministicAnswer: response.answer,
        evidenceReferences: response.evidence_references,
        limitation: response.limitation,
      });

      response.explanation = gemini.explanation;
response.metadata.llm_enabled =
  gemini.explanation_status === "AVAILABLE";
      response.explanation_status = gemini.explanation_status;
    }

    return NextResponse.json(response, {
      status: response.status === "UNAVAILABLE" ? 503 : 200,
    });
  } catch {
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
