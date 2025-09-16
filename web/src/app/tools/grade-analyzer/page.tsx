"use client";

import Link from 'next/link';

export default function GradeAnalyzerPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '32px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <Link href="/tools" style={{
              color: '#6b7280',
              textDecoration: 'none',
              fontSize: '14px',
              marginRight: '8px'
            }}>
              ← Terug naar Tools
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{
              fontSize: '48px',
              marginRight: '24px',
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderRadius: '12px'
            }}>
              📊
            </div>
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#111827',
                margin: '0 0 8px 0'
              }}>
                Cijfer Analyzer
              </h1>
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                margin: 0
              }}>
                Analyseer prestaties en genereer rapporten voor individuele leerlingen
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '48px 32px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Available Notice */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '48px',
            border: '1px solid #e5e7eb',
            textAlign: 'center',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
          }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '24px'
            }}>
              📈
            </div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#111827',
              margin: '0 0 16px 0'
            }}>
              Cijfer Analyzer beschikbaar!
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: '0 0 32px 0',
              lineHeight: '1.6'
            }}>
              Deze tool helpt je om inzicht te krijgen in de prestaties van je leerlingen:
            </p>
            
            <div style={{ textAlign: 'left', marginBottom: '32px' }}>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '12px',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  <span style={{ marginRight: '12px', color: '#10b981' }}>✓</span>
                  Gedetailleerde prestatie analyses per leerling
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '12px',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  <span style={{ marginRight: '12px', color: '#10b981' }}>✓</span>
                  Voortgang tracking over tijd
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '12px',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  <span style={{ marginRight: '12px', color: '#10b981' }}>✓</span>
                  Vergelijking met klasgemiddelden
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '12px',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  <span style={{ marginRight: '12px', color: '#10b981' }}>✓</span>
                  Automatische rapport generatie
                </li>
              </ul>
            </div>

            <div style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#0369a1',
                margin: 0,
                fontWeight: '500'
              }}>
                💡 Deze tool gebruikt je bestaande inzendingen data om inzichten te genereren.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link href="/teacher-submissions" style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#10b981',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Start Analyseren
              </Link>
              <Link href="/tools" style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#6b7280',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Terug naar Tools
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}