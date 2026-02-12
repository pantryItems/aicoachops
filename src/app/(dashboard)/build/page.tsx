import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function StepIcon({ status }: { status: string }) {
  switch (status) {
    case 'success':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-gray-400" />;
    default:
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
  }
}

export default async function BuildPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: coach } = await supabase
    .from('coaches')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();
  if (!coach) redirect('/login');

  const { data: build } = await supabase
    .from('builds')
    .select('*')
    .eq('coach_id', coach.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!build) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-2">No Build Found</h1>
        <p className="text-gray-500 mb-4">Complete the intake and connect GHL first.</p>
        <Link href="/dashboard">
          <Button>Go to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const steps = (build.customization_steps || []) as Array<{
    step: string;
    name: string;
    status: string;
    error?: string;
  }>;

  const statusColors: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-700',
    analyzing: 'bg-blue-100 text-blue-700',
    configuring: 'bg-blue-100 text-blue-700',
    applying: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
  };

  const stepLabels: Record<string, string> = {
    create_tag: 'Tag',
    create_custom_field: 'Custom Field',
    create_email_template: 'Email Template',
    create_calendar: 'Calendar',
  };

  const isComplete = build.status === 'completed';
  const configSpec = build.config_spec as Record<string, unknown> | null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Build Progress</h1>
          <p className="text-gray-500">
            {isComplete
              ? 'Your CRM has been configured!'
              : 'AI is building your CRM...'}
          </p>
        </div>
        <Badge className={statusColors[build.status] || ''}>
          {build.status}
        </Badge>
      </div>

      {/* AI Analysis */}
      {configSpec && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">AI Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Archetype</span>
              <Badge variant="secondary">{build.selected_archetype}</Badge>
            </div>
            {(configSpec as { build_notes?: string }).build_notes && (
              <p className="text-gray-600 mt-2">
                {(configSpec as { build_notes: string }).build_notes}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Build Steps */}
      {steps.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Configuration Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2 border-b last:border-0"
                >
                  <StepIcon status={step.status} />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{step.name}</span>
                    <span className="text-xs text-gray-400 ml-2">
                      {stepLabels[step.step] || step.step}
                    </span>
                  </div>
                  {step.error && (
                    <span className="text-xs text-red-500 max-w-[200px] truncate">
                      {step.error}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {isComplete && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">What Was Built</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">{build.tags_created?.length || 0}</div>
              <div className="text-xs text-gray-500">Tags</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">{build.custom_fields_created?.length || 0}</div>
              <div className="text-xs text-gray-500">Custom Fields</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">{build.templates_created?.length || 0}</div>
              <div className="text-xs text-gray-500">Email Templates</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">{build.calendars_created?.length || 0}</div>
              <div className="text-xs text-gray-500">Calendars</div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
        {isComplete && (
          <a
            href="https://app.gohighlevel.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button>Open GHL</Button>
          </a>
        )}
      </div>
    </div>
  );
}
