"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface LineChartProps {
  labels: string[];
  datasets: { label: string; data: number[]; color?: "blue"|"green"|"purple"|"orange"|"rose"|"cyan" }[];
  formatValue?: (value: number) => string;
  height?: number;
}

const PAL = {
  blue:   { line:"#60a5fa", area:"rgba(96,165,250,0.18)",  dot:"#93c5fd", glow:"rgba(96,165,250,0.55)"  },
  green:  { line:"#34d399", area:"rgba(52,211,153,0.18)",  dot:"#6ee7b7", glow:"rgba(52,211,153,0.55)"  },
  purple: { line:"#c084fc", area:"rgba(192,132,252,0.18)", dot:"#d8b4fe", glow:"rgba(192,132,252,0.55)" },
  orange: { line:"#fb923c", area:"rgba(251,146,60,0.18)",  dot:"#fdba74", glow:"rgba(251,146,60,0.55)"  },
  rose:   { line:"#fb7185", area:"rgba(251,113,133,0.18)", dot:"#fda4af", glow:"rgba(251,113,133,0.55)" },
  cyan:   { line:"#22d3ee", area:"rgba(34,211,238,0.18)",  dot:"#67e8f9", glow:"rgba(34,211,238,0.55)"  },
};

export const LineChart = ({
  labels, datasets,
  formatValue = (v) => v.toLocaleString("pt-BR"),
  height = 260,
}: LineChartProps) => {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef      = useRef<number>(0);
  const progressRef  = useRef(0);
  const startRef     = useRef<number|null>(null);

  const [hovX, setHovX]     = useState(-1);
  const [tooltip, setTooltip] = useState<{ visible:boolean; x:number; y:number; li:number }>({ visible:false,x:0,y:0,li:-1 });
  const [dims, setDims]     = useState({ w:0, h:height });

  const PAD = { t:24, r:20, b:52, l:64 };

  const allVals = datasets.flatMap(d => d.data);
  const maxV = Math.max(...allVals, 1);
  const minV = Math.min(...allVals.filter(v=>v>0), 0);
  const rng  = maxV - minV || 1;

  const getPoints = useCallback((arr: number[], W:number, H:number) => {
    const cW = W - PAD.l - PAD.r;
    const cH = H - PAD.t - PAD.b;
    return arr.map((v, i) => ({
      x: PAD.l + (i / Math.max(arr.length-1,1)) * cW,
      y: PAD.t + cH - ((v - minV) / rng) * cH,
      v,
    }));
  }, [minV, rng, PAD]);

  // Smooth bezier
  const smoothPath = (pts: {x:number;y:number}[], ctx: CanvasRenderingContext2D) => {
    if (pts.length < 2) return;
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(i-1,0)];
      const p1 = pts[i];
      const p2 = pts[i+1];
      const p3 = pts[Math.min(i+2, pts.length-1)];
      const t = 0.38;
      ctx.bezierCurveTo(
        p1.x + (p2.x - p0.x)/6*t*2, p1.y + (p2.y - p0.y)/6*t*2,
        p2.x - (p3.x - p1.x)/6*t*2, p2.y - (p3.y - p1.y)/6*t*2,
        p2.x, p2.y,
      );
    }
  };

  const draw = useCallback((progress: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !dims.w) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const DPR = window.devicePixelRatio || 1;
    const W = dims.w, H = dims.h;
    ctx.clearRect(0, 0, W*DPR, H*DPR);

    const cW = W - PAD.l - PAD.r;
    const cH = H - PAD.t - PAD.b;

    // Grid
    const LINES = 5;
    for (let i = 0; i <= LINES; i++) {
      const y   = PAD.t + (cH/LINES)*i;
      const val = maxV - ((maxV-minV)/LINES)*i;
      ctx.beginPath();
      ctx.strokeStyle = i===LINES ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)";
      ctx.lineWidth   = i===LINES ? 1.5 : 1;
      ctx.setLineDash(i===LINES ? [] : [3,6]);
      ctx.moveTo(PAD.l,y); ctx.lineTo(PAD.l+cW,y);
      ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "rgba(255,255,255,0.32)";
      ctx.font = `11px 'Geist Mono', monospace`;
      ctx.textAlign = "right"; ctx.textBaseline = "middle";
      ctx.fillText(val>=1000 ? `${(val/1000).toFixed(1)}k` : val.toFixed(0), PAD.l-10, y);
    }

    // Hover crosshair
    if (hovX >= 0 && hovX < labels.length) {
      const pts0 = getPoints(datasets[0]?.data ?? [], W, H);
      const hx = pts0[hovX]?.x;
      if (hx !== undefined) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.lineWidth = 1; ctx.setLineDash([4,5]);
        ctx.moveTo(hx, PAD.t); ctx.lineTo(hx, PAD.t+cH);
        ctx.stroke(); ctx.setLineDash([]);
      }
    }

    // Datasets
    datasets.forEach((ds, di) => {
      const col  = PAL[ds.color ?? "blue"];
      const pts  = getPoints(ds.data, W, H);
      const clipX = PAD.l + cW * progress;

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, clipX, H);
      ctx.clip();

      // Area
      const aGrad = ctx.createLinearGradient(0, PAD.t, 0, PAD.t+cH);
      aGrad.addColorStop(0, col.area.replace("0.18","0.3"));
      aGrad.addColorStop(0.7, col.area.replace("0.18","0.08"));
      aGrad.addColorStop(1,   col.area.replace("0.18","0"));
      ctx.beginPath();
      smoothPath(pts, ctx);
      ctx.lineTo(pts[pts.length-1].x, PAD.t+cH);
      ctx.lineTo(pts[0].x, PAD.t+cH);
      ctx.closePath();
      ctx.fillStyle = aGrad;
      ctx.fill();

      // Line glow (thicker, blurred)
      ctx.beginPath(); smoothPath(pts, ctx);
      ctx.strokeStyle = col.glow; ctx.lineWidth = 6;
      ctx.shadowColor = col.glow; ctx.shadowBlur = 0;
      ctx.globalAlpha = 0.25; ctx.stroke(); ctx.globalAlpha = 1;

      // Line crisp
      ctx.beginPath(); smoothPath(pts, ctx);
      ctx.strokeStyle = col.line; ctx.lineWidth = 2.5;
      ctx.lineJoin = "round"; ctx.lineCap = "round";
      ctx.shadowColor = col.glow; ctx.shadowBlur = 10;
      ctx.stroke(); ctx.shadowBlur = 0;

      ctx.restore();

      // Dots
      pts.forEach((pt, j) => {
        if (pt.x > PAD.l + cW*progress + 2) return;
        const isH = j === hovX;
        if (!isH && j !== 0 && j !== pts.length-1) return;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, isH ? 5.5 : 3.5, 0, Math.PI*2);
        ctx.fillStyle = isH ? col.line : col.dot;
        ctx.shadowColor = col.glow; ctx.shadowBlur = isH ? 18 : 8;
        ctx.fill(); ctx.shadowBlur = 0;
        if (isH) {
          ctx.beginPath(); ctx.arc(pt.x, pt.y, 9.5, 0, Math.PI*2);
          ctx.strokeStyle = col.line+"44"; ctx.lineWidth = 1.5; ctx.stroke();
        }
      });
    });

    // X labels
    const pts0 = getPoints(datasets[0]?.data ?? [], W, H);
    labels.forEach((lbl, i) => {
      const pt = pts0[i]; if (!pt) return;
      const isH = i === hovX;
      ctx.fillStyle = isH ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.35)";
      ctx.font = `${isH?"600 ":""}11px 'Geist Mono', monospace`;
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText(lbl.length>6 ? lbl.slice(0,5)+"…" : lbl, pt.x, H - PAD.b + 10);
    });
  }, [dims, datasets, labels, hovX, maxV, minV, getPoints, PAD]);

  useEffect(() => {
    progressRef.current = 0; startRef.current = null;
    const run = (ts:number) => {
      if (!startRef.current) startRef.current = ts;
      const t = Math.min((ts-startRef.current)/1000, 1);
      const p = t<0.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;
      progressRef.current = p; draw(p);
      if (t < 1) animRef.current = requestAnimationFrame(run);
    };
    animRef.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const ro = new ResizeObserver(e => {
      for (const en of e) setDims({ w: en.contentRect.width, h: height });
    });
    ro.observe(el); return () => ro.disconnect();
  }, [height]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas || !dims.w) return;
    const DPR = window.devicePixelRatio || 1;
    canvas.width = dims.w*DPR; canvas.height = dims.h*DPR;
    canvas.style.width = `${dims.w}px`; canvas.style.height = `${dims.h}px`;
    const ctx = canvas.getContext("2d"); if (ctx) ctx.scale(DPR, DPR);
    draw(progressRef.current);
  }, [dims, draw]);

  const handleMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect(); if (!rect) return;
    const mx = e.clientX - rect.left;
    const pts = getPoints(datasets[0]?.data ?? [], dims.w, dims.h);
    let ci = -1, md = Infinity;
    pts.forEach((pt, i) => { const d = Math.abs(mx - pt.x); if (d < md) { md = d; ci = i; } });
    if (ci !== hovX) {
      setHovX(ci);
      const pt = pts[ci];
      if (pt) setTooltip({ visible:true, x:pt.x, y:pt.y, li:ci });
    }
  }, [dims, datasets, getPoints, hovX]);

  return (
    <div ref={containerRef} style={{ position:"relative", width:"100%" }}>
      {datasets.length > 1 && (
        <div style={{ display:"flex", gap:16, marginBottom:10, flexWrap:"wrap" }}>
          {datasets.map((ds,i) => {
            const col = PAL[ds.color ?? "blue"];
            return (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ width:22, height:3, borderRadius:2, background:col.line, display:"inline-block" }} />
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.45)", fontFamily:"sans-serif" }}>{ds.label}</span>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ position:"relative" }}>
        <canvas ref={canvasRef}
          style={{ display:"block", width:"100%", height:dims.h, cursor:"crosshair" }}
          onMouseMove={handleMove}
          onMouseLeave={() => { setHovX(-1); setTooltip(t => ({ ...t, visible:false })); }}
        />

        {tooltip.visible && tooltip.li >= 0 && (
          <div style={{ position:"absolute", left:tooltip.x, top:Math.max(6, tooltip.y - 90), transform:"translateX(-50%)", pointerEvents:"none", zIndex:20 }}>
            <div style={{
              background:"rgba(8,12,22,0.97)",
              border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:10, padding:"9px 14px",
              boxShadow:"0 12px 40px rgba(0,0,0,0.6)",
              backdropFilter:"blur(16px)", minWidth:130,
            }}>
              <p style={{ fontSize:10, color:"rgba(255,255,255,0.38)", margin:"0 0 6px", letterSpacing:"0.07em", textTransform:"uppercase", fontFamily:"monospace" }}>
                {labels[tooltip.li]}
              </p>
              {datasets.map((ds, i) => {
                const col = PAL[ds.color ?? "blue"];
                return (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:14, marginTop: i > 0 ? 4 : 0 }}>
                    <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"rgba(255,255,255,0.42)", fontFamily:"sans-serif" }}>
                      <span style={{ width:8,height:8,borderRadius:2,background:col.line,flexShrink:0 }} />
                      {ds.label}
                    </span>
                    <span style={{ fontSize:14, fontWeight:800, color:col.line, fontFamily:"'Geist Mono',monospace" }}>
                      {formatValue(ds.data[tooltip.li] ?? 0)}
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