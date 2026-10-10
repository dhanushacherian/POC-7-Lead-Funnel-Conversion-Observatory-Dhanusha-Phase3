import { test, expect } from "@playwright/test";

test("supported question displays grounded answer and Gemini status", async ({ page }) => {
  await page.goto("/data-intelligence");

  await expect(
    page.getByRole("heading", { name: "Grounded Data Assistant" })
  ).toBeVisible();

  await page.getByLabel("Your question").fill(
    "Which stage has the highest total lead value?"
  );

  await page.getByRole("button", { name: "Ask assistant" }).click();

  await expect(
    page.getByText("SUPPORTED", { exact: true })
  ).toBeVisible({ timeout: 90000 });

  await expect(
    page.getByRole("heading", { name: "Deterministic answer" })
  ).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Gemini explanation" })
  ).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Evidence references" })
  ).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Limitation", exact: true })
  ).toBeVisible();

  await expect(
    page.getByText("949000", { exact: false }).first()
  ).toBeVisible();
});

test("unsupported prediction request is safely rejected", async ({ page }) => {
  await page.goto("/data-intelligence");

  await page.getByLabel("Your question").fill(
    "Predict next year's revenue using a machine learning model"
  );

  await page.getByRole("button", { name: "Ask assistant" }).click();

  await expect(
    page.getByText("OUT_OF_SCOPE", { exact: true })
  ).toBeVisible({ timeout: 90000 });

  await expect(
    page.getByRole("heading", { name: "Deterministic answer" })
  ).toBeVisible();
});

test("deterministic answer remains visible when Gemini explanation is unavailable", async ({ page }) => {
  await page.route("**/api/assistant", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: "SUPPORTED",
        intent: "compare_groups",
        answer:
          "The approved results identify Won as the highest-ranked group for total lead value. The recorded value is 949000.",
        explanation: null,
        explanation_status: "UNAVAILABLE",
        evidence_references: [
          {
            source_id: "stage_won_total_value",
            data_version: "phase3-v2",
            method_version: "1.0.0",
          },
        ],
        key_values: {
          value: 949000,
        },
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

  await expect(
    page.getByText("SUPPORTED", { exact: true })
  ).toBeVisible({ timeout: 30000 });

  await expect(
    page.getByText("949000", { exact: false }).first()
  ).toBeVisible();
});
