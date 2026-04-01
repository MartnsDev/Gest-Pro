"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface BarChartProps {
  labels: string[];
  data: number[];
  label: string;
  color?: "blue" | "green" | "purple" | "orange" | "rose";
  formatValue?: (value: number) => string;
  height?: number;
}

const PALETTES = {
  blue: {
    gradientFrom: "rgba(56, 189, 248, 0.9)",
    gradientTo: "rgba(59, 130, 246, 0.6)",
    glowColor: "rgba(59, 130, 246, 0.35)",
    accent: "#38bdf8",
    accentDark: "#0284c7",
    tooltipBorder: "rgba(56, 189, 248, 0.4)",
  },
  green: {
    gradientFrom: "rgba(52, 211, 153, 0.9)",
    gradientTo: "rgba(16, 185, 129, 0.6)",
    glowColor: "rgba(16, 185, 129, 0.35)",
    accent: "#34d399",
    accentDark: "#059669",
    tooltipBorder: "rgba(52, 211, 153, 0.4)",
  },
  purple: {
    gradientFrom: "rgba(167, 139, 250, 0.9)",
    gradientTo: "rgba(139, 92, 246, 0.6)",
    glowColor: "rgba(139, 92, 246, 0.35)",
    accent: "#a78bfa",
    accentDark: "#7c3aed",
    tooltipBorder: "rgba(167, 139, 250, 0.4)",
  },
  orange: {
    gradientFrom: "rgba(251, 146, 60, 0.9)",
    gradientTo: "rgba(249, 115, 22, 0.6)",
    glowColor: "rgba(249, 115, 22, 0.35)",
    accent: "#fb923c",
    accentDark: "#ea580c",
    tooltipBorder: "rgba(251, 146, 60, 0.4)",
  },
  rose: {
    gradientFrom: "rgba(251, 113, 133, 0.9)",
    gradientTo: "rgba(244, 63, 94, 0.6)",
    glowColor: "rgba(244, 63, 94, 0.35)",
    accent: "#fb7185",
    accentDark: "#e11d48",
    tooltipBorder: "rgba(251, 113, 133, 0.4)",
  },
};

