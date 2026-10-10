import { test, expect } from "@playwright/test";

const viewports = [
  { name: "small mobile", width: 320, height: 800 },
  { name: "standard mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
];

for (const viewport of viewports) {
  test(`assistant controls fit on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });

    await page.goto("/data-intelligence");

    const heading = page.getByRole("heading", {
      name: "Grounded Data Assistant",
    });
    const question = page.getByLabel("Your question");
    const askButton = page.getByRole("button", {
      name: "Ask assistant",
    });

    await expect(heading).toBeVisible();
    await expect(question).toBeVisible();
    await expect(askButton).toBeVisible();

    for (const [name, locator] of [
      ["heading", heading],
      ["question input", question],
      ["Ask button", askButton],
    ] as const) {
      const bounds = await locator.boundingBox();

      expect(bounds, `${name} should have visible dimensions`).not.toBeNull();

      if (bounds) {
        expect(bounds.x, `${name} should not extend beyond the left edge`)
          .toBeGreaterThanOrEqual(0);

        expect(
          bounds.x + bounds.width,
          `${name} should fit within the viewport`,
        ).toBeLessThanOrEqual(viewport.width);
      }
    }
  });
}
