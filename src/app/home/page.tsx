'use client';

import { useAuth } from '@/contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
        const transactionsRef = collection(db, 'transactions');
        const q = query(
          transactionsRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const fetchedTransactions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate(),
        })) as Transaction[];

        setTransactions(fetchedTransactions);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
    }).format(Math.abs(amount));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-surface border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary">Expense Tracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/profile"
                className="text-text-secondary hover:text-primary transition-colors duration-300"
              >
                Profile
              </Link>
              <button
                onClick={handleSignOut}
                className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-md transition-all duration-300 shadow-glow"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Summary Card */}
          <div className="bg-surface rounded-lg shadow-glow p-6">
            <h2 className="text-xl font-semibold text-primary mb-4">Monthly Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Total Income</span>
                <span className="text-secondary font-semibold">
                  {formatCurrency(transactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Total Expenses</span>
                <span className="text-accent font-semibold">
                  {formatCurrency(transactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + Math.abs(t.amount), 0))}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-primary/20 pt-4">
                <span className="text-text-secondary">Balance</span>
                <span className="text-primary font-semibold">
                  {formatCurrency(transactions.reduce((sum, t) => sum + t.amount, 0))}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-surface rounded-lg shadow-glow p-6 md:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-primary">Recent Transactions</h2>
              <Link
                href="/transactions/new"
                className="bg-secondary hover:bg-secondary-dark text-background px-4 py-2 rounded-md transition-all duration-300 shadow-glow-green"
              >
                Add Transaction
              </Link>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center text-text-secondary">Loading transactions...</div>
              ) : transactions.length === 0 ? (
                <p className="text-text-secondary text-center">No transactions yet</p>
              ) : (
                transactions.map(transaction => (
                  <div
                    key={transaction.id}
                    className="flex justify-between items-center p-4 bg-surface-light rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium text-text">{transaction.description}</h3>
                      <p className="text-sm text-text-secondary">
                        {formatDate(transaction.date)} • {transaction.category}
                      </p>
                    </div>
                    <span
                      className={`font-semibold ${
                        transaction.type === 'income' ? 'text-secondary' : 'text-accent'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="bg-surface rounded-lg shadow-glow p-6">
            <h2 className="text-xl font-semibold text-primary mb-4">Categories</h2>
            <div className="space-y-2">
              {['Food & Dining', 'Transportation', 'Entertainment'].map(category => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-text-secondary">{category}</span>
                  <span className="text-accent">
                    {formatCurrency(
                      transactions
                        .filter(t => t.category.toLowerCase() === category.toLowerCase().replace(' & ', ''))
                        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Overview */}
          <div className="bg-surface rounded-lg shadow-glow p-6">
            <h2 className="text-xl font-semibold text-primary mb-4">Budget Overview</h2>
            <div className="space-y-4">
              {[
                { category: 'Food & Dining', budget: 500 },
                { category: 'Transportation', budget: 300 },
              ].map(({ category, budget }) => {
                const spent = transactions
                  .filter(t => t.category.toLowerCase() === category.toLowerCase().replace(' & ', ''))
                  .reduce((sum, t) => sum + Math.abs(t.amount), 0);
                const percentage = (spent / budget) * 100;

                return (
                  <div key={category}>
                    <div className="flex justify-between mb-1">
                      <span className="text-text-secondary">{category}</span>
                      <span className="text-text-secondary">
                        {formatCurrency(spent)} / {formatCurrency(budget)}
                      </span>
                    </div>
                    <div className="w-full bg-surface-light rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          percentage > 100 ? 'bg-accent' : 'bg-primary'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 