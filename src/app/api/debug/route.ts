import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@/lib/supabase/server';

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

  // Test 1: Direct from request cookies (like debug endpoint)
  let directResult: Record<string, unknown> = {};
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
    directResult = {
      user_id: data?.user?.id || null,
      user_email: data?.user?.email || null,
      error: error?.message || null,
    };
  } catch (e: unknown) {
    directResult = { exception: String(e) };
  }

  // Test 2: Using server.ts createClient (same as dashboard)
  let serverClientResult: Record<string, unknown> = {};
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    serverClientResult = {
      user_id: data?.user?.id || null,
      user_email: data?.user?.email || null,
      error: error?.message || null,
    };
  } catch (e: unknown) {
    serverClientResult = { exception: String(e) };
  }

  // Test 3: Check coach record
  let coachResult: Record<string, unknown> = {};
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: coach, error } = await supabase
        .from('coaches')
        .select('id, email, onboarding_step')
        .eq('auth_user_id', user.id)
        .single();
      coachResult = { coach, error: error?.message || null };
    } else {
      coachResult = { coach: null, note: 'no user' };
    }
  } catch (e: unknown) {
    coachResult = { exception: String(e) };
  }

  return NextResponse.json({
    env: envCheck,
    cookies: cookieNames,
    auth_cookies: authCookies.map(c => ({ name: c.name, value_length: c.value.length })),
    direct_auth: directResult,
    server_client_auth: serverClientResult,
    coach: coachResult,
  });
}
