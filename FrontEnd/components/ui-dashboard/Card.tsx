"use client";

import React from "react";

interface CardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}

export function Card({ title, value, icon }: CardProps) {
  return (
    <div className="bg-gray-800 text-white p-4 rounded shadow flex items-center gap-4">
      {icon && <div className="text-2xl">{icon}</div>}
      <div>
        <p className="text-sm text-gray-300">{title}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}
