'use client';

import { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { Transaction } from '@/types/transaction';

interface TransactionChartProps {
  data: Transaction[];
}

const getCategoryTotals = (transactions: Transaction[]) => {
  const totals: Record<string, number> = {};
  
  // Only process expense transactions
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const category = t.category.toLowerCase();
      totals[category] = (totals[category] || 0) + Math.abs(t.amount);
    });

  return Object.entries(totals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

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

    const categoryData = getCategoryTotals(data);

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: categoryData.map(item => item.name),
        datasets: [
          {
            data: categoryData.map(item => item.value),
            backgroundColor: [
              'rgba(99, 102, 241, 0.8)', // indigo
              'rgba(236, 72, 153, 0.8)', // pink
              'rgba(16, 185, 129, 0.8)', // green
              'rgba(245, 158, 11, 0.8)', // yellow
              'rgba(239, 68, 68, 0.8)', // red
              'rgba(59, 130, 246, 0.8)', // blue
            ],
            borderColor: 'transparent',
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#94a3b8', // text-secondary
              font: {
                size: 12,
              },
              padding: 20,
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
    <div className="h-[500px] flex items-center justify-center">
      <canvas ref={chartRef} className="max-w-full max-h-full" />
    </div>
  );
} 