
import resultsDocument from "../../src/data/intelligence/intelligence_results.json";
import summaryDocument from "../../src/data/intelligence/intelligence_summary.json";

import type {
  AssistantDimension,
  AssistantEvidenceReference,
} from "../core/contracts";

import type {
  IntelligenceResult,
  IntelligenceSummary,
} from "../../src/types/intelligence";

const results = resultsDocument.results as IntelligenceResult[];
const summary = summaryDocument as IntelligenceSummary;

const QUALITY_STATUS = "VALIDATED_DESCRIPTIVE" as const;

export function getApprovedSummary(): IntelligenceSummary {
  return summary;
}

export function getApprovedResultById(
  resultId: string,
): IntelligenceResult | undefined {
  return results.find((item) => item.result_id === resultId);
}

export function getApprovedResultsByDimension(
  dimension: AssistantDimension,
): IntelligenceResult[] {
  const resultTypeByDimension: Record<AssistantDimension, string> = {
    stage: "stage_comparison",
    product: "product_comparison",
    source: "source_comparison",
  };

  return results.filter(
    (item) =>
      item.result_type === resultTypeByDimension[dimension] &&
      item.metric_name === "total_lead_value",
  );
}

export function getApprovedGroupResult(
  dimension: AssistantDimension,
  group: string,
): IntelligenceResult | undefined {
  const normalizedGroup = group.trim().toLowerCase();

  return getApprovedResultsByDimension(dimension).find(
    (item) => item.group_key?.trim().toLowerCase() === normalizedGroup,
  );
}

export function getSmallGroupWarnings(): IntelligenceResult[] {
  return getApprovedResultsByDimension("stage").filter(
    (item) => (item.evidence.lead_count ?? Number.MAX_SAFE_INTEGER) < 5,
  );
}

export function buildResultEvidence(
  result: IntelligenceResult,
): AssistantEvidenceReference {
  return {
    source_id: result.result_id,
    source_type: "intelligence_result",
    result_id: result.result_id,
    group: result.group_key ?? undefined,
    metric: result.metric_name,
    value: result.result_value,
    unit: result.result_unit,
    finding: result.finding,
    evidence: result.evidence,
    data_version: result.data_version,
    method_version: result.method_version,
    generated_at: result.generated_at,
    quality_status: result.quality_status,
    limitation: result.limitation,
  };
}

export function buildSummaryEvidence(): AssistantEvidenceReference {
  return {
    source_id: "intelligence_summary.json",
    source_type: "intelligence_summary",
    data_version: summary.data_version,
    method_version: summary.method_version,
    generated_at: summary.generated_at,
    quality_status: QUALITY_STATUS,
    limitation: summary.limitations.join(" "),
  };
}
