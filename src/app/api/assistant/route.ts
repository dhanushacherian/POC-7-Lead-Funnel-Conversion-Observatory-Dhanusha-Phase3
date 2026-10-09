
import { NextResponse } from "next/server";
import { answerQuestion } from "../../../../assistant/core/assistant-service";

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
        },
        { status: 400 },
      );
    }

    const question = (body as { question: unknown }).question;
    const response = answerQuestion(question);

    return NextResponse.json(response, {
      status:
        response.status === "UNAVAILABLE" ? 503 : 200,
    });
  } catch {
    return NextResponse.json(
      {
        status: "UNAVAILABLE",
        answer: "The assistant could not process this request. Please try again.",
      },
      { status: 400 },
    );
  }
}
