'use client';

import { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

type Me = { authenticated: boolean; role: 'user' | 'admin'; userName?: string; adminName?: string };

export default function HomePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/session/me`, { credentials: 'include' });
        if (!res.ok) {
          window.location.replace('/');
          return;
        }
        const data = await res.json();
        setMe(data);
      } catch {
        setError('Failed to get session');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function logout() {
    await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
    window.location.href = '/';
  }

  if (loading) {
    return null; // Evita flash de contenido hasta saber si está autenticado
  }

  return (
    <>
      <div style={{
        backgroundColor: '#E0F2FE',
        color: '#000000',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontWeight: 600 }}>Dashboard (Next.js)</span>
        <button onClick={logout} style={{
          backgroundColor: '#0C4A6E', color: 'white', border: 'none',
          padding: '8px 12px', borderRadius: 6, cursor: 'pointer'
        }}>Logout</button>
      </div>
      <div style={{ maxWidth: 600, padding: 20 }}>
        {me && (
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 12,
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
            padding: 24,
            maxWidth: 480,
            margin: '24px auto',
            textAlign: 'center',
            color: '#000000'
          }}>
            <p style={{ marginBottom: 12, color: '#000000' }}>Autenticado como: {me.role === 'admin' ? me.adminName : me?.userName}</p>
            <button
              onClick={() => (window.location.href = 'http://localhost:4201')}
              style={{
                backgroundColor: '#0C4A6E',
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 16px',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'inline-block'
              }}
            >
              Go to App
            </button>
          </div>
        )}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </>
  );
}











