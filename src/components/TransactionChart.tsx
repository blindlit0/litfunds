'use client';

import { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration } from 'chart.js/auto';

interface ChartData {
  category: string;
  amount: number;
}

interface TransactionChartProps {
  data: ChartData[];
}

export default function TransactionChart({ data }: TransactionChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !data.length) return;

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: data.map(item => item.category),
        datasets: [
          {
            data: data.map(item => item.amount),
            backgroundColor: [
              'rgba(99, 102, 241, 0.8)', // indigo
              'rgba(236, 72, 153, 0.8)', // pink
              'rgba(16, 185, 129, 0.8)', // green
              'rgba(245, 158, 11, 0.8)', // yellow
              'rgba(239, 68, 68, 0.8)', // red
              'rgba(59, 130, 246, 0.8)', // blue
            ],
            borderColor: [
              'rgba(99, 102, 241, 1)',
              'rgba(236, 72, 153, 1)',
              'rgba(16, 185, 129, 1)',
              'rgba(245, 158, 11, 1)',
              'rgba(239, 68, 68, 1)',
              'rgba(59, 130, 246, 1)',
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#94a3b8', // text-secondary
              font: {
                size: 12,
              },
            },
          },
        },
      },
    };

    chartInstance.current = new Chart(ctx, config);

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-secondary">No data available</p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <canvas ref={chartRef} />
    </div>
  );
} 