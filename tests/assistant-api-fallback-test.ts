
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

  // Test 1: Normal API route.
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

  // Test 2: Gemini failure must preserve the deterministic answer.
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
  assert.equal(fallbackResult.metadata.llm_enabled, false);

  // Test 3: Out-of-scope questions must not claim Gemini was used.
  const outOfScopeRequest = new Request(
    "http://localhost/api/assistant",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: "Tell me the weather in Paris.",
      }),
    },
  );

  const outOfScopeResponse = await POST(outOfScopeRequest);
  const outOfScopeResult = await outOfScopeResponse.json();

  assert.equal(outOfScopeResponse.status, 200);
  assert.equal(outOfScopeResult.status, "OUT_OF_SCOPE");
  assert.equal(outOfScopeResult.metadata.llm_enabled, false);
  assert.equal(outOfScopeResult.explanation, null);
  assert.equal(
    outOfScopeResult.explanation_status,
    "UNAVAILABLE",
  );

  console.log("PASS: Normal API route preserves the approved answer.");
  console.log("PASS: Gemini failure preserves the answer and evidence.");
  console.log("PASS: Gemini failure reports llm_enabled as false.");
  console.log("PASS: Out-of-scope response reports llm_enabled as false.");
  console.log("ALL API FALLBACK TESTS PASSED.");
}

main().catch((error) => {
  console.error("API fallback test failed:", error);
  process.exitCode = 1;
});
