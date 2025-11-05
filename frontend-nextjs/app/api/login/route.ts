import { NextResponse } from 'next/server';
import { login as loginCall } from '@/lib/apiCalls';

export async function POST(request: Request) {
  const form = await request.formData();
  const phone = String(form.get('phone') ?? '');
  const otp = String(form.get('otp') ?? '');

  if (!phone || !otp) {
    return NextResponse.redirect(new URL('/?error=missing', request.url), 303);
  }

  let backendRes: Response;
  try {
    backendRes = await loginCall({ phone, otp });
  } catch {
    return NextResponse.redirect(new URL('/?error=network', request.url), 303);
  }

  const redirectTo = backendRes.ok ? '/home' : '/?error=invalid';
  const res = NextResponse.redirect(new URL(redirectTo, request.url), 303);

  const setCookie = backendRes.headers.get('set-cookie');
  if (setCookie) {
    res.headers.set('set-cookie', setCookie);
  }
  return res;
}


