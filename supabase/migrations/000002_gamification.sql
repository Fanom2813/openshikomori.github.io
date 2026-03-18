-- OpenShikomori Gamification Schema
-- Adds tables for stats, badges, streaks, and contribution tracking

-- ============================================
-- USER STATS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- XP and Level
  xp_total INTEGER DEFAULT 0,
  xp_daily INTEGER DEFAULT 0,
  xp_daily_reset_at TIMESTAMPTZ DEFAULT NOW(),

  -- Streak tracking
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_contribution_date DATE,
  streak_freeze_used BOOLEAN DEFAULT FALSE,
  streak_freeze_reset_at TIMESTAMPTZ DEFAULT NOW(),

  -- Daily goals
  daily_goal INTEGER DEFAULT 10,
  daily_progress INTEGER DEFAULT 0,
  daily_goal_completed_at TIMESTAMPTZ,

  -- Contribution counts
  recordings_count INTEGER DEFAULT 0,
  corrections_count INTEGER DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,

  -- Word count estimate
  words_preserved INTEGER DEFAULT 0
);

-- ============================================
-- BADGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('volume', 'consistency', 'quality', 'special')),
  tier INTEGER NOT NULL CHECK (tier IN (1, 2, 3)), -- Bronze, Silver, Gold
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 0
);

-- ============================================
-- USER BADGES TABLE (Many-to-Many)
-- ============================================

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- ============================================
-- CONTRIBUTION ACTIVITY LOG
-- ============================================

CREATE TABLE IF NOT EXISTS contribution_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('recording', 'correction', 'review')),
  reference_id UUID, -- Can reference clips.id or corrections.id
  xp_earned INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'
);

-- ============================================
-- INSERT DEFAULT BADGES
-- ============================================

INSERT INTO badges (id, name, description, icon, category, tier, requirement_type, requirement_value, xp_reward) VALUES
-- Volume badges
('first_steps', 'First Steps', 'Made your first contribution', 'sprout', 'volume', 1, 'total_contributions', 1, 10),
('contributor_10', 'Rising Contributor', '10 contributions', 'zap', 'volume', 1, 'total_contributions', 10, 50),
('contributor_50', 'Active Contributor', '50 contributions', 'award', 'volume', 2, 'total_contributions', 50, 100),
('contributor_100', 'Master Contributor', '100 contributions', 'trophy', 'volume', 3, 'total_contributions', 100, 250),
('contributor_500', 'Legendary Contributor', '500 contributions', 'crown', 'volume', 3, 'total_contributions', 500, 1000),

-- Consistency badges
('streak_3', 'On Fire', '3-day contribution streak', 'flame', 'consistency', 1, 'streak_days', 3, 30),
('streak_7', 'Perfect Week', '7-day contribution streak', 'calendar', 'consistency', 2, 'streak_days', 7, 100),
('streak_30', 'Monthly Master', '30-day contribution streak', 'calendar-check', 'consistency', 3, 'streak_days', 30, 500),
('daily_goal_1', 'Goal Getter', 'Complete daily goal once', 'target', 'consistency', 1, 'daily_goals_completed', 1, 20),
('daily_goal_10', 'Goal Crusher', 'Complete daily goal 10 times', 'target', 'consistency', 2, 'daily_goals_completed', 10, 100),

-- Quality badges
('corrections_10', 'Editor', 'Submit 10 corrections', 'edit-3', 'quality', 1, 'corrections', 10, 50),
('corrections_50', 'Proofreader', 'Submit 50 corrections', 'check-circle', 'quality', 2, 'corrections', 50, 150),
('recordings_25', 'Voice Contributor', '25 recordings', 'mic', 'volume', 1, 'recordings', 25, 50),
('recordings_100', 'Voice Master', '100 recordings', 'mic', 'volume', 2, 'recordings', 100, 250)

