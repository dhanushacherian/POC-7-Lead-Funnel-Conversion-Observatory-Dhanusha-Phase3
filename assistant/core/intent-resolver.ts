

import type {
  AssistantDimension,
  AssistantIntent,
  AssistantStatus,
  IntentResolution,
} from "./contracts";

const DIMENSIONS: Record<AssistantDimension, string[]> = {
  stage: ["Lead", "Qualified", "Opportunity", "Proposal", "Won", "Lost"],
  product: ["Payments", "Analytics", "Security"],
  source: ["Website", "Partner", "Referral", "Campaign"],
};

function result(
  status: AssistantStatus,
  intent: AssistantIntent | null,
  message: string,
  extra: Partial<IntentResolution> = {},
): IntentResolution {
  return { status, intent, message, ...extra };
}

function findDimension(question: string): AssistantDimension | undefined {
  const q = question.toLowerCase();
  const matches: AssistantDimension[] = [];

  if (/\bstages?\b/.test(q)) matches.push("stage");
  if (/\bproducts?\b/.test(q)) matches.push("product");

  if (
    /\b(sources?|acquisition channels?)\b/.test(q)
  ) {
    matches.push("source");
  }

  return matches.length === 1 ? matches[0] : undefined;
}

function findGroups(
  question: string,
  dimension: AssistantDimension,
): string[] {
  return DIMENSIONS[dimension].filter((group) =>
    new RegExp(
      `\\b${group.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "i",
    ).test(question),
  );
}

export function resolveIntent(question: string): IntentResolution {
  const q = question.trim().replace(/\s+/g, " ");
  const lower = q.toLowerCase();

  if (
    /\b(what is|give me|show me|provide|summari[sz]e)\b/.test(lower) &&
    /\b(approved )?(summary|overview|key findings)\b/.test(lower)
  ) {
    return result("SUPPORTED", "get_summary", "Approved summary requested.");
  }

  if (
    /\b(data version|method version|freshness|when was .*generated|generated at)\b/.test(
      lower,
    )
  ) {
    return result(
      "SUPPORTED",
      "get_data_freshness",
      "Approved data and method metadata requested.",
    );
  }

  if (
    /\b(limitations?|caveats|weak cases|small sample sizes?)\b/.test(lower) &&
    !/\b(which|what|list|show)\b.{0,30}\b(groups?|categories)\b/.test(lower)
  ) {
    return result(
      "SUPPORTED",
      "explain_limitation",
      "Documented limitations requested.",
    );
  }

  if (
    /\b(methodology|method|how was .*analysis performed|how is .*analysis performed)\b/.test(
      lower,
    )
  ) {
    return result(
      "SUPPORTED",
      "explain_method",
      "Approved methodology requested.",
    );
  }

  if (
    /\b(fewer than five|less than five|under five|small group warnings?)\b/.test(
      lower,
    ) ||
    /\b(groups?|categories)\b.{0,40}\b(fewer than|less than|under)\s+5\b/.test(
      lower,
    )
  ) {
    return result(
      "SUPPORTED",
      "get_small_group_warnings",
      "Approved small-group warnings requested.",
    );
  }

  // Reject average-value rankings unless an approved comparison metric exists.
  if (
    /\b(highest|largest|top|most)\b/.test(lower) &&
    /\b(average lead value|average value|mean lead value)\b/.test(lower) &&
    /\b(stages?|products?|sources?|acquisition channels?)\b/.test(lower)
  ) {
    return result(
      "UNAVAILABLE",
      "compare_groups",
      "The approved comparison results do not provide average lead value rankings for stages, products, or acquisition sources. Only approved total lead value comparisons are available.",
      { dimension: findDimension(q) },
    );
  }

  const resultIdMatch = q.match(
    /\b(baseline_[a-z_]+|stage_[a-z_]+_total_value|product_[a-z_]+_total_value|source_[a-z_]+_total_value)\b/i,
  );

  if (
    /\b(explain|describe|details for|tell me about)\b/.test(lower) &&
    resultIdMatch
  ) {
    return result(
      "SUPPORTED",
      "explain_result",
      "A specific approved result was requested.",
      { result_id: resultIdMatch[1].toLowerCase() },
    );
  }

  const dimension = findDimension(q);

  if (
    /\b(compare|difference between|versus|vs\.?)\b/.test(lower) &&
    dimension
  ) {
    const groups = findGroups(q, dimension);

    if (groups.length === 0) {
      return result(
        "MISSING_PARAMETER",
        "compare_groups",
        `Please name two approved ${dimension} groups to compare.`,
        { dimension },
      );
    }

    if (groups.length === 1) {
      return result(
        "MISSING_PARAMETER",
        "compare_groups",
        `Please name a second approved ${dimension} group to compare with ${groups[0]}.`,
        { dimension, group_a: groups[0] },
      );
    }

    if (groups.length > 2) {
      return result(
        "AMBIGUOUS",
        "compare_groups",
        "Please compare exactly two approved groups in one question.",
        { dimension },
      );
    }

    return result(
      "SUPPORTED",
      "compare_groups",
      `Compare ${groups[0]} with ${groups[1]} for ${dimension}.`,
      { dimension, group_a: groups[0], group_b: groups[1] },
    );
  }

  if (
    /\b(highest|largest|top|most)\b/.test(lower) &&
    /\b(total lead value|lead value|total value)\b/.test(lower)
  ) {
    if (dimension) {
      return result(
        "SUPPORTED",
        "compare_groups",
        `Highest approved total lead value requested for ${dimension}.`,
        { dimension },
      );
    }
  }

  if (
    /\b(explain|describe|details for|tell me about)\b/.test(lower) &&
    /\b(analysis|result|finding|track a)\b/.test(lower)
  ) {
    return result(
      "MISSING_PARAMETER",
      "explain_result",
      "Please provide an approved result ID or name a specific approved group.",
    );
  }

  return result(
    "OUT_OF_SCOPE",
    null,
    "I could not match that question to an approved question pattern. Try asking for the approved summary, a highest-total-value stage/product/source, a comparison of two named groups, methodology, limitations, data version, or small-group warnings.",
  );
}
