import rawSummary from "../../data/demo/phase3-demo-v1/analytics/intelligence_summary.json";

type MetricRow = {
  stage?: string;
  product?: string;
  source?: string;
  team?: string;
  location?: string;
  lead_count: number;
  total_lead_value: number;
  average_lead_value: number;
  average_days_in_stage: number;
  median_days_in_stage: number;
  value_share_percent: number;
};

type DemoSummary = {
  project: string;
  dataset_classification: string;
  data_version: string;
  random_seed: number;
  observation_window: {
    start: string;
    end: string;
    calendar_months: number;
  };
  overall_summary: {
    source_leads_analyzed: number;
    canonical_rows_processed: number;
    total_lead_value: number;
    average_lead_value: number;
    average_days_in_stage: number;
    median_days_in_stage: number;
  };
  highest_observed_groups: {
    highest_value_stage: { stage: string; total_lead_value: number };
    highest_value_product: { product: string; total_lead_value: number };
    highest_value_source: { source: string; total_lead_value: number };
    highest_average_age_stage: {
      stage: string;
      average_days_in_stage: number;
    };
  };
  dimensions: {
    stage: MetricRow[];
    product: MetricRow[];
    source: MetricRow[];
    team: MetricRow[];
    location: MetricRow[];
  };
  interpretation: string[];
  limitations: string[];
};

type Evidence = {
  source_id: string;
  source_type: string;
  group?: string;
  metric?: string;
  value?: number;
  unit?: string;
  finding: string;
  data_version: string;
  method_version: string;
  generated_at: string;
  quality_status: string;
  limitation: string;
};

type ReplyStatus = "SUPPORTED" | "UNSUPPORTED" | "MISSING_PARAMETER";

type DemoReply = {
  answer_id: string;
  status: ReplyStatus;
  intent: string | null;
  answer: string;
  explanation: null;
  explanation_status: "UNAVAILABLE";
  evidence_references: Evidence[];
  key_values: Record<string, string | number | boolean | null>;
  metadata: {
    assistant_id: string;
    assistant_version: string;
    mode: string;
    llm_enabled: boolean;
    data_version: string;
    method_version: string;
    quality_status: string;
    generated_at: string;
  };
  limitation: string;
  suggested_follow_ups: string[];
};

const summary = rawSummary as DemoSummary;
const METHOD_VERSION = "demo-assistant-rules-1.0.0";
const QUALITY_STATUS = "SYNTHETIC_DEMO_DESCRIPTIVE";

const LIMITATION =
  "All figures come from synthetic demonstration data. Results are descriptive, use currency-unspecified units, and do not establish causation, real-world outcomes, stage transitions, conversion rates, or seasonality.";

function format(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(value);
}

function createReply(
  status: ReplyStatus,
  intent: string | null,
  answer: string,
  evidence: Array<{
    source_id: string;
    group?: string;
    metric?: string;
    value?: number;
    unit?: string;
    finding?: string;
  }> = [],
  keyValues: Record<string, string | number | boolean | null> = {},
): DemoReply {
  const generatedAt = new Date().toISOString();

  return {
    answer_id: `demo-assistant-${Date.now()}`,
    status,
    intent,
    answer,
    explanation: null,
    explanation_status: "UNAVAILABLE",
    evidence_references: evidence.map((item) => ({
      source_id: item.source_id,
      source_type: "demo_intelligence_summary",
      ...(item.group !== undefined ? { group: item.group } : {}),
      ...(item.metric !== undefined ? { metric: item.metric } : {}),
      ...(item.value !== undefined ? { value: item.value } : {}),
      ...(item.unit !== undefined ? { unit: item.unit } : {}),
      finding: item.finding ?? answer,
      data_version: summary.data_version,
      method_version: METHOD_VERSION,
      generated_at: generatedAt,
      quality_status: QUALITY_STATUS,
      limitation: LIMITATION,
    })),
    key_values: keyValues,
    metadata: {
      assistant_id: "phase3-demo-grounded-assistant",
      assistant_version: "1.0.0",
      mode: "deterministic",
      llm_enabled: false,
      data_version: summary.data_version,
      method_version: METHOD_VERSION,
      quality_status: QUALITY_STATUS,
      generated_at: generatedAt,
    },
    limitation: LIMITATION,
    suggested_follow_ups: [
      "Which stage has the highest total lead value?",
      "Which product has the highest total lead value?",
      "Compare Won and Lost stages.",
      "What are the limitations?",
    ],
  };
}

