
import assert from "node:assert/strict";
import {
  createPostHandler,
  POST,
} from "../src/app/api/assistant/route";
import { answerQuestion } from "../assistant/core/assistant-service";
import { explainWithGemini } from "../assistant/core/gemini-explainer";

async function main() {
  const question = "Which product has the highest lead value?";
  const expected = answerQuestion(question);

  // First, check the normal API route.
  const normalRequest = new Request(
    "http://localhost/api/assistant",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    },
  );

  const normalResponse = await POST(normalRequest);
  const normalResult = await normalResponse.json();

  assert.equal(normalResponse.status, 200);
  assert.equal(normalResult.status, "SUPPORTED");
  assert.equal(normalResult.answer, expected.answer);
  assert.deepEqual(
    normalResult.evidence_references,
    expected.evidence_references,
  );

  // Now simulate Gemini failing inside the actual API route.
  const fallbackHandler = createPostHandler({
    answerQuestion,
    explainWithGemini: (input) =>
      explainWithGemini(input, {
        generateContent: async () => {
          throw new Error("Mock Gemini provider error: HTTP 429");
        },
      }),
  });

  const fallbackRequest = new Request(
    "http://localhost/api/assistant",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    },
  );

  const fallbackResponse = await fallbackHandler(fallbackRequest);
  const fallbackResult = await fallbackResponse.json();

  assert.equal(fallbackResponse.status, 200);
  assert.equal(fallbackResult.status, "SUPPORTED");
  assert.equal(fallbackResult.answer, expected.answer);
  assert.deepEqual(
    fallbackResult.evidence_references,
    expected.evidence_references,
  );
  assert.equal(fallbackResult.explanation, null);
  assert.equal(fallbackResult.explanation_status, "UNAVAILABLE");
  assert.equal(fallbackResult.limitation, expected.limitation);

  console.log("PASS: Normal API route preserves the approved answer.");
  console.log("PASS: Simulated Gemini failure preserves the answer.");
  console.log("PASS: Evidence and limitations remain available.");
  console.log("ALL API FALLBACK TESTS PASSED.");
}

main().catch((error) => {
  console.error("API fallback test failed:", error);
  process.exitCode = 1;
});
