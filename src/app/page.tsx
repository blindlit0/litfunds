'use client';

import { useAuth } from '@/contexts/AuthContext';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useState } from 'react';

export default function Home() {
  const { user, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setAuthError('Invalid email or password');
      console.error('Error signing in:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
  return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-gray-300">{error.message}</p>
          <p className="text-sm text-gray-400 mt-4">
            Please check your Firebase configuration and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {user ? (
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-md mx-auto">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4 text-indigo-400">Welcome back, {user.email}</h1>
              <p className="text-gray-400 mb-6">Ready to track your expenses?</p>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-md mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8 text-indigo-400">Expense Tracker</h1>
            {authError && (
              <div className="mb-4 p-4 bg-red-900 text-red-100 rounded-md">
                {authError}
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
              >
                Sign In
              </button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Don't have an account?{' '}
                <a href="#" className="text-indigo-400 hover:text-indigo-300">
                  Sign up
                </a>
              </p>
            </div>
          </div>
        )}
    </div>
    </main>
  );
}
