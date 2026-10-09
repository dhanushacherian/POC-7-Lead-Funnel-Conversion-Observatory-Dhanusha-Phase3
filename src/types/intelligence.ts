
export type IntelligenceResultType =
  | "stage_comparison"
  | "product_comparison"
  | "source_comparison"
  | "baseline_summary";

export type IntelligenceMetric =
  | "total_lead_value"
  | "average_lead_value"
  | "average_days_in_stage"
  | "median_days_in_stage"
  | "lead_count"
  | "value_share_percent";

export type IntelligenceQualityStatus = "VALIDATED_DESCRIPTIVE";

export type IntelligenceEvidence = {
  group?: string;
  lead_count?: number;
  total_lead_value?: number;
  average_lead_value?: number;
  average_days_in_stage?: number;
  median_days_in_stage?: number;
  metric_unit?: string;
};

export type IntelligenceResult = {
  result_id: string;
  result_type: IntelligenceResultType;
  record_id: string | null;
  entity_id: string | null;
  group_key: string | null;
  period_start: string | null;
  period_end: string | null;
  metric_name: IntelligenceMetric;
  result_value: number;
  result_unit: string;
  result_category: string;
  priority_rank: number | null;
  finding: string;
  evidence: IntelligenceEvidence;
  method_version: string;
  data_version: string;
  generated_at: string;
  quality_status: IntelligenceQualityStatus;
  limitation: string;
};

export type IntelligenceResultsDocument = {
  project_id: string;
  poc_title: string;
  approved_track: "Track A - Comparative Intelligence";
  data_version: string;
  method_version: string;
  generated_at: string;
  result_count: number;
  results: IntelligenceResult[];
};

export type IntelligencePriorityItem = {
  rank: number;
  dimension: string;
  group: string;
  metric: string;
  value: number;
};

export type IntelligenceSummary = {
  project_id: string;
  poc_title: string;
  data_version: string;
  method_version: string;
  approved_track: "Track A - Comparative Intelligence";
  primary_question: string;
  decision: string;
  result_count: number;
  key_findings: string[];
  priority_items: IntelligencePriorityItem[];
  validation_result: string;
  weak_case_count: number;
  limitations: string[];
  generated_at: string;
};
