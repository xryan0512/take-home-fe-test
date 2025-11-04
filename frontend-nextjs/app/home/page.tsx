'use client';

import { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

type Me = { authenticated: boolean; role: 'user' | 'admin'; userName?: string; adminName?: string };

export default function HomePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/session/me`, { credentials: 'include' });
        if (!res.ok) {
          window.location.href = '/';
          return;
        }
        const data = await res.json();
        setMe(data);
      } catch (e) {
        setError('Failed to get session');
      }
    })();
  }, []);

  async function logout() {
    await fetch(`${API_BASE}/auth/logot`, { method: 'POST', credentials: 'include' });
    window.location.href = '/';
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h1>Home (Next.js)</h1>
      {me && (
        <>
          <p>Autenticado como: {me.role === 'admin' ? me.adminName : me?.userName}</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => (window.location.href = 'http://localhost:4201')}> resume application (Angular User)</button>
            <button onClick={logout}>Close session</button>
          </div>
        </>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}











