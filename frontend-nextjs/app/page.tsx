'use client';
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
      window.location.href = '/home';
    } catch (err) {
      setError('Network error');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div style={{ maxWidth: 420 }}>
        <h1 className="mb-3 text-lg text-gray-500 md:text-xl dark:text-gray-400">Welcome to the app (Next.js)</h1>
        <p className="text-gray-500 dark:text-gray-400">Use OTP 123456.</p>
        <form onSubmit={onSubmit}>
          <div>
            <label className="text-gray-500 dark:text-gray-400">Phone</label>
            <input className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={phone} onChange={(e) => setPhone(e.target.value)} required style={{ display: 'block', width: '100%', marginTop: 4, marginBottom: 12 }} />
          </div>
          <div>
            <label className="text-gray-500 dark:text-gray-400">OTP</label>
            <input className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={otp} onChange={(e) => setOtp(e.target.value)} required style={{ display: 'block', width: '100%', marginTop: 4, marginBottom: 12 }} />
          </div>
          <button type="submit" className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
          >Sign in</button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </div>
  );
}
