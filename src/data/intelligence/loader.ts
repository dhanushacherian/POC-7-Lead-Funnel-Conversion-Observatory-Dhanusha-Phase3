import type {
  IntelligenceResult,
  IntelligenceResultsDocument,
} from "@/types/intelligence";

import rawResults from "./intelligence_results.json";

const EXPECTED_DATA_VERSION = "phase3-v2";
const EXPECTED_METHOD_VERSION = "1.0.0";
const EXPECTED_TRACK =
  "Track A - Comparative Intelligence";

const MIN_GROUP_SIZE = 5;

export type IntelligenceLoadResult =
  | {
      status: "success";
      data: IntelligenceResultsDocument;
    }
  | {
      status: "error";
      message: string;
    };

function isValidTimestamp(
  value: unknown,
): value is string {
  if (typeof value !== "string") {
    return false;
  }

  return !Number.isNaN(Date.parse(value));
}

function isValidEvidence(
  value: unknown,
): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }

  const evidence =
    value as Record<string, unknown>;

  if (
    evidence.group !== undefined &&
    typeof evidence.group !== "string"
  ) {
    return false;
  }

  if (
    evidence.metric_unit !== undefined &&
    typeof evidence.metric_unit !== "string"
  ) {
    return false;
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
      (
        typeof evidence[field] !== "number" ||
        !Number.isFinite(
          evidence[field] as number,
        )
      )
    ) {
      return false;
    }
  }

  return true;
}

function isValidResult(
  result: unknown,
): result is IntelligenceResult {
  if (!result || typeof result !== "object") {
    return false;
  }

  const item =
    result as Record<string, unknown>;

  return (
    typeof item.result_id === "string" &&
    typeof item.result_type === "string" &&
    typeof item.metric_name === "string" &&
    typeof item.result_value === "number" &&
    Number.isFinite(item.result_value) &&
    typeof item.result_unit === "string" &&
    typeof item.result_category === "string" &&
    typeof item.finding === "string" &&
    isValidEvidence(item.evidence) &&
    typeof item.method_version === "string" &&
    typeof item.data_version === "string" &&
    typeof item.generated_at === "string" &&
    isValidTimestamp(item.generated_at) &&
    item.quality_status ===
      "VALIDATED_DESCRIPTIVE" &&
    typeof item.limitation === "string"
  );
}

export function validateIntelligenceDocument(
  value: unknown,
): IntelligenceLoadResult {
  try {
    if (!value || typeof value !== "object") {
      return {
        status: "error",
        message:
          "Intelligence output is malformed.",
      };
    }

    const document =
      value as Record<string, unknown>;

    if (
      document.data_version !==
      EXPECTED_DATA_VERSION
    ) {
      return {
        status: "error",
        message:
          `Data version mismatch. Expected ${EXPECTED_DATA_VERSION}.`,
      };
    }

    if (
      document.method_version !==
      EXPECTED_METHOD_VERSION
    ) {
      return {
        status: "error",
        message:
          `Method version mismatch. Expected ${EXPECTED_METHOD_VERSION}.`,
      };
    }

    if (
      document.approved_track !==
      EXPECTED_TRACK
    ) {
      return {
        status: "error",
        message:
          "Unsupported analytical track.",
      };
    }

    if (!Array.isArray(document.results)) {
      return {
        status: "error",
        message:
          "Intelligence results are missing or malformed.",
      };
    }

    if (
      typeof document.result_count !== "number" ||
      document.result_count !==
        document.results.length
    ) {
      return {
        status: "error",
        message:
          "Intelligence result count does not match the output.",
      };
    }

    const results =
      document.results;

    if (!results.every(isValidResult)) {
      return {
        status: "error",
        message:
          "One or more intelligence results violate the contract.",
      };
    }

    const resultIds =
      results.map(
        (result) => result.result_id,
      );

    if (
      new Set(resultIds).size !==
      resultIds.length
    ) {
      return {
        status: "error",
        message:
          "Duplicate intelligence result IDs detected.",
      };
    }

    if (!isValidTimestamp(document.generated_at)) {
      return {
        status: "error",
        message:
          "Generated timestamp is invalid.",
      };
    }

    const loadedDocument:
      IntelligenceResultsDocument = {
      project_id: String(
        document.project_id,
      ),

      poc_title: String(
        document.poc_title,
      ),

      approved_track:
        EXPECTED_TRACK,

      data_version:
        EXPECTED_DATA_VERSION,

      method_version:
        EXPECTED_METHOD_VERSION,

      generated_at: String(
        document.generated_at,
      ),

      result_count:
        results.length,

      results,
    };

    return {
      status: "success",
      data: loadedDocument,
    };
  } catch {
    return {
      status: "error",
      message:
        "Unable to load intelligence results.",
    };
  }
}

export function loadIntelligenceResults():
  IntelligenceLoadResult {
  return validateIntelligenceDocument(
    rawResults as unknown,
  );
}

export function getGroupSizeWarning(
  result: IntelligenceResult,
): string | null {
  const leadCount =
    result.evidence.lead_count;

  if (
    typeof leadCount === "number" &&
    leadCount < MIN_GROUP_SIZE
  ) {
    return (
      `Small group: ${leadCount} leads. ` +
      `Minimum approved group size is ${MIN_GROUP_SIZE}.`
    );
  }

  return null;
}