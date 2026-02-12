import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: coach } = await supabase
    .from('coaches')
    .select('name, business_name, is_admin, onboarding_step')
    .eq('auth_user_id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navbar */}
      <nav className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="text-lg font-bold text-gray-900">
          AI CoachOps
        </Link>
        <div className="flex items-center gap-4">
          {coach?.is_admin && (
            <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700">
              Admin
            </Link>
          )}
          <span className="text-sm text-gray-500">
            {coach?.name || user.email}
          </span>
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Sign Out
            </button>
          </form>
        </div>
      </nav>
      {children}
    </div>
  );
}
