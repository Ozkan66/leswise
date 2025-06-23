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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Fixed Sidebar */}
      <div style={{ 
        width: '256px', 
        backgroundColor: 'white', 
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', 
        position: 'fixed', 
        height: '100vh', 
        left: 0, 
        top: 0,
        zIndex: 10
      }}>
        {/* User Info */}
        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
            Welkom! {loading ? '...' : (profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Gebruiker')}
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0', display: 'none' }}>
            Plantyn Salesforce NL Institute SE
          </p>
        </div>
        
        {/* Navigation */}
        <div style={{ padding: '24px 12px' }}>
          <div style={{ marginBottom: '8px' }}>
            <Link href="/" style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              backgroundColor: '#2563eb',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '4px'
            }}>
              <span style={{ marginRight: '12px' }}>🏠</span>
              Home
            </Link>
            <Link href="/groups" style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              color: '#374151',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '4px'
            }}>
              <span style={{ marginRight: '12px' }}>👥</span>
              Mijn klassen
            </Link>
            <Link href="/folders" style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              color: '#374151',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '4px'
            }}>
              <span style={{ marginRight: '12px' }}>📚</span>
              Mappen Beheren
            </Link>
            <Link href="/worksheets" style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              color: '#374151',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '4px'
            }}>
              <span style={{ marginRight: '12px' }}>📝</span>
              Mijn werkbladen
            </Link>
            <Link href="/shared-worksheets" style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              color: '#374151',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '4px'
            }}>
              <span style={{ marginRight: '12px' }}>🔗</span>
              Gedeelde werkbladen
            </Link>
            <Link href="/teacher-submissions" style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              color: '#374151',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '4px'
            }}>
              <span style={{ marginRight: '12px' }}>📩</span>
              Inzendingen
            </Link>
          </div>
          
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px', marginTop: '32px' }}>
            <Link href="/profile" style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              color: '#374151',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '4px'
            }}>
              <span style={{ marginRight: '12px' }}>👤</span>
              Mijn profiel
            </Link>
            <a href="#" style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              color: '#374151',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '4px'
            }}>
              <span style={{ marginRight: '12px' }}>❓</span>
              Help
            </a>
            <a href="#" style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              color: '#374151',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              <span style={{ marginRight: '12px' }}>🚪</span>
              Uitloggen
            </a>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ marginLeft: '256px', flex: 1 }}>
        {/* Top Header */}
        <div style={{ 
          backgroundColor: 'white', 
          borderBottom: '1px solid #e5e7eb',
          padding: '24px 32px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', margin: 0 }}>
                Welkom terug, {loading ? '...' : (profile?.first_name || 'Gebruiker')}
              </h1>
              <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>
                Hier is een overzicht van je werkbladen en klassen
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{
                backgroundColor: '#4b5563',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ marginRight: '8px' }}>🔍</span>
                Zoeken
              </button>
              <button style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ marginRight: '8px' }}>➕</span>
                Nieuw werkblad
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div style={{ padding: '32px' }}>
          {/* Stats Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '24px', 
            marginBottom: '32px' 
          }}>
            <Link href="/worksheets" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                cursor: 'pointer'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    padding: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#ccfbf1'
                  }}>
                    <span style={{ fontSize: '20px' }}>📝</span>
                  </div>
                  <div style={{ marginLeft: '16px' }}>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: 0 }}>
                      Werkbladen
                    </p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '4px 0 0 0' }}>
                      {loading ? '...' : stats.worksheets}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
            
            <Link href="/folders" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                cursor: 'pointer'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    padding: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#fed7aa'
                  }}>
                    <span style={{ fontSize: '20px' }}>📁</span>
                  </div>
                  <div style={{ marginLeft: '16px' }}>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: 0 }}>
                      Mappen
                    </p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '4px 0 0 0' }}>
                      {loading ? '...' : stats.folders}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
            
            <Link href="/groups" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                cursor: 'pointer'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    padding: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#dbeafe'
                  }}>
                    <span style={{ fontSize: '20px' }}>👥</span>
                  </div>
                  <div style={{ marginLeft: '16px' }}>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: 0 }}>
                      Klassen
                    </p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '4px 0 0 0' }}>
                      {loading ? '...' : stats.groups}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
            
            <Link href="/teacher-submissions" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                cursor: 'pointer'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    padding: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#dcfce7'
                  }}>
                    <span style={{ fontSize: '20px' }}>📩</span>
                  </div>
                  <div style={{ marginLeft: '16px' }}>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: 0 }}>
                      Inzendingen
                    </p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '4px 0 0 0' }}>
                      {loading ? '...' : stats.submissions}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Actions */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              Snel naar
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px' 
            }}>
              <Link href="/worksheets" style={{ textDecoration: 'none' }}>
                <button style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  width: '100%',
                  height: '100%'
                }}>
                  <span style={{ fontSize: '24px', display: 'block', marginBottom: '12px' }}>📝</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Werkbladen</span>
                </button>
              </Link>
              <button style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                cursor: 'pointer',
                textAlign: 'center',
                width: '100%',
                height: '100%'
              }}>
                <span style={{ fontSize: '24px', display: 'block', marginBottom: '12px' }}>🤖</span>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>AI Hulpmiddelen</span>
              </button>
            </div>
          </div>

          {/* Worksheets Section */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0 }}>
                  Werkbladen
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <Link href="/worksheets" style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'none'
                  }}>
                    Alles bekijken
                  </Link>
                </div>
              </div>
            </div>
            <div style={{ padding: '24px' }}>
              {loading ? (
                <p>Werkbladen laden...</p>
              ) : worksheets.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {worksheets.map((worksheet) => (
                    <div key={worksheet.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                      <div>
                        <h3 style={{ fontWeight: '600', color: '#111827', margin: 0 }}>{worksheet.title}</h3>
                        <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '14px' }}>{worksheet.description || 'Geen beschrijving'}</p>
                      </div>
                      <Link href={`/worksheets/${worksheet.id}/edit`} passHref>
                        <button style={{
                          backgroundColor: '#2563eb',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}>
                          Openen
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px' }}>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>Je hebt nog geen werkbladen aangemaakt.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}