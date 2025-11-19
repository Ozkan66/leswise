"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import AuthenticatedLayout from '../../components/AuthenticatedLayout';

export default function StudentDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect unauthenticated users to login
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-10">
        <div className="max-w-6xl mx-auto">
          <header className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welkom, Student!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Hier kun je jouw werkbladen bekijken en invullen
            </p>
          </header>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                  <span className="text-2xl">📚</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Beschikbare Werkbladen
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    5
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Ingeleverd
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    3
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
                  <span className="text-2xl">⏳</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Te Doen
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    2
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-5">
              Recente Activiteit
            </h2>
            <div className="text-center py-10">
              <p className="text-gray-600 dark:text-gray-400">
                Nog geen activiteit om te tonen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}