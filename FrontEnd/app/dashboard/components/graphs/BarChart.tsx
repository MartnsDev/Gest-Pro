"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface BarChartProps {
  labels: string[];
  data: number[];
  label: string;
  color?: "blue" | "green" | "purple" | "orange" | "rose" | "cyan";
  formatValue?: (value: number) => string;
  height?: number;
}

const PALETTES = {
  blue:   { a: "#60a5fa", b: "#1d4ed8", glow: "rgba(96,165,250,0.5)",  border: "rgba(96,165,250,0.35)" },
  green:  { a: "#34d399", b: "#065f46", glow: "rgba(52,211,153,0.5)",  border: "rgba(52,211,153,0.35)" },
  purple: { a: "#c084fc", b: "#581c87", glow: "rgba(192,132,252,0.5)", border: "rgba(192,132,252,0.35)" },
  orange: { a: "#fb923c", b: "#9a3412", glow: "rgba(251,146,60,0.5)",  border: "rgba(251,146,60,0.35)" },
  rose:   { a: "#fb7185", b: "#9f1239", glow: "rgba(251,113,133,0.5)", border: "rgba(251,113,133,0.35)" },
  cyan:   { a: "#22d3ee", b: "#164e63", glow: "rgba(34,211,238,0.5)",  border: "rgba(34,211,238,0.35)" },
};

