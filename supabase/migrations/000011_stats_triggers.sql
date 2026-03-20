-- Automation Triggers for Stats and Gamification

-- Ensure user_stats has a column for total seconds recorded
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS total_seconds_recorded INTEGER DEFAULT 0;

-- 1. Function to update stats when a new contribution (CLIP) is created
CREATE OR REPLACE FUNCTION on_clip_inserted()
RETURNS TRIGGER AS $$
DECLARE
  today DATE := CURRENT_DATE;
  yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
  last_date DATE;
  new_streak INTEGER;
  best_streak_val INTEGER;
BEGIN
  -- Get current user stats
  SELECT last_contribution_date, current_streak, best_streak 
  INTO last_date, new_streak, best_streak_val
  FROM user_stats WHERE id = NEW.contributed_by;

  -- Create stats record if it doesn't exist
  IF NOT FOUND THEN
    INSERT INTO user_stats (id, recordings_count, total_seconds_recorded, current_streak, best_streak, last_contribution_date, daily_progress)
    VALUES (NEW.contributed_by, 1, NEW.duration, 1, 1, today, 1)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
  END IF;

  -- Calculate new streak
  IF last_date IS NULL OR last_date < yesterday THEN
    new_streak := 1;
  ELSIF last_date = yesterday THEN
    new_streak := new_streak + 1;
  END IF;

  -- Update best streak
  IF new_streak > best_streak_val THEN
    best_streak_val := new_streak;
  END IF;

  -- Update stats in background
  UPDATE user_stats
  SET
    recordings_count = recordings_count + 1,
    total_seconds_recorded = total_seconds_recorded + NEW.duration,
    current_streak = new_streak,
    best_streak = best_streak_val,
    last_contribution_date = today,
    daily_progress = CASE 
      WHEN last_contribution_date = today THEN daily_progress + 1
      ELSE 1
    END,
    updated_at = NOW()
  WHERE id = NEW.contributed_by;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger for clips
DROP TRIGGER IF EXISTS tr_on_clip_inserted ON clips;
CREATE TRIGGER tr_on_clip_inserted
AFTER INSERT ON clips
FOR EACH ROW EXECUTE FUNCTION on_clip_inserted();

-- 3. Function to update stats when a CORRECTION is created
CREATE OR REPLACE FUNCTION on_correction_inserted()
RETURNS TRIGGER AS $$
DECLARE
  today DATE := CURRENT_DATE;
BEGIN
  -- We assume the stats row exists (created at clip upload or signup)
  UPDATE user_stats
  SET
    corrections_count = corrections_count + 1,
    last_contribution_date = today,
    daily_progress = CASE 
      WHEN last_contribution_date = today THEN daily_progress + 1
      ELSE 1
    END,
    updated_at = NOW()
  WHERE id = NEW.contributed_by;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger for corrections
DROP TRIGGER IF EXISTS tr_on_correction_inserted ON corrections;
CREATE TRIGGER tr_on_correction_inserted
AFTER INSERT ON corrections
FOR EACH ROW EXECUTE FUNCTION on_correction_inserted();
