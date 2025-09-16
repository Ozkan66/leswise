"use client";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

export default function Navigation() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      router.push('/');
    }
  };

  if (loading) {
    return (
      <nav style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 32 }}>
        <span>Loading...</span>
      </nav>
    );
  }

  return (
    <nav style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 32 }}>
      <Link href="/" style={{ marginRight: 12, fontWeight: 'bold' }}>Leswise</Link>
      
      {user ? (
        <>
          <Link href="/groups" style={{ marginRight: 12 }}>Groups</Link>
          <Link href="/folders" style={{ marginRight: 12 }}>Folders</Link>
          <Link href="/worksheets" style={{ marginRight: 12 }}>Worksheets</Link>
          <Link href="/shared-worksheets" style={{ marginRight: 12 }}>Shared Worksheets</Link>
          <Link href="/worksheet-submission" style={{ marginRight: 12 }}>Submissions</Link>
          <Link href="/student-submissions" style={{ marginRight: 12 }}>Mijn Werkbladen</Link>
          <Link href="/teacher-submissions" style={{ marginRight: 12 }}>Teacher Submissions</Link>
          <Link href="/tools" style={{ marginRight: 12 }}>🚀 Tools</Link>
          
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <ThemeToggle />
            <Link 
              href="/profile" 
              style={{ 
                color: '#666',
                textDecoration: 'none' 
              }}
            >
              Welkom, {user.user_metadata?.first_name || user.email}
            </Link>
            <button
              onClick={handleSignOut}
              style={{
                padding: '6px 12px',
                backgroundColor: '#f0f0f0',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Uitloggen
            </button>
          </div>
        </>
      ) : (
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
          <ThemeToggle />
          <Link 
            href="/login" 
            style={{ 
              padding: '6px 12px',
              backgroundColor: '#0070f3',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            Inloggen
          </Link>
          <Link 
            href="/register" 
            style={{ 
              padding: '6px 12px',
              backgroundColor: '#28a745',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            Registreren
          </Link>
        </div>
      )}
    </nav>
  );
}