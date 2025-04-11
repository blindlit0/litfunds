'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';
import Link from 'next/link';

interface UserProfile {
  displayName: string;
  email: string;
  currency: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  date: Date;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    currency: 'GHS',
  });
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    transactionCount: 0,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setProfile(data);
          setFormData({
            displayName: data.displayName || '',
            currency: data.currency || 'GHS',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    const fetchStats = async () => {
      if (!user) return;

      try {
        const transactionsRef = collection(db, 'transactions');
        const q = query(transactionsRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);

        const transactions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate(),
        })) as Transaction[];

        const totalIncome = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        setStats({
          totalIncome,
          totalExpenses,
          balance: totalIncome - totalExpenses,
          transactionCount: transactions.length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchProfile();
    fetchStats();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: formData.displayName,
        currency: formData.currency,
      });

      setProfile({
        ...profile!,
        displayName: formData.displayName,
        currency: formData.currency,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    }
  };

  const formatCurrency = (amount: number) => {
    const currencySymbol = formData.currency === 'GHS' ? '₵' : '$';
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: formData.currency,
    }).format(Math.abs(amount)).replace(formData.currency, currencySymbol);
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

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-surface border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/home" className="text-text-secondary hover:text-primary transition-colors duration-300">
                Home
              </Link>
              <h1 className="text-xl font-bold text-primary">Profile</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Section */}
          <div className="bg-surface rounded-lg shadow-glow p-6">
            <h2 className="text-xl font-semibold text-primary mb-4">Profile Information</h2>
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-text-secondary">
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="mt-1 block w-full rounded-md border-primary/20 bg-surface text-text-primary shadow-sm focus:border-primary focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-text-secondary">
                    Currency
                  </label>
                  <select
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="mt-1 block w-full rounded-md border-primary/20 bg-surface text-text-primary shadow-sm focus:border-primary focus:ring-primary"
                  >
                    <option value="GHS">Ghana Cedi (₵)</option>
                    <option value="USD">US Dollar ($)</option>
                  </select>
                </div>

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
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-text-secondary">Display Name</p>
                  <p className="text-text-primary">{profile?.displayName || 'Not set'}</p>
                </div>

                <div>
                  <p className="text-text-secondary">Email</p>
                  <p className="text-text-primary">{profile?.email}</p>
                </div>

                <div>
                  <p className="text-text-secondary">Currency</p>
                  <p className="text-text-primary">
                    {formData.currency === 'GHS' ? 'Ghana Cedi (₵)' : 'US Dollar ($)'}
                  </p>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors duration-300"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>

          {/* Stats Section */}
          <div className="bg-surface rounded-lg shadow-glow p-6">
            <h2 className="text-xl font-semibold text-primary mb-4">Transaction Statistics</h2>
            <div className="space-y-4">
              <div>
                <p className="text-text-secondary">Total Transactions</p>
                <p className="text-2xl font-bold text-primary">{stats.transactionCount}</p>
              </div>

              <div>
                <p className="text-text-secondary">Total Income</p>
                <p className="text-2xl font-bold text-secondary">{formatCurrency(stats.totalIncome)}</p>
              </div>

              <div>
                <p className="text-text-secondary">Total Expenses</p>
                <p className="text-2xl font-bold text-accent">{formatCurrency(stats.totalExpenses)}</p>
              </div>

              <div>
                <p className="text-text-secondary">Current Balance</p>
                <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-secondary' : 'text-accent'}`}>
                  {stats.balance >= 0 ? '+' : ''}{formatCurrency(stats.balance)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 