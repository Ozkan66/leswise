"use client";

import { useState } from 'react';
import Link from 'next/link';
import { microSaasTools, getCategoryTools, MicroSaaSTool } from '../../config/tools';

interface ToolCardProps {
  tool: MicroSaaSTool;
}

function ToolCard({ tool }: ToolCardProps) {
  const getStatusColor = (status: MicroSaaSTool['status']) => {
    switch (status) {
      case 'available':
        return '#10b981'; // green
      case 'beta':
        return '#f59e0b'; // amber
      case 'coming-soon':
        return '#6b7280'; // gray
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: MicroSaaSTool['status']) => {
    switch (status) {
      case 'available':
        return 'Beschikbaar';
      case 'beta':
        return 'Beta';
      case 'coming-soon':
        return 'Binnenkort';
      default:
        return '';
    }
  };

  const isDisabled = tool.status === 'coming-soon';

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      transition: 'all 0.2s ease',
      position: 'relative',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.6 : 1
    }}
    onMouseEnter={(e) => {
      if (!isDisabled) {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px 0 rgb(0 0 0 / 0.15)';
      }
    }}
    onMouseLeave={(e) => {
      if (!isDisabled) {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.1)';
      }
    }}
    >
      {/* Status Badge */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        backgroundColor: getStatusColor(tool.status),
        color: 'white',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '10px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {getStatusText(tool.status)}
      </div>

      {/* Icon */}
      <div style={{
        fontSize: '32px',
        marginBottom: '16px',
        textAlign: 'center',
        padding: '16px',
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        width: '80px',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center'
      }}>
        {tool.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#111827',
          margin: '0 0 8px 0',
          textAlign: 'center'
        }}>
          {tool.title}
        </h3>
        
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          lineHeight: '1.5',
          margin: '0 0 24px 0',
          textAlign: 'center',
          flex: 1
        }}>
          {tool.description}
        </p>

        {/* Try It Button */}
        {isDisabled ? (
          <button
            disabled
            style={{
              width: '100%',
              padding: '12px 24px',
              backgroundColor: '#e5e7eb',
              color: '#9ca3af',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'not-allowed'
            }}
          >
            Binnenkort beschikbaar
          </button>
        ) : (
          <Link href={tool.route} style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%',
              padding: '12px 24px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1d4ed8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }}
            >
              Proberen
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}

interface CategorySectionProps {
  title: string;
  tools: MicroSaaSTool[];
  icon: string;
}

function CategorySection({ title, tools, icon }: CategorySectionProps) {
  if (tools.length === 0) return null;

  return (
    <div style={{ marginBottom: '48px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '24px',
        paddingBottom: '12px',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <span style={{ fontSize: '24px', marginRight: '12px' }}>{icon}</span>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#111827',
          margin: 0
        }}>
          {title}
        </h2>
        <span style={{
          marginLeft: '12px',
          backgroundColor: '#e5e7eb',
          color: '#6b7280',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          {tools.length} tool{tools.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '24px'
      }}>
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}

export default function ToolsOverview() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Alle Tools', icon: '🎯' },
    { id: 'content', label: 'Content Creatie', icon: '📝' },
    { id: 'productivity', label: 'Productiviteit', icon: '⚡' },
    { id: 'analysis', label: 'Analyse & Rapportage', icon: '📊' },
    { id: 'automation', label: 'Automatisering', icon: '🤖' }
  ];

  const getFilteredTools = () => {
    if (selectedCategory === 'all') {
      return microSaasTools;
    }
    return getCategoryTools(selectedCategory as MicroSaaSTool['category']);
  };

  const getCategorySections = () => {
    if (selectedCategory !== 'all') {
      return [{
        title: categories.find(cat => cat.id === selectedCategory)?.label || '',
        tools: getFilteredTools(),
        icon: categories.find(cat => cat.id === selectedCategory)?.icon || '🎯'
      }];
    }

    return [
      {
        title: 'Content Creatie',
        tools: getCategoryTools('content'),
        icon: '📝'
      },
      {
        title: 'Productiviteit',
        tools: getCategoryTools('productivity'),
        icon: '⚡'
      },
      {
        title: 'Analyse & Rapportage',
        tools: getCategoryTools('analysis'),
        icon: '📊'
      },
      {
        title: 'Automatisering',
        tools: getCategoryTools('automation'),
        icon: '🤖'
      }
    ];
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '32px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#111827',
              margin: '0 0 12px 0'
            }}>
              🚀 MicroSaaS Tools
            </h1>
            <p style={{
              fontSize: '18px',
              color: '#6b7280',
              margin: 0,
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: '1.6'
            }}>
              Ontdek krachtige tools die je dagelijkse werk als docent 
              vereenvoudigen en je productiviteit verhogen
            </p>
          </div>

          {/* Category Filter */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: selectedCategory === category.id ? '#2563eb' : 'white',
                  color: selectedCategory === category.id ? 'white' : '#6b7280',
                  boxShadow: selectedCategory === category.id 
                    ? '0 2px 4px rgb(37 99 235 / 0.2)' 
                    : '0 1px 2px rgb(0 0 0 / 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== category.id) {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== category.id) {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                <span>{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div style={{ padding: '48px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {getCategorySections().map((section) => (
            <CategorySection
              key={section.title}
              title={section.title}
              tools={section.tools}
              icon={section.icon}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
        padding: '32px',
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          margin: 0
        }}>
          Heb je ideeën voor nieuwe tools? 
          <a href="mailto:feedback@leswise.nl" style={{
            color: '#2563eb',
            textDecoration: 'none',
            marginLeft: '4px'
          }}>
            Laat het ons weten!
          </a>
        </p>
      </div>
    </div>
  );
}