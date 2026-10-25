export type ExplanationGroundingInput = {
  deterministicAnswer: string;
  evidenceReferences: Array<{
    group?: string;
    finding?: string;
    value?: number;
    unit?: string;
    data_version?: string;
    method_version?: string;
    limitation?: string;
  }>;
  limitation: string | null;
};

function extractNumbers(text: string): number[] {
  const matches = text.match(/-?\d[\d,]*(?:\.\d+)?/g) ?? [];

  return matches
    .map((value) => Number(value.replace(/,/g, "")))
    .filter(Number.isFinite);
}

function expectedWinningGroup(
  answer: string,
  evidenceReferences: ExplanationGroundingInput["evidenceReferences"]
): string | null {
  const answerPatterns = [
    /identify\s+(.+?)\s+as the highest-ranked group/i,
    /(?:the\s+)?([A-Za-z][A-Za-z0-9_-]*)\s+(?:stage|product|source|category|group)\s+(?:has|is|was)\s+(?:the\s+)?(?:highest|largest|greatest|top-ranked|top ranked)/i,
  ];

  for (const pattern of answerPatterns) {
    const match = answer.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  // Fall back to the approved evidence when the answer uses different wording.
  for (const item of evidenceReferences) {
    const finding = item.finding ?? "";
    const findingMatch = finding.match(
      /^\s*([A-Za-z][A-Za-z0-9_-]*)\s+(?:has|is|was)\s+(?:the\s+)?(?:highest|largest|greatest|top-ranked|top ranked)\b/i
    );

    if (findingMatch?.[1]) {
      return findingMatch[1].trim();
    }

    if (
      item.group &&
      /\b(?:highest|largest|greatest|top-ranked|top ranked)\b/i.test(finding)
    ) {
      return item.group.trim();
    }
  }

  return null;
}

export function validateGroundedExplanation(
  explanation: string,
  input: ExplanationGroundingInput
): { valid: boolean; reason?: string } {
  if (!explanation.trim()) {
    return { valid: false, reason: "Empty explanation." };
  }

  // Only use approved findings and evidence to establish supported numbers.
  const approvedText = [
    input.deterministicAnswer,
    ...input.evidenceReferences.map((item) =>
      [
        item.finding ?? "",
        item.value ?? "",
        item.unit ?? "",
        item.limitation ?? "",
      ].join(" ")
    ),
    input.limitation ?? "",
  ].join("\n");

  const approvedNumbers = new Set(
    extractNumbers(approvedText).map(String)
  );

  const unsupportedNumber = extractNumbers(explanation).find(
    (value) => !approvedNumbers.has(String(value))
  );

  if (unsupportedNumber !== undefined) {
    return {
      valid: false,
      reason: `Unsupported numerical value: ${unsupportedNumber}`,
    };
  }

  // Reject claims that assign the highest ranking to a different group.
  const winner = expectedWinningGroup(
    input.deterministicAnswer,
    input.evidenceReferences
  );

  if (winner) {
    const competingWinner = explanation.match(
      /\b([A-Za-z][A-Za-z0-9_-]*)\s+(?:(?:stage|product|source|category|group)\s+)?(?:has|is|was|holds?)\s+(?:the\s+)?(?:highest|largest|greatest|top-ranked|top ranked)\b/i
    );

    if (
      competingWinner &&
      competingWinner[1].toLowerCase() !== winner.toLowerCase()
    ) {
      return {
        valid: false,
        reason: "Explanation contradicts the approved highest-ranked group.",
      };
    }

    const escapedWinner = winner.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const deniesWinner = new RegExp(
      `\\b${escapedWinner}\\b[^.!?]{0,80}\\b(?:is not|isn't|was not|does not have|doesn't have)\\s+(?:the\\s+)?(?:highest|largest|greatest|top-ranked)\\b`,
      "i"
    );

    if (deniesWinner.test(explanation)) {
      return {
        valid: false,
        reason: "Explanation contradicts the approved finding.",
      };
    }
  }

  return { valid: true };
}
