import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { applyCustomizations } from '@/lib/ghl/customizer';
import type { GHLConfigSpec } from '@/types/database';

export async function POST(request: Request) {
  try {
    const { buildId } = await request.json();

    if (!buildId) {
      return NextResponse.json({ error: 'Missing buildId' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get build with coach data
    const { data: build, error: buildError } = await supabase
      .from('builds')
      .select('*, coaches!builds_coach_id_fkey(ghl_api_key, ghl_location_id)')
      .eq('id', buildId)
      .single();

    if (buildError || !build) {
      return NextResponse.json({ error: 'Build not found' }, { status: 404 });
    }

    const coach = (build as Record<string, unknown>).coaches as { ghl_api_key: string; ghl_location_id: string } | null;

    if (!coach?.ghl_api_key || !coach?.ghl_location_id) {
      return NextResponse.json({ error: 'GHL not connected' }, { status: 400 });
    }

    if (!build.config_spec) {
      return NextResponse.json({ error: 'No config spec — run analyze first' }, { status: 400 });
    }

    // Update status to applying
    await supabase
      .from('builds')
      .update({ status: 'applying' })
      .eq('id', buildId);

    // Apply customizations to GHL
    const steps = await applyCustomizations({
      apiKey: coach.ghl_api_key,
      locationId: coach.ghl_location_id,
      configSpec: build.config_spec as GHLConfigSpec,
    });

    // Determine final status
    const allSuccess = steps.every((s) => s.status === 'success');
    const anySuccess = steps.some((s) => s.status === 'success');
    const finalStatus = allSuccess ? 'completed' : anySuccess ? 'completed' : 'failed';

    // Update build with results
    await supabase
      .from('builds')
      .update({
        customization_steps: steps,
        customization_status: allSuccess ? 'completed' : 'partial',
        status: finalStatus,
        tags_created: steps.filter((s) => s.step === 'create_tag' && s.status === 'success').map((s) => s.name),
        custom_fields_created: steps.filter((s) => s.step === 'create_custom_field' && s.status === 'success').map((s) => s.name),
        templates_created: steps.filter((s) => s.step === 'create_email_template' && s.status === 'success').map((s) => s.name),
        calendars_created: steps.filter((s) => s.step === 'create_calendar' && s.status === 'success').map((s) => s.name),
        error_log: steps.filter((s) => s.status === 'failed').map((s) => ({
          step: `${s.step}: ${s.name}`,
          error: s.error || 'Unknown error',
          timestamp: s.timestamp || new Date().toISOString(),
        })),
      })
      .eq('id', buildId);

    // Update coach onboarding step
    if (finalStatus === 'completed') {
      await supabase
        .from('coaches')
        .update({ onboarding_step: 'complete' })
        .eq('id', build.coach_id);
    }

    return NextResponse.json({ status: finalStatus, steps });
  } catch (error) {
    console.error('Build execute error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
