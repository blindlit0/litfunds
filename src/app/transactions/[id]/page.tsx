'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import Link from 'next/link';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: Date;
}

export default function TransactionPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    type: 'expense',
    date: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, 'transactions', params.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const transactionData = {
            id: docSnap.id,
            ...data,
            date: data.date.toDate(),
          } as Transaction;

          setTransaction(transactionData);
          setFormData({
            amount: Math.abs(transactionData.amount).toString(),
            description: transactionData.description,
            category: transactionData.category,
            type: transactionData.type,
            date: format(transactionData.date, 'yyyy-MM-dd'),
          });
        } else {
          setError('Transaction not found');
        }
      } catch (error) {
        console.error('Error fetching transaction:', error);
        setError('Failed to fetch transaction');
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [user, params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !transaction) return;

    try {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid amount');
        return;
      }

      const transactionRef = doc(db, 'transactions', transaction.id);
      await updateDoc(transactionRef, {
        amount: formData.type === 'expense' ? -amount : amount,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        date: new Date(formData.date),
      });

      router.push('/home');
    } catch (error) {
      console.error('Error updating transaction:', error);
      setError('Failed to update transaction');
    }
  };

  const handleDelete = async () => {
    if (!user || !transaction) return;

    try {
      const transactionRef = doc(db, 'transactions', transaction.id);
      await deleteDoc(transactionRef);
      router.push('/home');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setError('Failed to delete transaction');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-accent">{error}</div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-accent">Transaction not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-surface border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/home" className="text-text-secondary hover:text-primary transition-colors duration-300">
                Home
              </Link>
              <h1 className="text-xl font-bold text-primary">
                {isEditing ? 'Edit Transaction' : 'Transaction Details'}
              </h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="space-y-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-text-secondary">
                  Type
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                  className="mt-1 block w-full rounded-md border-primary/20 bg-surface text-text-primary shadow-sm focus:border-primary focus:ring-primary"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-text-secondary">
                  Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="mt-1 block w-full rounded-md border-primary/20 bg-surface text-text-primary shadow-sm focus:border-primary focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-text-secondary">
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-primary/20 bg-surface text-text-primary shadow-sm focus:border-primary focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-text-secondary">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 block w-full rounded-md border-primary/20 bg-surface text-text-primary shadow-sm focus:border-primary focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-text-secondary">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-primary/20 bg-surface text-text-primary shadow-sm focus:border-primary focus:ring-primary"
                  required
                />
              </div>

              {error && <div className="text-accent">{error}</div>}

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors duration-300"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-surface-light text-text-secondary rounded-md hover:bg-surface transition-colors duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="max-w-md mx-auto">
            <div className="bg-surface rounded-lg shadow-glow p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-primary">Transaction Details</h2>
                <p className="text-text-secondary">{format(transaction.date, 'MMMM d, yyyy')}</p>
              </div>

              <div>
                <p className="text-text-secondary">Type</p>
                <p className="text-text-primary capitalize">{transaction.type}</p>
              </div>

              <div>
                <p className="text-text-secondary">Amount</p>
                <p className={`text-2xl font-bold ${transaction.type === 'income' ? 'text-secondary' : 'text-accent'}`}>
                  {transaction.type === 'income' ? '+' : '-'}₵{Math.abs(transaction.amount).toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-text-secondary">Description</p>
                <p className="text-text-primary">{transaction.description}</p>
              </div>

              <div>
                <p className="text-text-secondary">Category</p>
                <p className="text-text-primary capitalize">{transaction.category}</p>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors duration-300"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 