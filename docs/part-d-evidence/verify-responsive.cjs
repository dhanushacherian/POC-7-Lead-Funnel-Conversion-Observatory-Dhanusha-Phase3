const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const sizes = [
    [1440, 900],
    [1366, 768],
    [1280, 800],
    [768, 1024],
    [390, 844],
    [320, 720]
  ];
  const routes = ["/demo", "/demo/data-intelligence"];
  const results = [];
  let failed = false;

  try {
    for (const route of routes) {
      for (const [width, height] of sizes) {
        const page = await browser.newPage({
          viewport: { width, height }
        });

        const errors = [];
        page.on("pageerror", error => errors.push(error.message));

        const response = await page.goto(
          `http://localhost:3000${route}`,
          { waitUntil: "networkidle", timeout: 60000 }
        );

        const metrics = await page.evaluate(() => ({
          viewportWidth: window.innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          bodyWidth: document.body.scrollWidth
        }));

        const overflow =
          metrics.documentWidth > metrics.viewportWidth ||
          metrics.bodyWidth > metrics.viewportWidth;

        const passed =
          response?.status() === 200 && !overflow && errors.length === 0;

        if (!passed) failed = true;

        results.push({
          route,
          viewport: `${width}x${height}`,
          status: response?.status(),
          ...metrics,
          overflow,
          pageErrors: errors,
          result: passed ? "PASS" : "FAIL"
        });

        console.log(
          `${passed ? "PASS" : "FAIL"} ${route} ${width}x${height}` +
          ` | document=${metrics.documentWidth}` +
          ` | viewport=${metrics.viewportWidth}` +
          ` | overflow=${overflow}`
        );

        await page.close();
      }
    }

    const fs = require("node:fs");
    fs.writeFileSync(
      "docs/part-d-evidence/responsive-matrix.json",
      JSON.stringify(results, null, 2)
    );

    console.log(`\nResults: ${results.filter(r => r.result === "PASS").length}/12 passed`);
    console.log("Evidence: docs/part-d-evidence/responsive-matrix.json");

    if (failed) process.exitCode = 1;
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
