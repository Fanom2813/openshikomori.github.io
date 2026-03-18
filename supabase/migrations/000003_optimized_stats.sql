-- Optimized single-query stats fetching
-- Returns all user statistics, badges, and recent history in one call

-- ============================================
-- SINGLE QUERY FUNCTION FOR USER DASHBOARD
-- ============================================

CREATE OR REPLACE FUNCTION get_user_dashboard(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  user_stats_record RECORD;
  badges_json JSONB;
  history_json JSONB;
  weekly_json JSONB;
BEGIN
  -- Get user stats
  SELECT
    us.xp_total,
    us.xp_daily,
    us.current_streak,
    us.best_streak,
    us.recordings_count,
    us.corrections_count,
    us.words_preserved,
    us.daily_progress,
    us.daily_goal,
    us.last_contribution_date
  INTO user_stats_record
  FROM user_stats us
  WHERE us.id = user_uuid;

  -- If no stats exist, return default
  IF user_stats_record IS NULL THEN
    -- Create default stats
    INSERT INTO user_stats (id, xp_total, xp_daily, current_streak, best_streak, recordings_count, corrections_count, words_preserved, daily_progress, daily_goal)
    VALUES (user_uuid, 0, 0, 0, 0, 0, 0, 0, 0, 10)
    ON CONFLICT (id) DO NOTHING;

    user_stats_record := ROW(0, 0, 0, 0, 0, 0, 0, 0, 10, NULL)::RECORD;
  END IF;

  -- Get badges with earned status
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', b.id,
        'name', b.name,
        'description', b.description,
        'icon', b.icon,
        'category', b.category,
        'tier', b.tier,
        'xpReward', b.xp_reward,
        'earnedAt', ub.earned_at,
        'locked', CASE WHEN ub.badge_id IS NULL THEN true ELSE false END
      )
      ORDER BY b.tier, b.id
    ),
    '[]'::jsonb
  )
  INTO badges_json
  FROM badges b
  LEFT JOIN user_badges ub ON b.id = ub.badge_id AND ub.user_id = user_uuid;

  -- Get recent history (last 10)
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', ca.id,
        'createdAt', ca.created_at,
        'activityType', ca.activity_type,
        'xpEarned', ca.xp_earned,
        'details', CASE
          WHEN ca.activity_type = 'recording' THEN c.transcription
          WHEN ca.activity_type = 'correction' THEN cor.suggested_text
          ELSE NULL
        END,
        'status', CASE
          WHEN ca.activity_type = 'recording' THEN c.status
          WHEN ca.activity_type = 'correction' THEN cor.status
          ELSE 'completed'
        END
      )
      ORDER BY ca.created_at DESC
    ),
    '[]'::jsonb
  )
  INTO history_json
  FROM (
    SELECT id, created_at, activity_type, xp_earned, reference_id
    FROM contribution_activity
    WHERE user_id = user_uuid
    ORDER BY created_at DESC
    LIMIT 10
  ) ca
  LEFT JOIN clips c ON ca.reference_id = c.id AND ca.activity_type = 'recording'
  LEFT JOIN corrections cor ON ca.reference_id = cor.id AND ca.activity_type = 'correction';

  -- Calculate weekly data (last 7 days)
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'day', to_char(day, 'Dy'),
        'count', COALESCE(counts.cnt, 0)
      )
      ORDER BY day
    ),
    '[]'::jsonb
  )
  INTO weekly_json
  FROM generate_series(
    date_trunc('week', CURRENT_DATE),
    date_trunc('week', CURRENT_DATE) + interval '6 days',
    interval '1 day'
  ) AS day
  LEFT JOIN (
    SELECT
      date_trunc('day', created_at)::date as activity_date,
      count(*) as cnt
    FROM contribution_activity
    WHERE user_id = user_uuid
      AND created_at >= date_trunc('week', CURRENT_DATE)
    GROUP BY date_trunc('day', created_at)::date
  ) counts ON counts.activity_date = day::date;

  -- Build final result
  result := jsonb_build_object(
    'stats', jsonb_build_object(
      'xpTotal', user_stats_record.xp_total,
      'xpDaily', user_stats_record.xp_daily,
      'currentStreak', user_stats_record.current_streak,
      'bestStreak', user_stats_record.best_streak,
      'recordingsCount', user_stats_record.recordings_count,
      'correctionsCount', user_stats_record.corrections_count,
      'wordsPreserved', user_stats_record.words_preserved,
      'dailyProgress', user_stats_record.daily_progress,
      'dailyGoal', user_stats_record.daily_goal,
      'lastContributionDate', user_stats_record.last_contribution_date
    ),
    'badges', badges_json,
    'history', history_json,
    'weeklyData', weekly_json
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- OPTIMIZED RECORD CONTRIBUTION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION record_contribution_v2(
  user_uuid UUID,
  activity_type TEXT,
  reference_id UUID DEFAULT NULL,
  metadata JSONB DEFAULT '{}'
)
RETURNS JSONB AS $$
DECLARE
  xp_amount INTEGER := 0;
  today DATE := CURRENT_DATE;
  yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
  last_date DATE;
  current_streak_val INTEGER;
  best_streak_val INTEGER;
  new_badges JSONB;
  total_contributions INTEGER;
  result JSONB;
BEGIN
  -- Determine XP based on activity type
  xp_amount := CASE activity_type
    WHEN 'recording' THEN 10
    WHEN 'correction' THEN 5
    WHEN 'review' THEN 3
    ELSE 0
  END;

  -- Get current stats (single query)
  SELECT
    last_contribution_date,
    current_streak,
    best_streak,
    recordings_count,
    corrections_count
  INTO last_date, current_streak_val, best_streak_val, total_contributions
  FROM user_stats
  WHERE id = user_uuid;

  -- If no stats record exists, create one
  IF NOT FOUND THEN
    INSERT INTO user_stats (
      id, xp_total, xp_daily, current_streak, best_streak,
      last_contribution_date, recordings_count, corrections_count, words_preserved
    )
    VALUES (
      user_uuid, xp_amount, xp_amount, 1, 1, today,
      CASE WHEN activity_type = 'recording' THEN 1 ELSE 0 END,
      CASE WHEN activity_type = 'correction' THEN 1 ELSE 0 END,
      CASE WHEN activity_type = 'recording' THEN 50 ELSE 0 END
    );

    current_streak_val := 1;
    best_streak_val := 1;
  ELSE
    -- Calculate new streak
    IF last_date IS NULL OR last_date < yesterday THEN
      current_streak_val := 1;
    ELSIF last_date = yesterday THEN
      current_streak_val := current_streak_val + 1;
    END IF;

    -- Update best streak
    IF current_streak_val > best_streak_val THEN
      best_streak_val := current_streak_val;
    END IF;

    -- Update user_stats in single query
    UPDATE user_stats
    SET
      xp_total = xp_total + xp_amount,
      xp_daily = CASE
        WHEN xp_daily_reset_at::date = today THEN xp_daily + xp_amount
        ELSE xp_amount
      END,
      xp_daily_reset_at = CASE
        WHEN xp_daily_reset_at::date = today THEN xp_daily_reset_at
        ELSE NOW()
      END,
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

  -- Check for new badges and return them
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', b.id,
        'name', b.name,
        'icon', b.icon,
        'tier', b.tier
      )
    ),
    '[]'::jsonb
  )
  INTO new_badges
  FROM (
    SELECT b.id, b.name, b.icon, b.tier
    FROM badges b
    WHERE NOT EXISTS (
      SELECT 1 FROM user_badges ub
      WHERE ub.user_id = user_uuid AND ub.badge_id = b.id
    )
    AND (
      (b.requirement_type = 'total_contributions'
        AND (total_contributions + CASE WHEN activity_type = 'recording' OR activity_type = 'correction' THEN 1 ELSE 0 END) >= b.requirement_value)
      OR (b.requirement_type = 'streak_days' AND current_streak_val >= b.requirement_value)
      OR (b.requirement_type = 'recordings'
        AND (SELECT recordings_count FROM user_stats WHERE id = user_uuid) >= b.requirement_value)
      OR (b.requirement_type = 'corrections'
        AND (SELECT corrections_count FROM user_stats WHERE id = user_uuid) >= b.requirement_value)
    )
    LIMIT 5
  ) b;

  -- Award new badges
  INSERT INTO user_badges (user_id, badge_id)
  SELECT user_uuid, (badge->>'id')
  FROM jsonb_array_elements(new_badges) AS badge
  ON CONFLICT (user_id, badge_id) DO NOTHING;

  -- Build result
  result := jsonb_build_object(
    'xpEarned', xp_amount,
    'streak', current_streak_val,
    'badgesEarned', new_badges
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON FUNCTION get_user_dashboard(UUID) IS 'Returns complete user dashboard data including stats, badges, history, and weekly activity in a single JSON object';
COMMENT ON FUNCTION record_contribution_v2(UUID, TEXT, UUID, JSONB) IS 'Records a contribution, updates stats, awards badges, and returns changes in a single call';
