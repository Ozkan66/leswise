"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../utils/supabaseClient';
import { Worksheet } from '../../types/database';
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function TeacherHomepage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [profile, setProfile] = useState<{ first_name: string | null, last_name: string | null } | null>(null);
  const [stats, setStats] = useState({
    worksheets: 0,
    folders: 0,
    groups: 0,
    submissions: 0,
  });
  const [loadingData, setLoading] = useState(true);

  // Redirect niet-ingelogde gebruikers naar login
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

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
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loadingData) return <p>Loading...</p>;

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Welkom terug{profile?.first_name ? `, ${profile.first_name}` : ''}!</h1>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Jouw statistieken</h2>
        <ul className="grid grid-cols-2 gap-4">
          <li className="bg-blue-50 rounded p-4">Werkbladen: <b>{stats.worksheets}</b></li>
          <li className="bg-blue-50 rounded p-4">Mappen: <b>{stats.folders}</b></li>
          <li className="bg-blue-50 rounded p-4">Groepen: <b>{stats.groups}</b></li>
          <li className="bg-blue-50 rounded p-4">Inzendingen: <b>{stats.submissions}</b></li>
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Recente werkbladen</h2>
        {worksheets.length === 0 ? (
          <p>Je hebt nog geen werkbladen aangemaakt.</p>
        ) : (
          <ul>
            {worksheets.map(ws => (
              <li key={ws.id} className="mb-2">
                <Link href={`/worksheet/${ws.id}`}>{ws.title}</Link>
                <span className="text-gray-500 ml-2">{ws.description}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