export function answerDemoQuestion(question: unknown): DemoReply {
  if (typeof question !== "string" || !question.trim()) {
    return createReply(
      "MISSING_PARAMETER",
      null,
      "Please enter a question about the synthetic demo dataset.",
    );
  }

  if (question.length > 500) {
    return createReply(
      "UNSUPPORTED",
      null,
      "Questions must be 500 characters or fewer.",
    );
  }

  const normalized = question.trim().toLowerCase();

  if (
    normalized.includes("limitation") ||
    normalized.includes("conversion rate") ||
    normalized.includes("conversion rates") ||
    normalized.includes("transition history") ||
    normalized.includes("seasonality") ||
    normalized.includes("causation")
  ) {
    return createReply(
      "SUPPORTED",
      "get_limitations",
      summary.limitations.join(" "),
      [
        {
          source_id: "demo-summary-limitations",
          metric: "limitations",
          finding: summary.limitations.join(" "),
        },
      ],
    );
  }

  if (
    normalized.includes("version") ||
    normalized.includes("random seed") ||
    normalized.includes("observation window")
  ) {
    const answer =
      `The dataset version is ${summary.data_version}, generated with seed ${summary.random_seed}. ` +
      `The observation window is ${summary.observation_window.start} to ${summary.observation_window.end}, ` +
      `covering ${summary.observation_window.calendar_months} calendar months.`;

    return createReply(
      "SUPPORTED",
      "get_data_version",
      answer,
      [
        {
          source_id: "demo-summary-metadata",
          metric: "data_version",
          finding: answer,
        },
      ],
      {
        data_version: summary.data_version,
        random_seed: summary.random_seed,
        observation_start: summary.observation_window.start,
        observation_end: summary.observation_window.end,
      },
    );
  }

  if (
    normalized.includes("summary") ||
    normalized.includes("how many leads") ||
    normalized.includes("dataset overview") ||
    normalized.includes("how was the analysis performed")
  ) {
    const stats = summary.overall_summary;
    const answer =
      `This synthetic demonstration contains ${format(stats.source_leads_analyzed)} source leads ` +
      `and ${format(stats.canonical_rows_processed)} canonical rows. Total observed lead value is ` +
      `${format(stats.total_lead_value)} currency-unspecified units. Average lead value is ` +
      `${format(stats.average_lead_value)} units. Mean current-stage age is ` +
      `${format(stats.average_days_in_stage)} days and median age is ` +
      `${format(stats.median_days_in_stage)} days. The dataset contains current-stage snapshots, not transition history.`;

    return createReply(
      "SUPPORTED",
      "get_demo_summary",
      answer,
      [
        {
          source_id: "demo-summary-overall",
          metric: "source_leads_analyzed",
          value: stats.source_leads_analyzed,
          unit: "leads",
          finding: `The dataset contains ${format(stats.source_leads_analyzed)} synthetic source leads.`,
        },
        {
          source_id: "demo-summary-overall",
          metric: "canonical_rows_processed",
          value: stats.canonical_rows_processed,
          unit: "rows",
          finding: `The analytical process processed ${format(stats.canonical_rows_processed)} canonical rows.`,
        },
        {
          source_id: "demo-summary-overall",
          metric: "total_lead_value",
          value: stats.total_lead_value,
          unit: "currency-unspecified units",
          finding: `Total observed lead value is ${format(stats.total_lead_value)} currency-unspecified units.`,
        },
      ],
      {
        source_leads: stats.source_leads_analyzed,
        canonical_rows: stats.canonical_rows_processed,
        total_lead_value: stats.total_lead_value,
        average_lead_value: stats.average_lead_value,
        mean_days_in_stage: stats.average_days_in_stage,
        median_days_in_stage: stats.median_days_in_stage,
      },
    );
  }

  const wantsHighestAge =
    normalized.includes("highest average age") ||
    normalized.includes("oldest stage") ||
    normalized.includes("longest");

  if (wantsHighestAge && normalized.includes("stage")) {
    const top = summary.highest_observed_groups.highest_average_age_stage;
    const answer =
      `${top.stage} has the highest average recorded age in this synthetic snapshot: ` +
      `${format(top.average_days_in_stage)} days. This does not explain why records remain in that stage.`;

    return createReply(
      "SUPPORTED",
      "get_highest_average_stage_age",
      answer,
      [
        {
          source_id: "demo-summary-highest-average-age",
          group: top.stage,
          metric: "average_days_in_stage",
          value: top.average_days_in_stage,
          unit: "days",
        },
      ],
      {
        stage: top.stage,
        average_days_in_stage: top.average_days_in_stage,
      },
    );
  }

  const highestValue = normalized.includes("highest") ||
    normalized.includes("top") ||
    normalized.includes("most");

  if (highestValue && (normalized.includes("stage") || normalized.includes("funnel"))) {
    const top = summary.highest_observed_groups.highest_value_stage;
    return createReply(
      "SUPPORTED",
      "get_highest_value_stage",
      `${top.stage} has the highest observed total lead value by stage: ${format(top.total_lead_value)} currency-unspecified units in this synthetic sample.`,
      [{
        source_id: "demo-summary-highest-value-stage",
        group: top.stage,
        metric: "total_lead_value",
        value: top.total_lead_value,
        unit: "currency-unspecified units",
      }],
      { stage: top.stage, total_lead_value: top.total_lead_value },
    );
  }

  if (highestValue && normalized.includes("product")) {
    const top = summary.highest_observed_groups.highest_value_product;
    return createReply(
      "SUPPORTED",
      "get_highest_value_product",
      `${top.product} has the highest observed total lead value by product: ${format(top.total_lead_value)} currency-unspecified units in this synthetic sample.`,
      [{
        source_id: "demo-summary-highest-value-product",
        group: top.product,
        metric: "total_lead_value",
        value: top.total_lead_value,
        unit: "currency-unspecified units",
      }],
      { product: top.product, total_lead_value: top.total_lead_value },
    );
  }

  if (
    highestValue &&
    (normalized.includes("source") || normalized.includes("acquisition"))
  ) {
    const top = summary.highest_observed_groups.highest_value_source;
    return createReply(
      "SUPPORTED",
      "get_highest_value_source",
      `${top.source} has the highest observed total lead value by acquisition source: ${format(top.total_lead_value)} currency-unspecified units in this synthetic sample.`,
      [{
        source_id: "demo-summary-highest-value-source",
        group: top.source,
        metric: "total_lead_value",
        value: top.total_lead_value,
        unit: "currency-unspecified units",
      }],
      { source: top.source, total_lead_value: top.total_lead_value },
    );
  }

  if (
    normalized.includes("compare won and lost") ||
    (normalized.includes("won") && normalized.includes("lost"))
  ) {
    const won = summary.dimensions.stage.find((row) => row.stage === "Won");
    const lost = summary.dimensions.stage.find((row) => row.stage === "Lost");

    if (won && lost) {
      const answer =
        `In the current snapshot, Won contains ${won.lead_count} leads with total observed value ` +
        `${format(won.total_lead_value)} units and average age ${format(won.average_days_in_stage)} days. ` +
        `Lost contains ${lost.lead_count} leads with total observed value ${format(lost.total_lead_value)} units ` +
        `and average age ${format(lost.average_days_in_stage)} days. These are current-stage comparisons, not transition or conversion rates.`;

      return createReply(
        "SUPPORTED",
        "compare_won_lost",
        answer,
        [
          {
            source_id: "demo-stage-won",
            group: "Won",
            metric: "total_lead_value",
            value: won.total_lead_value,
            unit: "currency-unspecified units",
          },
          {
            source_id: "demo-stage-lost",
            group: "Lost",
            metric: "total_lead_value",
            value: lost.total_lead_value,
            unit: "currency-unspecified units",
          },
        ],
        {
          won_leads: won.lead_count,
          won_value: won.total_lead_value,
          won_average_age_days: won.average_days_in_stage,
          lost_leads: lost.lead_count,
          lost_value: lost.total_lead_value,
          lost_average_age_days: lost.average_days_in_stage,
        },
      );
    }
  }

  if (
    normalized.includes("average age") ||
    normalized.includes("mean age") ||
    normalized.includes("average days") ||
    normalized.includes("median age")
  ) {
    const stats = summary.overall_summary;
    const useMedian = normalized.includes("median");
    const value = useMedian
      ? stats.median_days_in_stage
      : stats.average_days_in_stage;
    const metric = useMedian ? "median_days_in_stage" : "average_days_in_stage";

    return createReply(
      "SUPPORTED",
      "get_average_stage_age",
      `The ${useMedian ? "median" : "mean"} recorded age across current-stage records is ${format(value)} days in the synthetic demo dataset.`,
      [{
        source_id: "demo-summary-overall-age",
        metric,
        value,
        unit: "days",
      }],
      { [metric]: value },
    );
  }

  return createReply(
    "UNSUPPORTED",
    null,
    "I can answer questions grounded in this demo's summary, highest-value stage/product/source, current-stage age, Won-versus-Lost snapshot comparison, dataset version, and limitations. I cannot infer historical transitions, real conversion rates, causes, seasonality, or future outcomes.",
  );
}

