const { chromium } = require("playwright");
const fs = require("node:fs");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  const record = (name, pass, detail) => {
    results.push({ name, result: pass ? "PASS" : "FAIL", detail });
    console.log(`${pass ? "PASS" : "FAIL"} ${name}: ${detail}`);
  };

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto("http://localhost:3000/demo", {
      waitUntil: "networkidle",
      timeout: 60000
    });

    // Filter selection should be possible.
    const selects = page.locator("select");
    const selectCount = await selects.count();
    record("Dashboard filter controls", selectCount === 3,
      `Found ${selectCount} dropdowns; expected 3`);

    if (selectCount === 3) {
      const options = await selects.nth(0).locator("option").evaluateAll(
        els => els.map(e => ({ value: e.value, text: e.textContent.trim() }))
      );
      console.log("First filter options:", JSON.stringify(options));

      const alternative = options.find(o => o.value !== "All");
      if (alternative) {
        await selects.nth(0).selectOption(alternative.value);
        const selected = await selects.nth(0).inputValue();
        record("Dashboard filter selection", selected === alternative.value,
          `Selected ${selected}`);
      } else {
        record("Dashboard filter selection", false,
          "No non-All option available in the first dropdown");
      }

      await page.getByRole("button", { name: "RESET FILTERS" }).click();
      const resetValues = await selects.evaluateAll(
        els => els.map(e => e.value)
      );
      const dates = await page.locator('input[type="date"]').evaluateAll(
        els => els.map(e => e.value)
      );
      const resetPassed =
        resetValues.every(v => v === "All") &&
        dates.every(v => v === "");
      record("Reset filters", resetPassed,
        `Dropdowns=${JSON.stringify(resetValues)}; dates=${JSON.stringify(dates)}`);
    }

    // CSV and JSON export should trigger downloads.
    for (const label of ["Download CSV", "Download JSON"]) {
      try {
        const downloadPromise = page.waitForEvent("download", { timeout: 10000 });
        await page.getByRole("button", { name: label }).click();
        const download = await downloadPromise;
        record(`${label} export`, true, `Download started: ${download.suggestedFilename()}`);
      } catch (error) {
        record(`${label} export`, false, error.message);
      }
    }

    await page.close();

    // Finding selection should expose its evidence area.
    const intelligence = await browser.newPage({
      viewport: { width: 1440, height: 900 }
    });
    await intelligence.goto("http://localhost:3000/demo/data-intelligence", {
      waitUntil: "networkidle",
      timeout: 60000
    });

    const finding = intelligence.getByRole("button", {
      name: /Opportunity has the highest observed stage value/
    }).first();

    await finding.click();

    const evidenceVisible = await intelligence.getByText(
      "Contributing CRM records", { exact: true }
    ).isVisible();

    record("Finding-to-record evidence section", evidenceVisible,
      evidenceVisible
        ? "Contributing CRM records section is visible after selecting the finding"
        : "Evidence section was not visible");

    const bodyText = await intelligence.locator("body").innerText();
    record("Opportunity finding context", bodyText.includes("Opportunity"),
      "Checked visible page text for the selected finding context");

    await intelligence.close();

    fs.mkdirSync("docs/part-d-evidence", { recursive: true });
    fs.writeFileSync(
      "docs/part-d-evidence/interaction-results.json",
      JSON.stringify(results, null, 2)
    );

    const failed = results.filter(r => r.result === "FAIL").length;
    console.log(`\nInteraction checks: ${results.length - failed}/${results.length} passed`);
    console.log("Evidence: docs/part-d-evidence/interaction-results.json");

    if (failed) process.exitCode = 1;
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
