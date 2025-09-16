"use client";

import { useState } from 'react';
import Link from 'next/link';

// Tool configuration interface
interface Tool {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  isExternal?: boolean;
  comingSoon?: boolean;
}

// Tools configuration - easily expandable
const toolsConfig: Tool[] = [
  {
    id: 'worksheet-generator',
    title: 'Leswise Worksheet Generator',
    description: 'Maak interactieve werkbladen met AI-ondersteuning. Genereer vragen, taken en oefeningen voor je leerlingen.',
    icon: '📝',
    href: '/worksheets'
  }
  // Future tools can be easily added here:
  // {
  //   id: 'quiz-creator',
  //   title: 'Quiz Creator',
  //   description: 'Creëer interactieve quizzen en toetsen voor je leerlingen.',
  //   icon: '🎯',
  //   href: '/tools/quiz-creator',
  //   comingSoon: true
  // }
];

// Individual tool card component
const ToolCard: React.FC<{ tool: Tool }> = ({ tool }) => {
  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '32px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    transition: 'all 0.2s ease-in-out',
    cursor: tool.comingSoon ? 'not-allowed' : 'pointer',
    opacity: tool.comingSoon ? 0.6 : 1,
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
    height: '100%',
    position: 'relative' as const
  };

  const cardHoverStyle = {
    ...cardStyle,
    transform: tool.comingSoon ? 'none' : 'translateY(-2px)',
    boxShadow: tool.comingSoon ? cardStyle.boxShadow : '0 10px 25px 0 rgb(0 0 0 / 0.15)'
  };

  const content = (
    <div 
      style={cardStyle}
      onMouseEnter={(e) => {
        if (!tool.comingSoon) {
          Object.assign(e.currentTarget.style, cardHoverStyle);
        }
      }}
      onMouseLeave={(e) => {
        Object.assign(e.currentTarget.style, cardStyle);
      }}
    >
      {tool.comingSoon && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          backgroundColor: '#fbbf24',
          color: 'white',
          fontSize: '12px',
          fontWeight: '600',
          padding: '4px 8px',
          borderRadius: '12px'
        }}>
          Binnenkort
        </div>
      )}
      
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '16px',
          display: 'block'
        }}>
          {tool.icon}
        </div>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#1e293b',
          margin: '0 0 12px 0',
          lineHeight: '1.3'
        }}>
          {tool.title}
        </h3>
      </div>
      
      <p style={{
        fontSize: '14px',
        color: '#64748b',
        lineHeight: '1.6',
        margin: '0 0 32px 0',
        minHeight: '60px'
      }}>
        {tool.description}
      </p>
      
      <div style={{ marginTop: 'auto' }}>
        <button
          style={{
            width: '100%',
            padding: '12px 24px',
            backgroundColor: tool.comingSoon ? '#e2e8f0' : '#2563eb',
            color: tool.comingSoon ? '#64748b' : 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: tool.comingSoon ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          disabled={tool.comingSoon}
        >
          {tool.comingSoon ? 'Binnenkort beschikbaar' : 'Start Tool'}
          {!tool.comingSoon && <span>→</span>}
        </button>
      </div>
    </div>
  );

  if (tool.comingSoon) {
    return content;
  }

  return tool.isExternal ? (
    <a href={tool.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
      {content}
    </a>
  ) : (
    <Link href={tool.href} style={{ textDecoration: 'none', color: 'inherit' }}>
      {content}
    </Link>
  );
};

export default function ToolsDashboard() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTools = toolsConfig.filter(tool =>
    tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ 
      backgroundColor: '#f8fafc', 
      minHeight: '100vh',
      paddingTop: '80px'
    }}>
      {/* Header Section */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '48px 24px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#1e293b',
              margin: '0 0 16px 0',
              lineHeight: '1.2'
            }}>
              Leswise Productiviteitstools
            </h1>
            <p style={{
              fontSize: '18px',
              color: '#64748b',
              margin: '0 0 32px 0',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: '1.6'
            }}>
              Ontdek krachtige tools om je onderwijsmateriaal te maken en je workflow te optimaliseren
            </p>
            
            {/* Search Bar */}
            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
              <input
                type="text"
                placeholder="Zoek tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '48px 24px'
      }}>
        {filteredTools.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 0',
            color: '#64748b'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <p>Geen tools gevonden die overeenkomen met je zoekopdracht.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '32px',
            alignItems: 'stretch'
          }}>
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}

        {/* Coming Soon Section */}
        {searchTerm === '' && (
          <div style={{
            marginTop: '64px',
            textAlign: 'center',
            padding: '48px',
            backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '24px' }}>🚀</div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#1e293b',
              margin: '0 0 16px 0'
            }}>
              Meer tools komen eraan!
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#64748b',
              margin: '0 0 24px 0',
              lineHeight: '1.6'
            }}>
              We werken hard aan nieuwe productiviteitstools om je workflow nog verder te verbeteren.
              Heb je suggesties voor nieuwe tools? Laat het ons weten!
            </p>
            <Link
              href="/profile"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: '#2563eb',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
            >
              Feedback geven
              <span>→</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}