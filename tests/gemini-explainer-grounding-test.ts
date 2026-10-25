import assert from "node:assert/strict";
import { answerQuestion } from "../assistant/core/assistant-service";
import { explainWithGemini } from "../assistant/core/gemini-explainer";

const QUESTION = "Which stage has the highest total lead value?";

const evidenceReferences = [
  {
    source_id: "stage_won_total_value",
    finding: "Won has the highest total lead value in the stage comparison.",
    group: "Won",
    metric: "total_lead_value",
    value: 949000,
    unit: "currency_unspecified",
    data_version: "phase3-v2",
    method_version: "1.0.0",
    limitation: "Descriptive comparison using a synthetic sample.",
  },
];

async function run(): Promise<void> {
  console.log("\n=== GEMINI EXPLANATION GROUNDING TESTS ===\n");

  // Test 1: Mock Gemini returning an incorrect number.
  const deterministicResponse = answerQuestion(QUESTION);

  assert.equal(deterministicResponse.status, "SUPPORTED");

  const originalAnswer = deterministicResponse.answer;

  const invalidResult = await explainWithGemini(
    {
      question: QUESTION,
      deterministicAnswer: originalAnswer,
      evidenceReferences,
      limitation: "Descriptive comparison using a synthetic sample.",
    },
    {
      generateContent: async () => ({
        text:
          "Won has the highest total lead value, with 949001 recorded. " +
          "This result is based on the supplied evidence.",
      }),
    },
  );

  assert.equal(
    invalidResult.explanation_status,
    "UNAVAILABLE",
    "An explanation with an unsupported number must be rejected.",
  );

  assert.equal(invalidResult.explanation, null);

  // Rejection must not modify the deterministic answer.
  assert.equal(deterministicResponse.status, "SUPPORTED");
  assert.equal(deterministicResponse.answer, originalAnswer);

  console.log(
    "PASS: Rejects an incorrect mocked Gemini number and preserves the deterministic answer.",
  );

  // CONTRADICTORY RANKING TEST: Gemini must not reverse the approved winner.
  const contradictoryResult = await explainWithGemini(
    {
      question: QUESTION,
      deterministicAnswer: originalAnswer,
      evidenceReferences,
      limitation: "Descriptive comparison using a synthetic sample.",
    },
    {
      generateContent: async () => ({
        text:
          "Lost has the highest total lead value in the approved stage comparison, " +
          "with 949000 recorded.",
      }),
    },
  );

  assert.equal(
    contradictoryResult.explanation_status,
    "UNAVAILABLE",
    "A contradictory ranking must be rejected.",
  );
  assert.equal(contradictoryResult.explanation, null);
  console.log("PASS: Rejects a contradictory highest-ranked stage.");
  // Test 2: Accept a number supported by approved evidence.
  const validResult = await explainWithGemini(
    {
      question: QUESTION,
      deterministicAnswer: originalAnswer,
      evidenceReferences,
      limitation: "Descriptive comparison using a synthetic sample.",
    },
    {
      generateContent: async () => ({
        text:
          "Won has the highest total lead value in the approved stage comparison, " +
          "with 949000 recorded. This is a descriptive comparison based on the " +
          "synthetic sample and should not be treated as a prediction.",
      }),
    },
  );

  assert.equal(
    validResult.explanation_status,
    "AVAILABLE",
    "A grounded explanation should remain available.",
  );

  assert.ok(validResult.explanation);

  console.log(
    "PASS: Accepts an explanation consistent with approved evidence.",
  );

  console.log("\n=== ALL GEMINI GROUNDING TESTS PASSED ===\n");
}

run().catch((error: unknown) => {
  console.error("GEMINI GROUNDING TEST FAILED:", error);
  process.exitCode = 1;
});