import { test, expect } from "@playwright/test";

test("supported question displays grounded answer and Gemini status", async ({ page }) => {
  await page.goto("/data-intelligence");

  await expect(page.getByRole("heading", { name: "Grounded Data Assistant" })).toBeVisible();

  await page.getByLabel("Your question").fill(
    "Which stage has the highest total lead value?"
  );
  await page.getByRole("button", { name: "Ask assistant" }).click();

  await expect(page.getByText("SUPPORTED", { exact: true })).toBeVisible({ timeout: 30000 });
  await expect(page.getByRole("heading", { name: "Deterministic answer" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Gemini explanation" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Evidence references" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Limitation", exact: true })).toBeVisible();
  await expect(page.getByText("949000", { exact: false }).first()).toBeVisible();
});

test("unsupported prediction request is safely rejected", async ({ page }) => {
  await page.goto("/data-intelligence");

  await page.getByLabel("Your question").fill(
    "Predict next year's revenue using a machine learning model"
  );
  await page.getByRole("button", { name: "Ask assistant" }).click();

  await expect(page.getByText("OUT_OF_SCOPE", { exact: true })).toBeVisible({ timeout: 30000 });
  await expect(page.getByRole("heading", { name: "Deterministic answer" })).toBeVisible();
});

