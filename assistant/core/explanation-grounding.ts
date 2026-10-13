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

function expectedWinningGroup(answer: string): string | null {
  const match = answer.match(
    /identify\s+(.+?)\s+as the highest-ranked group/i
  );

  return match?.[1]?.trim() ?? null;
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

  // Reject an explanation that names a different highest-ranked group.
  const winner = expectedWinningGroup(input.deterministicAnswer);

  if (winner) {
    const competingWinner = explanation.match(
      /\b([A-Za-z][A-Za-z0-9_-]*)\s+(?:stage|product|source|category|group)\b[^.!?]{0,100}\b(?:highest|largest|greatest|top-ranked|top ranked)\b/i
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
