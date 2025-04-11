'use client';

import { useAuth } from '@/contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';
import TransactionChart from '@/components/TransactionChart';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Transaction } from '@/types/transaction';

export default function HomePage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'transactions' | 'analytics'>('overview');
  const router = useRouter();

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
        const transactionsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate(),
          category: doc.data().category.toLowerCase(),
        })) as Transaction[];

        setTransactions(transactionsData);
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

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const balance = totalIncome - totalExpenses;

  const getBalanceStatus = (balance: number, totalExpenses: number) => {
    const expenseRatio = totalExpenses > 0 ? Math.abs(balance) / totalExpenses : 0;
    
    if (balance < 0) {
      if (expenseRatio > 0.5) {
        return {
          status: 'critical',
          message: 'Yikes! Your spending is doing backflips over your income! 🎭 Time to tighten those purse strings!',
          color: 'text-accent',
          bgColor: 'bg-accent/10'
        };
      } else {
        return {
          status: 'warning',
          message: 'Uh-oh! Your wallet is doing the limbo under your expenses! 💃 Let\'s find ways to boost that income!',
          color: 'text-accent',
          bgColor: 'bg-accent/10'
        };
      }
    } else {
      if (balance > totalExpenses * 3) {
        return {
          status: 'excellent',
          message: 'Woohoo! You\'re swimming in cash like Scrooge McDuck! 🦆 Time to make that money work for you!',
          color: 'text-secondary',
          bgColor: 'bg-secondary/10'
        };
      } else if (balance > totalExpenses) {
        return {
          status: 'good',
          message: 'Looking good! Your finances are doing the cha-cha in the right direction! 💃 Keep up the awesome work!',
          color: 'text-secondary',
          bgColor: 'bg-secondary/10'
        };
      } else {
        return {
          status: 'normal',
          message: 'Not bad! You\'re in the green, but let\'s aim for that financial high-five! ✋',
          color: 'text-secondary',
          bgColor: 'bg-secondary/10'
        };
      }
    }
  };

  const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
    const handleDelete = async () => {
      if (!user) return;

      try {
        const transactionRef = doc(db, 'transactions', transaction.id);
        await deleteDoc(transactionRef);
        router.refresh(); // Refresh the page to update the transaction list
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    };

    return (
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-300">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${transaction.type === 'income' ? 'text-secondary' : 'text-accent'}`}>
              {transaction.type === 'income' ? '+' : '-'}₵{Math.abs(transaction.amount).toFixed(2)}
            </span>
            <span className="text-text-secondary text-sm">
              {format(transaction.date, 'MMM d, yyyy')}
            </span>
          </div>
          <p className="text-text-primary mt-1">{transaction.description}</p>
          <p className="text-text-secondary text-sm capitalize">{transaction.category}</p>
        </div>
        <div className="flex space-x-2">
          <Link
            href={`/transactions/${transaction.id}`}
            className="p-2 text-primary hover:text-primary/80 transition-colors duration-300"
            title="Edit transaction"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </Link>
          <button
            onClick={handleDelete}
            className="p-2 text-accent hover:text-accent/80 transition-colors duration-300"
            title="Delete transaction"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80 relative overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated Large Circle */}
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-secondary/5 blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        
        {/* Animated Small Circle */}
        <div className="absolute top-1/4 -left-20 w-40 h-40 rounded-full bg-accent/5 blur-2xl animate-pulse" style={{ animationDuration: '6s' }} />
        
        {/* Animated Diagonal Lines */}
        <div className="absolute top-1/3 right-0 w-1/2 h-1 bg-gradient-to-r from-secondary/10 to-transparent transform -rotate-45 animate-slide" />
        <div className="absolute bottom-1/4 left-0 w-1/2 h-1 bg-gradient-to-r from-transparent to-accent/10 transform rotate-45 animate-slide-reverse" />
        
        {/* Floating Orbs */}
        <div className="absolute top-1/2 left-1/4 w-8 h-8 rounded-full bg-secondary/10 blur-xl animate-float" style={{ animationDuration: '15s' }} />
        <div className="absolute top-1/3 right-1/4 w-6 h-6 rounded-full bg-accent/10 blur-xl animate-float" style={{ animationDuration: '12s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-4 h-4 rounded-full bg-primary/10 blur-xl animate-float" style={{ animationDuration: '10s' }} />
      </div>

      {/* Content Container with Glass Effect */}
      <div className="relative z-10">
        <nav className="bg-white/5 border-b border-primary/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <h1 className="text-xl font-bold text-primary">LitFunds</h1>
              <div className="flex items-center space-x-4">
                <span className="text-text-secondary">Welcome, {user?.displayName || 'User'}</span>
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
          {/* Navigation Buttons */}
          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => setActiveSection('overview')}
              className={`px-6 py-3 rounded-lg transition-colors duration-300 ${
                activeSection === 'overview'
                  ? 'bg-secondary text-white shadow-glow-green'
                  : 'bg-white/5 text-text-secondary hover:bg-white/10'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveSection('transactions')}
              className={`px-6 py-3 rounded-lg transition-colors duration-300 ${
                activeSection === 'transactions'
                  ? 'bg-secondary text-white shadow-glow-green'
                  : 'bg-white/5 text-text-secondary hover:bg-white/10'
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => setActiveSection('analytics')}
              className={`px-6 py-3 rounded-lg transition-colors duration-300 ${
                activeSection === 'analytics'
                  ? 'bg-secondary text-white shadow-glow-green'
                  : 'bg-white/5 text-text-secondary hover:bg-white/10'
              }`}
            >
              Analytics
            </button>
          </div>

          {/* Content Sections */}
          <div className="relative">
            {/* Section Content */}
            {activeSection === 'overview' && (
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Column - Summary and Recent Transactions */}
                <div className="flex-1 space-y-6">
                  <div className="bg-white/5 rounded-lg shadow-glow p-6">
                    <h2 className="text-xl font-semibold text-primary mb-4">Monthly Summary</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-secondary/10 p-4 rounded-lg">
                        <p className="text-text-secondary">Total Income</p>
                        <p className="text-2xl font-bold text-secondary">{formatCurrency(totalIncome)}</p>
                      </div>
                      <div className="bg-accent/10 p-4 rounded-lg">
                        <p className="text-text-secondary">Total Expenses</p>
                        <p className="text-2xl font-bold text-accent">{formatCurrency(totalExpenses)}</p>
                      </div>
                      <div className="col-span-2 bg-white/5 p-4 rounded-lg">
                        <p className="text-text-secondary">Balance</p>
                        <p className={`text-2xl font-bold ${balance >= 0 ? 'text-secondary' : 'text-accent'}`}>
                          {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Balance Status Card */}
                  <div className={`rounded-lg shadow-glow p-6 ${getBalanceStatus(balance, totalExpenses).bgColor}`}>
                    <h2 className="text-xl font-semibold text-primary mb-4">Financial Status</h2>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <span className={`text-lg font-medium ${getBalanceStatus(balance, totalExpenses).color}`}>
                          {getBalanceStatus(balance, totalExpenses).status.charAt(0).toUpperCase() + 
                           getBalanceStatus(balance, totalExpenses).status.slice(1)}
                        </span>
                      </div>
                      <p className="text-text-primary">
                        {getBalanceStatus(balance, totalExpenses).message}
                      </p>
                      {balance < 0 && (
                        <div className="mt-4">
                          <Link
                            href="/transactions/new"
                            className="inline-block bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded-md transition shadow-glow-green"
                          >
                            Add Income
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg shadow-glow p-6">
                    <h2 className="text-xl font-semibold text-primary mb-4">Recent Transactions</h2>
                    <div className="space-y-4">
                      {loading ? (
                        <p className="text-center text-text-secondary">Loading...</p>
                      ) : transactions.length === 0 ? (
                        <p className="text-center text-text-secondary">No transactions yet</p>
                      ) : (
                        transactions.slice(0, 3).map(t => (
                          <TransactionItem key={t.id} transaction={t} />
                        ))
                      )}
                    </div>
                    <div className="mt-4">
                      <Link
                        href="/transactions/new"
                        className="block w-full text-center bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded-md transition shadow-glow-green"
                      >
                        Add Transaction
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Right Column - Charts */}
                <div className="flex-1">
                  <div className="bg-white/5 rounded-lg shadow-glow p-6 h-full">
                    <h2 className="text-xl font-semibold text-primary mb-4">Spending by Category</h2>
                    <div className="h-[500px]">
                      <TransactionChart data={transactions} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'transactions' && (
              <div className="bg-white/5 rounded-lg shadow-glow p-6 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-primary">All Transactions</h2>
                  <Link
                    href="/transactions/new"
                    className="bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded-md transition shadow-glow-green"
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
                      <TransactionItem key={t.id} transaction={t} />
                    ))
                  )}
                </div>
              </div>
            )}

            {activeSection === 'analytics' && (
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 bg-white/5 rounded-lg shadow-glow p-6">
                  <h2 className="text-xl font-semibold text-primary mb-4">Spending Trends</h2>
                  <div className="h-[500px]">
                    <TransactionChart data={transactions} />
                  </div>
                </div>

                <div className="flex-1 bg-white/5 rounded-lg shadow-glow p-6">
                  <h2 className="text-xl font-semibold text-primary mb-4">Category Breakdown</h2>
                  <div className="space-y-4">
                    {Object.entries(
                      transactions.reduce((acc, t) => {
                        if (t.type === 'expense') {
                          acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
                        }
                        return acc;
                      }, {} as Record<string, number>)
                    )
                      .sort(([, a], [, b]) => b - a)
                      .map(([category, amount]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-text-secondary capitalize">{category}</span>
                          <span className="text-accent font-semibold">{formatCurrency(amount)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}