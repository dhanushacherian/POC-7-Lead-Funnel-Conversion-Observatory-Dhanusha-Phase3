
import type { AssistantResponse } from "./contracts";

const MAX_EVIDENCE_REFERENCES = 10;
const MAX_FOLLOW_UPS = 3;

export function validateAssistantResponse(
  response: AssistantResponse,
): AssistantResponse {
  const invalid =
    !response.answer_id ||
    !response.status ||
    typeof response.answer !== "string" ||
    !response.metadata ||
    !Array.isArray(response.evidence_references) ||
    !Array.isArray(response.suggested_follow_ups) ||
    !response.key_values ||
    typeof response.key_values !== "object";

  if (invalid) {
    return {
      ...response,
      status: "UNAVAILABLE",
      intent: null,
      answer: "I could not validate the response. Please try an approved question again.",
      evidence_references: [],
      key_values: {},
      limitation: "The response did not satisfy the required response contract.",
      suggested_follow_ups: [
        "What is the approved summary?",
        "What are the documented limitations?",
      ],
    };
  }

  const evidence = response.evidence_references.slice(
    0,
    MAX_EVIDENCE_REFERENCES,
  );

  const followUps = response.suggested_follow_ups
    .filter((item) => typeof item === "string" && item.trim().length > 0)
    .slice(0, MAX_FOLLOW_UPS);

  const factualStatuses = ["SUPPORTED"];

  if (
    factualStatuses.includes(response.status) &&
    evidence.length === 0
  ) {
    return {
      ...response,
      status: "UNAVAILABLE",
      intent: null,
      answer:
        "I cannot provide a factual answer because approved supporting evidence is unavailable.",
      evidence_references: [],
      key_values: {},
      limitation: "No approved evidence references were attached to the response.",
      suggested_follow_ups: [
        "What is the approved summary?",
        "What data version is being used?",
      ],
    };
  }

  return {
    ...response,
    evidence_references: evidence,
    suggested_follow_ups: followUps,
  };
}
