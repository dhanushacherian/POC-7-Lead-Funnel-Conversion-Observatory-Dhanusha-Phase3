
import { test, expect } from "@playwright/test";
import { answerQuestion } from "../../assistant/core/assistant-service";

const supportedQuestions = [
  "What is the approved summary?",
  "What data version is being used?",
  "What are the limitations?",
  "Explain the methodology",
  "Which stage has the highest total lead value?",
  "Compare Won versus Lost stages",
  "Explain stage_won_total_value",
];

test("supported answers include evidence and version metadata", () => {
  for (const question of supportedQuestions) {
    const response = answerQuestion(question);

    expect(response.status, question).toBe("SUPPORTED");
    expect(
      response.evidence_references.length,
      `${question} should have evidence`,
    ).toBeGreaterThan(0);

    expect(response.metadata.data_version, question).toBe("phase3-v2");
    expect(response.metadata.method_version, question).toBe("1.0.0");
    expect(response.metadata.validation_result, question).toBe("PASS");

    for (const evidence of response.evidence_references) {
      expect(evidence.source_id, question).toBeTruthy();
      expect(evidence.data_version, question).toBe("phase3-v2");
      expect(evidence.method_version, question).toBe("1.0.0");
    }
  }
});

test("unsupported and missing-parameter answers do not invent evidence", () => {
  const questions = [
    "Predict which lead will convert next month",
    "Compare Won stages",
    "What is the weather today?",
  ];

  for (const question of questions) {
    const response = answerQuestion(question);

    expect(response.status, question).not.toBe("SUPPORTED");
    expect(response.evidence_references, question).toHaveLength(0);
  }
});
