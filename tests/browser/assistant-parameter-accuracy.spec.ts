import { test, expect } from "@playwright/test";

const cases = [
  {
    name: "valid comparison with two approved stage groups",
    question: "Compare Won versus Lost stages",
    expectedStatus: "SUPPORTED",
    expectedIntent: "compare_groups",
  },
  {
    name: "missing second comparison group",
    question: "Compare Won stages",
    expectedStatus: "MISSING_PARAMETER",
    expectedIntent: "compare_groups",
  },
  {
    name: "unrecognized comparison group",
    question: "Compare Mars versus Venus stages",
    expectedStatus: "MISSING_PARAMETER",
    expectedIntent: "compare_groups",
  },
  {
    name: "comparison names too many groups",
    question: "Compare Lead, Qualified and Won stages",
    expectedStatus: "AMBIGUOUS",
    expectedIntent: "compare_groups",
  },
];

for (const scenario of cases) {
  test(scenario.name, async ({ page }) => {
    await page.route("**/api/assistant", async (route) => {
      const body = await route.request().postDataJSON();

      const question =
        typeof body?.question === "string" ? body.question : "";

      const normalized = question.toLowerCase();
      let status = "OUT_OF_SCOPE";
      let intent = null;
      let answer = "Question is outside the approved scope.";

      if (
        normalized.includes("compare") &&
        normalized.includes("stages") &&
        normalized.includes("won") &&
        normalized.includes("lost")
      ) {
        status = "SUPPORTED";
        intent = "compare_groups";
        answer = "Comparing Won and Lost stages.";
      } else if (
        normalized.includes("compare") &&
        normalized.includes("stages") &&
        normalized.includes("mars") &&
        normalized.includes("venus")
      ) {
        status = "MISSING_PARAMETER";
        intent = "compare_groups";
        answer = "Please name two approved stage groups.";
      } else if (
        normalized.includes("compare") &&
        normalized.includes("stages") &&
        normalized.includes("lead") &&
        normalized.includes("qualified") &&
        normalized.includes("won")
      ) {
        status = "AMBIGUOUS";
        intent = "compare_groups";
        answer = "Please compare exactly two approved groups.";
      } else if (
        normalized.includes("compare") &&
        normalized.includes("stages") &&
        normalized.includes("won")
      ) {
        status = "MISSING_PARAMETER";
        intent = "compare_groups";
        answer = "Please name a second approved stage group.";
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status,
          intent,
          answer,
          explanation: null,
          explanation_status: "UNAVAILABLE",
          evidence_references: [],
          key_values: {},
          metadata: {
            assistant_id: "grounded-data-assistant",
            assistant_version: "1.0.0",
            mode: "A_DETERMINISTIC_GUIDED",
            llm_enabled: false,
            data_version: "phase3-v2",
            method_version: "1.0.0",
            quality_status: "VALIDATED_DESCRIPTIVE",
            validation_result: "PASS",
            generated_at: "2026-10-09T00:00:00.000Z",
          },
          limitation: "Descriptive results only.",
          suggested_follow_ups: [],
        }),
      });
    });

    await page.goto("/data-intelligence");
    await page.getByLabel("Your question").fill(scenario.question);
    await page.getByRole("button", { name: "Ask assistant" }).click();

    await expect(
      page.getByText(scenario.expectedStatus, { exact: true }),
    ).toBeVisible();

    if (scenario.expectedIntent) {
      await expect(
        page.getByText(scenario.expectedIntent, { exact: false }).first(),
      ).toBeVisible();
    }
  });
}
