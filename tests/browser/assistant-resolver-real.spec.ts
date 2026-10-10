import { test, expect } from "@playwright/test";
import { resolveIntent } from "../../assistant/core/intent-resolver";

test("real resolver accepts two approved stage groups", () => {
  const result = resolveIntent("Compare Won versus Lost stages");

  expect(result.status).toBe("SUPPORTED");
  expect(result.intent).toBe("compare_groups");
  expect(result.dimension).toBe("stage");
  expect(result.group_a).toBe("Won");
  expect(result.group_b).toBe("Lost");
});

test("real resolver requests a missing comparison group", () => {
  const result = resolveIntent("Compare Won stages");

  expect(result.status).toBe("MISSING_PARAMETER");
  expect(result.intent).toBe("compare_groups");
  expect(result.group_a).toBe("Won");
});

test("real resolver rejects unapproved group names", () => {
  const result = resolveIntent("Compare Mars versus Venus stages");

  expect(result.status).toBe("MISSING_PARAMETER");
  expect(result.intent).toBe("compare_groups");
});

test("real resolver flags more than two groups as ambiguous", () => {
  const result = resolveIntent("Compare Lead, Qualified and Won stages");

  expect(result.status).toBe("AMBIGUOUS");
  expect(result.intent).toBe("compare_groups");
});
