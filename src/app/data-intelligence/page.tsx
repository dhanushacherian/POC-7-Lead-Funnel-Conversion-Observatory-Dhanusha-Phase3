"use client";

import { useMemo, useState } from "react";

import {
  getGroupSizeWarning,
  loadIntelligenceResults,
} from "@/data/intelligence/loader";

import type {
  IntelligenceResult,
  IntelligenceResultType,
} from "@/types/intelligence";

type ViewType =
  | "stage_comparison"
  | "product_comparison"
  | "source_comparison";

const VIEW_LABELS: Record<ViewType, string> = {
  stage_comparison: "Stages",
  product_comparison: "Products",
  source_comparison: "Sources",
};

const VIEW_TITLES: Record<ViewType, string> = {
  stage_comparison: "Funnel Stage Comparison",
  product_comparison: "Product Comparison",
  source_comparison: "Acquisition Source Comparison",
};

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatValue(value: number, unit: string): string {
  if (unit === "days") {
    return `${formatNumber(value)} days`;
  }

  if (unit === "percent") {
    return `${formatNumber(value)}%`;
  }

  return formatNumber(value);
}

function getViewType(
  resultType: IntelligenceResultType,
): ViewType | null {
  if (resultType === "stage_comparison") {
    return "stage_comparison";
  }

  if (resultType === "product_comparison") {
    return "product_comparison";
  }

  if (resultType === "source_comparison") {
    return "source_comparison";
  }

  return null;
}

