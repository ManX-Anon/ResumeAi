import Plot from "react-plotly.js";
import type { ChartsData, ATSBreakdownItem } from "@/types";

const FONT = { family: "Inter, sans-serif", color: "#0F172A", size: 12 };
const FONT_DARK = { family: "Inter, sans-serif", color: "#F8FAFC", size: 12 };

const COLORS = {
  primary: "#6366f1",
  violet: "#8b5cf6",
  cyan: "#06b6d4",
  emerald: "#10b981",
  red: "#ef4444",
};

export function SkillMatchPie({ data }: { data: ChartsData["skill_match_pie"] }) {
  return (
    <Plot
      data={[
        {
          type: "pie",
          labels: data.labels,
          values: data.values,
          hole: 0.58,
          marker: {
            colors: [COLORS.primary, COLORS.red],
            line: { color: "#ffffff", width: 2 },
          },
          textinfo: "percent",
          hoverinfo: "label+value+percent",
        },
      ]}
      layout={{
        title: { text: "Skill Match", font: { ...FONT, size: 13, color: "#0f172a" } },
        showlegend: true,
        legend: { orientation: "h", y: -0.18, font: { ...FONT, size: 11 } },
        margin: { t: 40, b: 28, l: 10, r: 10 },
        font: FONT,
        paper_bgcolor: "transparent",
      }}
      config={{ displayModeBar: false, responsive: true }}
      style={{ width: "100%", height: "260px" }}
    />
  );
}

export function ATSRadarChart({ breakdown }: { breakdown: ATSBreakdownItem[] }) {
  const labels = breakdown.map((b) => b.category);
  const values = breakdown.map((b) => b.score);
  return (
    <Plot
      data={[
        {
          type: "scatterpolar",
          r: [...values, values[0]],
          theta: [...labels, labels[0]],
          fill: "toself",
          fillcolor: "rgba(99,102,241,0.15)",
          line: { color: COLORS.primary, width: 2 },
        },
      ]}
      layout={{
        title: { text: "ATS Breakdown", font: { ...FONT, size: 13 } },
        polar: {
          radialaxis: {
            visible: true,
            range: [0, Math.max(...values, 10)],
            tickfont: { size: 9 },
            gridcolor: "#e2e8f0",
          },
          angularaxis: { tickfont: { size: 9 } },
          bgcolor: "transparent",
        },
        showlegend: false,
        margin: { t: 40, b: 20, l: 30, r: 30 },
        font: FONT,
        paper_bgcolor: "transparent",
      }}
      config={{ displayModeBar: false, responsive: true }}
      style={{ width: "100%", height: "290px" }}
    />
  );
}

export function SkillDistributionBar({ data }: { data: ChartsData["skill_distribution_bar"] }) {
  if (data.labels.length === 0) {
    return (
      <div className="h-[260px] flex items-center justify-center text-sm text-muted">
        No repeated skill keywords detected yet.
      </div>
    );
  }
  return (
    <Plot
      data={[
        {
          type: "bar",
          x: data.labels,
          y: data.values,
          marker: {
            color: data.values.map((_, i) =>
              i % 3 === 0 ? COLORS.primary : i % 3 === 1 ? COLORS.violet : COLORS.cyan
            ),
          },
        },
      ]}
      layout={{
        title: { text: "Skill Frequency", font: { ...FONT, size: 13 } },
        margin: { t: 40, b: 70, l: 30, r: 10 },
        xaxis: { tickangle: -35, tickfont: { size: 10 } },
        yaxis: { gridcolor: "#f1f5f9" },
        font: FONT,
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
      }}
      config={{ displayModeBar: false, responsive: true }}
      style={{ width: "100%", height: "260px" }}
    />
  );
}
