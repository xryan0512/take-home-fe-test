"use client";

import { useEffect, useRef, useState } from 'react';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);

  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!showOtp) {
      phoneInputRef.current?.focus();
    } else {
      otpRefs.current[0]?.focus();
    }
  }, [showOtp]);

  function startOtpStep() {
    if (!phone.trim()) return;
    setShowOtp(true);
  }

  function handlePhoneKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      startOtpStep();
    }
  }

  function setDigitAt(index: number, value: string) {
    setOtpDigits(prev => {
      const clone = [...prev];
      clone[index] = value;
      return clone;
    });
  }

  function handleOtpChange(index: number, value: string) {
    const onlyDigit = value.replace(/\D/g, '').slice(0, 1);
    if (!onlyDigit && value !== '') return;
    setDigitAt(index, onlyDigit);
    if (onlyDigit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (otpDigits[index]) {
        setDigitAt(index, '');
        return;
      }
      if (index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpPaste(index: number, e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData('text') || '';
    const digits = text.replace(/\D/g, '').slice(0, 6).split('');
    if (digits.length === 0) return;
    e.preventDefault();
    setOtpDigits(prev => {
      const next = [...prev];
      for (let i = 0; i < 6 - index && i < digits.length; i++) {
        next[index + i] = digits[i] ?? '';
      }
      return next;
    });
    const lastIdx = Math.min(5, index + digits.length - 1);
    otpRefs.current[lastIdx]?.focus();
  }

  const otpValue = otpDigits.join('');

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black" style={{ backgroundColor: '#F0F9FF' }}>
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.75)',
        border: '1px solid rgba(229,231,235,0.6)',
        borderRadius: 16,
        backdropFilter: 'blur(8px)',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        padding: 24,
        width: '100%',
        maxWidth: 520,
        margin: '0 auto',
        color: '#000000'
      }}>
        <h1 style={{ marginTop: 0, marginBottom: 8, fontSize: 20, color: '#111827' }}>Welcome to the app (Next.js)</h1>
        <p style={{ color: '#111827', marginBottom: 12 }}>Use OTP 123456.</p>

        {!showOtp && (
          <div style={{ display: 'grid', gap: 10 }}>
            <div>
              <label style={{ color: '#374151' }}>Phone</label>
              <input
                ref={phoneInputRef}
                className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={handlePhoneKeyDown}
                placeholder="e.g. +1 555 123 4567"
                style={{ display: 'block', width: '100%', marginTop: 4 }}
              />
            </div>
            <button
              type="button"
              onClick={startOtpStep}
              style={{
                backgroundColor: '#0C4A6E', color: 'white', border: 'none',
                padding: '10px 16px', borderRadius: 8, cursor: 'pointer',
                width: 'fit-content'
              }}
            >
              Send OTP
            </button>
          </div>
        )}

        {showOtp && (
          <form action="/api/login" method="POST" style={{ display: 'grid', gap: 10 }}>
            <input type="hidden" name="phone" value={phone} />
            <input type="hidden" name="otp" value={otpValue} />

            <div>
              <label style={{ color: '#374151', display: 'block', marginBottom: 6 }}>Enter OTP</label>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { otpRefs.current[idx] = el; }}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={(e) => handleOtpPaste(idx, e)}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    autoComplete="one-time-code"
                    className="block p-2 text-center text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    style={{ width: 40 }}
                  />
                ))}
              </div>
            </div>

            <button type="submit" style={{
              backgroundColor: '#0C4A6E', color: 'white', border: 'none',
              padding: '10px 16px', borderRadius: 8, cursor: 'pointer',
              width: 'fit-content'
            }}>Sign in</button>
          </form>
        )}
      </div>
    </div>
  );
}
