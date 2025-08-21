"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      setIsLoading(false);
      if (user) {
        // Redirect authenticated users to their dashboard
        // You can implement role-based routing here if needed
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  if (isLoading) {
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

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      {/* Header */}
      <header style={{ 
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ 
          fontSize: '24px', 
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span style={{ marginRight: '8px' }}>📚</span>
          Leswise
        </div>
        <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link href="/login" style={{ 
            color: 'white', 
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '500'
          }}>
            Aanmelden
          </Link>
          <Link href="/register" style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '500',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            transition: 'all 0.3s ease'
          }}>
            Account aanmaken
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main style={{ 
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '80px 40px 0',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '48px',
          fontWeight: 'bold',
          marginBottom: '24px',
          lineHeight: '1.2'
        }}>
          Welkom bij Leswise
        </h1>
        <p style={{ 
          fontSize: '24px',
          marginBottom: '48px',
          opacity: 0.9,
          maxWidth: '600px',
          margin: '0 auto 48px'
        }}>
          Het moderne platform voor interactieve werkbladen en effectief leren
        </p>

        {/* CTA Buttons */}
        <div style={{ 
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          marginBottom: '80px',
          flexWrap: 'wrap'
        }}>
          <Link href="/login" style={{
            backgroundColor: 'white',
            color: '#667eea',
            padding: '16px 32px',
            borderRadius: '12px',
            textDecoration: 'none',
            fontSize: '18px',
            fontWeight: '600',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
            display: 'inline-block'
          }}>
            Aanmelden
          </Link>
          <Link href="/register" style={{
            backgroundColor: 'transparent',
            color: 'white',
            padding: '16px 32px',
            borderRadius: '12px',
            textDecoration: 'none',
            fontSize: '18px',
            fontWeight: '600',
            border: '2px solid white',
            transition: 'all 0.3s ease',
            display: 'inline-block'
          }}>
            Account aanmaken
          </Link>
        </div>

        {/* Features Section */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px',
          marginTop: '80px',
          textAlign: 'left'
        }}>
          {/* Feature 1 */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: '32px',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ 
              fontSize: '48px',
              marginBottom: '16px'
            }}>
              🚀
            </div>
            <h3 style={{ 
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '16px'
            }}>
              Direct aan de slag
            </h3>
            <p style={{ 
              fontSize: '16px',
              opacity: 0.9,
              lineHeight: '1.6'
            }}>
              Intuïtieve interface waarmee je binnen minuten je eerste interactieve werkbladen kunt maken en delen met je leerlingen.
            </p>
          </div>

          {/* Feature 2 */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: '32px',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ 
              fontSize: '48px',
              marginBottom: '16px'
            }}>
              👥
            </div>
            <h3 style={{ 
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '16px'
            }}>
              Voor docenten & leerlingen
            </h3>
            <p style={{ 
              fontSize: '16px',
              opacity: 0.9,
              lineHeight: '1.6'
            }}>
              Krachtige tools voor docenten om content te maken en beheren, met een eenvoudige interface voor leerlingen om werkbladen in te vullen.
            </p>
          </div>

          {/* Feature 3 */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: '32px',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ 
              fontSize: '48px',
              marginBottom: '16px'
            }}>
              🔒
            </div>
            <h3 style={{ 
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '16px'
            }}>
              Veilig & privacyvriendelijk
            </h3>
            <p style={{ 
              fontSize: '16px',
              opacity: 0.9,
              lineHeight: '1.6'
            }}>
              Jouw gegevens en die van je leerlingen zijn veilig. We hanteren strenge privacy-normen en beveiliging volgens Nederlandse wetgeving.
            </p>
          </div>
        </div>

        {/* Call to Action Section */}
        <div style={{ 
          marginTop: '80px',
          padding: '60px 0',
          textAlign: 'center'
        }}>
          <h2 style={{ 
            fontSize: '36px',
            fontWeight: 'bold',
            marginBottom: '24px'
          }}>
            Klaar om te beginnen?
          </h2>
          <p style={{ 
            fontSize: '18px',
            marginBottom: '32px',
            opacity: 0.9
          }}>
            Maak vandaag nog je gratis account aan en ontdek hoe Leswise jouw lessen kan verbeteren.
          </p>
          <Link href="/register" style={{
            backgroundColor: 'white',
            color: '#667eea',
            padding: '20px 40px',
            borderRadius: '12px',
            textDecoration: 'none',
            fontSize: '20px',
            fontWeight: '600',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
            display: 'inline-block'
          }}>
            Gratis account aanmaken
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ 
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '40px',
        textAlign: 'center',
        marginTop: '80px'
      }}>
        <div style={{ 
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
            📚 Leswise
          </div>
          <div style={{ display: 'flex', gap: '30px' }}>
            <Link href="/privacy-policy" style={{ 
              color: 'white', 
              textDecoration: 'none',
              opacity: 0.8,
              fontSize: '14px'
            }}>
              Privacy Policy
            </Link>
            <a href="#" style={{ 
              color: 'white', 
              textDecoration: 'none',
              opacity: 0.8,
              fontSize: '14px'
            }}>
              Contact
            </a>
            <a href="#" style={{ 
              color: 'white', 
              textDecoration: 'none',
              opacity: 0.8,
              fontSize: '14px'
            }}>
              Help
            </a>
          </div>
        </div>
        <div style={{ 
          marginTop: '20px',
          fontSize: '14px',
          opacity: 0.7
        }}>
          © 2024 Leswise. Alle rechten voorbehouden.
        </div>
      </footer>
    </div>
  );
}