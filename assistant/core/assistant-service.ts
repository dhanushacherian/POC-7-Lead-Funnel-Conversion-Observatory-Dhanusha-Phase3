

import config from "../config/assistant.config.json";

import type {
  AssistantIntent,
  AssistantResponse,
  AssistantStatus,
  IntentResolution,
} from "./contracts";

import { checkQuestionScope } from "./scope-guard";
import { resolveIntent } from "./intent-resolver";
import { validateAssistantResponse } from "./response-validator";

import {
  buildResultEvidence,
  buildSummaryEvidence,
  getApprovedGroupResult,
  getApprovedResultById,
  getApprovedResultsByDimension,
  getApprovedSummary,
  getSmallGroupWarnings,
} from "../queries/intelligence-queries";

import type { IntelligenceResult } from "../../src/types/intelligence";

const summary = getApprovedSummary();

const QUALITY_STATUS = "VALIDATED_DESCRIPTIVE" as const;

function makeResponse(
  status: AssistantStatus,
  intent: AssistantIntent | null,
  answer: string,
  options: {
    evidence?: AssistantResponse["evidence_references"];
    keyValues?: AssistantResponse["key_values"];
    limitation?: string | null;
    followUps?: string[];
  } = {},
): AssistantResponse {
  return validateAssistantResponse({
    answer_id: `assistant-${Date.now()}`,
    status,
    intent,
    answer,
    explanation: null,
    explanation_status: "UNAVAILABLE",
    evidence_references: options.evidence ?? [],
    key_values: options.keyValues ?? {},
    metadata: {
      assistant_id: config.assistant_id,
      assistant_version: config.assistant_version,
      mode: "A_DETERMINISTIC_GUIDED",
      llm_enabled: false,
      data_version: summary.data_version,
      method_version: summary.method_version,
      quality_status: QUALITY_STATUS,
      validation_result: summary.validation_result,
      generated_at: summary.generated_at,
    },
    limitation: options.limitation ?? null,
    suggested_follow_ups: options.followUps ?? [
      "What is the approved summary?",
      "What are the documented limitations?",
      "What data version is being used?",
    ],
  });
}

function explainResult(item: IntelligenceResult): AssistantResponse {
  return makeResponse(
    "SUPPORTED",
    "explain_result",
    item.finding,
    {
      evidence: [buildResultEvidence(item)],
      keyValues: {
        result_id: item.result_id,
        group: item.group_key,
        metric: item.metric_name,
        value: item.result_value,
        unit: item.result_unit,
      },
      limitation: item.limitation,
      followUps: [
        "What is the approved summary?",
        "What are the documented limitations?",
      ],
    },
  );
}

function resolveComparison(
  resolution: IntentResolution,
): AssistantResponse {
  const dimension = resolution.dimension;

  if (!dimension) {
    return makeResponse(
      "MISSING_PARAMETER",
      "compare_groups",
      "Please specify whether you want to compare stages, products, or acquisition sources.",
    );
  }

  const candidates = getApprovedResultsByDimension(dimension);

  if (!resolution.group_a && !resolution.group_b) {
    const top = candidates.find((item) => item.priority_rank === 1);

    if (!top) {
      return makeResponse(
        "UNAVAILABLE",
        "compare_groups",
        "The approved result needed for this comparison is unavailable.",
      );
    }

    return makeResponse(
      "SUPPORTED",
      "compare_groups",
      `The approved results identify ${top.group_key} as the highest-ranked group for total lead value in the ${dimension} comparison. The recorded value is ${top.result_value} ${top.result_unit}.`,
      {
        evidence: [buildResultEvidence(top)],
        keyValues: {
          dimension,
          group: top.group_key,
          metric: top.metric_name,
          value: top.result_value,
          priority_rank: top.priority_rank,
        },
        limitation: top.limitation,
      },
    );
  }

  if (!resolution.group_a || !resolution.group_b) {
    return makeResponse(
      "MISSING_PARAMETER",
      "compare_groups",
      resolution.message,
      {
        keyValues: { dimension },
      },
    );
  }

  const first = getApprovedGroupResult(
    dimension,
    resolution.group_a,
  );
  const second = getApprovedGroupResult(
    dimension,
    resolution.group_b,
  );

  if (!first || !second) {
    return makeResponse(
      "UNAVAILABLE",
      "compare_groups",
      "One or both requested groups are not available in the approved results for this dimension.",
    );
  }

  return makeResponse(
    "SUPPORTED",
    "compare_groups",
    `${first.group_key} has an approved total lead value of ${first.result_value} ${first.result_unit}; ${second.group_key} has ${second.result_value} ${second.result_unit}. These are descriptive comparisons, not evidence of causation.`,
    {
      evidence: [
        buildResultEvidence(first),
        buildResultEvidence(second),
      ],
      keyValues: {
        dimension,
        first_group: first.group_key,
        first_value: first.result_value,
        second_group: second.group_key,
        second_value: second.result_value,
      },
      limitation: `${first.limitation} ${second.limitation}`,
    },
  );
}

