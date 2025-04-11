'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function NewTransactionPage() {
  const router = useRouter();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
        return;
      }

      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        type,
        amount: parseFloat(amount),
        description,
        category: category.toLowerCase(),
        date: new Date(date)
      });

      router.push('/home');
    } catch (err) {
      console.error('Error creating transaction:', err);
      setError('Failed to create transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-surface border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary">Add Transaction</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-surface rounded-lg shadow-glow p-6">
            {error && (
              <div className="mb-4 p-4 bg-accent/10 border border-accent text-accent rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-text-secondary">
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as 'income' | 'expense')}
                  className="mt-1 block w-full px-3 py-2 bg-surface-light border border-primary/30 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                  disabled={loading}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-text-secondary">
                  Amount
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-text-secondary sm:text-sm">₵</span>
                  </div>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.01"
                    min="0"
                    className="block w-full pl-7 pr-12 rounded-md bg-surface-light border border-primary/30 text-text focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                    placeholder="0.00"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-text-secondary">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-surface-light border border-primary/30 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                  placeholder="What was this for?"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-text-secondary">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-surface-light border border-primary/30 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                  disabled={loading}
                >
                  <option value="food">Food & Dining</option>
                  <option value="transportation">Transportation</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="utilities">Utilities</option>
                  <option value="shopping">Shopping</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-text-secondary">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-surface-light border border-primary/30 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                  disabled={loading}
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => router.push('/home')}
                  className="flex-1 bg-accent hover:bg-accent/90 text-background font-semibold py-2 px-4 rounded-md transition-all duration-300 shadow-glow"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-secondary hover:bg-secondary-dark text-background font-semibold py-2 px-4 rounded-md transition-all duration-300 shadow-glow-green disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
} 