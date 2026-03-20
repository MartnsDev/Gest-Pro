"use client";

import type { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: string; positive: boolean };
  accent?: "primary" | "secondary" | "warning" | "destructive";
  loading?: boolean;
}

const ACCENT_COLORS = {
  primary: { bg: "var(--primary-muted)", icon: "var(--primary)" },
  secondary: { bg: "var(--secondary-muted)", icon: "var(--secondary)" },
  warning: { bg: "var(--warning-muted)", icon: "var(--warning)" },
  destructive: { bg: "var(--destructive-muted)", icon: "var(--destructive)" },
};

export function StatsCard({
  title,
  value,
  icon,
  trend,
  accent = "primary",
  loading = false,
}: StatsCardProps) {
  const colors = ACCENT_COLORS[accent];

  if (loading) {
    return (
      <div
        className="card-glow"
        style={{
          background: "var(--surface-elevated)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "20px",
        }}
      >
        <div className="skeleton" style={{ height: 12, width: "60%", marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 28, width: "40%", marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 10, width: "30%" }} />
      </div>
    );
  }

  return (
    <div
      className="card-glow animate-fade-in"
      style={{
        background: "var(--surface-elevated)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, color: "var(--foreground-muted)", fontWeight: 500 }}>
          {title}
        </span>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: colors.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: colors.icon,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 24, fontWeight: 700, color: "var(--foreground)", lineHeight: 1 }}>
          {value}
        </div>
        {trend && (
          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              color: trend.positive ? "var(--success)" : "var(--destructive)",
              fontWeight: 500,
            }}
          >
            {trend.positive ? "+" : ""}{trend.value}
          </div>
        )}
      </div>
    </div>
  );
}
