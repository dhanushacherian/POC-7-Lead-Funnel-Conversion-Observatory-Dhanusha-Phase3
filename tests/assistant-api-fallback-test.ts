
import assert from "node:assert/strict";
import { POST } from "../src/app/api/assistant/route";
import { answerQuestion } from "../assistant/core/assistant-service";

async function main() {
  const question = "Which product has the highest lead value?";

  const expected = answerQuestion(question);

  const request = new Request("http://localhost/api/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  const response = await POST(request);
  const result = await response.json();

  assert.equal(response.status, 200);
  assert.equal(result.status, "SUPPORTED");
  assert.equal(result.answer, expected.answer);
  assert.deepEqual(
    result.evidence_references,
    expected.evidence_references,
  );

  console.log("API fallback test passed.");
  console.log("Approved deterministic answer was preserved.");
}

main().catch((error) => {
  console.error("API fallback test failed:", error);
  process.exitCode = 1;
});
