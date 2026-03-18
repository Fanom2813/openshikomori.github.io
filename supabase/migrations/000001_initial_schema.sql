-- OpenShikomori Supabase Setup Script
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql/new

-- Enable pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABLES
-- ============================================

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  display_name TEXT,
  avatar TEXT,
  home_island TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  contribution_count INTEGER DEFAULT 0,
  last_contributed_at TIMESTAMPTZ
);

-- Clips table
CREATE TABLE IF NOT EXISTS clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  contributed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  duration INTEGER NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('comorian', 'french', 'arabic')),
  dialect TEXT CHECK (dialect IN ('shingazidja', 'shindzuani', 'shimwali', 'shimaore')),
  transcription TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  correction_count INTEGER DEFAULT 0,
  is_duplicate BOOLEAN DEFAULT FALSE
);

-- Corrections table
CREATE TABLE IF NOT EXISTS corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  clip_id UUID NOT NULL REFERENCES clips(id) ON DELETE CASCADE,
  original_text TEXT NOT NULL,
  suggested_text TEXT NOT NULL,
  suggested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ
);

-- Admin config table
CREATE TABLE IF NOT EXISTS admin_config (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_clips_contributed_by ON clips(contributed_by);
CREATE INDEX IF NOT EXISTS idx_clips_status ON clips(status);
CREATE INDEX IF NOT EXISTS idx_clips_language ON clips(language);
CREATE INDEX IF NOT EXISTS idx_corrections_clip_id ON corrections(clip_id);
CREATE INDEX IF NOT EXISTS idx_corrections_suggested_by ON corrections(suggested_by);
CREATE INDEX IF NOT EXISTS idx_corrections_status ON corrections(status);
CREATE INDEX IF NOT EXISTS idx_users_is_public ON users(is_public);
CREATE INDEX IF NOT EXISTS idx_users_contribution_count ON users(contribution_count DESC);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to increment user contribution count
CREATE OR REPLACE FUNCTION increment_contribution_count(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET contribution_count = contribution_count + 1,
      last_contributed_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment clip correction count
CREATE OR REPLACE FUNCTION increment_correction_count(clip_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE clips
  SET correction_count = correction_count + 1
  WHERE id = clip_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Public profiles are viewable"
  ON users FOR SELECT
  TO authenticated
  USING (is_public = TRUE);

-- Clips table policies
CREATE POLICY "Approved clips are viewable"
  ON clips FOR SELECT
  TO authenticated
  USING (status = 'approved');

CREATE POLICY "Users can view own clips"
  ON clips FOR SELECT
  TO authenticated
  USING (contributed_by = auth.uid());

CREATE POLICY "Authenticated users can create clips"
  ON clips FOR INSERT
  TO authenticated
  WITH CHECK (contributed_by = auth.uid());

CREATE POLICY "Admins can update clips"
  ON clips FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_config WHERE user_id = auth.uid()));

-- Corrections table policies
CREATE POLICY "Users can view own corrections"
  ON corrections FOR SELECT
  TO authenticated
  USING (suggested_by = auth.uid());

CREATE POLICY "Admins can view all corrections"
  ON corrections FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_config WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can create corrections"
  ON corrections FOR INSERT
  TO authenticated
  WITH CHECK (suggested_by = auth.uid());

CREATE POLICY "Admins can update corrections"
  ON corrections FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_config WHERE user_id = auth.uid()));

-- Admin config policies
CREATE POLICY "Only admins can access admin_config"
  ON admin_config FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- SETUP INSTRUCTIONS
-- ============================================

-- 1. Enable Anonymous Sign-Ins in your Supabase Dashboard:
--    Authentication > Providers > Anonymous > Enable

-- 2. Enable Email provider for admin login:
--    Authentication > Providers > Email > Enable
--    Disable "Confirm email" for easier admin setup (or keep enabled for security)

-- 3. Create your admin user (run this after setting up Email provider):
--    Go to Authentication > Users > Add User
--    Enter your email and password
--    Copy the user's UUID

-- 4. Add the user to admin_config (replace with your actual UUID from step 3):
--    INSERT INTO admin_config (user_id, role) VALUES ('your-user-uuid-here', 'superadmin');

-- 5. Set your environment variables:
--    VITE_SUPABASE_URL=https://your-project.supabase.co
--    VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key
--    VITE_R2_WORKER_URL=https://your-worker.workers.dev

-- ============================================
-- CREATING ADDITIONAL ADMINS
-- ============================================
-- To add more admins:
-- 1. Have them sign up via /admin/login (they can't access dashboard yet)
-- 2. Find their user ID in Authentication > Users
-- 3. Run: INSERT INTO admin_config (user_id, role) VALUES ('their-uuid', 'admin');
