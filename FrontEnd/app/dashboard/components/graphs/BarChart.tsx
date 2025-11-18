"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  labels: string[];
  data: number[];
  label: string;
}

export const BarChart = ({ labels, data, label }: BarChartProps) => {
  const chartData = {
    labels,
    datasets: [
      {
        label,
        data,
        backgroundColor: "rgba(59, 130, 246, 0.8)", // azul
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // ocupa 100% da altura disponível
    plugins: {
      legend: {
        labels: { color: "#fff" }, // legenda branca
      },
      tooltip: {
        backgroundColor: "#1e293b",
        titleColor: "#fff",
        bodyColor: "#fff",
      },
    },
    scales: {
      x: {
        ticks: { color: "#fff" },
        grid: { display: false },
      },
      y: {
        ticks: { color: "#fff" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};
