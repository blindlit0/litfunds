'use client';

import { useAuth } from '@/contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import TransactionChart from '@/components/TransactionChart';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: Date;
}

export default function HomePage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, 'transactions'),
          where('userId', '==', user.uid),
          orderBy('date', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date.toDate(),
            category: data.category.toLowerCase(),
          };
        }) as Transaction[];

        setTransactions(fetched);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(Math.abs(amount));

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-GH', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);

  const getCategoryTotal = (categoryName: string) => {
    const key = categoryName.toLowerCase().replace(/[^a-z]/g, '');
    return transactions
      .filter(t => t.category.replace(/[^a-z]/g, '') === key)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  const groupedChartData = transactions.reduce((acc, t) => {
    const category = t.category;
    acc[category] = (acc[category] || 0) + Math.abs(t.amount);
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(groupedChartData).map(([category, amount]) => ({ category, amount }));

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-surface border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-primary">LitFunds</h1>
            <div className="flex items-center space-x-4">
              <span className="text-text-secondary">Welcome, {user?.displayName || 'User'}</span>
              <Link
                href="/analytics"
                className="text-text-secondary hover:text-primary transition-colors duration-300"
              >
                Analytics
              </Link>
              <Link
                href="/profile"
                className="text-text-secondary hover:text-primary transition-colors duration-300"
              >
                Profile
              </Link>
              <button
                onClick={handleSignOut}
                className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-md transition shadow-glow"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-surface rounded-lg shadow-glow p-6">
            <h2 className="text-xl font-semibold text-primary mb-4">Monthly Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-text-secondary">Total Income</span>
                <span className="text-secondary font-semibold">{formatCurrency(totalIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Total Expenses</span>
                <span className="text-accent font-semibold">{formatCurrency(totalExpenses)}</span>
              </div>
              <div className="flex justify-between border-t border-primary/20 pt-4">
                <span className="text-text-secondary">Balance</span>
                <span className="text-primary font-semibold">{formatCurrency(totalIncome - totalExpenses)}</span>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-lg shadow-glow p-6 md:col-span-2">
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-semibold text-primary">Recent Transactions</h2>
              <Link
                href="/transactions/new"
                className="bg-secondary hover:bg-secondary-dark text-background px-4 py-2 rounded-md transition shadow-glow-green"
              >
                Add Transaction
              </Link>
            </div>
            <div className="space-y-4">
              {loading ? (
                <p className="text-center text-text-secondary">Loading...</p>
              ) : transactions.length === 0 ? (
                <p className="text-center text-text-secondary">No transactions yet</p>
              ) : (
                transactions.map(t => (
                  <div key={t.id} className="flex justify-between items-center p-4 bg-surface-light rounded-lg">
                    <div>
                      <h3 className="font-medium text-text">{t.description}</h3>
                      <p className="text-sm text-text-secondary">{formatDate(t.date)} • {t.category}</p>
                    </div>
                    <span className={`font-semibold ${t.type === 'income' ? 'text-secondary' : 'text-accent'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-surface rounded-lg shadow-glow p-6">
            <h2 className="text-xl font-semibold text-primary mb-4">Spending by Category</h2>
            <TransactionChart data={chartData} />
          </div>

          <div className="bg-surface rounded-lg shadow-glow p-6">
            <h2 className="text-xl font-semibold text-primary mb-4">Budget Overview</h2>
            {[{ category: 'Food & Dining', budget: 500 }, { category: 'Transportation', budget: 300 }].map(({ category, budget }) => {
              const spent = getCategoryTotal(category);
              const percent = (spent / budget) * 100;
              return (
                <div key={category} className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-text-secondary">{category}</span>
                    <span className="text-text-secondary">{formatCurrency(spent)} / {formatCurrency(budget)}</span>
                  </div>
                  <div className="w-full bg-surface-light h-2 rounded-full">
                    <div
                      className={`h-2 rounded-full ${percent > 100 ? 'bg-accent' : 'bg-primary'}`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
}