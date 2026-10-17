import { NextResponse } from "next/server";
import { answerDemoQuestion } from "../../../../../assistant/core/demo-assistant-service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    const question =
      typeof body === "object" &&
      body !== null &&
      "question" in body
        ? (body as { question: unknown }).question
        : undefined;

    const response = answerDemoQuestion(question);

    return NextResponse.json(response, {
      status: response.status === "MISSING_PARAMETER" ? 400 : 200,
    });
  } catch {
    return NextResponse.json(
      {
        status: "UNAVAILABLE",
        answer: "The demo assistant could not process the request. Please try again.",
        explanation: null,
        explanation_status: "UNAVAILABLE",
      },
      { status: 500 },
    );
  }
}
