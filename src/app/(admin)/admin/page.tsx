import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Check admin
  const { data: coach } = await supabase
    .from('coaches')
    .select('is_admin')
    .eq('auth_user_id', user.id)
    .single();

  if (!coach?.is_admin) redirect('/dashboard');

  // Get stats
  const { count: totalCoaches } = await supabase
    .from('coaches')
    .select('*', { count: 'exact', head: true });

  const { count: completedBuilds } = await supabase
    .from('builds')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed');

  const { count: failedBuilds } = await supabase
    .from('builds')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'failed');

  const { count: totalFeedback } = await supabase
    .from('feedback')
    .select('*', { count: 'exact', head: true });

  // Get recent coaches
  const { data: recentCoaches } = await supabase
    .from('coaches')
    .select('id, email, name, business_name, onboarding_step, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  // Get recent builds
  const { data: recentBuilds } = await supabase
    .from('builds')
    .select('id, coach_id, selected_archetype, status, created_at, tags_created, custom_fields_created')
    .order('created_at', { ascending: false })
    .limit(10);

  // Get feedback
  const { data: feedbackItems } = await supabase
    .from('feedback')
    .select('*, coaches(name, email)')
    .order('created_at', { ascending: false })
    .limit(10);

  const stepColors: Record<string, string> = {
    signup: 'bg-gray-100 text-gray-600',
    intake: 'bg-blue-100 text-blue-600',
    ghl_connect: 'bg-yellow-100 text-yellow-600',
    building: 'bg-purple-100 text-purple-600',
    complete: 'bg-green-100 text-green-600',
  };

  const statusColors: Record<string, string> = {
    completed: 'bg-green-100 text-green-600',
    failed: 'bg-red-100 text-red-600',
    pending: 'bg-gray-100 text-gray-600',
    analyzing: 'bg-blue-100 text-blue-600',
    applying: 'bg-yellow-100 text-yellow-600',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-lg font-bold text-gray-900">
            AI CoachOps
          </Link>
          <Badge variant="secondary">Admin</Badge>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold">{totalCoaches || 0}</div>
              <div className="text-sm text-gray-500">Total Coaches</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-green-600">{completedBuilds || 0}</div>
              <div className="text-sm text-gray-500">Completed Builds</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-red-600">{failedBuilds || 0}</div>
              <div className="text-sm text-gray-500">Failed Builds</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-blue-600">{totalFeedback || 0}</div>
              <div className="text-sm text-gray-500">Feedback Responses</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Coaches */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Coaches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentCoaches?.map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <div className="text-sm font-medium">{c.name || c.email}</div>
                      <div className="text-xs text-gray-400">{c.business_name || 'No business name'}</div>
                    </div>
                    <Badge className={stepColors[c.onboarding_step] || ''}>
                      {c.onboarding_step}
                    </Badge>
                  </div>
                ))}
                {(!recentCoaches || recentCoaches.length === 0) && (
                  <p className="text-sm text-gray-400 text-center py-4">No coaches yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Builds */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Builds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentBuilds?.map((b) => (
                  <div key={b.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <div className="text-sm font-medium">{b.selected_archetype || 'Pending'}</div>
                      <div className="text-xs text-gray-400">
                        {b.tags_created?.length || 0} tags, {b.custom_fields_created?.length || 0} fields
                      </div>
                    </div>
                    <Badge className={statusColors[b.status] || ''}>
                      {b.status}
                    </Badge>
                  </div>
                ))}
                {(!recentBuilds || recentBuilds.length === 0) && (
                  <p className="text-sm text-gray-400 text-center py-4">No builds yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback */}
        {feedbackItems && feedbackItems.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Beta Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedbackItems.map((f) => (
                  <div key={f.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={f.would_pay === 'yes' ? 'default' : f.would_pay === 'maybe' ? 'secondary' : 'destructive'}>
                        Would pay: {f.would_pay}
                      </Badge>
                      {f.price_range && <Badge variant="outline">{f.price_range}</Badge>}
                      {f.overall_rating && <span className="text-sm">{'★'.repeat(f.overall_rating)}</span>}
                    </div>
                    {f.what_would_change && (
                      <p className="text-sm text-gray-600">&ldquo;{f.what_would_change}&rdquo;</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      — {(f.coaches as { name?: string; email: string })?.name || (f.coaches as { email: string })?.email}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
