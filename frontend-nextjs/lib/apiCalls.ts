export type LoginResponse = {
  ok: boolean;
  role?: 'user' | 'admin';
  userName?: string;
  adminName?: string;
};

function getBackendBase(): string {
  const base = process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
  return base;
}

export async function login(params: { phone: string; otp: string }): Promise<Response> {
  const backendBase = getBackendBase();
  const res = await fetch(`${backendBase}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: params.phone, otp: params.otp }),
  });
  return res;
}