export function answerQuestion(
  question: unknown,
): AssistantResponse {
  const scope = checkQuestionScope(question);

  if (scope.status !== "SUPPORTED") {
    return makeResponse(
      scope.status,
      null,
      scope.message,
    );
  }

  const resolution = resolveIntent(scope.normalizedQuestion);

  if (resolution.status !== "SUPPORTED") {
    return makeResponse(
      resolution.status,
      resolution.intent,
      resolution.message,
    );
  }

  switch (resolution.intent) {
    case "get_summary": {
      return makeResponse(
        "SUPPORTED",
        "get_summary",
        `${summary.primary_question} ${summary.decision} Key findings: ${summary.key_findings.join(" ")}`,
        {
          evidence: [buildSummaryEvidence()],
          keyValues: {
            result_count: summary.result_count,
            data_version: summary.data_version,
            method_version: summary.method_version,
            validation_result: summary.validation_result,
            quality_status: QUALITY_STATUS,
            weak_case_count: summary.weak_case_count,
          },
          limitation: summary.limitations.join(" "),
        },
      );
    }

    case "get_data_freshness":
      return makeResponse(
        "SUPPORTED",
        "get_data_freshness",
        `The approved Track A data version is ${summary.data_version}; the method version is ${summary.method_version}. The published summary was generated at ${summary.generated_at}.`,
        {
          evidence: [buildSummaryEvidence()],
          keyValues: {
            data_version: summary.data_version,
            method_version: summary.method_version,
            generated_at: summary.generated_at,
          },
          limitation:
            "This reports the metadata in the approved published summary; it does not independently establish that the underlying business data is current.",
        },
      );

    case "explain_limitation":
      return makeResponse(
        "SUPPORTED",
        "explain_limitation",
        summary.limitations.join(" "),
        {
          evidence: [buildSummaryEvidence()],
          keyValues: {
            weak_case_count: summary.weak_case_count,
            validation_result: summary.validation_result,
            quality_status: QUALITY_STATUS,
          },
          limitation:
            "These limitations come from the approved summary and should be considered when interpreting descriptive comparisons.",
        },
      );

    case "explain_method":
      return makeResponse(
        "SUPPORTED",
        "explain_method",
        "The approved analysis is Track A - Comparative Intelligence. This assistant retrieves existing validated descriptive results; it does not run new statistical analyses, predictions, or causal tests.",
        {
          evidence: [buildSummaryEvidence()],
          keyValues: {
            approved_track: summary.approved_track,
            method_version: summary.method_version,
            quality_status: QUALITY_STATUS,
            validation_result: summary.validation_result,
          },
          limitation: summary.limitations.join(" "),
        },
      );

    case "get_small_group_warnings": {
      const warnings = getSmallGroupWarnings();
      const warningEvidence = warnings.map(buildResultEvidence);

      if (warnings.length === 0) {
        return makeResponse(
          "SUPPORTED",
          "get_small_group_warnings",
          "No stage groups with fewer than five leads were identified in the approved results.",
          {
            evidence: [buildSummaryEvidence()],
            limitation: summary.limitations.join(" "),
          },
        );
      }

      return makeResponse(
        "SUPPORTED",
        "get_small_group_warnings",
        `The following stage groups have fewer than five leads: ${warnings.map((item) => `${item.group_key} (${item.evidence.lead_count ?? "count unavailable"} leads)`).join(", ")}.`,
        {
          evidence: warningEvidence,
          keyValues: {
            groups: warnings
              .map((item) => item.group_key)
              .join(", "),
            count: warnings.length,
          },
          limitation:
            "Small groups may produce less stable descriptive comparisons. Only group counts in approved results are used.",
        },
      );
    }

    case "explain_result": {
      const item = resolution.result_id
        ? getApprovedResultById(resolution.result_id)
        : undefined;

      if (!item) {
        return makeResponse(
          "UNAVAILABLE",
          "explain_result",
          "That result ID was not found in the approved intelligence results. Please use an exact approved result ID.",
        );
      }

      return explainResult(item);
    }

    case "compare_groups":
      return resolveComparison(resolution);

    default:
      return makeResponse(
        "OUT_OF_SCOPE",
        null,
        "That question is not supported by the approved assistant catalog.",
      );
  }
}
