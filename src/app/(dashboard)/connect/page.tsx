'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

export default function ConnectGHLPage() {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const router = useRouter();

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

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
      if (!coach) throw new Error('Coach not found');

      // Validate API key by trying to fetch locations
      const res = await fetch('https://services.leadconnectorhq.com/locations/search', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Version: '2021-07-28',
        },
      });

      if (!res.ok) {
        throw new Error('Invalid API key. Make sure you copied the full key from GHL.');
      }

      const data = await res.json();
      if (!data.locations || data.locations.length === 0) {
        throw new Error('No locations found. Make sure your API key has location access.');
      }

      const location = data.locations[0];

      // Save to database
      await supabase
        .from('coaches')
        .update({
          ghl_api_key: apiKey,
          ghl_location_id: location.id,
          ghl_connected_at: new Date().toISOString(),
          onboarding_step: 'building',
        })
        .eq('id', coach.id);

      setConnected(true);

      // Get the latest intake to start the build
      const { data: intake } = await supabase
        .from('intake_responses')
        .select('id')
        .eq('coach_id', coach.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (intake) {
        // Trigger AI analysis
        const analyzeRes = await fetch('/api/intake/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coachId: coach.id, intakeId: intake.id }),
        });

        if (analyzeRes.ok) {
          const { buildId } = await analyzeRes.json();

          // Trigger GHL build
          await fetch('/api/build/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ buildId }),
          });
        }
      }

      // Navigate to build progress
      setTimeout(() => {
        router.push('/build');
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Connect Go High Level</h1>
        <p className="text-gray-500">
          Link your GHL account so we can configure your CRM automatically.
        </p>
      </div>

      {/* Instructions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">How to get your API key</CardTitle>
          <CardDescription>Follow these steps in your GHL account:</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-2">
              <span className="font-bold text-blue-600 shrink-0">1.</span>
              <span>
                Log into your Go High Level account at{' '}
                <a
                  href="https://app.gohighlevel.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  app.gohighlevel.com <ExternalLink className="h-3 w-3" />
                </a>
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-blue-600 shrink-0">2.</span>
              <span>Go to <strong>Settings</strong> → <strong>Integrations</strong></span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-blue-600 shrink-0">3.</span>
              <span>Click <strong>Create Private Integration</strong></span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-blue-600 shrink-0">4.</span>
              <span>Name it &ldquo;AI CoachOps&rdquo; and grant all permissions</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-blue-600 shrink-0">5.</span>
              <span>Copy the <strong>API Key</strong> and paste it below</span>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Connection form */}
      <Card>
        <CardContent className="pt-6">
          {connected ? (
            <div className="text-center py-6">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-1">Connected!</h3>
              <p className="text-sm text-gray-500">Building your CRM now...</p>
            </div>
          ) : (
            <form onSubmit={handleConnect} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 bg-red-50 text-red-600 text-sm p-3 rounded-md">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="apiKey">GHL API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your GHL API key here"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !apiKey}>
                {loading ? 'Connecting & Building...' : 'Connect & Build My CRM'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
