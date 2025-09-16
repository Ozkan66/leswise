"use client";

import Link from 'next/link';

export default function QuizMakerPage() {
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
              🧩
            </div>
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#111827',
                margin: '0 0 8px 0'
              }}>
                Quiz Maker
              </h1>
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                margin: 0
              }}>
                Maak interactieve quizzen en toetsen met automatische feedback
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '48px 32px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Coming Soon Notice */}
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
              🚧
            </div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#111827',
              margin: '0 0 16px 0'
            }}>
              Tool in ontwikkeling
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: '0 0 32px 0',
              lineHeight: '1.6'
            }}>
              De Quiz Maker wordt momenteel ontwikkeld. Deze tool zal je helpen om:
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
                  Interactieve multiple choice quizzen maken
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '12px',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  <span style={{ marginRight: '12px', color: '#10b981' }}>✓</span>
                  Automatische feedback en scoring
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '12px',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  <span style={{ marginRight: '12px', color: '#10b981' }}>✓</span>
                  Real-time resultaten dashboard
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '12px',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  <span style={{ marginRight: '12px', color: '#10b981' }}>✓</span>
                  Delen met leerlingen via links
                </li>
              </ul>
            </div>

            <Link href="/tools" style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#2563eb',
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
  );
}