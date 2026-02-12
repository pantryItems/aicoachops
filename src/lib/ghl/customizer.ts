import { ghlRequest } from './client';
import type { GHLConfigSpec, BuildStep } from '@/types/database';

interface CustomizeOptions {
  apiKey: string;
  locationId: string;
  configSpec: GHLConfigSpec;
}

export async function applyCustomizations({
  apiKey,
  locationId,
  configSpec,
}: CustomizeOptions): Promise<BuildStep[]> {
  const steps: BuildStep[] = [];

  // Step 1: Create tags
  for (const tag of configSpec.customizations.tags) {
    try {
      await ghlRequest({
        method: 'POST',
        path: `/locations/${locationId}/tags`,
        body: { name: tag.name },
        apiKey,
      });
      steps.push({
        step: 'create_tag',
        name: tag.name,
        status: 'success',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      steps.push({
        step: 'create_tag',
        name: tag.name,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Step 2: Create custom fields
  for (const field of configSpec.customizations.custom_fields) {
    try {
      await ghlRequest({
        method: 'POST',
        path: `/locations/${locationId}/customFields`,
        body: {
          name: field.name,
          dataType: field.data_type,
          ...(field.options && { options: field.options }),
        },
        apiKey,
      });
      steps.push({
        step: 'create_custom_field',
        name: field.name,
        status: 'success',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      steps.push({
        step: 'create_custom_field',
        name: field.name,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Step 3: Create email templates
  for (const template of configSpec.customizations.email_templates) {
    try {
      await ghlRequest({
        method: 'POST',
        path: '/emails/builder',
        body: {
          locationId,
          name: template.name,
          subject: template.subject,
          type: 'html',
        },
        apiKey,
      });
      steps.push({
        step: 'create_email_template',
        name: template.name,
        status: 'success',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      steps.push({
        step: 'create_email_template',
        name: template.name,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Step 4: Create calendars
  const calendarConfig = configSpec.customizations.calendar_config;
  for (const [key, name] of Object.entries(calendarConfig)) {
    try {
      await ghlRequest({
        method: 'POST',
        path: '/calendars/',
        body: {
          locationId,
          name,
          description: key === 'discovery_call_name'
            ? 'Book a free discovery call to see if we\'re a good fit.'
            : 'Your coaching session calendar.',
          eventType: 'RoundRobin_OptimizeForAvailability',
          slotDuration: key === 'discovery_call_name' ? 30 : 60,
        },
        apiKey,
      });
      steps.push({
        step: 'create_calendar',
        name,
        status: 'success',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      steps.push({
        step: 'create_calendar',
        name,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  return steps;
}