export const BarChart = ({
  labels,
  data,
  label,
  color = "blue",
  formatValue = (v) => v.toLocaleString("pt-BR"),
  height = 260,
}: BarChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const progressRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const palette = PALETTES[color];

  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    index: number;
  }>({ visible: false, x: 0, y: 0, index: -1 });

  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [dims, setDims] = useState({ width: 0, height });

  const containerRef = useRef<HTMLDivElement>(null);

  const PADDING = { top: 28, right: 24, bottom: 52, left: 60 };

  const getBarRects = useCallback(
    (w: number, h: number) => {
      if (!data.length) return [];
      const chartW = w - PADDING.left - PADDING.right;
      const chartH = h - PADDING.top - PADDING.bottom;
      const maxVal = Math.max(...data, 1);
      const gap = 0.35;
      const barW = (chartW / data.length) * (1 - gap);
      const space = (chartW / data.length) * gap;

      return data.map((val, i) => {
        const barH = (val / maxVal) * chartH;
        const x = PADDING.left + i * (barW + space) + space / 2;
        const y = PADDING.top + chartH - barH;
        return { x, y, w: barW, h: barH, val };
      });
    },
    [data, PADDING.left, PADDING.right, PADDING.top, PADDING.bottom]
  );

  const draw = useCallback(
    (progress: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const { width: w, height: h } = canvas;

      ctx.clearRect(0, 0, w, h);

      // Background grid
      const chartH = h - PADDING.top - PADDING.bottom;
      const chartW = w - PADDING.left - PADDING.right;
      const gridLines = 5;
      const maxVal = Math.max(...data, 1);

      for (let i = 0; i <= gridLines; i++) {
        const y = PADDING.top + (chartH / gridLines) * i;
        const val = maxVal * (1 - i / gridLines);

        ctx.beginPath();
        ctx.strokeStyle =
          i === gridLines
            ? "rgba(255,255,255,0.15)"
            : "rgba(255,255,255,0.06)";
        ctx.lineWidth = i === gridLines ? 1.5 : 1;
        ctx.setLineDash(i === gridLines ? [] : [4, 4]);
        ctx.moveTo(PADDING.left, y);
        ctx.lineTo(PADDING.left + chartW, y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Y axis labels
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.font = "11px 'DM Mono', monospace, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(
          val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(0),
          PADDING.left - 10,
          y + 4
        );
      }

      // Bars
      const rects = getBarRects(w, h);

      rects.forEach(({ x, y, w: bw, h: bh, val }, i) => {
        const animH = bh * progress;
        const animY = y + bh - animH;
        const isHovered = i === hoveredIndex;
        const radius = Math.min(6, bw / 4);

        // Glow shadow when hovered
        if (isHovered) {
          ctx.shadowColor = palette.glowColor;
          ctx.shadowBlur = 18;
        }

        // Gradient fill
        const grad = ctx.createLinearGradient(x, animY, x, animY + animH);
        grad.addColorStop(0, isHovered ? palette.gradientFrom : palette.gradientFrom.replace("0.9", "0.75"));
        grad.addColorStop(1, palette.gradientTo.replace("0.6", "0.25"));

        ctx.beginPath();
        ctx.moveTo(x + radius, animY);
        ctx.lineTo(x + bw - radius, animY);
        ctx.quadraticCurveTo(x + bw, animY, x + bw, animY + radius);
        ctx.lineTo(x + bw, animY + animH);
        ctx.lineTo(x, animY + animH);
        ctx.lineTo(x, animY + radius);
        ctx.quadraticCurveTo(x, animY, x + radius, animY);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        // Top accent line
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(x + radius, animY);
        ctx.lineTo(x + bw - radius, animY);
        ctx.strokeStyle = isHovered ? palette.accent : "rgba(255,255,255,0.3)";
        ctx.lineWidth = isHovered ? 2 : 1;
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.shadowColor = "transparent";

        // X labels
        ctx.fillStyle = isHovered
          ? "rgba(255,255,255,0.9)"
          : "rgba(255,255,255,0.45)";
        ctx.font = isHovered
          ? "bold 11px 'DM Mono', monospace, sans-serif"
          : "11px 'DM Mono', monospace, sans-serif";
        ctx.textAlign = "center";
        const labelText = labels[i] ?? "";
        ctx.fillText(labelText, x + bw / 2, h - PADDING.bottom + 18);
      });
    },
    [data, labels, hoveredIndex, palette, PADDING, getBarRects]
  );

  // Animation loop
  useEffect(() => {
    progressRef.current = 0;
    startTimeRef.current = null;

    const animate = (ts: number) => {
      if (!startTimeRef.current) startTimeRef.current = ts;
      const elapsed = ts - startTimeRef.current;
      const duration = 900;
      const eased = Math.min(elapsed / duration, 1);
      // Cubic ease out
      const progress = 1 - Math.pow(1 - eased, 3);
      progressRef.current = progress;
      draw(progress);
      if (eased < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        setDims({ width: w, height });
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [height]);

  // Canvas DPR scaling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !dims.width) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dims.width * dpr;
    canvas.height = dims.height * dpr;
    canvas.style.width = `${dims.width}px`;
    canvas.style.height = `${dims.height}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);
    draw(progressRef.current);
  }, [dims, draw]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !dims.width) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const rects = getBarRects(dims.width, dims.height);
      let found = -1;
      for (let i = 0; i < rects.length; i++) {
        const { x, w: bw } = rects[i];
        if (mx >= x - 4 && mx <= x + bw + 4) {
          found = i;
          break;
        }
      }

      if (found !== hoveredIndex) {
        setHoveredIndex(found);
        if (found >= 0) {
          const { x, y, w: bw } = rects[found];
          setTooltip({
            visible: true,
            x: x + bw / 2,
            y,
            index: found,
          });
        } else {
          setTooltip((t) => ({ ...t, visible: false }));
        }
      }
    },
    [dims, getBarRects, hoveredIndex]
  );

  const handleMouseLeave = () => {
    setHoveredIndex(-1);
    setTooltip((t) => ({ ...t, visible: false }));
  };

  const maxVal = Math.max(...data, 1);
  const total = data.reduce((a, b) => a + b, 0);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        fontFamily: "inherit",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: palette.accent,
              margin: 0,
            }}
          >
            {label}
          </p>
          <p
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--foreground, #fff)",
              margin: "4px 0 0",
              letterSpacing: "-0.02em",
            }}
          >
            {formatValue(total)}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: 6,
            alignItems: "center",
            padding: "4px 10px",
            borderRadius: 20,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            fontSize: 11,
            color: "rgba(255,255,255,0.45)",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: palette.accent,
              display: "inline-block",
            }}
          />
          Total acumulado
        </div>
      </div>

      {/* Canvas */}
      <div style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            width: "100%",
            height,
            cursor: hoveredIndex >= 0 ? "crosshair" : "default",
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />

        {/* Tooltip */}
        {tooltip.visible && tooltip.index >= 0 && (
          <div
            style={{
              position: "absolute",
              left: tooltip.x,
              top: Math.max(8, tooltip.y - 68),
              transform: "translateX(-50%)",
              pointerEvents: "none",
              zIndex: 10,
              transition: "opacity 0.15s, top 0.1s",
              opacity: tooltip.visible ? 1 : 0,
            }}
          >
            <div
              style={{
                background: "rgba(10,14,26,0.96)",
                border: `1px solid ${palette.tooltipBorder}`,
                borderRadius: 10,
                padding: "8px 14px",
                boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)`,
                backdropFilter: "blur(12px)",
                minWidth: 110,
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.45)",
                  margin: "0 0 3px",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {labels[tooltip.index]}
              </p>
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: palette.accent,
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                {formatValue(data[tooltip.index])}
              </p>
              <p
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.3)",
                  margin: "3px 0 0",
                }}
              >
                {((data[tooltip.index] / maxVal) * 100).toFixed(0)}% do pico
              </p>
            </div>
            {/* Arrow */}
            <div
              style={{
                width: 8,
                height: 8,
                background: "rgba(10,14,26,0.96)",
                border: `1px solid ${palette.tooltipBorder}`,
                borderTop: "none",
                borderLeft: "none",
                transform: "rotate(45deg)",
                margin: "-4px auto 0",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};