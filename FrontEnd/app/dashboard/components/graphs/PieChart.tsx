"use client";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  labels: string[];
  data: number[];
}

export const PieChart = ({ labels, data }: PieChartProps) => {
  const colors = [
    "#3b82f6", // azul
    "#f97316", // laranja
    "#10b981", // verde
    "#f43f5e", // rosa/vermelho
    "#8b5cf6", // roxo
    "#eab308", // amarelo
  ];

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: labels.map((_, i) => colors[i % colors.length]),
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // ocupa 100% da altura
    plugins: {
      legend: {
        labels: { color: "#fff", font: { size: 12 } },
      },
      tooltip: {
        backgroundColor: "#1e293b",
        titleColor: "#fff",
        bodyColor: "#fff",
      },
    },
  };

  return <Pie data={chartData} options={options} />;
};
