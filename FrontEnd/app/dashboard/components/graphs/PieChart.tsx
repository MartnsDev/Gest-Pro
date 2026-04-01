"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface PieChartProps {
  labels: string[];
  data: number[];
  formatValue?: (value: number) => string;
}

const COLORS = [
  { a:"#34d399", b:"#064e3b", glow:"rgba(52,211,153,0.45)",  hex:"#34d399" },
  { a:"#60a5fa", b:"#1e3a8a", glow:"rgba(96,165,250,0.45)",  hex:"#60a5fa" },
  { a:"#c084fc", b:"#4c1d95", glow:"rgba(192,132,252,0.45)", hex:"#c084fc" },
  { a:"#fbbf24", b:"#78350f", glow:"rgba(251,191,36,0.45)",  hex:"#fbbf24" },
  { a:"#fb7185", b:"#881337", glow:"rgba(251,113,133,0.45)", hex:"#fb7185" },
  { a:"#22d3ee", b:"#164e63", glow:"rgba(34,211,238,0.45)",  hex:"#22d3ee" },
];

export const PieChart = ({
  labels, data,
  formatValue = (v) => v.toLocaleString("pt-BR"),
}: PieChartProps) => {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef      = useRef<number>(0);
  const progressRef  = useRef(0);
  const startRef     = useRef<number|null>(null);

  const [hovered, setHovered]   = useState(-1);
  const [dims, setDims]         = useState({ w:0, h:220 });

  const total = data.reduce((a,b) => a+b, 0) || 1;

  const getSlices = useCallback((progress: number) => {
    let ang = -Math.PI / 2;
    return data.map((val, i) => {
      const sweep = (val / total) * Math.PI * 2 * progress;
      const mid   = ang + sweep / 2;
      const s = { ang, sweep, mid, val, i };
      ang += sweep;
      return s;
    });
  }, [data, total]);

  const draw = useCallback((progress: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !dims.w) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const DPR = window.devicePixelRatio || 1;
    const W = dims.w, H = dims.h;
    ctx.clearRect(0, 0, W*DPR, H*DPR);

    const cx = W / 2, cy = H / 2;
    const R  = Math.min(cx, cy) - 18;
    const ri = R * 0.55;
    const GAP = 0.028;

    const slices = getSlices(progress);

    // ── Draw each slice ──
    slices.forEach(({ ang, sweep, mid, i }) => {
      if (sweep < 0.002) return;
      const col  = COLORS[i % COLORS.length];
      const isH  = i === hovered;
      const bump = isH ? 10 : 0;
      const ox = Math.cos(mid) * bump;
      const oy = Math.sin(mid) * bump;
      const s  = ang  + GAP/2;
      const e  = ang + sweep - GAP/2;

      if (isH) { ctx.shadowColor = col.glow; ctx.shadowBlur = 22; }

      // Radial gradient
      const grad = ctx.createRadialGradient(cx+ox, cy+oy, ri*0.6, cx+ox, cy+oy, R+bump);
      grad.addColorStop(0, col.b + "bb");
      grad.addColorStop(0.5, col.a + "ee");
      grad.addColorStop(1,   col.a + (isH?"ff":"cc"));

      ctx.beginPath();
      ctx.moveTo(cx+ox + Math.cos(s)*ri, cy+oy + Math.sin(s)*ri);
      ctx.arc(cx+ox, cy+oy, R+bump, s, e);
      ctx.arc(cx+ox, cy+oy, ri, e, s, true);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.shadowBlur = 0; ctx.shadowColor = "transparent";

      // Subtle inner stroke
      ctx.beginPath();
      ctx.moveTo(cx+ox + Math.cos(s)*ri, cy+oy + Math.sin(s)*ri);
      ctx.arc(cx+ox, cy+oy, R+bump, s, e);
      ctx.arc(cx+ox, cy+oy, ri, e, s, true);
      ctx.closePath();
      ctx.strokeStyle = "rgba(255,255,255,0.07)";
      ctx.lineWidth = 1; ctx.stroke();
    });

    // ── Center donut ──
    // Dark center fill
    const cGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, ri);
    cGrad.addColorStop(0, "rgba(6,8,18,0.95)");
    cGrad.addColorStop(1, "rgba(6,8,18,0.80)");
    ctx.beginPath(); ctx.arc(cx, cy, ri - 1, 0, Math.PI*2);
    ctx.fillStyle = cGrad; ctx.fill();

    // Center text
    const hi   = hovered >= 0 ? hovered : -1;
    const dVal = hi >= 0 ? data[hi] : total;
    const dLbl = hi >= 0 ? labels[hi] : "Total";
    const dPct = hi >= 0 ? `${((data[hi]/total)*100).toFixed(1)}%` : `${data.length} categ.`;
    const col  = hi >= 0 ? COLORS[hi % COLORS.length].a : "rgba(255,255,255,0.88)";

    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = col;
    ctx.font = `800 ${Math.min(20, ri*0.38)}px 'Geist Mono', monospace`;
    ctx.fillText(formatValue(dVal), cx, cy - 13);

    ctx.fillStyle = "rgba(255,255,255,0.38)";
    ctx.font = `${Math.min(10, ri*0.2)}px sans-serif`;
    ctx.fillText(dLbl.length > 14 ? dLbl.slice(0,13)+"…" : dLbl, cx, cy + 4);

    ctx.fillStyle = hi >= 0 ? col : "rgba(255,255,255,0.22)";
    ctx.font = `600 ${Math.min(11, ri*0.22)}px 'Geist Mono', monospace`;
    ctx.fillText(dPct, cx, cy + 18);
  }, [data, dims, hovered, labels, formatValue, getSlices, total]);

  // Animation
  useEffect(() => {
    progressRef.current = 0; startRef.current = null;
    const run = (ts:number) => {
      if (!startRef.current) startRef.current = ts;
      const t = Math.min((ts - startRef.current) / 950, 1);
      const p = t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
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
      for (const en of e) setDims({ w: en.contentRect.width, h: 220 });
    });
    ro.observe(el); return () => ro.disconnect();
  }, []);

  // DPR
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas || !dims.w) return;
    const DPR = window.devicePixelRatio || 1;
    canvas.width = dims.w*DPR; canvas.height = dims.h*DPR;
    canvas.style.width = `${dims.w}px`; canvas.style.height = `${dims.h}px`;
    const ctx = canvas.getContext("2d"); if (ctx) ctx.scale(DPR, DPR);
    draw(progressRef.current);
  }, [dims, draw]);

  const hitIndex = useCallback((mx:number, my:number) => {
    const cx = dims.w/2, cy = dims.h/2;
    const R  = Math.min(cx, cy) - 18;
    const ri = R * 0.55;
    const dx = mx-cx, dy = my-cy;
    const dist = Math.sqrt(dx*dx+dy*dy);
    if (dist > R+12 || dist < ri-4) return -1;
    let ang = Math.atan2(dy, dx);
    if (ang < -Math.PI/2) ang += Math.PI*2;
    let start = -Math.PI/2;
    for (let i=0; i<data.length; i++) {
      const sw = (data[i]/total)*Math.PI*2;
      if (ang >= start && ang <= start+sw) return i;
      start += sw;
    }
    return -1;
  }, [dims, data, total]);

  return (
    <div ref={containerRef} style={{ position:"relative", width:"100%" }}>
      <div style={{ position:"relative" }}>
        <canvas ref={canvasRef}
          style={{ display:"block", width:"100%", height:dims.h, cursor: hovered>=0?"pointer":"default" }}
          onMouseMove={e => {
            const rect = canvasRef.current?.getBoundingClientRect(); if (!rect) return;
            const i = hitIndex(e.clientX-rect.left, e.clientY-rect.top);
            if (i !== hovered) setHovered(i);
          }}
          onMouseLeave={() => setHovered(-1)}
        />
      </div>

      {/* Legend */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:"6px 14px", marginTop:14, justifyContent:"center" }}>
        {labels.map((lbl, i) => {
          const col = COLORS[i % COLORS.length];
          const pct = ((data[i]/total)*100).toFixed(1);
          const isH = i === hovered;
          return (
            <div key={i}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"3px 8px", borderRadius:6, cursor:"pointer",
                background: isH ? "rgba(255,255,255,0.06)" : "transparent",
                opacity: hovered >= 0 && !isH ? 0.4 : 1, transition:"all 0.18s" }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(-1)}
            >
              <span style={{ width:10, height:10, borderRadius:3, background:col.a, flexShrink:0,
                boxShadow: isH ? `0 0 10px ${col.glow}` : "none", transition:"box-shadow 0.18s" }} />
              <span style={{ fontSize:11, color: isH ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.45)",
                transition:"color 0.18s", maxWidth:90, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                fontFamily:"sans-serif" }}>{lbl}</span>
              <span style={{ fontSize:11, fontWeight:700, color: isH ? col.a : "rgba(255,255,255,0.3)",
                transition:"color 0.18s", fontFamily:"'Geist Mono',monospace" }}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};