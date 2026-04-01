"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface PieChartProps {
  labels: string[];
  data: number[];
  formatValue?: (value: number) => string;
  donut?: boolean;
}

const COLORS = [
  { from: "#38bdf8", to: "#0369a1", glow: "rgba(56,189,248,0.4)" },
  { from: "#34d399", to: "#047857", glow: "rgba(52,211,153,0.4)" },
  { from: "#a78bfa", to: "#6d28d9", glow: "rgba(167,139,250,0.4)" },
  { from: "#fb923c", to: "#c2410c", glow: "rgba(251,146,60,0.4)" },
  { from: "#f472b6", to: "#be185d", glow: "rgba(244,114,182,0.4)" },
  { from: "#fbbf24", to: "#b45309", glow: "rgba(251,191,36,0.4)" },
];

export const PieChart = ({
  labels,
  data,
  formatValue = (v) => v.toLocaleString("pt-BR"),
  donut = true,
}: PieChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const progressRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    index: number;
  }>({ visible: false, x: 0, y: 0, index: -1 });
  const [dims, setDims] = useState({ width: 0, height: 240 });

  const total = data.reduce((a, b) => a + b, 0) || 1;

  const getSlices = useCallback(
    (cx: number, cy: number, radius: number, progress: number) => {
      let startAngle = -Math.PI / 2;
      return data.map((val, i) => {
        const sweep = ((val / total) * Math.PI * 2) * progress;
        const midAngle = startAngle + sweep / 2;
        const slice = { startAngle, sweep, midAngle, val, i };
        startAngle += sweep;
        return slice;
      });
    },
    [data, total]
  );

  const draw = useCallback(
    (progress: number) => {
      const canvas = canvasRef.current;
      if (!canvas || !dims.width) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(cx, cy) - 16;
      const innerRadius = donut ? radius * 0.58 : 0;
      const gap = 0.025; // radians gap between slices

      const slices = getSlices(cx, cy, radius, progress);

      slices.forEach(({ startAngle, sweep, midAngle, val, i }) => {
        if (sweep <= 0) return;
        const color = COLORS[i % COLORS.length];
        const isHovered = i === hoveredIndex;
        const expand = isHovered ? 8 : 0;
        const ox = Math.cos(midAngle) * expand;
        const oy = Math.sin(midAngle) * expand;

        const actualStart = startAngle + gap / 2;
        const actualEnd = startAngle + sweep - gap / 2;

        // Glow
        if (isHovered) {
          ctx.shadowColor = color.glow;
          ctx.shadowBlur = 20;
        }

        // Gradient
        const grad = ctx.createRadialGradient(
          cx + ox,
          cy + oy,
          innerRadius,
          cx + ox,
          cy + oy,
          radius + expand
        );
        grad.addColorStop(0, color.to + "99");
        grad.addColorStop(1, color.from);

        ctx.beginPath();
        ctx.moveTo(
          cx + ox + Math.cos(actualStart) * innerRadius,
          cy + oy + Math.sin(actualStart) * innerRadius
        );
        ctx.arc(cx + ox, cy + oy, radius + expand, actualStart, actualEnd);
        ctx.arc(
          cx + ox,
          cy + oy,
          innerRadius,
          actualEnd,
          actualStart,
          true
        );
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.shadowColor = "transparent";

        // Subtle stroke
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Center label (donut)
      if (donut) {
        const hovered = hoveredIndex >= 0 ? hoveredIndex : -1;
        const displayVal =
          hovered >= 0 ? data[hovered] : total;
        const displayLabel =
          hovered >= 0
            ? labels[hovered]
            : "Total";

        ctx.save();
        // Subtle center bg
        const cGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerRadius);
        cGrad.addColorStop(0, "rgba(255,255,255,0.04)");
        cGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(cx, cy, innerRadius - 2, 0, Math.PI * 2);
        ctx.fillStyle = cGrad;
        ctx.fill();

        ctx.fillStyle =
          hovered >= 0
            ? COLORS[hovered % COLORS.length].from
            : "rgba(255,255,255,0.9)";
        ctx.font = `bold ${Math.min(22, innerRadius * 0.4)}px 'DM Mono', monospace, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(formatValue(displayVal), cx, cy - 10);

        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.font = `${Math.min(11, innerRadius * 0.22)}px sans-serif`;
        ctx.fillText(displayLabel, cx, cy + 14);

        if (hovered >= 0) {
          ctx.fillStyle = "rgba(255,255,255,0.25)";
          ctx.font = `${Math.min(10, innerRadius * 0.2)}px sans-serif`;
          ctx.fillText(
            `${((data[hovered] / total) * 100).toFixed(1)}%`,
            cx,
            cy + 30
          );
        }
        ctx.restore();
      }
    },
    [data, dims, hoveredIndex, donut, formatValue, getSlices, labels, total]
  );

  // Animation
  useEffect(() => {
    progressRef.current = 0;
    startTimeRef.current = null;

    const animate = (ts: number) => {
      if (!startTimeRef.current) startTimeRef.current = ts;
      const elapsed = ts - startTimeRef.current;
      const duration = 950;
      const t = Math.min(elapsed / duration, 1);
      // Elastic-like ease
      const progress =
        t === 0
          ? 0
          : t === 1
          ? 1
          : t < 0.5
          ? 4 * t * t * t
          : 1 - Math.pow(-2 * t + 2, 3) / 2;
      progressRef.current = progress;
      draw(progress);
      if (t < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  // Resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        setDims({ width: w, height: 240 });
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Canvas DPR
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

  const getHitIndex = useCallback(
    (mx: number, my: number) => {
      if (!dims.width) return -1;
      const cx = dims.width / 2;
      const cy = dims.height / 2;
      const radius = Math.min(cx, cy) - 16;
      const innerRadius = donut ? radius * 0.58 : 0;

      const dx = mx - cx;
      const dy = my - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > radius + 10 || dist < innerRadius - 4) return -1;

      let angle = Math.atan2(dy, dx);
      if (angle < -Math.PI / 2) angle += Math.PI * 2;

      let startAngle = -Math.PI / 2;
      for (let i = 0; i < data.length; i++) {
        const sweep = (data[i] / total) * Math.PI * 2;
        if (angle >= startAngle && angle <= startAngle + sweep) return i;
        startAngle += sweep;
      }
      return -1;
    },
    [dims, data, total, donut]
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const idx = getHitIndex(mx, my);
    if (idx !== hoveredIndex) {
      setHoveredIndex(idx);
      setTooltip({ visible: idx >= 0, x: e.clientX - rect.left, y: e.clientY - rect.top, index: idx });
    }
  };

  const handleMouseLeave = () => {
    setHoveredIndex(-1);
    setTooltip((t) => ({ ...t, visible: false }));
  };

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <div style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            width: "100%",
            height: dims.height,
            cursor: hoveredIndex >= 0 ? "pointer" : "default",
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />

        {/* Floating tooltip (outside donut) */}
        {!donut && tooltip.visible && tooltip.index >= 0 && (
          <div
            style={{
              position: "absolute",
              left: tooltip.x,
              top: tooltip.y - 60,
              transform: "translateX(-50%)",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            <div
              style={{
                background: "rgba(10,14,26,0.96)",
                border: `1px solid ${COLORS[tooltip.index % COLORS.length].glow}`,
                borderRadius: 10,
                padding: "8px 14px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                textAlign: "center",
                backdropFilter: "blur(12px)",
              }}
            >
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {labels[tooltip.index]}
              </p>
              <p style={{ fontSize: 16, fontWeight: 700, color: COLORS[tooltip.index % COLORS.length].from, margin: 0 }}>
                {formatValue(data[tooltip.index])}
              </p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: "3px 0 0" }}>
                {((data[tooltip.index] / total) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px 16px",
          marginTop: 16,
          justifyContent: "center",
        }}
      >
        {labels.map((lbl, i) => {
          const pct = ((data[i] / total) * 100).toFixed(1);
          const isHovered = i === hoveredIndex;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                cursor: "pointer",
                opacity: hoveredIndex >= 0 && !isHovered ? 0.45 : 1,
                transition: "opacity 0.2s",
                padding: "4px 8px",
                borderRadius: 6,
                background: isHovered ? "rgba(255,255,255,0.06)" : "transparent",
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(-1)}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 3,
                  background: COLORS[i % COLORS.length].from,
                  flexShrink: 0,
                  boxShadow: isHovered ? `0 0 8px ${COLORS[i % COLORS.length].glow}` : "none",
                  transition: "box-shadow 0.2s",
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  color: isHovered ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)",
                  transition: "color 0.2s",
                  maxWidth: 100,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {lbl}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: isHovered ? COLORS[i % COLORS.length].from : "rgba(255,255,255,0.35)",
                  transition: "color 0.2s",
                }}
              >
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};