export default function DataIntelligencePage() {
  const [selectedType, setSelectedType] =
    useState<ViewType>("stage_comparison");

  const [search, setSearch] = useState("");

  const loadResult = useMemo(
    () => loadIntelligenceResults(),
    [],
  );

  const filteredResults = useMemo(() => {
    if (loadResult.status !== "success") {
      return [] as IntelligenceResult[];
    }

    const normalizedSearch =
      search.trim().toLowerCase();

    return loadResult.data.results
      .filter(
        (result) =>
          getViewType(result.result_type) ===
          selectedType,
      )
      .filter((result) => {
        if (!normalizedSearch) {
          return true;
        }

        const searchableText = [
          result.group_key ?? "",
          result.entity_id ?? "",
          result.metric_name,
          result.result_category,
          result.finding,
          result.limitation,
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(
          normalizedSearch,
        );
      })
      .sort((a, b) => {
        const rankA =
          a.priority_rank ??
          Number.MAX_SAFE_INTEGER;

        const rankB =
          b.priority_rank ??
          Number.MAX_SAFE_INTEGER;

        return rankA - rankB;
      });
  }, [loadResult, search, selectedType]);

  const baseline = useMemo(() => {
    if (loadResult.status !== "success") {
      return {
        sourceLeads: 0,
        totalValue: 0,
        averageLeadValue: 0,
        averageDays: 0,
      };
    }

    const results = loadResult.data.results;

    const totalValue = results.find(
      (result) =>
        result.result_id ===
        "baseline_total_lead_value",
    );

    const averageLeadValue = results.find(
      (result) =>
        result.result_id ===
        "baseline_average_lead_value",
    );

    const averageDays = results.find(
      (result) =>
        result.result_id ===
        "baseline_average_days_in_stage",
    );

    return {
      sourceLeads:
        totalValue?.evidence.lead_count ?? 0,

      totalValue:
        totalValue?.result_value ?? 0,

      averageLeadValue:
        averageLeadValue?.result_value ?? 0,

      averageDays:
        averageDays?.result_value ?? 0,
    };
  }, [loadResult]);

  const keyFindings = useMemo(() => {
    if (loadResult.status !== "success") {
      return [];
    }

    const results = loadResult.data.results;

    const stageResult = results.find(
      (result) =>
        result.result_id ===
        "stage_won_total_value",
    );

    const productResult = results.find(
      (result) =>
        result.result_id ===
        "product_payments_total_value",
    );

    const sourceResult = results.find(
      (result) =>
        result.result_id ===
        "source_website_total_value",
    );

    return [
      stageResult
        ? `Won is the highest observed-value funnel stage with ${stageResult.result_value.toFixed(2)}.`
        : null,

      productResult
        ? `Payments is the highest observed-value product category with ${productResult.result_value.toFixed(2)}.`
        : null,

      sourceResult
        ? `Website is the highest observed-value acquisition source with ${sourceResult.result_value.toFixed(2)}.`
        : null,
    ].filter(
      (finding): finding is string =>
        finding !== null,
    );
  }, [loadResult]);

  if (loadResult.status === "error") {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          padding: "32px",
          fontFamily:
            "Arial, Helvetica, sans-serif",
        }}
      >
        <section
          style={{
            maxWidth: "1080px",
            margin: "0 auto",
            border: "1px solid #fca5a5",
            borderRadius: "14px",
            background: "#ffffff",
            padding: "24px",
          }}
        >
          <h1
            style={{
              margin: "0 0 12px",
              color: "#b91c1c",
              fontSize: "26px",
            }}
          >
            Data Intelligence
          </h1>

          <p
            style={{
              margin: "0 0 8px",
              color: "#334155",
              fontSize: "16px",
            }}
          >
            The approved intelligence
            output could not be loaded
            safely.
          </p>

          <p
            style={{
              margin: 0,
              color: "#475569",
              fontSize: "14px",
            }}
          >
            {loadResult.message}
          </p>
        </section>
      </main>
    );
  }

  const data = loadResult.data;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#0f172a",
        padding: "28px 20px 60px",
        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
        }}
      >
              <nav
          aria-label="Primary navigation"
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          <a
            href="/"
            style={{
              display: "inline-block",
              padding: "10px 16px",
              border: "1px solid #64748b",
              borderRadius: "10px",
              background: "#ffffff",
              color: "#0f172a",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Operational View
          </a>

          <a
            href="/data-intelligence"
            aria-current="page"
            style={{
              display: "inline-block",
              padding: "10px 16px",
              border: "1px solid #2563eb",
              borderRadius: "10px",
              background: "#2563eb",
              color: "#ffffff",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Data Intelligence
          </a>
        </nav>
        <section
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "24px",
            marginBottom: "28px",
          }}
        >
          <div>
            <div
              style={{
                color: "#1d4ed8",
                fontWeight: 700,
                fontSize: "14px",
                marginBottom: "6px",
              }}
            >
              PHASE 3 · POST #4
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "36px",
                lineHeight: 1.1,
              }}
            >
              Data Intelligence
            </h1>

            <p
              style={{
                margin: "10px 0 0",
                color: "#475569",
                fontSize: "16px",
              }}
            >
              Approved Track A comparative
              intelligence from the validated
              synthetic lead sample.
            </p>
          </div>

          <div
            style={{
              border: "1px solid #334155",
              borderRadius: "12px",
              padding: "16px 20px",
              background: "#ffffff",
              minWidth: "245px",
            }}
          >
            <div>
              <strong>Data version:</strong>{" "}
              {data.data_version}
            </div>

            <div style={{ marginTop: "7px" }}>
              <strong>Method version:</strong>{" "}
              {data.method_version}
            </div>

            <div style={{ marginTop: "7px" }}>
              <strong>Quality:</strong>{" "}
              VALIDATED_DESCRIPTIVE
            </div>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(4, minmax(0, 1fr))",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          {[
            {
              label: "Source leads",
              value: formatNumber(
                baseline.sourceLeads,
              ),
            },
            {
              label: "Total observed value",
              value: formatNumber(
                baseline.totalValue,
              ),
            },
            {
              label: "Average lead value",
              value: formatNumber(
                baseline.averageLeadValue,
              ),
            },
            {
              label: "Average days in stage",
              value: formatNumber(
                baseline.averageDays,
              ),
            },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                border: "1px solid #334155",
                borderRadius: "14px",
                background: "#ffffff",
                padding: "24px",
              }}
            >
              <div
                style={{
                  color: "#64748b",
                  fontSize: "15px",
                  marginBottom: "12px",
                }}
              >
                {card.label}
              </div>

              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 700,
                }}
              >
                {card.value}
              </div>
            </div>
          ))}
        </section>

        <section
          style={{
            border: "1px solid #334155",
            borderRadius: "14px",
            background: "#ffffff",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  margin: "0 0 8px",
                  fontSize: "24px",
                }}
              >
                Track A — Comparative
                Intelligence
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                }}
              >
                Compare approved descriptive
                results across stages, products,
                and acquisition sources.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
              }}
            >
              {(
                Object.keys(
                  VIEW_LABELS,
                ) as ViewType[]
              ).map((type) => {
                const active =
                  selectedType === type;

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      setSelectedType(type)
                    }
                    style={{
                      padding: "10px 18px",
                      borderRadius: "10px",
                      border: active
                        ? "1px solid #2563eb"
                        : "1px solid #64748b",
                      background: active
                        ? "#2563eb"
                        : "#ffffff",
                      color: active
                        ? "#ffffff"
                        : "#0f172a",
                      cursor: "pointer",
                      fontSize: "15px",
                    }}
                  >
                    {VIEW_LABELS[type]}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section
          style={{
            border: "1px solid #334155",
            borderRadius: "14px",
            background: "#ffffff",
            padding: "20px 24px",
            marginBottom: "24px",
          }}
        >
          <label
            htmlFor="intelligence-search"
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "15px",
            }}
          >
            Filter results
          </label>

          <input
            id="intelligence-search"
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search group, metric, or finding..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              border: "1px solid #64748b",
              borderRadius: "10px",
              padding: "13px 15px",
              fontSize: "16px",
              outline: "none",
            }}
          />
        </section>

        <section
          style={{
            border: "1px solid #334155",
            borderRadius: "14px",
            background: "#ffffff",
            overflow: "hidden",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              padding: "24px 26px",
              borderBottom: "1px solid #334155",
            }}
          >
            <h2
              style={{
                margin: "0 0 8px",
                fontSize: "24px",
              }}
            >
              {VIEW_TITLES[selectedType]}
            </h2>

            <p
              style={{
                margin: 0,
                color: "#64748b",
              }}
            >
              Approved analytical results.
              Values are displayed directly
              from the validated intelligence
              output.
            </p>
          </div>

          {filteredResults.length === 0 ? (
            <div
              style={{
                padding: "32px",
                color: "#64748b",
              }}
            >
              No approved results match the
              current filter.
            </div>
          ) : (
            <div
              style={{
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "900px",
                }}
              >
                <thead>
                  <tr>
                    {[
                      "Rank",
                      "Group",
                      "Metric",
                      "Value",
                      "Status",
                      "Finding",
                    ].map((heading) => (
                      <th
                        key={heading}
                        style={{
                          textAlign: "left",
                          padding: "14px 16px",
                          borderBottom:
                            "1px solid #334155",
                          fontSize: "14px",
                        }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredResults.map(
                    (result, index) => {
                      const warning =
                        getGroupSizeWarning(
                          result,
                        );

                      return (
                        <tr
                          key={result.result_id}
                        >
                          <td
                            style={{
                              padding:
                                "14px 16px",
                              borderBottom:
                                "1px solid #cbd5e1",
                            }}
                          >
                            {result.priority_rank ??
                              index + 1}
                          </td>

                          <td
                            style={{
                              padding:
                                "14px 16px",
                              borderBottom:
                                "1px solid #cbd5e1",
                              fontWeight: 600,
                            }}
                          >
                            {result.group_key ??
                              result.entity_id ??
                              "Overall"}

                            {warning && (
                              <div
                                style={{
                                  marginTop: "7px",
                                  color: "#b45309",
                                  fontSize: "12px",
                                  fontWeight: 500,
                                }}
                              >
                                {warning}
                              </div>
                            )}
                          </td>

                          <td
                            style={{
                              padding:
                                "14px 16px",
                              borderBottom:
                                "1px solid #cbd5e1",
                            }}
                          >
                            {result.metric_name}
                          </td>

                          <td
                            style={{
                              padding:
                                "14px 16px",
                              borderBottom:
                                "1px solid #cbd5e1",
                              fontWeight: 700,
                            }}
                          >
                            {formatValue(
                              result.result_value,
                              result.result_unit,
                            )}
                          </td>

                          <td
                            style={{
                              padding:
                                "14px 16px",
                              borderBottom:
                                "1px solid #cbd5e1",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-block",
                                padding: "5px 10px",
                                borderRadius: "999px",
                                background: "#dcfce7",
                                color: "#15803d",
                                fontSize: "12px",
                                fontWeight: 700,
                              }}
                            >
                              {result.quality_status}
                            </span>
                          </td>

                          <td
                            style={{
                              padding:
                                "14px 16px",
                              borderBottom:
                                "1px solid #cbd5e1",
                              lineHeight: 1.5,
                            }}
                          >
                            {result.finding}
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section
          style={{
            border: "1px solid #334155",
            borderRadius: "14px",
            background: "#ffffff",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              margin: "0 0 18px",
              fontSize: "24px",
            }}
          >
            Key Findings
          </h2>

          {keyFindings.map((finding) => (
            <p
              key={finding}
              style={{
                margin: "0 0 14px",
                color: "#334155",
                lineHeight: 1.6,
              }}
            >
              {finding}
            </p>
          ))}
        </section>

        <section
          style={{
            border: "1px solid #334155",
            borderRadius: "14px",
            background: "#ffffff",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              margin: "0 0 16px",
              fontSize: "24px",
            }}
          >
            Evidence
          </h2>

          <p
            style={{
              margin: "0 0 10px",
              color: "#334155",
              lineHeight: 1.6,
            }}
          >
            The page displays evidence attached
            to the approved analytical results.
            No new analytical calculations are
            performed here.
          </p>

          <p
            style={{
              margin: 0,
              color: "#64748b",
            }}
          >
            Source: canonical intelligence output
            generated for {data.data_version}.
          </p>
        </section>

        <section
          style={{
            border: "1px solid #334155",
            borderRadius: "14px",
            background: "#ffffff",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              margin: "0 0 18px",
              fontSize: "24px",
            }}
          >
            Methodology
          </h2>

          <p
            style={{
              margin: "0 0 14px",
              lineHeight: 1.6,
            }}
          >
            How do lead value and days in stage
            vary across CRM funnel stages,
            acquisition sources and products
            within the available synthetic lead
            sample?
          </p>

          <p
            style={{
              margin: "0 0 14px",
              lineHeight: 1.6,
            }}
          >
            Support descriptive operational review
            of observed differences across funnel
            stages, products and acquisition sources
            within the available synthetic sample.
          </p>

          <p
            style={{
              margin: "0 0 8px",
              color: "#475569",
            }}
          >
            Track: {data.approved_track}
          </p>

          <p
            style={{
              margin: 0,
              color: "#475569",
            }}
          >
            Method version: {data.method_version}
          </p>
        </section>

        <section
          style={{
            border: "1px solid #334155",
            borderRadius: "14px",
            background: "#ffffff",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              margin: "0 0 18px",
              fontSize: "24px",
            }}
          >
            Limitations
          </h2>

          <ul
            style={{
              margin: "0 0 18px",
              paddingLeft: "22px",
              lineHeight: 1.8,
              color: "#334155",
            }}
          >
            <li>The dataset is synthetic.</li>

            <li>
              The available analytical sample
              contains 30 source CRM leads.
            </li>

            <li>
              The analysis is descriptive and
              does not establish causation.
            </li>

            <li>
              The analysis is not predictive.
            </li>

            <li>
              Team and location are not represented
              as separate canonical fields.
            </li>

            <li>
              The available temporal information
              does not constitute a full longitudinal
              time series.
            </li>

            <li>
              Small stage groups require cautious
              interpretation.
            </li>
          </ul>

          <div
            style={{
              color: "#b45309",
              fontWeight: 600,
            }}
          >
            Weak-case count: 4
          </div>
        </section>

        <section
          style={{
            border: "1px solid #334155",
            borderRadius: "14px",
            background: "#ffffff",
            padding: "20px 24px",
          }}
        >
          <div style={{ marginBottom: "8px" }}>
            <strong>Generated:</strong>{" "}
            {data.generated_at}
          </div>

          <div style={{ marginBottom: "8px" }}>
            <strong>Result count:</strong>{" "}
            {data.result_count}
          </div>

          <div>
            <strong>Validation:</strong> PASS
          </div>
        </section>
      </div>
    </main>
  );
}