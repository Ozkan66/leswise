"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../utils/supabaseClient';
import { Worksheet } from '../types/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { FileText, Folder, Users, Inbox } from 'lucide-react';

export default function TeacherDashboard() {
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
          console.error('Error fetching profile:', profileError);
          // Continue with null profile - don't block the rest of the dashboard
        } else {
          setProfile(userProfile);
        }

        // Fetch recent worksheets
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

        // Fetch stats
        const { data: ownedWorksheets } = await supabase
          .from('worksheets')
          .select('id')
          .eq('owner_id', user.id);
        const worksheetIdsOwnedByUser = ownedWorksheets?.map(w => w.id) || [];

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

  const statsCards = [
    { icon: FileText, label: "Werkbladen", value: stats.worksheets, href: "/worksheets", color: "text-teal-600" },
    { icon: Folder, label: "Mappen", value: stats.folders, href: "/folders", color: "text-orange-600" },
    { icon: Users, label: "Klassen", value: stats.groups, href: "/groups", color: "text-blue-600" },
    { icon: Inbox, label: "Inzendingen", value: stats.submissions, href: "/teacher-submissions", color: "text-green-600" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-card border-b border-border px-8 py-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Welkom terug, {loading ? '...' : (profile?.first_name || 'Gebruik er')}
          </h1>
          <p className="text-muted-foreground mt-1">
            Hier is een overzicht van je werkbladen en klassen
          </p>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.href} href={stat.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {loading ? '...' : stat.value}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Recent Worksheets */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recente Werkbladen</CardTitle>
                <CardDescription>Je meest recente werkbladen</CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link href="/worksheets">Alles bekijken</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Werkbladen laden...</p>
            ) : worksheets.length > 0 ? (
              <div className="space-y-4">
                {worksheets.map((worksheet) => (
                  <div
                    key={worksheet.id}
                    className="flex justify-between items-center p-4 border border-border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {worksheet.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {worksheet.description || 'Geen beschrijving'}
                      </p>
                    </div>
                    <Button asChild>
                      <Link href={`/worksheets/${worksheet.id}/edit`}>
                        Openen
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Je hebt nog geen werkbladen aangemaakt.
                </p>
                <Button asChild>
                  <Link href="/worksheets">Maak je eerste werkblad</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
