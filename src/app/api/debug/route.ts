import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Check env vars
  const envCheck = {
    url_set: !!url,
    url_length: url?.length,
    url_value: url?.substring(0, 30) + '...',
    key_set: !!key,
    key_length: key?.length,
  };

  // Check cookies
  const allCookies = request.cookies.getAll();
  const cookieNames = allCookies.map(c => c.name);
  const authCookies = allCookies.filter(c => c.name.includes('supabase') || c.name.includes('sb-'));

  // Try to get user
  let userResult: Record<string, unknown> = {};
  try {
    const supabase = createServerClient(url!, key!, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {},
      },
    });
    const { data, error } = await supabase.auth.getUser();
    userResult = {
      user_id: data?.user?.id || null,
      user_email: data?.user?.email || null,
      error: error?.message || null,
    };
  } catch (e: unknown) {
    userResult = { exception: String(e) };
  }

  return NextResponse.json({
    env: envCheck,
    cookies: cookieNames,
    auth_cookies: authCookies.map(c => ({ name: c.name, value_length: c.value.length })),
    user: userResult,
  });
}
