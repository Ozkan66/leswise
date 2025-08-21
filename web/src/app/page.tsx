"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../utils/supabaseClient';
import { Worksheet } from '../types/database';


export default function TeacherHomepage() {
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [profile, setProfile] = useState<{ first_name: string | null, last_name: string | null } | null>(null);
  const [stats, setStats] = useState({
    worksheets: 0,
    folders: 0,
    groups: 0,
    submissions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Fetch user profile
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError.message);
        } else {
          setProfile(userProfile);
        }
        
        // Fetch recent worksheets for the list
        const { data: recentWorksheets, error: worksheetsError } = await supabase
          .from('worksheets')
          .select('id, title, description')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })
          .limit(2);

        if (worksheetsError) {
          console.error('Error fetching worksheets:', worksheetsError.message);
          setWorksheets([]);
        } else if (recentWorksheets) {
          setWorksheets(recentWorksheets as Worksheet[]);
        }

        // Fetch all worksheet IDs owned by the user for submission count
        const { data: ownedWorksheets } = await supabase
          .from('worksheets')
          .select('id')
          .eq('owner_id', user.id);
        const worksheetIdsOwnedByUser = ownedWorksheets?.map(w => w.id) || [];

        // Fetch all stats in parallel
        const [
          worksheetsCount,
          foldersCount,
          groupsCount,
          submissionsCount,
        ] = await Promise.all([
          supabase.from('worksheets').select('id', { count: 'exact', head: true }).eq('owner_id', user.id),
          supabase.from('folders').select('id', { count: 'exact', head: true }).eq('owner_id', user.id),
          supabase.from('group_members').select('group_id', { count: 'exact', head: true }).eq('user_id', user.id),
          worksheetIdsOwnedByUser.length > 0
            ? supabase.from('submissions').select('id', { count: 'exact', head: true }).in('worksheet_id', worksheetIdsOwnedByUser)
            : Promise.resolve({ count: 0, error: null })
        ]);

        setStats({
          worksheets: worksheetsCount.count ?? 0,
          folders: foldersCount.count ?? 0,
          groups: groupsCount.count ?? 0,
          submissions: submissionsCount.count ?? 0,
        });

      } else {
        setWorksheets([]);
        setStats({ worksheets: 0, folders: 0, groups: 0, submissions: 0 });
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Fixed Sidebar */}
      <div className="plantyn-sidebar w-64 shadow-lg">
      
        {/* User Info */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-lg font-semibold text-white m-0">
            Welkom! {loading ? '...' : (profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Gebruiker')}
          </h2>
          <p className="text-sm text-gray-300 mt-1 hidden">
            Plantyn Salesforce NL Institute SE
          </p>
        </div>
        
        {/* Navigation */}
        <div className="p-6 px-3">
          <div className="mb-2">
            <Link href="/" className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md no-underline text-sm font-medium mb-1">
              <span className="mr-3">🏠</span>
              Home
            </Link>
            <Link href="/groups" className="flex items-center px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md no-underline text-sm font-medium mb-1">
              <span className="mr-3">👥</span>
              Mijn klassen
            </Link>
            <Link href="/folders" className="flex items-center px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md no-underline text-sm font-medium mb-1">
              <span className="mr-3">📚</span>
              Mappen Beheren
            </Link>
            <Link href="/worksheets" className="flex items-center px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md no-underline text-sm font-medium mb-1">
              <span className="mr-3">📝</span>
              Mijn werkbladen
            </Link>
            <Link href="/shared-worksheets" className="flex items-center px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md no-underline text-sm font-medium mb-1">
              <span className="mr-3">🔗</span>
              Gedeelde werkbladen
            </Link>
            <Link href="/teacher-submissions" className="flex items-center px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md no-underline text-sm font-medium mb-1">
              <span className="mr-3">📩</span>
              Inzendingen
            </Link>
          </div>
          
          <div className="border-t border-gray-600 pt-6 mt-8">
            <Link href="/profile" className="flex items-center px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md no-underline text-sm font-medium mb-1">
              <span className="mr-3">👤</span>
              Mijn profiel
            </Link>
            <a href="#" className="flex items-center px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md no-underline text-sm font-medium mb-1">
              <span className="mr-3">❓</span>
              Help
            </a>
            <a href="#" className="flex items-center px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md no-underline text-sm font-medium">
              <span className="mr-3">🚪</span>
              Uitloggen
            </a>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="ml-64 flex-1">
        {/* Top Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-6 px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white m-0">
                Welkom terug, {loading ? '...' : (profile?.first_name || 'Gebruiker')}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1 m-0">
                Hier is een overzicht van je werkbladen en klassen
              </p>
            </div>
            <div className="flex gap-3">
              <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg border-none text-sm font-medium cursor-pointer flex items-center">
                <span className="mr-2">🔍</span>
                Zoeken
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg border-none text-sm font-medium cursor-pointer flex items-center">
                <span className="mr-2">➕</span>
                Nieuw werkblad
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link href="/worksheets" className="no-underline">
              <div className="plantyn-card p-6 cursor-pointer transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-teal-100 dark:bg-teal-900">
                    <span className="text-xl">📝</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 m-0">
                      Werkbladen
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 m-0">
                      {loading ? '...' : stats.worksheets}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
            
            <Link href="/folders" className="no-underline">
              <div className="plantyn-card p-6 cursor-pointer transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
                    <span className="text-xl">📁</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 m-0">
                      Mappen
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 m-0">
                      {loading ? '...' : stats.folders}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
            
            <Link href="/groups" className="no-underline">
              <div className="plantyn-card p-6 cursor-pointer transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                    <span className="text-xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 m-0">
                      Klassen
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 m-0">
                      {loading ? '...' : stats.groups}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
            
            <Link href="/teacher-submissions" className="no-underline">
              <div className="plantyn-card p-6 cursor-pointer transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                    <span className="text-xl">📩</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 m-0">
                      Inzendingen
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 m-0">
                      {loading ? '...' : stats.submissions}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Snel naar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/worksheets" className="no-underline">
                <button className="plantyn-card p-6 cursor-pointer text-center w-full h-full border-none">
                  <span className="text-2xl block mb-3">📝</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Werkbladen</span>
                </button>
              </Link>
              <button className="plantyn-card p-6 cursor-pointer text-center w-full h-full border-none">
                <span className="text-2xl block mb-3">🤖</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Hulpmiddelen</span>
              </button>
            </div>
          </div>

          {/* Worksheets Section */}
          <div className="plantyn-card">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white m-0">
                  Werkbladen
                </h2>
                <div className="flex items-center gap-4">
                  <Link href="/worksheets" className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-none border-none cursor-pointer no-underline">
                    Alles bekijken
                  </Link>
                </div>
              </div>
            </div>
            <div className="p-6">
              {loading ? (
                <p className="text-gray-600 dark:text-gray-400">Werkbladen laden...</p>
              ) : worksheets.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {worksheets.map((worksheet) => (
                    <div key={worksheet.id} className="flex justify-between items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white m-0">{worksheet.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1 m-0 text-sm">{worksheet.description || 'Geen beschrijving'}</p>
                      </div>
                      <Link href={`/worksheets/${worksheet.id}/edit`} passHref>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md border-none text-sm font-medium cursor-pointer">
                          Openen
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Je hebt nog geen werkbladen aangemaakt.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}