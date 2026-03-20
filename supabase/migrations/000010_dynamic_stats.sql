-- Dynamic Site Data Stats Function (Replaces hardcoded filters)

CREATE OR REPLACE FUNCTION get_global_dataset_stats()
RETURNS JSONB AS $$
DECLARE
  summary JSONB;
  cat_stats JSONB;
BEGIN
  -- 1. Get overall counts
  SELECT jsonb_build_object(
    'total_speakers', count(distinct contributed_by),
    'total_clips', count(*),
    'total_duration_seconds', COALESCE(sum(duration), 0)
  ) INTO summary
  FROM clips
  WHERE status = 'approved';

  -- 2. Build categories JSON dynamically by language and dialect
  -- This handles any language/dialect present in the DB without hardcoding
  WITH category_raw AS (
    -- Group by language for non-comorian
    SELECT 
      language as cat_key,
      count(*) as clips,
      COALESCE(sum(duration), 0) as duration_seconds
    FROM clips
    WHERE status = 'approved' AND language != 'comorian'
    GROUP BY language
    
    UNION ALL
    
    -- Group by dialect for comorian
    SELECT 
      dialect as cat_key,
      count(*) as clips,
      COALESCE(sum(duration), 0) as duration_seconds
    FROM clips
    WHERE status = 'approved' AND language = 'comorian' AND dialect IS NOT NULL
    GROUP BY dialect
  )
  SELECT jsonb_object_agg(cat_key, jsonb_build_object('clips', clips, 'duration_seconds', duration_seconds))
  INTO cat_stats
  FROM category_raw;

  RETURN summary || jsonb_build_object('categories', COALESCE(cat_stats, '{}'::jsonb));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure constraints allow future expansions (already handled in previous migrations, but kept for robustness)
ALTER TABLE clips DROP CONSTRAINT IF EXISTS clips_language_check;
ALTER TABLE clips ADD CONSTRAINT clips_language_check CHECK (language IN ('comorian', 'french', 'arabic', 'english', 'swahili', 'other'));

ALTER TABLE clips DROP CONSTRAINT IF EXISTS clips_dialect_check;
ALTER TABLE clips ADD CONSTRAINT clips_dialect_check CHECK (dialect IN ('shingazidja', 'shindzuani', 'shimwali', 'shimaore', 'other'));
