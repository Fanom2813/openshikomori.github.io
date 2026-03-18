import { supabase, isSupabaseConfigured } from './supabase';
import type { Clip, Correction, User } from '../types';

// Create a new clip
export async function createClip(
  clipData: Omit<Clip, 'id' | 'contributedAt' | 'status' | 'correctionsCount'>
): Promise<string | null> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase not initialized');
  }

  const { data, error } = await supabase
    .from('clips')
    .insert({
      audio_url: clipData.audioUrl,
      duration: clipData.duration,
      language: clipData.language,
      dialect: clipData.dialect || null,
      transcription: clipData.transcription.text,
      contributed_by: clipData.contributedBy,
      status: 'pending',
      correction_count: 0,
      is_duplicate: false,
      transcription_history: [
        {
          text: clipData.transcription.text,
          source: 'original',
          created_at: new Date().toISOString(),
          contributed_by: clipData.contributedBy,
        },
      ],
    })
    .select('id')
    .single();

  if (error) throw error;

  // Update user's contribution count
  await supabase.rpc('increment_contribution_count', {
    user_id: clipData.contributedBy,
  });

  return data?.id || null;
}

// Get clips for correction (Method 2)
export async function getClipsForCorrection(
  userId: string,
  language?: 'comorian' | 'french' | 'arabic',
  maxResults = 20
): Promise<Clip[]> {
  if (!supabase || !isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await supabase.rpc('get_clips_for_correction_v2', {
    p_user_id: userId,
    p_language: language || null,
    p_limit: maxResults,
  });

  if (error) {
    console.error('Error fetching clips:', error);
    return [];
  }

  return (data || []).map(convertClipRow);
}

// Get a single clip by ID
export async function getClip(clipId: string): Promise<Clip | null> {
  if (!supabase || !isSupabaseConfigured) {
    return null;
  }

  const { data, error } = await supabase
    .from('clips')
    .select('*')
    .eq('id', clipId)
    .single();

  if (error || !data) return null;

  return convertClipRow(data);
}

// Create a correction suggestion
export async function createCorrection(
  correction: Omit<Correction, 'id' | 'suggestedAt' | 'status'>
): Promise<string | null> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase not initialized');
  }

  const { data, error } = await supabase
    .from('corrections')
    .insert({
      clip_id: correction.clipId,
      original_text: correction.originalText,
      suggested_text: correction.suggestedText,
      suggested_by: correction.suggestedBy,
      status: 'pending',
    })
    .select('id')
    .single();

  if (error) throw error;

  // Update clip correction count
  await supabase.rpc('increment_correction_count', {
    clip_id: correction.clipId,
  });

  return data?.id || null;
}

// Get pending corrections for admin review
export async function getPendingCorrections(
  maxResults = 50
): Promise<Correction[]> {
  if (!supabase || !isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await supabase
    .from('corrections')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(maxResults);

  if (error) {
    console.error('Error fetching corrections:', error);
    return [];
  }

  return (data || []).map(convertCorrectionRow);
}

// Approve or reject a correction (admin only)
export async function reviewCorrection(
  correctionId: string,
  decision: 'approved' | 'rejected',
  adminUid: string,
  reviewNote?: string
): Promise<void> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase not initialized');
  }

  const { error } = await supabase.rpc('review_correction_v2', {
    correction_id: correctionId,
    decision,
    admin_uid: adminUid,
    review_note: reviewNote || null,
  });

  if (error) throw error;
}

// Get user clips
export async function getUserClips(userId: string): Promise<Clip[]> {
  if (!supabase || !isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await supabase
    .from('clips')
    .select('*')
    .eq('contributed_by', userId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching user clips:', error);
    return [];
  }

  return (data || []).map(convertClipRow);
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  profile: User['profile']
): Promise<void> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase not initialized');
  }

  const { error } = await supabase
    .from('users')
    .update({
      display_name: profile?.displayName,
      avatar: profile?.avatar,
      home_island: profile?.homeIsland,
      is_public: profile?.isPublic ?? false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) throw error;
}

// Update own clip transcription
export async function updateOwnClipTranscription(clipId: string, newText: string): Promise<void> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase not initialized');
  }

  const { error } = await supabase.rpc('update_own_clip_transcription', {
    p_clip_id: clipId,
    p_new_text: newText,
  });

  if (error) throw error;
}

// Update own correction
export async function updateOwnCorrection(correctionId: string, newText: string): Promise<void> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase not initialized');
  }

  const { error } = await supabase.rpc('update_own_correction', {
    p_correction_id: correctionId,
    p_new_text: newText,
  });

  if (error) throw error;
}

// Get public contributors for the community cloud
export async function getPublicContributors(
  maxResults = 50
): Promise<User[]> {
  if (!supabase || !isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('is_public', true)
    .order('contribution_count', { ascending: false })
    .limit(maxResults);

  if (error) {
    console.error('Error fetching contributors:', error);
    return [];
  }

  return (data || []).map(convertUserRow);
}

// Check if user is admin
export async function isUserAdmin(userId: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) {
    return false;
  }

  // For Supabase, we'll use a simple approach - check if user ID is in a config table
  // Or you can use Row Level Security policies
  const { data, error } = await supabase
    .from('admin_config')
    .select('*')
    .eq('user_id', userId)
    .single();

  return !error && !!data;
}

// Helper functions to convert database rows to types
function convertClipRow(row: Record<string, unknown>): Clip {
  return {
    id: row.id as string,
    audioUrl: row.audio_url as string,
    duration: row.duration as number,
    language: row.language as 'comorian' | 'french' | 'arabic',
    dialect: row.dialect as string | undefined,
    transcription: {
      text: row.transcription as string,
      source: 'manual',
    },
    contributedBy: row.contributed_by as string,
    contributedAt: new Date(row.created_at as string),
    status: row.status as 'pending' | 'approved' | 'rejected',
    correctionsCount: row.correction_count as number,
    isDuplicate: row.is_duplicate as boolean,
  };
}

function convertCorrectionRow(row: Record<string, unknown>): Correction {
  return {
    id: row.id as string,
    clipId: row.clip_id as string,
    originalText: row.original_text as string,
    suggestedText: row.suggested_text as string,
    suggestedBy: row.suggested_by as string,
    suggestedAt: new Date(row.created_at as string),
    status: row.status as 'pending' | 'approved' | 'rejected',
    reviewedBy: row.reviewed_by as string | undefined,
    reviewedAt: row.reviewed_at ? new Date(row.reviewed_at as string) : undefined,
  };
}

function convertUserRow(row: Record<string, unknown>): User {
  return {
    uid: row.id as string,
    contributionCount: {
      recordings: row.contribution_count as number,
      corrections: 0,
      reviews: 0,
    },
    profile: row.is_public
      ? {
          displayName: row.display_name as string,
          avatar: row.avatar as string,
          homeIsland: row.home_island as string,
          isPublic: true,
        }
      : undefined,
    createdAt: new Date(row.created_at as string),
    lastActiveAt: new Date(row.updated_at as string),
  };
}
