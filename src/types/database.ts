export type OnboardingStep = 'signup' | 'intake' | 'ghl_connect' | 'building' | 'complete';

export type BuildStatus = 'pending' | 'analyzing' | 'configuring' | 'applying' | 'completed' | 'failed';

export interface Coach {
  id: string;
  auth_user_id: string;
  email: string;
  name: string | null;
  business_name: string | null;
  ghl_location_id: string | null;
  ghl_api_key: string | null;
  ghl_connected_at: string | null;
  onboarding_step: OnboardingStep;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface IntakeResponse {
  id: string;
  coach_id: string;
  coaching_type: string;
  niche: string | null;
  niche_detail: string | null;
  business_name: string | null;
  years_in_business: string | null;
  current_client_count: string | null;
  monthly_revenue_range: string | null;
  how_clients_find_you: string[];
  current_booking_method: string | null;
  lead_to_client_steps: string | null;
  services: ServiceItem[];
  uses_packages: boolean | null;
  payment_structure: string | null;
  preferred_channels: string[];
  follow_up_frequency: string | null;
  uses_email_sequences: string | null;
  biggest_tech_pain: string | null;
  raw_answers: Record<string, unknown> | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceItem {
  name: string;
  price: string;
  duration: string;
  type: string;
}

export interface Build {
  id: string;
  coach_id: string;
  intake_id: string;
  ai_analysis: Record<string, unknown> | null;
  selected_archetype: string | null;
  config_spec: GHLConfigSpec | null;
  customization_status: string;
  customization_steps: BuildStep[];
  tags_created: string[];
  custom_fields_created: string[];
  templates_created: string[];
  calendars_created: string[];
  status: BuildStatus;
  error_log: BuildError[];
  created_at: string;
  updated_at: string;
}

export interface BuildStep {
  step: string;
  name: string;
  status: 'pending' | 'success' | 'failed';
  error?: string;
  timestamp?: string;
}

export interface BuildError {
  step: string;
  error: string;
  timestamp: string;
}

export interface GHLConfigSpec {
  archetype: string;
  archetype_reasoning: string;
  customizations: {
    tags: Array<{ name: string; description: string }>;
    custom_fields: Array<{
      name: string;
      field_key: string;
      data_type: 'TEXT' | 'NUMBER' | 'DATE' | 'SINGLE_OPTIONS' | 'MULTIPLE_OPTIONS' | 'CHECKBOX';
      options?: string[];
      description: string;
    }>;
    calendar_config: {
      discovery_call_name: string;
      coaching_session_name: string;
    };
    email_templates: Array<{
      name: string;
      subject: string;
      purpose: string;
      body_outline: string;
    }>;
    branding: {
      business_name: string;
      niche_label: string;
      welcome_message: string;
    };
    automation_config: {
      follow_up_speed: 'immediate' | 'same_day' | 'next_day';
      preferred_channels: string[];
    };
  };
  build_notes: string;
}

export interface Snapshot {
  id: string;
  name: string;
  archetype: string;
  description: string | null;
  includes_pipelines: string[];
  includes_workflows: string[];
  includes_calendars: string[];
  includes_templates: string[];
  customizable_tags: Record<string, unknown> | null;
  customizable_fields: Record<string, unknown> | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Feedback {
  id: string;
  coach_id: string;
  build_id: string;
  would_pay: string;
  price_range: string | null;
  what_would_change: string | null;
  overall_rating: number | null;
  created_at: string;
}
