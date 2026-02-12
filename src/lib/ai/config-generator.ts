import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT, formatIntakePrompt } from './prompts';
import type { GHLConfigSpec } from '@/types/database';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateBuildConfig(
  intakeData: Record<string, unknown>
): Promise<GHLConfigSpec> {
  const userPrompt = formatIntakePrompt(intakeData);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from AI');
  }

  // Parse JSON from response (handle possible markdown wrapping)
  let jsonStr = textBlock.text.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  let config: GHLConfigSpec;
  try {
    config = JSON.parse(jsonStr);
  } catch {
    // Retry with explicit JSON-only instruction
    const retryResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      system: SYSTEM_PROMPT + '\n\nIMPORTANT: Output ONLY valid JSON. No markdown, no explanation, no code blocks. Just the JSON object.',
      messages: [{ role: 'user', content: userPrompt }],
    });

    const retryBlock = retryResponse.content.find((b) => b.type === 'text');
    if (!retryBlock || retryBlock.type !== 'text') {
      throw new Error('No text response from AI on retry');
    }

    config = JSON.parse(retryBlock.text.trim());
  }

  // Basic validation
  if (!config.archetype || !config.customizations) {
    throw new Error('Invalid config spec: missing required fields');
  }

  return config;
}
