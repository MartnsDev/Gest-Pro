"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface LineChartProps {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: "blue" | "green" | "purple" | "orange" | "rose";
  }[];
  formatValue?: (value: number) => string;
  height?: number;
  showArea?: boolean;
}

const PALETTE = {
  blue: { line: "#38bdf8", area: "rgba(56,189,248,0.15)", dot: "#0ea5e9", glow: "rgba(56,189,248,0.5)" },
  green: { line: "#34d399", area: "rgba(52,211,153,0.15)", dot: "#10b981", glow: "rgba(52,211,153,0.5)" },
  purple: { line: "#a78bfa", area: "rgba(167,139,250,0.15)", dot: "#8b5cf6", glow: "rgba(167,139,250,0.5)" },
  orange: { line: "#fb923c", area: "rgba(251,146,60,0.15)", dot: "#f97316", glow: "rgba(251,146,60,0.5)" },
  rose: { line: "#fb7185", area: "rgba(251,113,133,0.15)", dot: "#f43f5e", glow: "rgba(251,113,133,0.5)" },
};

export const LineChart = ({
  labels,
  datasets,
  formatValue = (v) => v.toLocaleString("pt-BR"),
  height = 260,
  showArea = true,
}: LineChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const progressRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [hoveredX, setHoveredX] = useState(-1);
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; labelIndex: number }>({
    visible: false, x: 0, y: 0, labelIndex: -1,
  });
  const [dims, setDims] = useState({ width: 0, height });

  const PADDING = { top: 28, right: 24, bottom: 52, left: 60 };

  const allData = datasets.flatMap((d) => d.data);
  const maxVal = Math.max(...allData, 1);
  const minVal = Math.min(...allData, 0);
  const range = maxVal - minVal || 1;

  const getPoints = useCallback(
    (dataArr: number[], w: number, h: number) => {
      const chartW = w - PADDING.left - PADDING.right;
      const chartH = h - PADDING.top - PADDING.bottom;
      return dataArr.map((val, i) => ({
        x: PADDING.left + (i / Math.max(dataArr.length - 1, 1)) * chartW,
        y: PADDING.top + chartH - ((val - minVal) / range) * chartH,
        val,
      }));
    },
    [minVal, range, PADDING]
  );

  const catmullRom = (pts: { x: number; y: number }[], ctx: CanvasRenderingContext2D, tension = 0.4) => {
    if (pts.length < 2) return;
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(i - 1, 0)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(i + 2, pts.length - 1)];
      const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension * 2;
      const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension * 2;
      const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension * 2;
      const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension * 2;
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }
  };

  const draw = useCallback(
    (progress: number) => {
      const canvas = canvasRef.current;
      if (!canvas || !dims.width) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const w = dims.width;
      const h = dims.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const chartH = h - PADDING.top - PADDING.bottom;
      const chartW = w - PADDING.left - PADDING.right;
      const gridLines = 5;

      // Grid
      for (let i = 0; i <= gridLines; i++) {
        const y = PADDING.top + (chartH / gridLines) * i;
        const val = maxVal - ((maxVal - minVal) / gridLines) * i;

        ctx.beginPath();
        ctx.strokeStyle = i === gridLines ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)";
        ctx.lineWidth = i === gridLines ? 1.5 : 1;
        ctx.setLineDash(i === gridLines ? [] : [4, 6]);
        ctx.moveTo(PADDING.left, y);
        ctx.lineTo(PADDING.left + chartW, y);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.font = "11px 'DM Mono', monospace, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(
          val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(0),
          PADDING.left - 10,
          y + 4
        );
      }

      // Hover vertical line
      if (hoveredX >= 0 && hoveredX < labels.length) {
        const pts = getPoints(datasets[0]?.data ?? [], w, h);
        const hx = pts[hoveredX]?.x;
        if (hx !== undefined) {
          ctx.beginPath();
          ctx.strokeStyle = "rgba(255,255,255,0.12)";
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.moveTo(hx, PADDING.top);
          ctx.lineTo(hx, PADDING.top + chartH);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // Datasets
      datasets.forEach((dataset, di) => {
        const col = PALETTE[dataset.color ?? "blue"];
        const pts = getPoints(dataset.data, w, h);

        // Clip to progress
        const clipX = PADDING.left + chartW * progress;

        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, clipX, canvas.height / (window.devicePixelRatio || 1));
        ctx.clip();

        // Area fill
        if (showArea) {
          const aGrad = ctx.createLinearGradient(0, PADDING.top, 0, PADDING.top + chartH);
          aGrad.addColorStop(0, col.area.replace("0.15", "0.25"));
          aGrad.addColorStop(1, col.area.replace("0.15", "0"));

          ctx.beginPath();
          catmullRom(pts, ctx);
          ctx.lineTo(pts[pts.length - 1].x, PADDING.top + chartH);
          ctx.lineTo(pts[0].x, PADDING.top + chartH);
          ctx.closePath();
          ctx.fillStyle = aGrad;
          ctx.fill();
        }

        // Line
        ctx.beginPath();
        catmullRom(pts, ctx);
        ctx.strokeStyle = col.line;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.shadowColor = col.glow;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();

        // Dots
        pts.forEach((pt, i) => {
          if (pt.x > PADDING.left + chartW * progress + 2) return;
          const isHovered = i === hoveredX;
          if (isHovered || i === 0 || i === pts.length - 1) {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, isHovered ? 5 : 3, 0, Math.PI * 2);
            ctx.fillStyle = isHovered ? col.line : col.dot;
            ctx.shadowColor = col.glow;
            ctx.shadowBlur = isHovered ? 14 : 6;
            ctx.fill();
            ctx.shadowBlur = 0;

            if (isHovered) {
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, 9, 0, Math.PI * 2);
              ctx.strokeStyle = col.line + "44";
              ctx.lineWidth = 1.5;
              ctx.stroke();
            }
          }
        });
      });

      // X labels
      labels.forEach((lbl, i) => {
        const pts = getPoints(datasets[0]?.data ?? [], w, h);
        const pt = pts[i];
        if (!pt) return;
        const isHovered = i === hoveredX;
        ctx.fillStyle = isHovered ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)";
        ctx.font = isHovered
          ? "bold 11px 'DM Mono', monospace, sans-serif"
          : "11px 'DM Mono', monospace, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(lbl, pt.x, h - PADDING.bottom + 18);
      });
    },
    [dims, datasets, labels, hoveredX, maxVal, minVal, showArea, getPoints, PADDING]
  );

  // Animation
  useEffect(() => {
    progressRef.current = 0;
    startTimeRef.current = null;
    const animate = (ts: number) => {
      if (!startTimeRef.current) startTimeRef.current = ts;
      const t = Math.min((ts - startTimeRef.current) / 1000, 1);
      const p = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      progressRef.current = p;
      draw(p);
      if (t < 1) animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  // Resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setDims({ width: e.contentRect.width, height });
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [height]);

  // DPR
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

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const pts = getPoints(datasets[0]?.data ?? [], dims.width, dims.height);
    let closest = -1;
    let minDist = Infinity;
    pts.forEach((pt, i) => {
      const d = Math.abs(mx - pt.x);
      if (d < minDist) { minDist = d; closest = i; }
    });
    if (closest !== hoveredX) {
      setHoveredX(closest);
      const pt = pts[closest];
      if (pt) setTooltip({ visible: true, x: pt.x, y: pt.y, labelIndex: closest });
    }
  };

  const handleMouseLeave = () => {
    setHoveredX(-1);
    setTooltip((t) => ({ ...t, visible: false }));
  };

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      {/* Legend */}
      {datasets.length > 1 && (
        <div style={{ display: "flex", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
          {datasets.map((ds, i) => {
            const col = PALETTE[ds.color ?? "blue"];
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 20, height: 3, borderRadius: 2, background: col.line, display: "inline-block" }} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{ds.label}</span>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          style={{ display: "block", width: "100%", height, cursor: "crosshair" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />

        {/* Tooltip */}
        {tooltip.visible && tooltip.labelIndex >= 0 && (
          <div
            style={{
              position: "absolute",
              left: tooltip.x,
              top: Math.max(8, tooltip.y - 80),
              transform: "translateX(-50%)",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            <div
              style={{
                background: "rgba(10,14,26,0.96)",
                border: `1px solid rgba(255,255,255,0.1)`,
                borderRadius: 10,
                padding: "8px 14px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                backdropFilter: "blur(12px)",
                minWidth: 120,
              }}
            >
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {labels[tooltip.labelIndex]}
              </p>
              {datasets.map((ds, i) => {
                const col = PALETTE[ds.color ?? "blue"];
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginTop: i > 0 ? 4 : 0 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: col.line, flexShrink: 0 }} />
                      {ds.label}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: col.line }}>
                      {formatValue(ds.data[tooltip.labelIndex] ?? 0)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};