ON CONFLICT (id) DO NOTHING;

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(id);
CREATE INDEX IF NOT EXISTS idx_user_stats_streak ON user_stats(current_streak DESC);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_contribution_activity_user_id ON contribution_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_contribution_activity_created_at ON contribution_activity(created_at DESC);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_stats table
CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON user_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate streak
CREATE OR REPLACE FUNCTION calculate_streak(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  last_date DATE;
  current_streak_val INTEGER;
  today DATE := CURRENT_DATE;
  yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
BEGIN
  SELECT last_contribution_date, current_streak
  INTO last_date, current_streak_val
  FROM user_stats
  WHERE id = user_uuid;

  -- If no previous contribution, streak is 0
  IF last_date IS NULL THEN
    RETURN 0;
  END IF;

  -- If last contribution was today, return current streak
  IF last_date = today THEN
    RETURN current_streak_val;
  END IF;

  -- If last contribution was yesterday, streak continues
  IF last_date = yesterday THEN
    RETURN current_streak_val;
  END IF;

  -- Streak broken
  RETURN 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record contribution activity and update stats
CREATE OR REPLACE FUNCTION record_contribution(
  user_uuid UUID,
  activity_type TEXT,
  reference_id UUID DEFAULT NULL,
  metadata JSONB DEFAULT '{}'
)
RETURNS TABLE (
  xp_earned INTEGER,
  streak_updated BOOLEAN,
  badge_earned TEXT
) AS $$
DECLARE
  xp_amount INTEGER := 0;
  today DATE := CURRENT_DATE;
  yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
  last_date DATE;
  current_streak_val INTEGER;
  best_streak_val INTEGER;
  new_badge TEXT;
BEGIN
  -- Determine XP based on activity type
  xp_amount := CASE activity_type
    WHEN 'recording' THEN 10
    WHEN 'correction' THEN 5
    WHEN 'review' THEN 3
    ELSE 0
  END;

  -- Get current stats
  SELECT last_contribution_date, current_streak, best_streak
  INTO last_date, current_streak_val, best_streak_val
  FROM user_stats
  WHERE id = user_uuid;

  -- If no stats record exists, create one
  IF NOT FOUND THEN
    INSERT INTO user_stats (id, xp_total, xp_daily, current_streak, best_streak, last_contribution_date, recordings_count, corrections_count, words_preserved)
    VALUES (user_uuid, xp_amount, xp_amount, 1, 1, today,
      CASE WHEN activity_type = 'recording' THEN 1 ELSE 0 END,
      CASE WHEN activity_type = 'correction' THEN 1 ELSE 0 END,
      CASE WHEN activity_type = 'recording' THEN 50 ELSE 0 END
    );
    current_streak_val := 1;
    best_streak_val := 1;
  ELSE
    -- Update streak
    IF last_date IS NULL OR last_date < yesterday THEN
      -- Streak broken or first contribution
      current_streak_val := 1;
    ELSIF last_date = yesterday THEN
      -- Continue streak
      current_streak_val := current_streak_val + 1;
    ELSIF last_date = today THEN
      -- Already contributed today, keep streak
      NULL;
    END IF;

    -- Update best streak if needed
    IF current_streak_val > best_streak_val THEN
      best_streak_val := current_streak_val;
    END IF;

    -- Update user_stats
    UPDATE user_stats
    SET
      xp_total = xp_total + xp_amount,
      xp_daily = CASE WHEN xp_daily_reset_at::date = today THEN xp_daily + xp_amount ELSE xp_amount END,
      xp_daily_reset_at = CASE WHEN xp_daily_reset_at::date = today THEN xp_daily_reset_at ELSE NOW() END,
      current_streak = current_streak_val,
      best_streak = best_streak_val,
      last_contribution_date = today,
      recordings_count = recordings_count + CASE WHEN activity_type = 'recording' THEN 1 ELSE 0 END,
      corrections_count = corrections_count + CASE WHEN activity_type = 'correction' THEN 1 ELSE 0 END,
      words_preserved = words_preserved + CASE WHEN activity_type = 'recording' THEN 50 ELSE 0 END,
      updated_at = NOW()
    WHERE id = user_uuid;
  END IF;

  -- Log activity
  INSERT INTO contribution_activity (user_id, activity_type, reference_id, xp_earned, metadata)
  VALUES (user_uuid, activity_type, reference_id, xp_amount, metadata);

  -- Check for new badges
  SELECT badge_id INTO new_badge
  FROM check_and_award_badges(user_uuid)
  LIMIT 1;

  RETURN QUERY SELECT xp_amount, true, new_badge;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and award badges
CREATE OR REPLACE FUNCTION check_and_award_badges(user_uuid UUID)
RETURNS TABLE (badge_id TEXT) AS $$
DECLARE
  user_stats_record RECORD;
  total_contributions INTEGER;
BEGIN
  -- Get user stats
  SELECT * INTO user_stats_record FROM user_stats WHERE id = user_uuid;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  total_contributions := user_stats_record.recordings_count + user_stats_record.corrections_count;

  -- Check each badge requirement and award if not already earned
  RETURN QUERY
  INSERT INTO user_badges (user_id, badge_id)
  SELECT user_uuid, b.id
  FROM badges b
  WHERE NOT EXISTS (
    SELECT 1 FROM user_badges ub
    WHERE ub.user_id = user_uuid AND ub.badge_id = b.id
  )
  AND (
    (b.requirement_type = 'total_contributions' AND total_contributions >= b.requirement_value) OR
    (b.requirement_type = 'streak_days' AND user_stats_record.current_streak >= b.requirement_value) OR
    (b.requirement_type = 'recordings' AND user_stats_record.recordings_count >= b.requirement_value) OR
    (b.requirement_type = 'corrections' AND user_stats_record.corrections_count >= b.requirement_value)
  )
  RETURNING b.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user leaderboard position
CREATE OR REPLACE FUNCTION get_leaderboard_position(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  position INTEGER;
BEGIN
  SELECT rank INTO position
  FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY xp_total DESC, recordings_count DESC) as rank
    FROM user_stats
  ) ranked
  WHERE id = user_uuid;

  RETURN COALESCE(position, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get leaderboard (top N)
CREATE OR REPLACE FUNCTION get_leaderboard(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  avatar TEXT,
  xp_total INTEGER,
  recordings_count INTEGER,
  corrections_count INTEGER,
  current_streak INTEGER,
  rank BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    us.id as user_id,
    u.display_name,
    u.avatar,
    us.xp_total,
    us.recordings_count,
    us.corrections_count,
    us.current_streak,
    ROW_NUMBER() OVER (ORDER BY us.xp_total DESC, us.recordings_count DESC) as rank
  FROM user_stats us
  JOIN users u ON us.id = u.id
  WHERE u.is_public = TRUE
  ORDER BY us.xp_total DESC, us.recordings_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset daily progress at midnight
CREATE OR REPLACE FUNCTION reset_daily_progress()
RETURNS VOID AS $$
BEGIN
  UPDATE user_stats
  SET
    daily_progress = 0,
    daily_goal_completed_at = NULL,
    xp_daily = 0,
    xp_daily_reset_at = NOW(),
    streak_freeze_used = FALSE,
    streak_freeze_reset_at = NOW()
  WHERE
    daily_progress > 0
    OR xp_daily > 0
    OR streak_freeze_used = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VIEWS
-- ============================================

-- View for user contribution history with details
CREATE OR REPLACE VIEW user_contribution_history AS
SELECT
  ca.id,
  ca.created_at,
  ca.user_id,
  ca.activity_type,
  ca.xp_earned,
  ca.metadata,
  CASE
    WHEN ca.activity_type = 'recording' THEN c.transcription
    WHEN ca.activity_type = 'correction' THEN cor.suggested_text
    ELSE NULL
  END as details,
  CASE
    WHEN ca.activity_type = 'recording' THEN c.status
    WHEN ca.activity_type = 'correction' THEN cor.status
    ELSE 'completed'
  END as status
FROM contribution_activity ca
LEFT JOIN clips c ON ca.reference_id = c.id AND ca.activity_type = 'recording'
LEFT JOIN corrections cor ON ca.reference_id = cor.id AND ca.activity_type = 'correction'
ORDER BY ca.created_at DESC;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE contribution_activity ENABLE ROW LEVEL SECURITY;

-- User stats policies
CREATE POLICY "Users can read own stats"
  ON user_stats FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can insert own stats"
  ON user_stats FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Badges are public read-only
CREATE POLICY "Badges are viewable by all authenticated users"
  ON badges FOR SELECT
  TO authenticated
  USING (true);

-- User badges policies
CREATE POLICY "Users can read own badges"
  ON user_badges FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert user badges"
  ON user_badges FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Inserted by functions

-- Contribution activity policies
CREATE POLICY "Users can read own activity"
  ON contribution_activity FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert activity"
  ON contribution_activity FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
