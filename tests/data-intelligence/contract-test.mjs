import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const projectRoot = process.cwd();

const resultsPath = path.join(
  projectRoot,
  "src",
  "data",
  "intelligence",
  "intelligence_results.json"
);

const summaryPath = path.join(
  projectRoot,
  "src",
  "data",
  "intelligence",
  "intelligence_summary.json"
);

const EXPECTED_PROJECT_ID = "POC-7";
const EXPECTED_TRACK = "Track A - Comparative Intelligence";
const EXPECTED_DATA_VERSION = "phase3-v2";
const EXPECTED_METHOD_VERSION = "1.0.0";
const EXPECTED_QUALITY_STATUS = "VALIDATED_DESCRIPTIVE";
const EXPECTED_RESULT_COUNT = 16;
const MIN_GROUP_SIZE = 5;

const ALLOWED_RESULT_TYPES = new Set([
  "stage_comparison",
  "product_comparison",
  "source_comparison",
  "baseline_summary",
]);

const ALLOWED_METRICS = new Set([
  "total_lead_value",
  "average_lead_value",
  "average_days_in_stage",
  "median_days_in_stage",
  "lead_count",
  "value_share_percent",
]);

function readJson(filePath) {
  assert.ok(
    fs.existsSync(filePath),
    `Required JSON file does not exist: ${filePath}`
  );

  const raw = fs.readFileSync(filePath, "utf8");

  assert.doesNotThrow(
    () => JSON.parse(raw),
    `Invalid JSON: ${filePath}`
  );

  return JSON.parse(raw);
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isValidTimestamp(value) {
  if (typeof value !== "string" || value.trim() === "") {
    return false;
  }

  return !Number.isNaN(Date.parse(value));
}

function validateOptionalString(value, fieldName) {
  if (value !== null && typeof value !== "string") {
    throw new Error(`${fieldName} must be a string or null`);
  }
}

function validateEvidence(evidence, resultId) {
  assert.ok(
    isObject(evidence),
    `Evidence must be an object for result ${resultId}`
  );

  const stringFields = ["group", "metric_unit"];

  for (const field of stringFields) {
    if (
      evidence[field] !== undefined &&
      typeof evidence[field] !== "string"
    ) {
      throw new Error(
        `Evidence field ${field} must be a string for result ${resultId}`
      );
    }
  }

  const numericFields = [
    "lead_count",
    "total_lead_value",
    "average_lead_value",
    "average_days_in_stage",
    "median_days_in_stage",
  ];

  for (const field of numericFields) {
    if (
      evidence[field] !== undefined &&
      typeof evidence[field] !== "number"
    ) {
      throw new Error(
        `Evidence field ${field} must be numeric for result ${resultId}`
      );
    }

    if (
      evidence[field] !== undefined &&
      !Number.isFinite(evidence[field])
    ) {
      throw new Error(
        `Evidence field ${field} must be finite for result ${resultId}`
      );
    }
  }
}

function validateResult(result) {
  assert.ok(
    isObject(result),
    "Every intelligence result must be an object"
  );

  assert.equal(
    typeof result.result_id,
    "string",
    "result_id must be a string"
  );

  assert.ok(
    result.result_id.length > 0,
    "result_id must not be empty"
  );

  assert.ok(
    ALLOWED_RESULT_TYPES.has(result.result_type),
    `Unsupported result_type: ${result.result_type}`
  );

  validateOptionalString(result.record_id, "record_id");
  validateOptionalString(result.entity_id, "entity_id");
  validateOptionalString(result.group_key, "group_key");
  validateOptionalString(result.period_start, "period_start");
  validateOptionalString(result.period_end, "period_end");

  assert.ok(
    ALLOWED_METRICS.has(result.metric_name),
    `Unsupported metric_name: ${result.metric_name}`
  );

  assert.equal(
    typeof result.result_value,
    "number",
    `result_value must be numeric for ${result.result_id}`
  );

  assert.ok(
    Number.isFinite(result.result_value),
    `result_value must be finite for ${result.result_id}`
  );

  assert.equal(
    typeof result.result_unit,
    "string",
    `result_unit must be a string for ${result.result_id}`
  );

  assert.equal(
    typeof result.result_category,
    "string",
    `result_category must be a string for ${result.result_id}`
  );

  assert.ok(
    result.priority_rank === null ||
      Number.isInteger(result.priority_rank),
    `priority_rank must be an integer or null for ${result.result_id}`
  );

  assert.equal(
    typeof result.finding,
    "string",
    `finding must be a string for ${result.result_id}`
  );

  validateEvidence(result.evidence, result.result_id);

  assert.equal(
    result.method_version,
    EXPECTED_METHOD_VERSION,
    `Invalid method_version for ${result.result_id}`
  );

  assert.equal(
    result.data_version,
    EXPECTED_DATA_VERSION,
    `Invalid data_version for ${result.result_id}`
  );

  assert.ok(
    isValidTimestamp(result.generated_at),
    `Invalid generated_at timestamp for ${result.result_id}`
  );

  if (result.period_start !== null) {
    assert.ok(
      isValidTimestamp(result.period_start),
      `Invalid period_start for ${result.result_id}`
    );
  }

  if (result.period_end !== null) {
    assert.ok(
      isValidTimestamp(result.period_end),
      `Invalid period_end for ${result.result_id}`
    );
  }

  assert.equal(
    result.quality_status,
    EXPECTED_QUALITY_STATUS,
    `Invalid quality_status for ${result.result_id}`
  );

  assert.equal(
    typeof result.limitation,
    "string",
    `limitation must be a string for ${result.result_id}`
  );
}

function validateResultsDocument(document) {
  assert.ok(
    isObject(document),
    "Intelligence results document must be an object"
  );

  assert.equal(
    document.project_id,
    EXPECTED_PROJECT_ID,
    "Invalid project_id"
  );

  assert.equal(
    document.approved_track,
    EXPECTED_TRACK,
    "Invalid approved_track"
  );

  assert.equal(
    document.data_version,
    EXPECTED_DATA_VERSION,
    "Invalid data_version"
  );

  assert.equal(
    document.method_version,
    EXPECTED_METHOD_VERSION,
    "Invalid method_version"
  );

  assert.ok(
    isValidTimestamp(document.generated_at),
    "Invalid document generated_at timestamp"
  );

  assert.equal(
    typeof document.result_count,
    "number",
    "result_count must be numeric"
  );

  assert.ok(
    Number.isInteger(document.result_count),
    "result_count must be an integer"
  );

  assert.ok(
    Array.isArray(document.results),
    "results must be an array"
  );

  assert.equal(
    document.result_count,
    document.results.length,
    "result_count must equal results.length"
  );

  assert.equal(
    document.result_count,
    EXPECTED_RESULT_COUNT,
    `Expected ${EXPECTED_RESULT_COUNT} approved results`
  );

  const resultIds = new Set();

  for (const result of document.results) {
    validateResult(result);

    assert.ok(
      !resultIds.has(result.result_id),
      `Duplicate result_id detected: ${result.result_id}`
    );

    resultIds.add(result.result_id);
  }

  assert.equal(
    resultIds.size,
    document.results.length,
    "Every result must have a unique result_id"
  );
}

function validateSummary(summary) {
  assert.ok(
    isObject(summary),
    "Intelligence summary must be an object"
  );

  assert.equal(
    summary.project_id,
    EXPECTED_PROJECT_ID,
    "Invalid summary project_id"
  );

  assert.equal(
    summary.data_version,
    EXPECTED_DATA_VERSION,
    "Invalid summary data_version"
  );

  assert.equal(
    summary.method_version,
    EXPECTED_METHOD_VERSION,
    "Invalid summary method_version"
  );

  assert.equal(
    summary.approved_track,
    EXPECTED_TRACK,
    "Invalid summary approved_track"
  );

  assert.equal(
    typeof summary.primary_question,
    "string",
    "primary_question must be a string"
  );

  assert.equal(
    typeof summary.decision,
    "string",
    "decision must be a string"
  );

  assert.equal(
    summary.result_count,
    EXPECTED_RESULT_COUNT,
    "Summary result_count must equal 16"
  );

  assert.ok(
    Array.isArray(summary.key_findings),
    "key_findings must be an array"
  );

  assert.ok(
    Array.isArray(summary.priority_items),
    "priority_items must be an array"
  );

  assert.equal(
    summary.validation_result,
    "PASS",
    "Summary validation_result must be PASS"
  );

  assert.equal(
    typeof summary.weak_case_count,
    "number",
    "weak_case_count must be numeric"
  );

  assert.ok(
    Array.isArray(summary.limitations),
    "limitations must be an array"
  );

  assert.ok(
    isValidTimestamp(summary.generated_at),
    "Invalid summary generated_at timestamp"
  );
}

function validateExpectedDimensions(results) {
  const stageResults = results.filter(
    (result) => result.result_type === "stage_comparison"
  );

  const productResults = results.filter(
    (result) => result.result_type === "product_comparison"
  );

  const sourceResults = results.filter(
    (result) => result.result_type === "source_comparison"
  );

  const baselineResults = results.filter(
    (result) => result.result_type === "baseline_summary"
  );

  assert.equal(
    stageResults.length,
    6,
    "Expected 6 stage comparison results"
  );

  assert.equal(
    productResults.length,
    3,
    "Expected 3 product comparison results"
  );

  assert.equal(
    sourceResults.length,
    4,
    "Expected 4 source comparison results"
  );

  assert.equal(
    baselineResults.length,
    3,
    "Expected 3 baseline results"
  );
}

function validateSmallGroups(results) {
  const stageResults = results.filter(
    (result) => result.result_type === "stage_comparison"
  );

  const smallGroups = stageResults.filter(
    (result) =>
      result.evidence &&
      typeof result.evidence.lead_count === "number" &&
      result.evidence.lead_count < MIN_GROUP_SIZE
  );

  const smallGroupNames = smallGroups
    .map((result) => result.group_key)
    .sort();

  assert.deepEqual(
    smallGroupNames,
    ["Lead", "Lost", "Proposal"],
    "Approved small stage groups do not match expected groups"
  );
}

function run() {
  console.log("========================================");
  console.log("DATA INTELLIGENCE CONTRACT TEST");
  console.log("========================================");

  console.log("\n[1/7] Reading intelligence results...");
  const resultsDocument = readJson(resultsPath);
  console.log("PASS");

  console.log("\n[2/7] Validating results document...");
  validateResultsDocument(resultsDocument);
  console.log("PASS");

  console.log("\n[3/7] Validating result dimensions...");
  validateExpectedDimensions(resultsDocument.results);
  console.log("PASS");

  console.log("\n[4/7] Validating small-group disclosure data...");
  validateSmallGroups(resultsDocument.results);
  console.log("PASS");

  console.log("\n[5/7] Reading intelligence summary...");
  const summary = readJson(summaryPath);
  console.log("PASS");

  console.log("\n[6/7] Validating intelligence summary...");
  validateSummary(summary);
  console.log("PASS");

  console.log("\n[7/7] Validating approved metadata...");
  assert.equal(
    resultsDocument.project_id,
    summary.project_id,
    "Project IDs do not match"
  );

  assert.equal(
    resultsDocument.data_version,
    summary.data_version,
    "Data versions do not match"
  );

  assert.equal(
    resultsDocument.method_version,
    summary.method_version,
    "Method versions do not match"
  );

  assert.equal(
    resultsDocument.approved_track,
    summary.approved_track,
    "Analytical tracks do not match"
  );

  assert.equal(
    resultsDocument.result_count,
    summary.result_count,
    "Result counts do not match"
  );

  console.log("PASS");

  console.log("\n========================================");
  console.log("CONTRACT TEST PASSED");
  console.log("========================================");
  console.log(`Project: ${resultsDocument.project_id}`);
  console.log(`Track: ${resultsDocument.approved_track}`);
  console.log(`Data version: ${resultsDocument.data_version}`);
  console.log(`Method version: ${resultsDocument.method_version}`);
  console.log(`Result count: ${resultsDocument.result_count}`);
  console.log(`Quality status: ${EXPECTED_QUALITY_STATUS}`);
  console.log("========================================");
}

try {
  run();
} catch (error) {
  console.error("\n========================================");
  console.error("CONTRACT TEST FAILED");
  console.error("========================================");
  console.error(error.message);
  process.exit(1);
}