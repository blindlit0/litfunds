'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export default function NewTransactionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: 'food',
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!user) {
        throw new Error('You must be logged in to add a transaction');
      }

      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      const transactionData = {
        amount: formData.type === 'expense' ? -amount : amount,
        description: formData.description.trim(),
        category: formData.category,
        type: formData.type,
        date: new Date(formData.date),
        userId: user.uid,
        createdAt: serverTimestamp(),
      };

      const transactionsRef = collection(db, 'transactions');
      await addDoc(transactionsRef, transactionData);
      
      // Only redirect after successful save
      router.push('/home');
    } catch (err) {
      console.error('Error saving transaction:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while saving the transaction');
      setIsSubmitting(false);
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
                  value={formData.type}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-surface-light border border-primary/30 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                  disabled={isSubmitting}
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
                    value={formData.amount}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="block w-full pl-7 pr-12 rounded-md bg-surface-light border border-primary/30 text-text focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                    placeholder="0.00"
                    disabled={isSubmitting}
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
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-surface-light border border-primary/30 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                  placeholder="What was this for?"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-text-secondary">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-surface-light border border-primary/30 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                  disabled={isSubmitting}
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
                  value={formData.date}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-surface-light border border-primary/30 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => router.push('/home')}
                  className="flex-1 bg-accent hover:bg-accent/90 text-background font-semibold py-2 px-4 rounded-md transition-all duration-300 shadow-glow"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-secondary hover:bg-secondary-dark text-background font-semibold py-2 px-4 rounded-md transition-all duration-300 shadow-glow-green disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : 'Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
} 