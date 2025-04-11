'use client';

import { useAuth } from '@/contexts/AuthContext';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const { user, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/home');
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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-pulse-slow rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="bg-surface rounded-lg shadow-glow p-6 max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold text-accent mb-4">Error</h2>
          <p className="text-text">{error.message}</p>
          <p className="text-sm text-text-secondary mt-4">
            Please check your Firebase configuration and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {user ? (
          <div className="bg-surface rounded-lg shadow-glow p-6 max-w-md mx-auto">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4 text-primary">Welcome back, {user.email}</h1>
              <p className="text-text-secondary mb-6">Ready to track your expenses?</p>
              <button
                onClick={handleLogout}
                className="bg-accent hover:bg-accent/90 text-white font-semibold py-2 px-4 rounded-md transition-all duration-300 shadow-glow"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-surface rounded-lg shadow-glow p-6 max-w-md mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8 text-primary">LitFunds</h1>
            {authError && (
              <div className="mb-4 p-4 bg-accent/10 border border-accent text-accent rounded-md">
                {authError}
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-light border border-primary/30 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-light border border-primary/30 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-background font-semibold py-2 px-4 rounded-md transition-all duration-300 shadow-glow"
              >
                Sign In
              </button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-text-secondary">
                Don't have an account?{' '}
                <Link href="/signup" className="text-secondary hover:text-secondary-dark transition-colors duration-300">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        )}
    </div>
    </main>
  );
}
