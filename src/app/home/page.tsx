'use client';

import { useAuth } from '@/contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

export default function HomePage() {
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-surface border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary">LitFunds</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/profile"
                className="text-text-secondary hover:text-primary transition-colors duration-300"
              >
                Profile
              </Link>
              <span className="text-text-secondary">{user?.email}</span>
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
                <span className="text-secondary font-semibold">₵0.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Total Expenses</span>
                <span className="text-accent font-semibold">₵0.00</span>
              </div>
              <div className="flex justify-between items-center border-t border-primary/20 pt-4">
                <span className="text-text-secondary">Balance</span>
                <span className="text-primary font-semibold">₵0.00</span>
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
              <p className="text-text-secondary text-center">No transactions yet</p>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-surface rounded-lg shadow-glow p-6">
            <h2 className="text-xl font-semibold text-primary mb-4">Categories</h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Food & Dining</span>
                <span className="text-accent">₵0.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Transportation</span>
                <span className="text-accent">₵0.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Entertainment</span>
                <span className="text-accent">₵0.00</span>
              </div>
            </div>
          </div>

          {/* Budget Overview */}
          <div className="bg-surface rounded-lg shadow-glow p-6 md:col-span-2">
            <h2 className="text-xl font-semibold text-primary mb-4">Budget Overview</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-text-secondary">Food & Dining</span>
                  <span className="text-text-secondary">₵0 / ₵500</span>
                </div>
                <div className="w-full bg-surface-light rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: '0%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-text-secondary">Transportation</span>
                  <span className="text-text-secondary">₵0 / ₵300</span>
                </div>
                <div className="w-full bg-surface-light rounded-full h-2">
                  <div className="bg-secondary h-2 rounded-full transition-all duration-300" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 