export const BarChart = ({
  labels, data, label,
  color = "blue",
  formatValue = (v) => v.toLocaleString("pt-BR"),
  height = 280,
}: BarChartProps) => {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const containerRef= useRef<HTMLDivElement>(null);
  const animRef     = useRef<number>(0);
  const progressRef = useRef(0);
  const startRef    = useRef<number | null>(null);
  const pal = PALETTES[color];

  const [hovered, setHovered]     = useState(-1);
  const [tooltip, setTooltip]     = useState<{ visible:boolean; x:number; y:number; i:number }>({ visible:false,x:0,y:0,i:-1 });
  const [dims, setDims]           = useState({ w:0, h:height });

  const PAD = { t:24, r:20, b:52, l:64 };

  const getRects = useCallback((W:number, H:number) => {
    if (!data.length) return [];
    const cW = W - PAD.l - PAD.r;
    const cH = H - PAD.t - PAD.b;
    const max = Math.max(...data, 1);
    const slotW = cW / data.length;
    const barW  = slotW * 0.52;
    const gap   = (slotW - barW) / 2;
    return data.map((val, i) => {
      const bH = (val / max) * cH;
      return { x: PAD.l + i*slotW + gap, y: PAD.t + cH - bH, w: barW, h: bH, val };
    });
  }, [data, PAD.l, PAD.r, PAD.t, PAD.b]);

  const draw = useCallback((progress: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !dims.w) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const DPR = window.devicePixelRatio || 1;
    const W = dims.w, H = dims.h;
    ctx.clearRect(0, 0, W * DPR, H * DPR);

    const cW = W - PAD.l - PAD.r;
    const cH = H - PAD.t - PAD.b;
    const max = Math.max(...data, 1);

    // ── Grid lines + Y labels ──
    const LINES = 5;
    for (let i = 0; i <= LINES; i++) {
      const y   = PAD.t + (cH / LINES) * i;
      const val = max * (1 - i / LINES);
      ctx.beginPath();
      ctx.strokeStyle = i === LINES ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)";
      ctx.lineWidth   = i === LINES ? 1.5 : 1;
      ctx.setLineDash(i === LINES ? [] : [3,6]);
      ctx.moveTo(PAD.l, y); ctx.lineTo(PAD.l + cW, y);
      ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle  = "rgba(255,255,255,0.32)";
      ctx.font       = `11px 'Geist Mono', 'DM Mono', monospace`;
      ctx.textAlign  = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(val >= 1000 ? `${(val/1000).toFixed(1)}k` : val.toFixed(0), PAD.l - 10, y);
    }

    // ── Bars ──
    const rects = getRects(W, H);
    rects.forEach(({ x, y, w:bW, h:bH, val }, i) => {
      const animH = bH * progress;
      const animY = y + bH - animH;
      const isH   = i === hovered;
      const r     = Math.min(7, bW / 4);

      if (animH < 1) return;

      // Glow
      if (isH) { ctx.shadowColor = pal.glow; ctx.shadowBlur = 24; }

      // Gradient
      const grad = ctx.createLinearGradient(x, animY, x, animY + animH);
      grad.addColorStop(0, pal.a + (isH ? "ff" : "cc"));
      grad.addColorStop(0.6, pal.b + "99");
      grad.addColorStop(1,   pal.b + "22");
      ctx.beginPath();
      ctx.moveTo(x + r, animY);
      ctx.lineTo(x + bW - r, animY);
      ctx.quadraticCurveTo(x + bW, animY, x + bW, animY + r);
      ctx.lineTo(x + bW, animY + animH);
      ctx.lineTo(x, animY + animH);
      ctx.lineTo(x, animY + r);
      ctx.quadraticCurveTo(x, animY, x + r, animY);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Shimmer line on top
      ctx.shadowBlur = 0;
      const lg = ctx.createLinearGradient(x, 0, x + bW, 0);
      lg.addColorStop(0, "rgba(255,255,255,0)");
      lg.addColorStop(0.5, isH ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.2)");
      lg.addColorStop(1, "rgba(255,255,255,0)");
      ctx.beginPath();
      ctx.moveTo(x + r, animY); ctx.lineTo(x + bW - r, animY);
      ctx.strokeStyle = lg; ctx.lineWidth = isH ? 2 : 1.5;
      ctx.stroke();

      ctx.shadowBlur = 0; ctx.shadowColor = "transparent";

      // Value label on top when hovered
      if (isH && animH > 20) {
        ctx.fillStyle = pal.a;
        ctx.font = `bold 11px 'Geist Mono', monospace`;
        ctx.textAlign = "center"; ctx.textBaseline = "bottom";
        ctx.fillText(formatValue(val), x + bW/2, animY - 5);
      }

      // X label
      const lbl = labels[i] ?? "";
      ctx.fillStyle = isH ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.38)";
      ctx.font = `${isH ? "600 " : ""}11px 'Geist Mono', monospace`;
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText(lbl.length > 8 ? lbl.slice(0,7)+"…" : lbl, x + bW/2, H - PAD.b + 10);
    });
  }, [data, dims, hovered, pal, labels, getRects, formatValue, PAD]);

  // Animate on mount / data change
  useEffect(() => {
    progressRef.current = 0; startRef.current = null;
    const run = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const t = Math.min((ts - startRef.current) / 850, 1);
      const p = 1 - Math.pow(1 - t, 3);
      progressRef.current = p; draw(p);
      if (t < 1) animRef.current = requestAnimationFrame(run);
    };
    animRef.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  // Resize
  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const ro = new ResizeObserver(e => {
      for (const en of e) setDims({ w: en.contentRect.width, h: height });
    });
    ro.observe(el); return () => ro.disconnect();
  }, [height]);

  // DPR canvas setup
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas || !dims.w) return;
    const DPR = window.devicePixelRatio || 1;
    canvas.width  = dims.w * DPR; canvas.height = dims.h * DPR;
    canvas.style.width = `${dims.w}px`; canvas.style.height = `${dims.h}px`;
    const ctx = canvas.getContext("2d"); if (ctx) ctx.scale(DPR, DPR);
    draw(progressRef.current);
  }, [dims, draw]);

  const handleMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect(); if (!rect) return;
    const mx = e.clientX - rect.left;
    const rects = getRects(dims.w, dims.h);
    let found = -1;
    for (let i = 0; i < rects.length; i++) {
      if (mx >= rects[i].x - 4 && mx <= rects[i].x + rects[i].w + 4) { found = i; break; }
    }
    if (found !== hovered) {
      setHovered(found);
      if (found >= 0) {
        const { x, y, w:bW, h:bH } = rects[found];
        setTooltip({ visible: true, x: x + bW/2, y: Math.max(8, y + bH*0 - 4), i: found });
      } else {
        setTooltip(t => ({ ...t, visible: false }));
      }
    }
  }, [dims, getRects, hovered]);

  const total = data.reduce((a,b) => a+b, 0);
  const max   = Math.max(...data, 1);

  return (
    <div ref={containerRef} style={{ position:"relative", width:"100%" }}>
      {/* Metric header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14, gap:8, flexWrap:"wrap" }}>
        <div>
          <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:pal.a, fontFamily:"'Geist Mono',monospace" }}>
            {label}
          </span>
          <p style={{ fontSize:24, fontWeight:800, color:"var(--foreground,#fff)", margin:"2px 0 0", letterSpacing:"-0.03em", lineHeight:1 }}>
            {formatValue(total)}
          </p>
        </div>
        <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", padding:"3px 8px", borderRadius:20, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.03)", fontFamily:"monospace", alignSelf:"flex-end" }}>
          total acumulado
        </div>
      </div>

      {/* Canvas */}
      <div style={{ position:"relative" }}>
        <canvas ref={canvasRef}
          style={{ display:"block", width:"100%", height, cursor: hovered>=0?"crosshair":"default" }}
          onMouseMove={handleMove}
          onMouseLeave={() => { setHovered(-1); setTooltip(t => ({ ...t, visible:false })); }}
        />

        {/* Tooltip */}
        {tooltip.visible && tooltip.i >= 0 && (
          <div style={{
            position:"absolute", left:tooltip.x, top: Math.max(4, (getRects(dims.w,dims.h)[tooltip.i]?.y ?? 40) - 74),
            transform:"translateX(-50%)", pointerEvents:"none", zIndex:20,
          }}>
            <div style={{
              background:"rgba(8,12,22,0.97)", border:`1px solid ${pal.border}`,
              borderRadius:10, padding:"9px 14px", boxShadow:`0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), 0 0 20px ${pal.glow}`,
              backdropFilter:"blur(16px)", minWidth:120, textAlign:"center",
            }}>
              <p style={{ fontSize:10, color:"rgba(255,255,255,0.38)", margin:"0 0 4px", letterSpacing:"0.07em", textTransform:"uppercase", fontFamily:"monospace" }}>
                {labels[tooltip.i]}
              </p>
              <p style={{ fontSize:18, fontWeight:800, color:pal.a, margin:0, letterSpacing:"-0.02em" }}>
                {formatValue(data[tooltip.i])}
              </p>
              <p style={{ fontSize:10, color:"rgba(255,255,255,0.25)", margin:"4px 0 0", fontFamily:"monospace" }}>
                {((data[tooltip.i]/max)*100).toFixed(0)}% do máximo
              </p>
            </div>
            <div style={{ width:8, height:8, background:"rgba(8,12,22,0.97)", border:`1px solid ${pal.border}`, borderTop:"none", borderLeft:"none", transform:"rotate(45deg)", margin:"-4px auto 0" }} />
          </div>
        )}
      </div>
    </div>
  );
};