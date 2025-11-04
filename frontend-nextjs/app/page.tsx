import Image from "next/image";
import { useState } from 'react';


const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';


export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone, otp }),
      });
      if (!res.ok) {
        setError('OTP inválido');
        return;
      }

    } catch (err) {
      setError('Error de red');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div style={{ maxWidth: 420 }}>
        <h1>Login (Next.js)</h1>
        <p>Use OTP 123456.</p>
        <form onSubmit={onSubmit}>
          <div>
            <label>Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} required style={{ display: 'block', width: '100%', marginTop: 4, marginBottom: 12 }} />
          </div>
          <div>
            <label>OTP</label>
            <input value={otp} onChange={(e) => setOtp(e.target.value)} required style={{ display: 'block', width: '100%', marginTop: 4, marginBottom: 12 }} />
          </div>
          <button type="submit">Ingresar</button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </div>
  );
}
