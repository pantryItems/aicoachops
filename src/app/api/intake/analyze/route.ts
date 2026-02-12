import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateBuildConfig } from '@/lib/ai/config-generator';

export async function POST(request: Request) {
  try {
    const { coachId, intakeId } = await request.json();

    if (!coachId || !intakeId) {
      return NextResponse.json({ error: 'Missing coachId or intakeId' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get intake data
    const { data: intake, error: intakeError } = await supabase
      .from('intake_responses')
      .select('*')
      .eq('id', intakeId)
      .single();

    if (intakeError || !intake) {
      return NextResponse.json({ error: 'Intake not found' }, { status: 404 });
    }

    // Create a build record
    const { data: build, error: buildError } = await supabase
      .from('builds')
      .insert({
        coach_id: coachId,
        intake_id: intakeId,
        status: 'analyzing',
      })
      .select()
      .single();

    if (buildError || !build) {
      return NextResponse.json({ error: 'Failed to create build' }, { status: 500 });
    }

    // Generate config with Claude AI
    const configSpec = await generateBuildConfig(intake);

    // Update build with AI results
    await supabase
      .from('builds')
      .update({
        ai_analysis: intake,
        selected_archetype: configSpec.archetype,
        config_spec: configSpec,
        status: 'configuring',
      })
      .eq('id', build.id);

    return NextResponse.json({ buildId: build.id, configSpec });
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
