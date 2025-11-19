"use client";
import React, { useState } from "react";
import Link from "next/link";

const SignupPage: React.FC = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "student"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    // Hier zou je een signup API call doen
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1200);
  };

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom, #fff, #e0e7ff)',
      padding: '2rem 1rem',
    }}>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #e0e7ff', padding: 32, minWidth: 340, maxWidth: 400 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1e3a8a', marginBottom: 24 }}>Account aanmaken</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="text"
            name="firstName"
            placeholder="Voornaam"
            value={form.firstName}
            onChange={handleChange}
            required
            style={{ padding: 12, borderRadius: 8, border: '1px solid #dbeafe', fontSize: 16 }}
          />
          <input
            type="text"
            name="lastName"
            placeholder="Achternaam"
            value={form.lastName}
            onChange={handleChange}
            required
            style={{ padding: 12, borderRadius: 8, border: '1px solid #dbeafe', fontSize: 16 }}
          />
          <input
            type="email"
            name="email"
            placeholder="E-mailadres"
            value={form.email}
            onChange={handleChange}
            required
            style={{ padding: 12, borderRadius: 8, border: '1px solid #dbeafe', fontSize: 16 }}
          />
          <input
            type="password"
            name="password"
            placeholder="Wachtwoord"
            value={form.password}
            onChange={handleChange}
            required
            style={{ padding: 12, borderRadius: 8, border: '1px solid #dbeafe', fontSize: 16 }}
          />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            style={{ padding: 12, borderRadius: 8, border: '1px solid #dbeafe', fontSize: 16 }}
          >
            <option value="student">Leerling</option>
            <option value="teacher">Leerkracht</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px 0',
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 18,
              marginTop: 8,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px #dbeafe',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Account aanmaken...' : 'Account aanmaken'}
          </button>
        </form>
        {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
        {success && <div style={{ color: 'green', marginTop: 12 }}>Account succesvol aangemaakt!</div>}
        <div style={{ marginTop: 18, textAlign: 'center' }}>
          <span style={{ fontSize: 15, color: '#2563eb' }}>Heb je al een account? </span>
          <Link href="/login" style={{ color: '#1e3a8a', fontWeight: 600, textDecoration: 'underline', marginLeft: 4 }}>Aanmelden</Link>
        </div>
      </div>
    </main>
  );
};

export default SignupPage;
