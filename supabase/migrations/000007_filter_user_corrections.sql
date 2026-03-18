-- Migration: Filter out clips already corrected or created by the user in the review queue

CREATE OR REPLACE FUNCTION get_clips_for_correction_v2(
  p_user_id UUID,
  p_language TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  created_at TIMESTAMPTZ,
  contributed_by UUID,
  audio_url TEXT,
  duration INTEGER,
  language TEXT,
  dialect TEXT,
  transcription TEXT,
  status TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  correction_count INTEGER,
  is_duplicate BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT c.*
  FROM clips c
  WHERE 
    -- Only pending or approved clips
    c.status IN ('pending', 'approved')
    -- Filter by language if provided
    AND (p_language IS NULL OR c.language = p_language)
    -- DO NOT show clips created by the current user
    AND c.contributed_by != p_user_id
    -- DO NOT show clips that the user has already submitted a correction for
    AND NOT EXISTS (
      SELECT 1 
      FROM corrections cor 
      WHERE cor.clip_id = c.id 
      AND cor.suggested_by = p_user_id
    )
  ORDER BY c.correction_count ASC, c.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON FUNCTION get_clips_for_correction_v2(UUID, TEXT, INTEGER) IS 'Returns a queue of clips for review, excluding those created or already corrected by the specified user';
