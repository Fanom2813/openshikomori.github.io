-- Exhaustive Backend Automation Triggers

-- 1. Automatically create user_stats row for EVERY new user (auth.users)
CREATE OR REPLACE FUNCTION public.handle_new_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_stats (id, xp_total, current_streak, best_streak, recordings_count, daily_goal)
  VALUES (NEW.id, 0, 0, 0, 0, 10)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_stats();

-- 2. Enhanced CLIP Trigger: Updates user stats, logs activity, AND updates global count
CREATE OR REPLACE FUNCTION on_clip_inserted_v3()
RETURNS TRIGGER AS $$
DECLARE
  today DATE := CURRENT_DATE;
  yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
  last_date DATE;
  new_streak INTEGER;
  best_streak_val INTEGER;
  xp_amount INTEGER := 10;
BEGIN
  -- Get current user stats
  SELECT last_contribution_date, current_streak, best_streak 
  INTO last_date, new_streak, best_streak_val
  FROM user_stats WHERE id = NEW.contributed_by;

  -- Calculate streak
  IF last_date IS NULL OR last_date < yesterday THEN
    new_streak := 1;
  ELSIF last_date = yesterday THEN
    new_streak := COALESCE(new_streak, 0) + 1;
  ELSE
    new_streak := COALESCE(new_streak, 1);
  END IF;

  IF new_streak > best_streak_val THEN best_streak_val := new_streak; END IF;

  -- Update user stats
  UPDATE user_stats
  SET
    xp_total = xp_total + xp_amount,
    xp_daily = CASE WHEN xp_daily_reset_at::date = today THEN xp_daily + xp_amount ELSE xp_amount END,
    xp_daily_reset_at = CASE WHEN xp_daily_reset_at::date = today THEN xp_daily_reset_at ELSE NOW() END,
    recordings_count = recordings_count + 1,
    total_seconds_recorded = total_seconds_recorded + NEW.duration,
    current_streak = new_streak,
    best_streak = best_streak_val,
    last_contribution_date = today,
    daily_progress = CASE WHEN last_contribution_date = today THEN daily_progress + 1 ELSE 1 END,
    words_preserved = words_preserved + 50,
    updated_at = NOW()
  WHERE id = NEW.contributed_by;

  -- Update the legacy contribution_count on users table (if it exists and is used for leaderboard)
  UPDATE users SET contribution_count = contribution_count + 1 WHERE id = NEW.contributed_by;

  -- Log activity
  INSERT INTO contribution_activity (user_id, activity_type, reference_id, xp_earned, metadata)
  VALUES (NEW.contributed_by, 'recording', NEW.id, xp_amount, jsonb_build_object('duration', NEW.duration, 'language', NEW.language));

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_on_clip_inserted ON clips;
CREATE TRIGGER tr_on_clip_inserted
AFTER INSERT ON clips
FOR EACH ROW EXECUTE FUNCTION on_clip_inserted_v3();

-- 3. Enhanced CORRECTION Trigger: Updates user stats, logs activity, AND updates the CLIP's correction count
CREATE OR REPLACE FUNCTION on_correction_inserted_v3()
RETURNS TRIGGER AS $$
DECLARE
  today DATE := CURRENT_DATE;
  xp_amount INTEGER := 5;
BEGIN
  -- Update user stats
  UPDATE user_stats
  SET
    xp_total = xp_total + xp_amount,
    xp_daily = CASE WHEN xp_daily_reset_at::date = today THEN xp_daily + xp_amount ELSE xp_amount END,
    xp_daily_reset_at = CASE WHEN xp_daily_reset_at::date = today THEN xp_daily_reset_at ELSE NOW() END,
    corrections_count = corrections_count + 1,
    last_contribution_date = today,
    daily_progress = CASE WHEN last_contribution_date = today THEN daily_progress + 1 ELSE 1 END,
    updated_at = NOW()
  WHERE id = NEW.suggested_by;
  
  -- Automatically update the clip's correction count
  UPDATE clips SET correction_count = correction_count + 1 WHERE id = NEW.clip_id;

  -- Log activity
  INSERT INTO contribution_activity (user_id, activity_type, reference_id, xp_earned)
  VALUES (NEW.suggested_by, 'correction', NEW.id, xp_amount);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_on_correction_inserted ON corrections;
CREATE TRIGGER tr_on_correction_inserted
AFTER INSERT ON corrections
FOR EACH ROW EXECUTE FUNCTION on_correction_inserted_v3();
