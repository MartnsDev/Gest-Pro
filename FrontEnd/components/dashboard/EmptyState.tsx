"use client";

import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: "48px 24px",
        textAlign: "center",
      }}
    >
      {icon && (
        <div style={{ color: "var(--foreground-subtle)", marginBottom: 4 }}>
          {icon}
        </div>
      )}
      <span style={{ fontSize: 15, fontWeight: 600, color: "var(--foreground-muted)" }}>
        {title}
      </span>
      {description && (
        <span style={{ fontSize: 13, color: "var(--foreground-subtle)", maxWidth: 320 }}>
          {description}
        </span>
      )}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
