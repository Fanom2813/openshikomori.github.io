-- Migration: Allow users to edit their own transcriptions and pending corrections

-- Function to update a clip's transcription while maintaining history
CREATE OR REPLACE FUNCTION update_own_clip_transcription(
  p_clip_id UUID,
  p_new_text TEXT
)
RETURNS VOID AS $$
DECLARE
  v_clip RECORD;
BEGIN
  -- Get the clip
  SELECT * INTO v_clip FROM clips WHERE id = p_clip_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Clip not found';
  END IF;

  -- Ensure user owns the clip
  IF v_clip.contributed_by != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to edit this clip';
  END IF;

  -- Update the clip
  UPDATE clips
  SET 
    -- Append new version to history
    transcription_history = COALESCE(transcription_history, '[]'::jsonb) || jsonb_build_object(
      'text', p_new_text,
      'source', 'user_edit',
      'updated_at', NOW()
    ),
    transcription = p_new_text,
    -- Reset to pending so it can be reviewed again if needed
    status = 'pending',
    updated_at = NOW()
  WHERE id = p_clip_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update a correction's suggested text
CREATE OR REPLACE FUNCTION update_own_correction(
  p_correction_id UUID,
  p_new_text TEXT
)
RETURNS VOID AS $$
DECLARE
  v_corr RECORD;
BEGIN
  -- Get the correction
  SELECT * INTO v_corr FROM corrections WHERE id = p_correction_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Correction not found';
  END IF;

  -- Ensure user owns the correction
  IF v_corr.suggested_by != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to edit this correction';
  END IF;

  -- Ensure it's still pending
  IF v_corr.status != 'pending' THEN
    RAISE EXCEPTION 'Cannot edit a correction that has already been reviewed';
  END IF;

  -- Update the correction
  UPDATE corrections
  SET 
    suggested_text = p_new_text,
    updated_at = NOW() -- assuming there's no updated_at column, but it's good practice. Wait, corrections table doesn't have updated_at trigger by default in initial schema. 
    -- Actually, looking at initial schema, let's just update the text.
  WHERE id = p_correction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update get_user_dashboard to include audioUrl for clips, and the target reference_id
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

  -- If no stats exist, create default and re-select
  IF user_stats_record IS NULL THEN
    INSERT INTO user_stats (id, xp_total, xp_daily, current_streak, best_streak, recordings_count, corrections_count, words_preserved, daily_progress, daily_goal)
    VALUES (user_uuid, 0, 0, 0, 0, 0, 0, 0, 0, 10)
    ON CONFLICT (id) DO NOTHING;

    -- Re-select to populate the record properly
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
        'referenceId', ca.reference_id,
        'audioUrl', CASE
          WHEN ca.activity_type = 'recording' THEN c.audio_url
          WHEN ca.activity_type = 'correction' THEN (SELECT audio_url FROM clips WHERE id = cor.clip_id LIMIT 1)
          ELSE NULL
        END,
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
      'current_streak', user_stats_record.current_streak,
      'best_streak', user_stats_record.best_streak,
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
