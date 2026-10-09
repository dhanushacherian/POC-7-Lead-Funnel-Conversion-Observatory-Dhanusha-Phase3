import type {
  IntelligenceResult,
  IntelligenceSummary,
} from "../../src/types/intelligence";

export type AssistantStatus =
  | "SUPPORTED"
  | "MISSING_PARAMETER"
  | "AMBIGUOUS"
  | "OUT_OF_SCOPE"
  | "UNSAFE"
  | "UNAVAILABLE";

export type AssistantIntent =
  | "get_summary"
  | "compare_groups"
  | "explain_result"
  | "explain_method"
  | "explain_limitation"
  | "get_data_freshness"
  | "get_small_group_warnings";

export type AssistantDimension = "stage" | "product" | "source";

export type AssistantEvidenceReference = {
  source_id: string;
  source_type: "intelligence_result" | "intelligence_summary";
  result_id?: string;
  group?: string;
  metric?: string;
  value?: number;
  unit?: string;
  finding?: string;
  evidence?: IntelligenceResult["evidence"];
  data_version: string;
  method_version: string;
  generated_at: string;
  quality_status?: IntelligenceResult["quality_status"];
  validation_result?: string;
  limitation?: string;
};

export type AssistantResponse = {
  answer_id: string;
  status: AssistantStatus;
  intent: AssistantIntent | null;
  answer: string;
  explanation: string | null;
  explanation_status: "AVAILABLE" | "UNAVAILABLE";
  evidence_references: AssistantEvidenceReference[];
  key_values: Record<string, string | number | boolean | null>;
  metadata: {
    assistant_id: string;
    assistant_version: string;
    mode: "A_DETERMINISTIC_GUIDED";
    llm_enabled: boolean;
    data_version: string;
    method_version: string;
    quality_status: IntelligenceResult["quality_status"];
    validation_result: string;
    generated_at: string;
  };
  limitation: string | null;
  suggested_follow_ups: string[];
};

export type AssistantQueryContext = {
  results: IntelligenceResult[];
  summary: IntelligenceSummary;
};

export type IntentResolution = {
  status: AssistantStatus;
  intent: AssistantIntent | null;
  dimension?: AssistantDimension;
  group_a?: string;
  group_b?: string;
  result_id?: string;
  message: string;
};
