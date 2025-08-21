"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
            Welkom, Student!
          </h1>
          <p style={{ fontSize: '18px', color: '#6b7280' }}>
            Hier kun je jouw werkbladen bekijken en invullen
          </p>
        </header>

        {/* Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                padding: '12px',
                borderRadius: '50%',
                backgroundColor: '#dbeafe'
              }}>
                <span style={{ fontSize: '20px' }}>📚</span>
              </div>
              <div style={{ marginLeft: '16px' }}>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: 0 }}>
                  Beschikbare Werkbladen
                </p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '4px 0 0 0' }}>
                  5
                </p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                padding: '12px',
                borderRadius: '50%',
                backgroundColor: '#dcfce7'
              }}>
                <span style={{ fontSize: '20px' }}>✅</span>
              </div>
              <div style={{ marginLeft: '16px' }}>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: 0 }}>
                  Ingeleverd
                </p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '4px 0 0 0' }}>
                  3
                </p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                padding: '12px',
                borderRadius: '50%',
                backgroundColor: '#fed7aa'
              }}>
                <span style={{ fontSize: '20px' }}>⏳</span>
              </div>
              <div style={{ marginLeft: '16px' }}>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: 0 }}>
                  Te Doen
                </p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '4px 0 0 0' }}>
                  2
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <a href="/student-submissions" style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            textDecoration: 'none',
            color: 'inherit',
            display: 'block',
            textAlign: 'center',
            transition: 'all 0.3s ease'
          }}>
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}>📋</span>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
              Mijn Inzendingen
            </h3>
          </a>

          <a href="#" style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            textDecoration: 'none',
            color: 'inherit',
            display: 'block',
            textAlign: 'center',
            transition: 'all 0.3s ease'
          }}>
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}>👤</span>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
              Mijn Profiel
            </h3>
          </a>

          <a href="#" style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            textDecoration: 'none',
            color: 'inherit',
            display: 'block',
            textAlign: 'center',
            transition: 'all 0.3s ease'
          }}>
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}>❓</span>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
              Help
            </h3>
          </a>
        </div>

        {/* Recent Activity */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          padding: '24px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
            Recente Activiteit
          </h2>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Nog geen activiteit om te tonen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}