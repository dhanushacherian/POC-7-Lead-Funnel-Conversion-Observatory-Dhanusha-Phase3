
import summaryDocument from "./intelligence_summary.json";

import type {
  IntelligencePriorityItem,
  IntelligenceSummary,
} from "@/types/intelligence";

const EXPECTED_DATA_VERSION = "phase3-v2";
const EXPECTED_METHOD_VERSION = "1.0.0";
const EXPECTED_TRACK = "Track A - Comparative Intelligence";

type SummaryLoadResult =
  | {
      status: "success";
      data: IntelligenceSummary;
    }
  | {
      status: "error";
      message: string;
    };

function isPriorityItem(item: unknown): item is IntelligencePriorityItem {
  if (typeof item !== "object" || item === null) {
    return false;
  }

  const value = item as Record<string, unknown>;

  return (
    typeof value.rank === "number" &&
    typeof value.dimension === "string" &&
    typeof value.group === "string" &&
    typeof value.metric === "string" &&
    typeof value.value === "number"
  );
}

export function loadIntelligenceSummary(): SummaryLoadResult {
  try {
    const summary = summaryDocument as Record<string, unknown>;

    if (
      typeof summary.project_id !== "string" ||
      typeof summary.poc_title !== "string" ||
      typeof summary.data_version !== "string" ||
      typeof summary.method_version !== "string" ||
      summary.approved_track !== EXPECTED_TRACK ||
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

    if (
      summary.data_version !== EXPECTED_DATA_VERSION ||
      summary.method_version !== EXPECTED_METHOD_VERSION
    ) {
      return {
        status: "error",
        message: "Intelligence summary version does not match the approved version.",
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
      priority_items: summary.priority_items.filter(isPriorityItem),
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
      message: "Unable to load the approved intelligence summary.",
    };
  }
}
