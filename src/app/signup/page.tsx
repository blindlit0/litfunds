'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, {
        displayName: displayName
      });

      // Create user profile document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        displayName: displayName,
        currency: 'GHS'
      });

      router.push('/home');
    } catch (err) {
      console.error('Error signing up:', err);
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80 flex items-center justify-center">
      <div className="bg-white/5 rounded-lg shadow-glow p-8 w-full max-w-md backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-primary mb-6 text-center">Create Account</h1>
        
        {error && (
          <div className="bg-accent/10 border border-accent text-accent px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-text-secondary mb-2">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-white/5 border border-primary/20 rounded-md px-4 py-2 text-text-primary"
              required
            />
          </div>

          <div>
            <label className="block text-text-secondary mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-primary/20 rounded-md px-4 py-2 text-text-primary"
              required
            />
          </div>

          <div>
            <label className="block text-text-secondary mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-primary/20 rounded-md px-4 py-2 text-text-primary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary hover:bg-secondary-dark text-white py-2 rounded-md transition shadow-glow-green disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-center text-text-secondary">
          Already have an account?{' '}
          <Link href="/login" className="text-secondary hover:text-secondary-dark">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
} 