'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizard } from './wizard-provider';
import { NICHE_OPTIONS, LEAD_SOURCE_OPTIONS, CHANNEL_OPTIONS } from '@/types/intake';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { Pencil } from 'lucide-react';

function getLabelForValue(options: readonly { value: string; label: string }[], value: string) {
  return options.find((o) => o.value === value)?.label || value;
}

export function StepReview() {
  const { data, setStep } = useWizard();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit() {
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get coach record
      const { data: coach } = await supabase
        .from('coaches')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!coach) throw new Error('Coach profile not found');

      // Save intake response
      const { error: intakeError } = await supabase.from('intake_responses').insert({
        coach_id: coach.id,
        coaching_type: data.coaching_type,
        niche: data.niche,
        niche_detail: data.niche_detail,
        business_name: data.business_name,
        years_in_business: data.years_in_business,
        current_client_count: data.current_client_count,
        monthly_revenue_range: data.monthly_revenue_range,
        how_clients_find_you: data.how_clients_find_you,
        current_booking_method: data.current_booking_method,
        lead_to_client_steps: data.lead_to_client_steps,
        services: data.services,
        uses_packages: data.uses_packages,
        payment_structure: data.payment_structure,
        preferred_channels: data.preferred_channels,
        follow_up_frequency: data.follow_up_frequency,
        uses_email_sequences: data.uses_email_sequences,
        biggest_tech_pain: data.biggest_tech_pain,
        raw_answers: data,
        completed_at: new Date().toISOString(),
      });

      if (intakeError) throw intakeError;

      // Update onboarding step
      await supabase
        .from('coaches')
        .update({
          onboarding_step: 'ghl_connect',
          business_name: data.business_name,
        })
        .eq('id', coach.id);

      router.push('/connect');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  }

  const coachingTypeLabels: Record<string, string> = {
    '1on1': '1-on-1 Coaching',
    group: 'Group Coaching',
    course: 'Online Course / Program',
    hybrid: 'Hybrid',
  };

  const yearsLabels: Record<string, string> = {
    pre_launch: 'Pre-launch',
    less_than_1: 'Less than 1 year',
    '1_to_3': '1–3 years',
    '3_to_5': '3–5 years',
    '5_plus': '5+ years',
  };

  const clientLabels: Record<string, string> = {
    '0': 'None yet',
    '1_to_5': '1–5',
    '6_to_20': '6–20',
    '21_to_50': '21–50',
    '50_plus': '50+',
  };

  const revenueLabels: Record<string, string> = {
    pre_revenue: 'Pre-revenue',
    under_5k: 'Under $5k',
    '5k_to_15k': '$5k–$15k',
    '15k_to_50k': '$15k–$50k',
    '50k_plus': '$50k+',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Review Your Answers</h2>
        <p className="text-sm text-gray-500">Make sure everything looks right before we build your CRM.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">{error}</div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Coaching Model</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setStep(0)}>
            <Pencil className="h-3 w-3 mr-1" /> Edit
          </Button>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <p><span className="text-gray-500">Type:</span> {coachingTypeLabels[data.coaching_type || ''] || '—'}</p>
          <p><span className="text-gray-500">Niche:</span> {getLabelForValue(NICHE_OPTIONS, data.niche || '')}</p>
          {data.niche_detail && <p><span className="text-gray-500">Detail:</span> {data.niche_detail}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Business Info</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
            <Pencil className="h-3 w-3 mr-1" /> Edit
          </Button>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <p><span className="text-gray-500">Business:</span> {data.business_name || '—'}</p>
          <p><span className="text-gray-500">Experience:</span> {yearsLabels[data.years_in_business || ''] || '—'}</p>
          <p><span className="text-gray-500">Clients:</span> {clientLabels[data.current_client_count || ''] || '—'}</p>
          <p><span className="text-gray-500">Revenue:</span> {revenueLabels[data.monthly_revenue_range || ''] || '—'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Client Journey</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
            <Pencil className="h-3 w-3 mr-1" /> Edit
          </Button>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div className="flex flex-wrap gap-1">
            {data.how_clients_find_you?.map((s) => (
              <Badge key={s} variant="secondary">{getLabelForValue(LEAD_SOURCE_OPTIONS, s)}</Badge>
            ))}
          </div>
          <p><span className="text-gray-500">Booking:</span> {data.current_booking_method || '—'}</p>
          <p className="text-gray-700">{data.lead_to_client_steps}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Services & Pricing</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setStep(3)}>
            <Pencil className="h-3 w-3 mr-1" /> Edit
          </Button>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          {data.services?.map((s, i) => (
            <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span>{s.name}</span>
              <span className="text-gray-500">{s.price} / {s.duration}</span>
            </div>
          ))}
          <p><span className="text-gray-500">Packages:</span> {data.uses_packages ? 'Yes' : 'No'}</p>
          <p><span className="text-gray-500">Payment:</span> {data.payment_structure || '—'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Communication</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setStep(4)}>
            <Pencil className="h-3 w-3 mr-1" /> Edit
          </Button>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div className="flex flex-wrap gap-1">
            {data.preferred_channels?.map((c) => (
              <Badge key={c} variant="secondary">{getLabelForValue(CHANNEL_OPTIONS, c)}</Badge>
            ))}
          </div>
          <p><span className="text-gray-500">Follow-up:</span> {data.follow_up_frequency || '—'}</p>
          <p><span className="text-gray-500">Email sequences:</span> {data.uses_email_sequences || '—'}</p>
          <p className="text-gray-700 italic">&ldquo;{data.biggest_tech_pain}&rdquo;</p>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={() => setStep(4)}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={loading} size="lg">
          {loading ? 'Saving...' : 'Build My CRM'}
        </Button>
      </div>
    </div>
  );
}
