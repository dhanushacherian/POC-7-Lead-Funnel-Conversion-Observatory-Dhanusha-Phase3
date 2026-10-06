import rawResults from "../../src/data/intelligence/intelligence_results.json";

import {
  validateIntelligenceDocument,
  getGroupSizeWarning,
} from "../../src/data/intelligence/loader";

function assert(
  condition: boolean,
  message: string,
): void {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }

  console.log(`PASS: ${message}`);
}

function cloneDocument(): any {
  return JSON.parse(
    JSON.stringify(rawResults),
  );
}

console.log(
  "\n=== DATA INTELLIGENCE LOADER TEST ===\n",
);

// 1. Successful validation
const validResult =
  validateIntelligenceDocument(rawResults);

assert(
  validResult.status === "success",
  "Approved intelligence output loads successfully",
);

if (validResult.status === "success") {
  assert(
    validResult.data.data_version ===
      "phase3-v2",
    "Data version is phase3-v2",
  );

  assert(
    validResult.data.method_version ===
      "1.0.0",
    "Method version is 1.0.0",
  );

  assert(
    validResult.data.result_count ===
      16,
    "Result count is 16",
  );

  assert(
    validResult.data.results.length ===
      16,
    "Results array contains 16 records",
  );
}

// 2. Data version mismatch
const badDataVersion =
  cloneDocument();

badDataVersion.data_version =
  "wrong-version";

const dataVersionResult =
  validateIntelligenceDocument(
    badDataVersion,
  );

assert(
  dataVersionResult.status === "error" &&
    dataVersionResult.message.includes(
      "Data version mismatch",
    ),
  "Rejects data version mismatch",
);

// 3. Method version mismatch
const badMethodVersion =
  cloneDocument();

badMethodVersion.method_version =
  "9.9.9";

const methodVersionResult =
  validateIntelligenceDocument(
    badMethodVersion,
  );

assert(
  methodVersionResult.status === "error" &&
    methodVersionResult.message.includes(
      "Method version mismatch",
    ),
  "Rejects method version mismatch",
);

// 4. Result-count mismatch
const badCount =
  cloneDocument();

badCount.result_count = 999;

const countResult =
  validateIntelligenceDocument(
    badCount,
  );

assert(
  countResult.status === "error" &&
    countResult.message.includes(
      "result count",
    ),
  "Rejects result-count mismatch",
);

// 5. Duplicate result IDs
const duplicateIds =
  cloneDocument();

duplicateIds.results[1].result_id =
  duplicateIds.results[0].result_id;

const duplicateResult =
  validateIntelligenceDocument(
    duplicateIds,
  );

assert(
  duplicateResult.status === "error" &&
    duplicateResult.message.includes(
      "Duplicate intelligence result IDs",
    ),
  "Rejects duplicate result IDs",
);

// 6. Invalid generated timestamp
const badTimestamp =
  cloneDocument();

badTimestamp.generated_at =
  "not-a-valid-timestamp";

const timestampResult =
  validateIntelligenceDocument(
    badTimestamp,
  );

assert(
  timestampResult.status === "error" &&
    timestampResult.message.includes(
      "Generated timestamp is invalid",
    ),
  "Rejects invalid document timestamp",
);

// 7. Invalid result timestamp
const badResultTimestamp =
  cloneDocument();

badResultTimestamp.results[0].generated_at =
  "not-a-valid-timestamp";

const resultTimestampResult =
  validateIntelligenceDocument(
    badResultTimestamp,
  );

assert(
  resultTimestampResult.status === "error" &&
    resultTimestampResult.message.includes(
      "contract",
    ),
  "Rejects invalid result timestamp",
);

// 8. Unsupported quality status
const badQuality =
  cloneDocument();

badQuality.results[0].quality_status =
  "REJECTED";

const qualityResult =
  validateIntelligenceDocument(
    badQuality,
  );

assert(
  qualityResult.status === "error" &&
    qualityResult.message.includes(
      "contract",
    ),
  "Rejects unsupported quality status",
);

// 9. Missing results
const missingResults =
  cloneDocument();

delete missingResults.results;

const missingResultsResult =
  validateIntelligenceDocument(
    missingResults,
  );

assert(
  missingResultsResult.status === "error" &&
    missingResultsResult.message.includes(
      "missing or malformed",
    ),
  "Rejects missing results array",
);

// 10. Malformed document
const malformedResult =
  validateIntelligenceDocument(
    null,
  );

assert(
  malformedResult.status === "error" &&
    malformedResult.message.includes(
      "malformed",
    ),
  "Rejects malformed document",
);

// 11. Small-group warning
if (validResult.status === "success") {
  const proposal =
    validResult.data.results.find(
      (result) =>
        result.group_key ===
        "Proposal",
    );

  assert(
    proposal !== undefined,
    "Finds Proposal result",
  );

  if (proposal) {
    const warning =
      getGroupSizeWarning(proposal);

    assert(
      warning !== null,
      "Warns when group size is below minimum",
    );

    assert(
      warning?.includes("4 leads") ===
        true,
      "Proposal warning reports 4 leads",
    );
  }
}

console.log(
  "\n=== LOADER TEST PASSED ===\n",
);