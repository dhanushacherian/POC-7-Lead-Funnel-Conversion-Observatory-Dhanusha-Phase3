import type { IntelligenceSummary } from "@/types/intelligence";

import rawSummary from "./intelligence_summary.json";

const EXPECTED_DATA_VERSION = "phase3-v2";
const EXPECTED_METHOD_VERSION = "1.0.0";
const EXPECTED_TRACK = "Track A - Comparative Intelligence";

export type IntelligenceSummaryLoadResult =
  | {
      status: "success";
      data: IntelligenceSummary;
    }
  | {
      status: "error";
      message: string;
    };

export function loadIntelligenceSummary(): IntelligenceSummaryLoadResult {
  try {
    const data = rawSummary as unknown;

    if (!data || typeof data !== "object") {
      return {
        status: "error",
        message: "Intelligence summary is malformed.",
      };
    }

    const summary = data as Record<string, unknown>;

    if (summary.data_version !== EXPECTED_DATA_VERSION) {
      return {
        status: "error",
        message: `Summary data version mismatch. Expected ${EXPECTED_DATA_VERSION}.`,
      };
    }

    if (summary.method_version !== EXPECTED_METHOD_VERSION) {
      return {
        status: "error",
        message: `Summary method version mismatch. Expected ${EXPECTED_METHOD_VERSION}.`,
      };
    }

    if (summary.approved_track !== EXPECTED_TRACK) {
      return {
        status: "error",
        message: "Unsupported analytical track in summary.",
      };
    }

    if (
      typeof summary.project_id !== "string" ||
      typeof summary.poc_title !== "string" ||
      typeof summary.primary_question !== "string" ||
      typeof summary.decision !== "string" ||
      typeof summary.result_count !== "number" ||
      !Array.isArray(summary.key_findings) ||
      !Array.isArray(summary.priority_items) ||
      typeof summary.validation_result !== "string" ||
      typeof summary.weak_case_count !== "number" ||
      !Array.isArray(summary.limitations) ||
      typeof summary.generated_at !== "string"
    ) {
      return {
        status: "error",
        message: "Intelligence summary violates the expected contract.",
      };
    }

    const loadedSummary: IntelligenceSummary = {
      project_id: summary.project_id,
      poc_title: summary.poc_title,
      data_version: EXPECTED_DATA_VERSION,
      method_version: EXPECTED_METHOD_VERSION,
      approved_track: EXPECTED_TRACK,
      primary_question: summary.primary_question,
      decision: summary.decision,
      result_count: summary.result_count,
      key_findings: summary.key_findings.filter(
        (item): item is string => typeof item === "string",
      ),
      priority_items: summary.priority_items.filter(
        (item): item is string => typeof item === "string",
      ),
      validation_result: summary.validation_result,
      weak_case_count: summary.weak_case_count,
      limitations: summary.limitations.filter(
        (item): item is string => typeof item === "string",
      ),
      generated_at: summary.generated_at,
    };

    return {
      status: "success",
      data: loadedSummary,
    };
  } catch {
    return {
      status: "error",
      message: "Unable to load intelligence summary.",
    };
  }
}