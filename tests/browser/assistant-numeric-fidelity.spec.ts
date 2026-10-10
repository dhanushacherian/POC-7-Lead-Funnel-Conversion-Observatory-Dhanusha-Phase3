import { test, expect } from "@playwright/test";

test("assistant numeric answer matches approved lead value", async ({ page }) => {
  await page.route("**/api/assistant", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: "SUPPORTED",
        intent: "compare_groups",
        answer:
          "The Won stage has the highest total lead value, recorded as 949000.",
        explanation: null,
        explanation_status: "UNAVAILABLE",
        evidence_references: [
          {
            source_id: "stage_won_total_value",
            data_version: "phase3-v2",
            method_version: "1.0.0",
          },
        ],
        key_values: { value: 949000 },
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
  await page.getByLabel("Your question").fill(
    "Which stage has the highest total lead value?"
  );
  await page.getByRole("button", { name: "Ask assistant" }).click();

  await expect(page.getByText("SUPPORTED", { exact: true })).toBeVisible();
  await expect(page.getByText("949000", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("phase3-v2", { exact: false }).first()).toBeVisible();
});
