'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: Date;
}

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;

      try {
        const transactionsRef = collection(db, 'transactions');
        const q = query(
          transactionsRef,
          where('userId', '==', user.uid)
        );

        const querySnapshot = await getDocs(q);
        const fetchedTransactions = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date.toDate(),
            category: data.category.toLowerCase(),
          };
        }) as Transaction[];

        fetchedTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());
        setTransactions(fetchedTransactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
    }).format(Math.abs(amount));
  };

  const getFilteredTransactions = () => {
    return transactions.filter(t => 
      t.date >= dateRange.start && t.date <= dateRange.end
    );
  };

  const getCategoryTotals = () => {
    const filtered = getFilteredTransactions();
    const totals = filtered.reduce((acc, t) => {
      if (t.type === 'expense') {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(totals).map(([category, amount]) => ({
      name: category,
      value: amount,
    }));
  };

  const getDailySpending = () => {
    const filtered = getFilteredTransactions();
    const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
    
    return days.map(day => {
      const dayTransactions = filtered.filter(t => isSameDay(t.date, day));
      const total = dayTransactions.reduce((sum, t) => {
        if (t.type === 'expense') {
          return sum + Math.abs(t.amount);
        }
        return sum;
      }, 0);
      
      return {
        date: format(day, 'MMM d'),
        amount: total,
      };
    });
  };

  const getBiggestCategory = () => {
    const categoryTotals = getCategoryTotals();
    if (categoryTotals.length === 0) return null;
    
    return categoryTotals.reduce((max, current) => 
      current.value > max.value ? current : max
    );
  };

  const getBalance = () => {
    const filtered = getFilteredTransactions();
    const income = filtered
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = filtered
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return income - expenses;
  };

  const totalSpending = getFilteredTransactions()
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalIncome = getFilteredTransactions()
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const biggestCategory = getBiggestCategory();
  const dailySpending = getDailySpending();
  const categoryData = getCategoryTotals();
  const balance = getBalance();

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-surface border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/home" className="text-text-secondary hover:text-primary transition-colors duration-300">
                Home
              </Link>
              <h1 className="text-xl font-bold text-primary">Spending Analytics</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              onClick={() => setSelectedPeriod('week')}
              className={`px-4 py-2 rounded-md transition-colors duration-300 ${
                selectedPeriod === 'week' ? 'bg-primary text-white' : 'bg-surface-light text-text-secondary'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-4 py-2 rounded-md transition-colors duration-300 ${
                selectedPeriod === 'month' ? 'bg-primary text-white' : 'bg-surface-light text-text-secondary'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setSelectedPeriod('year')}
              className={`px-4 py-2 rounded-md transition-colors duration-300 ${
                selectedPeriod === 'year' ? 'bg-primary text-white' : 'bg-surface-light text-text-secondary'
              }`}
            >
              Year
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Balance Card */}
          <div className="bg-surface rounded-lg shadow-glow p-6">
            <h2 className="text-xl font-semibold text-primary mb-4">Balance</h2>
            <div className={`text-3xl font-bold ${balance >= 0 ? 'text-secondary' : 'text-accent'}`}>
              {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
            </div>
            <p className="text-text-secondary mt-2">
              {format(dateRange.start, 'MMM d')} - {format(dateRange.end, 'MMM d, yyyy')}
            </p>
          </div>

          {/* Income vs Expenses Card */}
          <div className="bg-surface rounded-lg shadow-glow p-6">
            <h2 className="text-xl font-semibold text-primary mb-4">Income vs Expenses</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-text-secondary">Income</p>
                <p className="text-2xl font-bold text-secondary">{formatCurrency(totalIncome)}</p>
              </div>
              <div>
                <p className="text-text-secondary">Expenses</p>
                <p className="text-2xl font-bold text-accent">{formatCurrency(totalSpending)}</p>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-surface rounded-lg shadow-glow p-6 md:col-span-2">
            <h2 className="text-xl font-semibold text-primary mb-4">Category Breakdown</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Spending Trend */}
          <div className="bg-surface rounded-lg shadow-glow p-6 md:col-span-2">
            <h2 className="text-xl font-semibold text-primary mb-4">Daily Spending Trend</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailySpending}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="amount" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 