"use client";

import Link from 'next/link';

interface ToolPageProps {
  icon: string;
  title: string;
  description: string;
  features: string[];
  isAvailable?: boolean;
  redirectUrl?: string;
  tipText?: string;
}

export default function ToolPageTemplate({ 
  icon, 
  title, 
  description, 
  features, 
  isAvailable = false,
  redirectUrl,
  tipText 
}: ToolPageProps) {
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
              {icon}
            </div>
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#111827',
                margin: '0 0 8px 0'
              }}>
                {title}
              </h1>
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                margin: 0
              }}>
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '48px 32px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
              {isAvailable ? '✨' : '🚧'}
            </div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#111827',
              margin: '0 0 16px 0'
            }}>
              {isAvailable ? `${title} beschikbaar!` : 'Tool in ontwikkeling'}
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: '0 0 32px 0',
              lineHeight: '1.6'
            }}>
              {isAvailable 
                ? `Deze tool is klaar voor gebruik en helpt je om:`
                : `De ${title} wordt momenteel ontwikkeld. Deze tool zal je helpen om:`
              }
            </p>
            
            <div style={{ textAlign: 'left', marginBottom: '32px' }}>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                {features.map((feature, index) => (
                  <li key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '12px',
                    fontSize: '14px',
                    color: '#374151'
                  }}>
                    <span style={{ marginRight: '12px', color: '#10b981' }}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {tipText && (
              <div style={{
                backgroundColor: isAvailable ? '#f0f9ff' : '#eff6ff',
                border: `1px solid ${isAvailable ? '#bae6fd' : '#dbeafe'}`,
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <p style={{
                  fontSize: '14px',
                  color: isAvailable ? '#0369a1' : '#1e40af',
                  margin: 0,
                  fontWeight: '500'
                }}>
                  💡 {tipText}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              {isAvailable && redirectUrl ? (
                <Link href={redirectUrl} style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Tool Gebruiken
                </Link>
              ) : null}
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