import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ArrowRight, ClipboardList, Plug, Hammer } from 'lucide-react';
import { FeedbackSurvey } from '@/components/dashboard/feedback-survey';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: coach } = await supabase
    .from('coaches')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  if (!coach) redirect('/login');

  const step = coach.onboarding_step;

  // Get latest build if exists
  const { data: latestBuild } = await supabase
    .from('builds')
    .select('*')
    .eq('coach_id', coach.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const steps = [
    {
      id: 'intake',
      label: 'Complete Intake',
      description: 'Answer 5 quick questions about your coaching business',
      icon: ClipboardList,
      href: '/intake',
      done: ['ghl_connect', 'building', 'complete'].includes(step),
      current: step === 'intake' || step === 'signup',
    },
    {
      id: 'ghl_connect',
      label: 'Connect GHL',
      description: 'Link your Go High Level account',
      icon: Plug,
      href: '/connect',
      done: ['building', 'complete'].includes(step),
      current: step === 'ghl_connect',
    },
    {
      id: 'building',
      label: 'Build CRM',
      description: 'AI configures your GHL with custom tags, fields, templates, and calendars',
      icon: Hammer,
      href: '/build',
      done: step === 'complete',
      current: step === 'building',
    },
  ];

  if (step === 'complete' && latestBuild) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Your CRM is Ready!</h1>
          <p className="text-gray-500">
            We configured {latestBuild.tags_created?.length || 0} tags,{' '}
            {latestBuild.custom_fields_created?.length || 0} custom fields,{' '}
            {latestBuild.templates_created?.length || 0} email templates, and{' '}
            {latestBuild.calendars_created?.length || 0} calendars in your GHL account.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Build Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Archetype</span>
              <Badge>{latestBuild.selected_archetype}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Status</span>
              <Badge variant={latestBuild.status === 'completed' ? 'default' : 'destructive'}>
                {latestBuild.status}
              </Badge>
            </div>
            {latestBuild.tags_created?.length > 0 && (
              <div>
                <span className="text-sm text-gray-500 block mb-1">Tags Created</span>
                <div className="flex flex-wrap gap-1">
                  {latestBuild.tags_created.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feedback Survey */}
        <div className="mt-6">
          <FeedbackSurvey coachId={coach.id} buildId={latestBuild.id} />
        </div>

        <div className="mt-6 text-center">
          <Link href="/build">
            <Button variant="outline">View Full Build Details</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">
          Welcome{coach.name ? `, ${coach.name}` : ''}!
        </h1>
        <p className="text-gray-500">
          Let&apos;s get your coaching CRM set up. Three quick steps and you&apos;re live.
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((s, index) => (
          <Card
            key={s.id}
            className={`transition-all ${
              s.current ? 'border-blue-500 shadow-md' : s.done ? 'opacity-75' : 'opacity-50'
            }`}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  s.done
                    ? 'bg-green-100 text-green-600'
                    : s.current
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {s.done ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <s.icon className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{s.label}</h3>
                <p className="text-sm text-gray-500">{s.description}</p>
              </div>
              {s.current && (
                <Link href={s.href}>
                  <Button size="sm">
                    Start <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              )}
              {s.done && <Badge variant="secondary">Done</Badge>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
