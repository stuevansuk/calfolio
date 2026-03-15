"use client";

import type { TemplateConfig } from "@/types";

type TemplatePreviewProps = {
  config: TemplateConfig;
  className?: string;
};

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

// A sample month grid (like January 2027 starting on Friday)
const SAMPLE_GRID = [
  [0, 0, 0, 0, 1, 2, 3],
  [4, 5, 6, 7, 8, 9, 10],
  [11, 12, 13, 14, 15, 16, 17],
  [18, 19, 20, 21, 22, 23, 24],
  [25, 26, 27, 28, 29, 30, 31],
];

function isWeekend(colIndex: number): boolean {
  return colIndex >= 5;
}

export function TemplatePreview({ config, className = "" }: TemplatePreviewProps) {
  const { monthLayout, colors, typography } = config;
  const isLandscape = config.orientation === "landscape";
  const viewW = isLandscape ? 297 : 210;
  const viewH = isLandscape ? 210 : 297;

  const img = monthLayout.imageArea;
  const grid = monthLayout.calendarGridArea;
  const title = monthLayout.monthTitleArea;

  // Scale font sizes relative to the viewBox
  const titleFontSize = Math.max(viewH * 0.03, 6);
  const dayHeaderSize = Math.max(viewH * 0.014, 3.5);
  const dayNumSize = Math.max(viewH * 0.013, 3);

  // Grid cell calculations
  const gridX = (grid.x / 100) * viewW;
  const gridY = (grid.y / 100) * viewH;
  const gridW = (grid.width / 100) * viewW;
  const gridH = (grid.height / 100) * viewH;
  const colW = gridW / 7;
  const headerRowH = gridH * 0.14;
  const rowH = (gridH - headerRowH) / 5;

  // Image area
  const imgX = (img.x / 100) * viewW;
  const imgY = (img.y / 100) * viewH;
  const imgW = (img.width / 100) * viewW;
  const imgH = (img.height / 100) * viewH;

  // Title area
  const titleX = (title.x / 100) * viewW;
  const titleY = (title.y / 100) * viewH;
  const titleW = (title.width / 100) * viewW;
  const titleH = (title.height / 100) * viewH;

  // Detect if background is dark
  const isDark = isDarkColor(colors.background);
  const photoGradient = isDark
    ? ["#374151", "#1f2937", "#4b5563"]
    : ["#e8d5c4", "#c9a88c", "#dbc1ab"];

  return (
    <svg
      viewBox={`0 0 ${viewW} ${viewH}`}
      className={className}
      role="img"
      aria-label="Template preview"
    >
      {/* Background */}
      <rect width={viewW} height={viewH} fill={colors.background} rx={3} />

      {/* Photo placeholder area */}
      <defs>
        <linearGradient id={`photo-${config.orientation}-${colors.background.replace("#", "")}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={photoGradient[0]} />
          <stop offset="50%" stopColor={photoGradient[1]} />
          <stop offset="100%" stopColor={photoGradient[2]} />
        </linearGradient>
      </defs>
      <rect
        x={imgX}
        y={imgY}
        width={imgW}
        height={imgH}
        rx={2}
        fill={`url(#photo-${config.orientation}-${colors.background.replace("#", "")})`}
      />
      {/* Photo icon */}
      <g transform={`translate(${imgX + imgW / 2 - 8}, ${imgY + imgH / 2 - 6})`} opacity={0.35}>
        <rect x="0" y="2" width="16" height="10" rx="1.5" fill="none" stroke={isDark ? "#9ca3af" : "#78716c"} strokeWidth="0.8" />
        <circle cx="5" cy="6" r="1.5" fill="none" stroke={isDark ? "#9ca3af" : "#78716c"} strokeWidth="0.6" />
        <polyline points="2,11 6,7 9,10 11,8 14,11" fill="none" stroke={isDark ? "#9ca3af" : "#78716c"} strokeWidth="0.6" />
      </g>

      {/* Month title */}
      <text
        x={titleX + titleW / 2}
        y={titleY + titleH / 2 + titleFontSize * 0.35}
        textAnchor="middle"
        fill={colors.text}
        fontSize={titleFontSize}
        fontFamily={mapFont(typography.monthTitleFont)}
        fontWeight={typography.monthTitleFont === "Impact" ? "bold" : "normal"}
      >
        January
      </text>

      {/* Calendar grid */}
      {/* Weekend column highlights */}
      {[5, 6].map((col) => (
        <rect
          key={`wk-${col}`}
          x={gridX + col * colW}
          y={gridY}
          width={colW}
          height={gridH}
          fill={colors.weekendHighlight}
        />
      ))}

      {/* Horizontal grid lines */}
      {Array.from({ length: 7 }, (_, i) => (
        <line
          key={`hline-${i}`}
          x1={gridX}
          y1={gridY + headerRowH + i * rowH}
          x2={gridX + gridW}
          y2={gridY + headerRowH + i * rowH}
          stroke={colors.gridLines}
          strokeWidth={0.3}
        />
      ))}

      {/* Vertical grid lines */}
      {Array.from({ length: 8 }, (_, i) => (
        <line
          key={`vline-${i}`}
          x1={gridX + i * colW}
          y1={gridY + headerRowH}
          x2={gridX + i * colW}
          y2={gridY + gridH}
          stroke={colors.gridLines}
          strokeWidth={0.3}
        />
      ))}

      {/* Day headers */}
      {DAYS.map((day, i) => (
        <text
          key={`dh-${i}`}
          x={gridX + i * colW + colW / 2}
          y={gridY + headerRowH * 0.65}
          textAnchor="middle"
          fill={isWeekend(i) ? colors.accent : colors.text}
          fontSize={dayHeaderSize}
          fontFamily={mapFont(typography.dayFont)}
          opacity={0.7}
        >
          {day}
        </text>
      ))}

      {/* Day numbers */}
      {SAMPLE_GRID.map((week, row) =>
        week.map((day, col) =>
          day > 0 ? (
            <text
              key={`d-${row}-${col}`}
              x={gridX + col * colW + colW / 2}
              y={gridY + headerRowH + row * rowH + rowH * 0.6}
              textAnchor="middle"
              fill={isWeekend(col) ? colors.accent : colors.text}
              fontSize={dayNumSize}
              fontFamily={mapFont(typography.dayFont)}
              opacity={isWeekend(col) ? 0.7 : 0.85}
            >
              {day}
            </text>
          ) : null,
        ),
      )}

      {/* Accent line under title */}
      <line
        x1={titleX + titleW * 0.3}
        y1={titleY + titleH}
        x2={titleX + titleW * 0.7}
        y2={titleY + titleH}
        stroke={colors.accent}
        strokeWidth={0.5}
        opacity={0.5}
      />
    </svg>
  );
}

function mapFont(font: string): string {
  const serif = ["Georgia", "Palatino", "Garamond", "Didot", "Times"];
  if (serif.some((s) => font.includes(s))) return "Georgia, serif";
  if (font.includes("Comic")) return "Comic Sans MS, cursive";
  if (font.includes("Impact")) return "Impact, sans-serif";
  return "Helvetica, Arial, sans-serif";
}

function isDarkColor(hex: string): boolean {
  const c = hex.replace("#", "");
  if (c.length < 6) return false;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}
