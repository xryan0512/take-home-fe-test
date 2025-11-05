export default function LoginPage() {
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
        <form action="/api/auth/verify-otp" method="POST" style={{ display: 'grid', gap: 10 }}>
          <div>
            <label style={{ color: '#374151' }}>Phone</label>
            <input className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              required name="phone" style={{ display: 'block', width: '100%', marginTop: 4 }} />
          </div>
          <div>
            <label style={{ color: '#374151' }}>OTP</label>
            <input className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              required name="otp" style={{ display: 'block', width: '100%', marginTop: 4 }} />
          </div>
          <button type="submit" style={{
            backgroundColor: '#0C4A6E', color: 'white', border: 'none',
            padding: '10px 16px', borderRadius: 8, cursor: 'pointer',
            width: 'fit-content'
          }}>Sign in</button>
        </form>
      </div>
    </div>
  );
}
