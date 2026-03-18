-- Migration to support transcription versioning and history
-- This adds a transcription_history column to clips to store all versions of a transcription

-- Add transcription_history column to clips table
ALTER TABLE clips ADD COLUMN IF NOT EXISTS transcription_history JSONB DEFAULT '[]'::jsonb;

-- Update existing clips to have their current transcription in history if history is empty
UPDATE clips 
SET transcription_history = jsonb_build_array(
  jsonb_build_object(
    'text', transcription,
    'source', 'original',
    'created_at', created_at,
    'contributed_by', contributed_by
  )
)
WHERE transcription_history IS NULL OR jsonb_array_length(transcription_history) = 0;

-- Update the reviewCorrection function to handle versioning
CREATE OR REPLACE FUNCTION review_correction_v2(
  correction_id UUID,
  decision TEXT,
  admin_uid UUID,
  review_note TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  corr_record RECORD;
BEGIN
  -- Get the correction details
  SELECT * INTO corr_record FROM corrections WHERE id = correction_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Correction not found';
  END IF;

  -- Update correction status
  UPDATE corrections
  SET 
    status = decision,
    reviewed_by = admin_uid,
    reviewed_at = NOW()
  WHERE id = correction_id;

  -- If approved, update the clip
  IF decision = 'approved' THEN
    UPDATE clips
    SET 
      -- Append new version to history
      transcription_history = transcription_history || jsonb_build_object(
        'text', corr_record.suggested_text,
        'source', 'correction',
        'correction_id', correction_id,
        'approved_by', admin_uid,
        'approved_at', NOW()
      ),
      -- Update current transcription to the approved version
      transcription = corr_record.suggested_text,
      status = 'approved',
      reviewed_by = admin_uid,
      reviewed_at = NOW()
    WHERE id = corr_record.clip_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a comment for documentation
COMMENT ON FUNCTION review_correction_v2(UUID, TEXT, UUID, TEXT) IS 'Reviews a transcription correction and maintains a version history in the clips table';
