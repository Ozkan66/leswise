"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import TeacherDashboard from '../../components/TeacherDashboard';
import PageLayout from '../../components/PageLayout';

export default function DashboardPage() {
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
      <PageLayout showHeader={false}>
        <div className="flex justify-center items-center min-h-96">
          <div className="text-lg text-gray-600 dark:text-gray-400">Loading...</div>
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  // For now, show teacher dashboard for all users
  // In the future, you could implement role-based routing here
  return <TeacherDashboard />;
}