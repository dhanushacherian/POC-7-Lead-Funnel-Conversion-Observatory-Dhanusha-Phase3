import assert from "node:assert/strict";
import { answerQuestion } from "../assistant/core/assistant-service";
import {
  explainWithGemini,
  type GeminiExplainerDependencies,
} from "../assistant/core/gemini-explainer";

const QUESTION = "Which stage has the highest total lead value?";

function makeProviderError(
  status: number,
): Error & { status: number } {
  const error = new Error(
    `Mock Gemini provider error: HTTP ${status}`,
  ) as Error & { status: number };

  error.status = status;
  return error;
}

async function verifyFallback(
  name: string,
  dependencies?: GeminiExplainerDependencies,
): Promise<void> {
  const response = answerQuestion(QUESTION);

  assert.equal(response.status, "SUPPORTED");
  assert.ok(response.answer.length > 0);
  assert.ok(response.evidence_references.length > 0);
  assert.ok(response.limitation);

  const original = {
    status: response.status,
    answer: response.answer,
    evidence: structuredClone(response.evidence_references),
    limitation: response.limitation,
  };

  const result = await explainWithGemini(
    {
      question: QUESTION,
      deterministicAnswer: response.answer,
      evidenceReferences: response.evidence_references,
      limitation: response.limitation,
    },
    dependencies,
  );

  // Calculate this before the assertion narrows the status type.
  const explanationAvailable: boolean =
    result.explanation_status === "AVAILABLE";

  assert.equal(
    result.explanation_status,
    "UNAVAILABLE",
    `${name}: explanation should be unavailable`,
  );
  assert.equal(result.explanation, null);

  // Mirror the explanation-related updates made by the API route.
  response.explanation = result.explanation;
  response.explanation_status = result.explanation_status;
  response.metadata.llm_enabled = explanationAvailable;

  // Verify that approved deterministic content remains unchanged.
  assert.equal(response.status, original.status);
  assert.equal(response.answer, original.answer);
  assert.deepEqual(
    response.evidence_references,
    original.evidence,
  );
  assert.equal(response.limitation, original.limitation);
  assert.equal(response.metadata.llm_enabled, false);

  console.log(`PASS: ${name}`);
}

async function run(): Promise<void> {
  console.log("\n=== GEMINI FALLBACK TESTS ===\n");

  // Test 1: Missing API key.
  const savedApiKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  try {
    await verifyFallback(
      "Missing GEMINI_API_KEY preserves approved results",
    );
  } finally {
    if (savedApiKey === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = savedApiKey;
    }
  }

  // Test 2: HTTP 429 quota exhaustion.
  await verifyFallback(
    "HTTP 429 quota exhaustion preserves approved results",
    {
      generateContent: async () => {
        throw makeProviderError(429);
      },
    },
  );

  // Test 3: HTTP 503 provider failure, retried exactly once.
  let attempts503 = 0;

  await verifyFallback(
    "HTTP 503 provider failure preserves approved results",
    {
      generateContent: async () => {
        attempts503 += 1;
        throw makeProviderError(503);
      },
    },
  );

  assert.equal(
    attempts503,
    2,
    "HTTP 503 must be retried exactly once",
  );

  console.log("PASS: HTTP 503 is retried exactly once");

  // Test 4: HTTP 504 gateway error.
  await verifyFallback(
    "HTTP 504 gateway error preserves approved results",
    {
      generateContent: async () => {
        throw makeProviderError(504);
      },
    },
  );

  console.log("\n=== ALL GEMINI FALLBACK TESTS PASSED ===\n");
}

run().catch((error: unknown) => {
  console.error("GEMINI FALLBACK TEST FAILED:", error);
  process.exitCode = 1;
});