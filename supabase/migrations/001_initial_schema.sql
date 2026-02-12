-- AI CoachOps Database Schema

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- coaches: core user profile
-- ============================================
CREATE TABLE coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  business_name TEXT,

  -- GHL connection (private integration for beta)
  ghl_location_id TEXT,
  ghl_api_key TEXT,          -- encrypted at application level
  ghl_connected_at TIMESTAMPTZ,

  -- Onboarding state machine
  onboarding_step TEXT NOT NULL DEFAULT 'signup'
    CHECK (onboarding_step IN ('signup', 'intake', 'ghl_connect', 'building', 'complete')),

  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coaches_auth_user ON coaches(auth_user_id);

-- ============================================
-- intake_responses: wizard answers
-- ============================================
CREATE TABLE intake_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,

  -- Step 1: Coaching Model
  coaching_type TEXT,
  niche TEXT,
  niche_detail TEXT,

  -- Step 2: Business Info
  business_name TEXT,
  years_in_business TEXT,
  current_client_count TEXT,
  monthly_revenue_range TEXT,

  -- Step 3: Client Journey
  how_clients_find_you TEXT[] DEFAULT '{}',
  current_booking_method TEXT,
  lead_to_client_steps TEXT,

  -- Step 4: Services & Pricing
  services JSONB DEFAULT '[]',
  uses_packages BOOLEAN,
  payment_structure TEXT,

  -- Step 5: Communication
  preferred_channels TEXT[] DEFAULT '{}',
  follow_up_frequency TEXT,
  uses_email_sequences TEXT,
  biggest_tech_pain TEXT,

  -- Meta
  raw_answers JSONB,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_intake_coach ON intake_responses(coach_id);

-- ============================================
-- builds: GHL configuration builds
-- ============================================
CREATE TABLE builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  intake_id UUID NOT NULL REFERENCES intake_responses(id),

  -- AI analysis
  ai_analysis JSONB,
  selected_archetype TEXT,
  config_spec JSONB,

  -- Customization tracking
  customization_status TEXT DEFAULT 'pending',
  customization_steps JSONB DEFAULT '[]',

  -- Results
  tags_created TEXT[] DEFAULT '{}',
  custom_fields_created TEXT[] DEFAULT '{}',
  templates_created TEXT[] DEFAULT '{}',
  calendars_created TEXT[] DEFAULT '{}',

  -- Status
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'analyzing', 'configuring', 'applying', 'completed', 'failed')),
  error_log JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_builds_coach ON builds(coach_id);
CREATE INDEX idx_builds_status ON builds(status);

-- ============================================
-- snapshots: admin-managed snapshot registry
-- ============================================
CREATE TABLE snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  archetype TEXT NOT NULL UNIQUE,
  description TEXT,
  includes_pipelines TEXT[] DEFAULT '{}',
  includes_workflows TEXT[] DEFAULT '{}',
  includes_calendars TEXT[] DEFAULT '{}',
  includes_templates TEXT[] DEFAULT '{}',
  customizable_tags JSONB,
  customizable_fields JSONB,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- feedback: beta validation responses
-- ============================================
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  build_id UUID REFERENCES builds(id),
  would_pay TEXT NOT NULL,        -- 'yes', 'no', 'maybe'
  price_range TEXT,               -- '$99/mo', '$199/mo', '$299/mo', 'other'
  what_would_change TEXT,
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feedback_coach ON feedback(coach_id);

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;

-- Coaches can read/update their own data
CREATE POLICY "coaches_own_data" ON coaches
  FOR ALL USING (auth_user_id = auth.uid());

-- Intake responses scoped to coach
CREATE POLICY "intake_own_data" ON intake_responses
  FOR ALL USING (coach_id IN (SELECT id FROM coaches WHERE auth_user_id = auth.uid()));

-- Builds scoped to coach
CREATE POLICY "builds_own_data" ON builds
  FOR ALL USING (coach_id IN (SELECT id FROM coaches WHERE auth_user_id = auth.uid()));

-- Feedback scoped to coach
CREATE POLICY "feedback_own_data" ON feedback
  FOR ALL USING (coach_id IN (SELECT id FROM coaches WHERE auth_user_id = auth.uid()));

-- Snapshots readable by all authenticated users
CREATE POLICY "snapshots_read_all" ON snapshots
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admin policies (full access)
CREATE POLICY "admin_coaches" ON coaches
  FOR ALL USING (
    EXISTS (SELECT 1 FROM coaches WHERE auth_user_id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "admin_intake" ON intake_responses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM coaches WHERE auth_user_id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "admin_builds" ON builds
  FOR ALL USING (
    EXISTS (SELECT 1 FROM coaches WHERE auth_user_id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "admin_snapshots" ON snapshots
  FOR ALL USING (
    EXISTS (SELECT 1 FROM coaches WHERE auth_user_id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "admin_feedback" ON feedback
  FOR ALL USING (
    EXISTS (SELECT 1 FROM coaches WHERE auth_user_id = auth.uid() AND is_admin = TRUE)
  );

-- ============================================
-- Auto-create coach profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.coaches (auth_user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER coaches_updated_at BEFORE UPDATE ON coaches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER intake_updated_at BEFORE UPDATE ON intake_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER builds_updated_at BEFORE UPDATE ON builds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
