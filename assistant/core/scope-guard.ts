
import type { AssistantStatus } from "./contracts";

export type ScopeGuardResult = {
  status: AssistantStatus;
  normalizedQuestion: string;
  message: string;
};

const MAX_QUESTION_LENGTH = 500;

const UNSAFE_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /reveal\s+(the\s+)?(system\s+prompt|hidden\s+instructions|secrets?)/i,
  /(system\s+prompt|hidden\s+instructions)/i,
  /\b(api[_ -]?keys?|passwords?|credentials|access tokens?)\b/i,
  /\b(print|dump|show|export|reveal)\b.{0,40}\b(raw dataset|all raw records|all lead records|private records)\b/i,
  /\b(run|execute)\b.{0,30}\b(sql|python|javascript|arbitrary code|shell commands?)\b/i,
];

const OUT_OF_SCOPE_PATTERNS: RegExp[] = [
  /\b(predict|forecast|prediction|future conversion|propensity score)\b/i,
  /\b(caus(al|ation)|caused by|impact of|prove that)\b/i,
  /\b(generate|invent|change|alter|fabricate)\b.{0,35}\b(scores?|rankings?|findings?|results?|numbers?)\b/i,
  /\b(employee|personnel|customer email|phone number|personal address)\b/i,
  /\b(write|execute|run)\b.{0,30}\b(sql|python|javascript|code)\b/i,
];

export function checkQuestionScope(question: unknown): ScopeGuardResult {
  if (typeof question !== "string") {
    return {
      status: "MISSING_PARAMETER",
      normalizedQuestion: "",
      message: "Please enter a question about the approved Data Intelligence results.",
    };
  }

  const normalizedQuestion = question.trim().replace(/\s+/g, " ");

  if (!normalizedQuestion) {
    return {
      status: "MISSING_PARAMETER",
      normalizedQuestion: "",
      message: "Please enter a question about the approved Data Intelligence results.",
    };
  }

  if (normalizedQuestion.length > MAX_QUESTION_LENGTH) {
    return {
      status: "OUT_OF_SCOPE",
      normalizedQuestion: "",
      message: "Questions must be 500 characters or fewer.",
    };
  }

  if (UNSAFE_PATTERNS.some((pattern) => pattern.test(normalizedQuestion))) {
    return {
      status: "UNSAFE",
      normalizedQuestion,
      message:
        "I cannot help with requests to expose protected instructions, credentials, raw records, or execute arbitrary code. Ask about the approved aggregate intelligence results instead.",
    };
  }

  if (OUT_OF_SCOPE_PATTERNS.some((pattern) => pattern.test(normalizedQuestion))) {
    return {
      status: "OUT_OF_SCOPE",
      normalizedQuestion,
      message:
        "That request is outside the approved descriptive-analysis scope. I can answer questions using the existing Track A intelligence results, methodology, data version, and documented limitations.",
    };
  }

  return {
    status: "SUPPORTED",
    normalizedQuestion,
    message: "Question passed the initial scope check.",
  };
}
