import { z } from 'zod';

// Step 1: Coaching Model
export const coachingModelSchema = z.object({
  coaching_type: z.enum(['1on1', 'group', 'course', 'hybrid']),
  niche: z.string().min(1, 'Please select a niche'),
  niche_detail: z.string().optional(),
});

// Step 2: Business Info
export const businessInfoSchema = z.object({
  business_name: z.string().min(1, 'Business name is required'),
  years_in_business: z.enum(['pre_launch', 'less_than_1', '1_to_3', '3_to_5', '5_plus']),
  current_client_count: z.enum(['0', '1_to_5', '6_to_20', '21_to_50', '50_plus']),
  monthly_revenue_range: z.enum(['pre_revenue', 'under_5k', '5k_to_15k', '15k_to_50k', '50k_plus']),
});

// Step 3: Client Journey
export const clientJourneySchema = z.object({
  how_clients_find_you: z.array(z.string()).min(1, 'Select at least one'),
  current_booking_method: z.string().min(1, 'Please select one'),
  lead_to_client_steps: z.string().min(10, 'Please describe your process (at least a few sentences)'),
});

// Step 4: Services & Pricing
export const serviceItemSchema = z.object({
  name: z.string().min(1),
  price: z.string().min(1),
  duration: z.string().min(1),
  type: z.enum(['1on1', 'group', 'course', 'other']),
});

export const servicesPricingSchema = z.object({
  services: z.array(serviceItemSchema).min(1, 'Add at least one service'),
  uses_packages: z.boolean(),
  payment_structure: z.enum(['per_session', 'monthly', 'package', 'mix']),
});

// Step 5: Communication
export const communicationSchema = z.object({
  preferred_channels: z.array(z.string()).min(1, 'Select at least one'),
  follow_up_frequency: z.enum(['same_day', 'few_days', 'weekly', 'when_i_remember']),
  uses_email_sequences: z.enum(['yes', 'no', 'whats_that']),
  biggest_tech_pain: z.string().min(5, 'Tell us about your biggest tech challenge'),
});

// Full intake form
export const fullIntakeSchema = coachingModelSchema
  .merge(businessInfoSchema)
  .merge(clientJourneySchema)
  .merge(servicesPricingSchema)
  .merge(communicationSchema);

export type CoachingModelData = z.infer<typeof coachingModelSchema>;
export type BusinessInfoData = z.infer<typeof businessInfoSchema>;
export type ClientJourneyData = z.infer<typeof clientJourneySchema>;
export type ServicesPricingData = z.infer<typeof servicesPricingSchema>;
export type CommunicationData = z.infer<typeof communicationSchema>;
export type FullIntakeData = z.infer<typeof fullIntakeSchema>;
export type ServiceItem = z.infer<typeof serviceItemSchema>;

export const NICHE_OPTIONS = [
  { value: 'executive', label: 'Executive / Leadership' },
  { value: 'life', label: 'Life Coaching' },
  { value: 'business', label: 'Business / Entrepreneurship' },
  { value: 'fitness', label: 'Fitness & Health' },
  { value: 'career', label: 'Career / Job Transition' },
  { value: 'relationship', label: 'Relationship' },
  { value: 'mindset', label: 'Mindset / Performance' },
  { value: 'financial', label: 'Financial' },
  { value: 'spiritual', label: 'Spiritual / Wellness' },
  { value: 'other', label: 'Other' },
] as const;

export const LEAD_SOURCE_OPTIONS = [
  { value: 'social_media', label: 'Social Media' },
  { value: 'referrals', label: 'Referrals / Word of Mouth' },
  { value: 'paid_ads', label: 'Paid Ads (Facebook, Google, etc.)' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'speaking', label: 'Speaking Engagements' },
  { value: 'website_seo', label: 'Website / SEO' },
  { value: 'networking', label: 'Networking Events' },
  { value: 'other', label: 'Other' },
] as const;

export const CHANNEL_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS / Text' },
  { value: 'phone', label: 'Phone Calls' },
  { value: 'social_dm', label: 'Social Media DMs' },
] as const;
