
import { test, expect } from "@playwright/test";
import { resolveIntent } from "../../assistant/core/intent-resolver";

const cases = [
  {
    name: "compare two approved stages",
    question: "Compare Won versus Lost stages",
    status: "SUPPORTED",
    intent: "compare_groups",
    dimension: "stage",
  },
  {
    name: "compare two approved products",
    question: "Compare Payments versus Analytics products",
    status: "SUPPORTED",
    intent: "compare_groups",
    dimension: "product",
  },
  {
    name: "compare two approved sources",
    question: "Compare Website versus Referral sources",
    status: "SUPPORTED",
    intent: "compare_groups",
    dimension: "source",
  },
  {
    name: "detect missing comparison group",
    question: "Compare Won stages",
    status: "MISSING_PARAMETER",
    intent: "compare_groups",
    dimension: "stage",
  },
  {
    name: "detect no approved group names",
    question: "Compare Mars versus Venus stages",
    status: "MISSING_PARAMETER",
    intent: "compare_groups",
    dimension: "stage",
  },
  {
    name: "detect three comparison groups",
    question: "Compare Lead, Qualified and Won stages",
    status: "AMBIGUOUS",
    intent: "compare_groups",
    dimension: "stage",
  },
  {
    name: "detect highest total lead value by stage",
    question: "Which stage has the highest total lead value?",
    status: "SUPPORTED",
    intent: "compare_groups",
    dimension: "stage",
  },
  {
    name: "detect methodology request",
    question: "Explain the methodology",
    status: "SUPPORTED",
    intent: "explain_method",
  },
  {
    name: "detect limitations request",
    question: "What are the limitations?",
    status: "SUPPORTED",
    intent: "explain_limitation",
  },
  {
    name: "detect data version request",
    question: "What data version is being used?",
    status: "SUPPORTED",
    intent: "get_data_freshness",
  },
  {
    name: "reject unsupported prediction",
    question: "Predict which lead will convert next month",
    status: "OUT_OF_SCOPE",
    intent: null,
  },
  {
    name: "reject unrelated question",
    question: "What is the weather today?",
    status: "OUT_OF_SCOPE",
    intent: null,
  },
];

test.describe("real resolver evaluation", () => {
  for (const item of cases) {
    test(item.name, () => {
      const result = resolveIntent(item.question);

      expect(result.status).toBe(item.status);
      expect(result.intent).toBe(item.intent);

      if ("dimension" in item) {
        expect(result.dimension).toBe(item.dimension);
      }
    });
  }
});
