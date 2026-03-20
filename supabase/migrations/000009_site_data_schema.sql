-- Site Data Schema for Roadmap and Global Goals (REVISED for 7 Categories)

-- Update clips table to include 'english' (Add a new constraint or recreate if needed)
-- We'll do it in a way that handles the existing table.
ALTER TABLE clips DROP CONSTRAINT IF EXISTS clips_language_check;
ALTER TABLE clips ADD CONSTRAINT clips_language_check CHECK (language IN ('comorian', 'french', 'arabic', 'english'));

-- 1. Global Goals
CREATE TABLE IF NOT EXISTS global_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_hours INTEGER NOT NULL DEFAULT 10,
  target_dialects INTEGER NOT NULL DEFAULT 4,
  target_languages_hours JSONB NOT NULL DEFAULT '{"shingazidja": 10, "shindzuani": 10, "shimwali": 10, "shimaore": 10, "french": 10, "english": 10, "arabic": 10}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial default row if empty
INSERT INTO global_goals (id, target_hours, target_dialects, target_languages_hours)
SELECT '00000000-0000-0000-0000-000000000001', 10, 4, '{"shingazidja": 10, "shindzuani": 10, "shimwali": 10, "shimaore": 10, "french": 10, "english": 10, "arabic": 10}'
WHERE NOT EXISTS (SELECT 1 FROM global_goals);

-- 2. Roadmap Phases
CREATE TABLE IF NOT EXISTS roadmap_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage TEXT NOT NULL,
  period TEXT NOT NULL,
  order_index INTEGER NOT NULL
);

-- 3. Roadmap Items
CREATE TABLE IF NOT EXISTS roadmap_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID REFERENCES roadmap_phases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT CHECK (status IN ('completed', 'in-progress', 'upcoming')),
  order_index INTEGER NOT NULL
);

-- Function to get global dataset stats (REVISED for 7 categories)
CREATE OR REPLACE FUNCTION get_global_dataset_stats()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_speakers', count(distinct contributed_by),
    'total_clips', count(*),
    'total_duration_seconds', COALESCE(sum(duration), 0),
    'categories', jsonb_build_object(
      'shingazidja', jsonb_build_object(
        'clips', count(*) filter (where dialect = 'shingazidja'),
        'duration_seconds', COALESCE(sum(duration) filter (where dialect = 'shingazidja'), 0)
      ),
      'shindzuani', jsonb_build_object(
        'clips', count(*) filter (where dialect = 'shindzuani'),
        'duration_seconds', COALESCE(sum(duration) filter (where dialect = 'shindzuani'), 0)
      ),
      'shimwali', jsonb_build_object(
        'clips', count(*) filter (where dialect = 'shimwali'),
        'duration_seconds', COALESCE(sum(duration) filter (where dialect = 'shimwali'), 0)
      ),
      'shimaore', jsonb_build_object(
        'clips', count(*) filter (where dialect = 'shimaore'),
        'duration_seconds', COALESCE(sum(duration) filter (where dialect = 'shimaore'), 0)
      ),
      'french', jsonb_build_object(
        'clips', count(*) filter (where language = 'french'),
        'duration_seconds', COALESCE(sum(duration) filter (where language = 'french'), 0)
      ),
      'english', jsonb_build_object(
        'clips', count(*) filter (where language = 'english'),
        'duration_seconds', COALESCE(sum(duration) filter (where language = 'english'), 0)
      ),
      'arabic', jsonb_build_object(
        'clips', count(*) filter (where language = 'arabic'),
        'duration_seconds', COALESCE(sum(duration) filter (where language = 'arabic'), 0)
      )
    )
  )
  INTO result
  FROM clips
  WHERE status = 'approved';

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get the full site data
CREATE OR REPLACE FUNCTION get_site_data()
RETURNS JSONB AS $$
DECLARE
  goals JSONB;
  phases JSONB;
BEGIN
  SELECT jsonb_build_object(
    'target_hours', target_hours,
    'target_dialects', target_dialects,
    'target_languages_hours', target_languages_hours
  ) INTO goals
  FROM global_goals
  LIMIT 1;

  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'stage', p.stage,
      'period', p.period,
      'order_index', p.order_index,
      'items', (
        SELECT COALESCE(jsonb_agg(
          jsonb_build_object(
            'title', i.title,
            'description', i.description,
            'status', i.status,
            'order_index', i.order_index
          ) ORDER BY i.order_index
        ), '[]'::jsonb)
        FROM roadmap_items i
        WHERE i.phase_id = p.id
      )
    ) ORDER BY p.order_index
  ), '[]'::jsonb) INTO phases
  FROM roadmap_phases p;

  RETURN jsonb_build_object(
    'goals', goals,
    'roadmap', phases
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
