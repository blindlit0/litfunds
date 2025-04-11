'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

export default function ProfilePage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (!user) throw new Error('You must be logged in to update your profile');
      
      await updateProfile(user, {
        displayName: displayName.trim(),
      });
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating your profile');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-surface border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/home" className="text-xl font-bold text-primary">LitFunds</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-surface rounded-lg shadow-glow p-6">
            <h1 className="text-2xl font-bold text-primary mb-6">Profile Settings</h1>

            {error && (
              <div className="mb-4 p-4 bg-accent/10 border border-accent text-accent rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-secondary/10 border border-secondary text-secondary rounded-md">
                {success}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary">Email</label>
                <div className="mt-1 p-2 bg-surface-light rounded-md text-text">
                  {user?.email}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-text-secondary">
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 bg-surface-light border border-primary/30 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 disabled:opacity-50"
                  />
                </div>

                <div className="flex space-x-4">
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="bg-primary hover:bg-primary-dark text-background font-semibold py-2 px-4 rounded-md transition-all duration-300 shadow-glow"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleUpdateProfile}
                        className="bg-secondary hover:bg-secondary-dark text-background font-semibold py-2 px-4 rounded-md transition-all duration-300 shadow-glow-green"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setDisplayName(user?.displayName || '');
                        }}
                        className="bg-accent hover:bg-accent/90 text-background font-semibold py-2 px-4 rounded-md transition-all duration-300 shadow-glow"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 