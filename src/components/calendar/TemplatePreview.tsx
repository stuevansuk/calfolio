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

function getPhotoScene(bgColor: string): number {
  const hex = bgColor.replace("#", "");
  let hash = 0;
  for (let i = 0; i < hex.length; i++) {
    hash = hex.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 6;
}

function renderPhotoScene(
  sceneIndex: number,
  x: number,
  y: number,
  w: number,
  h: number,
  gradientId: string,
): React.ReactNode {
  switch (sceneIndex) {
    // Sunset landscape
    case 0:
      return (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e3a5f" />
              <stop offset="35%" stopColor="#e8756a" />
              <stop offset="65%" stopColor="#f4a261" />
              <stop offset="100%" stopColor="#fcd89d" />
            </linearGradient>
          </defs>
          <rect x={x} y={y} width={w} height={h} rx={2} fill={`url(#${gradientId})`} />
          <circle cx={x + w * 0.7} cy={y + h * 0.55} r={h * 0.08} fill="#fbbf24" opacity={0.9} />
          <polygon
            points={`${x},${y + h * 0.75} ${x + w * 0.25},${y + h * 0.55} ${x + w * 0.5},${y + h * 0.7} ${x + w * 0.75},${y + h * 0.5} ${x + w},${y + h * 0.65} ${x + w},${y + h} ${x},${y + h}`}
            fill="#2d1b3d"
            opacity={0.7}
          />
        </>
      );

    // Beach scene
    case 1:
      return (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#87ceeb" />
              <stop offset="50%" stopColor="#a8e6f0" />
              <stop offset="70%" stopColor="#38bdf8" />
              <stop offset="85%" stopColor="#e8d5a3" />
              <stop offset="100%" stopColor="#f5e6c8" />
            </linearGradient>
          </defs>
          <rect x={x} y={y} width={w} height={h} rx={2} fill={`url(#${gradientId})`} />
          <ellipse cx={x + w * 0.3} cy={y + h * 0.2} rx={w * 0.12} ry={h * 0.06} fill="white" opacity={0.7} />
          <ellipse cx={x + w * 0.35} cy={y + h * 0.2} rx={w * 0.08} ry={h * 0.05} fill="white" opacity={0.5} />
        </>
      );

    // Mountain lake
    case 2:
      return (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="40%" stopColor="#cbd5e1" />
              <stop offset="55%" stopColor="#4a7c59" />
              <stop offset="70%" stopColor="#3b82c4" />
              <stop offset="100%" stopColor="#60a5d4" />
            </linearGradient>
          </defs>
          <rect x={x} y={y} width={w} height={h} rx={2} fill={`url(#${gradientId})`} />
          <polygon
            points={`${x},${y + h * 0.5} ${x + w * 0.2},${y + h * 0.2} ${x + w * 0.35},${y + h * 0.4} ${x + w * 0.55},${y + h * 0.15} ${x + w * 0.75},${y + h * 0.35} ${x + w},${y + h * 0.45} ${x + w},${y + h * 0.5} ${x},${y + h * 0.5}`}
            fill="#6b7c8d"
            opacity={0.6}
          />
          <rect x={x} y={y + h * 0.5} width={w} height={h * 0.05} fill="#4a7c59" opacity={0.5} />
        </>
      );

    // Flower garden
    case 3:
      return (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d4edda" />
              <stop offset="100%" stopColor="#a8d5a2" />
            </linearGradient>
          </defs>
          <rect x={x} y={y} width={w} height={h} rx={2} fill={`url(#${gradientId})`} />
          <circle cx={x + w * 0.2} cy={y + h * 0.4} r={h * 0.06} fill="#f472b6" opacity={0.8} />
          <circle cx={x + w * 0.5} cy={y + h * 0.3} r={h * 0.05} fill="#fbbf24" opacity={0.8} />
          <circle cx={x + w * 0.75} cy={y + h * 0.5} r={h * 0.07} fill="#c084fc" opacity={0.7} />
          <circle cx={x + w * 0.35} cy={y + h * 0.7} r={h * 0.05} fill="#fb923c" opacity={0.7} />
          <circle cx={x + w * 0.65} cy={y + h * 0.75} r={h * 0.04} fill="#f472b6" opacity={0.6} />
        </>
      );

    // Family portrait style (warm bokeh)
    case 4:
      return (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e8d5c4" />
              <stop offset="50%" stopColor="#d4b896" />
              <stop offset="100%" stopColor="#c9a88c" />
            </linearGradient>
          </defs>
          <rect x={x} y={y} width={w} height={h} rx={2} fill={`url(#${gradientId})`} />
          <circle cx={x + w * 0.15} cy={y + h * 0.25} r={h * 0.1} fill="#fef3c7" opacity={0.3} />
          <circle cx={x + w * 0.7} cy={y + h * 0.2} r={h * 0.08} fill="#fde68a" opacity={0.25} />
          <circle cx={x + w * 0.85} cy={y + h * 0.6} r={h * 0.12} fill="#fef3c7" opacity={0.2} />
          <circle cx={x + w * 0.4} cy={y + h * 0.7} r={h * 0.07} fill="#fde68a" opacity={0.3} />
        </>
      );

    // Autumn forest
    case 5:
      return (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
          </defs>
          <rect x={x} y={y} width={w} height={h} rx={2} fill={`url(#${gradientId})`} />
          <polygon
            points={`${x + w * 0.15},${y + h} ${x + w * 0.15},${y + h * 0.4} ${x + w * 0.05},${y + h * 0.5} ${x + w * 0.15},${y + h * 0.3} ${x + w * 0.25},${y + h * 0.5} ${x + w * 0.15},${y + h * 0.4}`}
            fill="#7c2d12"
            opacity={0.6}
          />
          <polygon
            points={`${x + w * 0.55},${y + h} ${x + w * 0.55},${y + h * 0.35} ${x + w * 0.42},${y + h * 0.5} ${x + w * 0.55},${y + h * 0.25} ${x + w * 0.68},${y + h * 0.5} ${x + w * 0.55},${y + h * 0.35}`}
            fill="#991b1b"
            opacity={0.5}
          />
          <polygon
            points={`${x + w * 0.85},${y + h} ${x + w * 0.85},${y + h * 0.45} ${x + w * 0.75},${y + h * 0.55} ${x + w * 0.85},${y + h * 0.35} ${x + w * 0.95},${y + h * 0.55} ${x + w * 0.85},${y + h * 0.45}`}
            fill="#7c2d12"
            opacity={0.5}
          />
        </>
      );

    default:
      return (
        <>
          <rect x={x} y={y} width={w} height={h} rx={2} fill="#e8d5c4" />
        </>
      );
  }
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

  // Photo scene
  const sceneIndex = getPhotoScene(colors.background);
  const gradientId = `scene-${config.orientation}-${colors.background.replace("#", "")}`;

  return (
    <svg
      viewBox={`0 0 ${viewW} ${viewH}`}
      className={className}
      role="img"
      aria-label="Template preview"
    >
      {/* Background */}
      <rect width={viewW} height={viewH} fill={colors.background} rx={3} />

      {/* Photo scene area */}
      {renderPhotoScene(sceneIndex, imgX, imgY, imgW, imgH, gradientId)}

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
