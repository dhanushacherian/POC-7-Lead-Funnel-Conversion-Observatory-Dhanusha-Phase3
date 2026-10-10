import { test, expect } from "@playwright/test";
import {
  getApprovedSummary,
  getApprovedResultById,
  getApprovedResultsByDimension,
  getApprovedGroupResult,
  getSmallGroupWarnings,
  buildResultEvidence,
  buildSummaryEvidence,
} from "../../assistant/queries/intelligence-queries";

test("approved summary has the expected data version", () => {
  const summary = getApprovedSummary();

  expect(summary.data_version).toBe("phase3-v2");
  expect(summary.method_version).toBe("1.0.0");
});

test("stage, product and source retrieval only returns total lead value results", () => {
  for (const dimension of ["stage", "product", "source"] as const) {
    const results = getApprovedResultsByDimension(dimension);

    expect(results.length, `${dimension} should have approved results`).toBeGreaterThan(0);

    for (const result of results) {
      expect(result.metric_name).toBe("total_lead_value");
    }
  }
});

test("group retrieval is case-insensitive and trims whitespace", () => {
  const result = getApprovedGroupResult("stage", "  wOn  ");

  expect(result).toBeDefined();
  expect(result?.group_key?.toLowerCase()).toBe("won");
});

test("unknown result IDs do not retrieve an approved result", () => {
  expect(getApprovedResultById("not_an_approved_result")).toBeUndefined();
});

test("small-group warnings only include groups below five leads", () => {
  const warnings = getSmallGroupWarnings();

  for (const result of warnings) {
    expect(result.evidence.lead_count).toBeDefined();
    expect(result.evidence.lead_count!).toBeLessThan(5);
  }
});

test("result evidence preserves IDs, values and versions", () => {
  const results = getApprovedResultsByDimension("stage");
  const result = results[0];

  expect(result).toBeDefined();

  const evidence = buildResultEvidence(result);

  expect(evidence.source_id).toBe(result.result_id);
  expect(evidence.result_id).toBe(result.result_id);
  expect(evidence.value).toBe(result.result_value);
  expect(evidence.data_version).toBe(result.data_version);
  expect(evidence.method_version).toBe(result.method_version);
});

test("summary evidence identifies the summary source and approved versions", () => {
  const evidence = buildSummaryEvidence();
  const summary = getApprovedSummary();

  expect(evidence.source_id).toBe("intelligence_summary.json");
  expect(evidence.data_version).toBe(summary.data_version);
  expect(evidence.method_version).toBe(summary.method_version);
});
