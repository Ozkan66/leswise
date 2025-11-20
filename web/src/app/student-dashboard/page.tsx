"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import AuthenticatedLayout from '../../components/AuthenticatedLayout';
import { supabase } from '../../utils/supabaseClient';
import { Worksheet, Submission } from '../../types/database';

export default function StudentDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    available: 0,
    submitted: 0,
    todo: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        // 1. Get user's groups
        const { data: userGroups } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('user_id', user.id)
          .eq('status', 'active');

        const groupIds = userGroups?.map(g => g.group_id) || [];

        // 2. Fetch assigned worksheets (direct shares OR group shares)
        const { data: sharedData, error: sharedError } = await supabase
          .from('worksheet_shares')
          .select('worksheet_id')
          .or(`shared_with_user_id.eq.${user.id},shared_with_group_id.in.(${groupIds.join(',')})`);

        if (sharedError) throw sharedError;

        const assignedIds = sharedData?.map(s => s.worksheet_id) || [];

        // 3. Fetch submissions
        const { data: submissionsData, error: subError } = await supabase
          .from('submissions')
          .select('*, worksheets(title)')
          .eq('user_id', user.id)
          .order('submitted_at', { ascending: false })
          .limit(5);

        if (subError) throw subError;

        const submittedCount = submissionsData?.length || 0;
        // Note: This is a simple count of all submissions. 
        // Ideally we should count unique worksheets submitted vs total assigned.
        // For now, let's count unique worksheets submitted.
        const uniqueSubmittedWorksheetIds = new Set(submissionsData?.map(s => s.worksheet_id));
        const todoCount = Math.max(0, assignedIds.length - uniqueSubmittedWorksheetIds.size);

        setStats({
          available: assignedIds.length,
          submitted: uniqueSubmittedWorksheetIds.size,
          todo: todoCount
        });

        setRecentActivity(submissionsData || []);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading || isLoadingData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-10">
        <div className="max-w-6xl mx-auto">
          <header className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welkom, {user.user_metadata?.first_name || 'Student'}!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Hier kun je jouw werkbladen bekijken en invullen
            </p>
          </header>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Link href="/student-submissions" className="block group">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-transform group-hover:scale-105 shadow-sm hover:shadow-md">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                    <span className="text-2xl">📚</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Beschikbare Werkbladen
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {stats.available}
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/student-submissions" className="block group">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-transform group-hover:scale-105 shadow-sm hover:shadow-md">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Ingeleverd
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {stats.submitted}
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/student-submissions" className="block group">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-transform group-hover:scale-105 shadow-sm hover:shadow-md">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
                    <span className="text-2xl">⏳</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Te Doen
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {stats.todo}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-5">
              Recente Activiteit
            </h2>

            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {activity.worksheets?.title || 'Werkblad'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Ingediend op {new Date(activity.submitted_at).toLocaleDateString('nl-NL')}
                      </p>
                    </div>
                    <Link
                      href={`/worksheet-submission?worksheetId=${activity.worksheet_id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                    >
                      Bekijk
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-600 dark:text-gray-400">
                  Nog geen activiteit om te tonen.
                </p>
                <Link
                  href="/student-submissions"
                  className="inline-block mt-4 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Ga naar mijn werkbladen
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}