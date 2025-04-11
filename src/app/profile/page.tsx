'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Transaction } from '@/types/transaction';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';
import Link from 'next/link';

interface UserProfile {
  displayName: string;
  currency: 'GHS' | 'USD';
}

export default function ProfilePage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newCurrency, setNewCurrency] = useState<'GHS' | 'USD'>('GHS');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        // First, try to get the user's profile
        const profileRef = doc(db, 'users', user.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          // Profile exists, use the data
          const profileData = profileSnap.data() as UserProfile;
          setUserProfile(profileData);
          setNewDisplayName(profileData.displayName);
          setNewCurrency(profileData.currency);
        } else {
          // No profile exists, create one with default values
          const defaultProfile: UserProfile = {
            displayName: user.displayName || 'User',
            currency: 'GHS'
          };
          
          try {
            await setDoc(profileRef, defaultProfile);
            setUserProfile(defaultProfile);
            setNewDisplayName(defaultProfile.displayName);
            setNewCurrency(defaultProfile.currency);
          } catch (err) {
            console.error('Error creating profile:', err);
            setError('Failed to create profile. Please try again.');
            return;
          }
        }

        // Only fetch transactions if profile exists/was created
        try {
          const transactionsRef = collection(db, 'transactions');
          const q = query(transactionsRef, where('userId', '==', user.uid));
          const querySnapshot = await getDocs(q);
          
          const transactionsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date.toDate(),
          })) as Transaction[];
          
          setTransactions(transactionsData);
        } catch (err) {
          console.error('Error fetching transactions:', err);
          setError('Failed to load transactions. Please refresh the page.');
        }

      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSave = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user || !userProfile) {
      setError('You must be logged in to update your profile.');
      return;
    }

    try {
      const profileRef = doc(db, 'users', user.uid);
      const updatedProfile: UserProfile = {
        displayName: newDisplayName,
        currency: newCurrency
      };

      await setDoc(profileRef, updatedProfile, { merge: true });
      setUserProfile(updatedProfile);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    }
  };

  const formatCurrency = (amount: number) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: userProfile?.currency || 'GHS',
    });
    return formatter.format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80 flex items-center justify-center">
        <p className="text-text-primary">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80 flex items-center justify-center">
        <p className="text-accent">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link 
            href="/home"
            className="flex items-center text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
                clipRule="evenodd" 
              />
            </svg>
            Back to Home
          </Link>
        </div>
        <div className="bg-white/5 rounded-lg shadow-glow p-6 backdrop-blur-sm">
          <h1 className="text-2xl font-bold text-primary mb-6">Profile</h1>
          
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-text-secondary mb-2">Display Name</label>
                <input
                  type="text"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  className="w-full bg-white/5 border border-primary/20 rounded-md px-4 py-2 text-text-primary"
                />
              </div>
              <div>
                <label className="block text-text-secondary mb-2">Currency</label>
                <select
                  value={newCurrency}
                  onChange={(e) => setNewCurrency(e.target.value as 'GHS' | 'USD')}
                  className="w-full bg-white/5 border border-primary/20 rounded-md px-4 py-2 text-text-primary"
                >
                  <option value="GHS">Ghana Cedi (₵)</option>
                  <option value="USD">US Dollar ($)</option>
                </select>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-text-secondary hover:text-text-primary transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-secondary hover:bg-secondary-dark text-white rounded-md transition shadow-glow-green"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-primary mb-2">Account Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-text-secondary">Display Name</p>
                    <p className="text-text-primary text-lg">{userProfile?.displayName}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-text-secondary">Currency</p>
                    <p className="text-text-primary text-lg">
                      {userProfile?.currency === 'GHS' ? 'Ghana Cedi (₵)' : 'US Dollar ($)'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-primary mb-4">Transaction Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-text-secondary">Total Transactions</p>
                    <p className="text-text-primary text-lg">{transactions.length}</p>
                  </div>
                  <div className="bg-secondary/10 p-4 rounded-lg">
                    <p className="text-text-secondary">Total Income</p>
                    <p className="text-secondary text-lg">
                      {formatCurrency(transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0))}
                    </p>
                  </div>
                  <div className="bg-accent/10 p-4 rounded-lg">
                    <p className="text-text-secondary">Total Expenses</p>
                    <p className="text-accent text-lg">
                      {formatCurrency(transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0))}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-secondary hover:bg-secondary-dark text-white rounded-md transition shadow-glow-green"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 