// Cloudflare R2 upload service

const R2_WORKER_URL = import.meta.env.VITE_R2_WORKER_URL;

interface PresignedUrlResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Get presigned URL from Cloudflare Worker
 */
async function getPresignedUrl(
  fileName: string,
  contentType: string,
  userId: string
): Promise<PresignedUrlResponse | null> {
  if (!R2_WORKER_URL) {
    console.error('R2 Worker URL not configured');
    return null;
  }

  try {
    const response = await fetch(`${R2_WORKER_URL}/presign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName,
        contentType,
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get presigned URL: ${response.statusText}`);
    }

    return await response.json() as PresignedUrlResponse;
  } catch (error) {
    console.error('Error getting presigned URL:', error);
    return null;
  }
}

/**
 * Upload audio blob directly to R2 using presigned URL
 */
async function uploadToR2(
  blob: Blob,
  presignedUrl: string
): Promise<boolean> {
  try {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type': blob.type || 'audio/wav',
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Error uploading to R2:', error);
    return false;
  }
}

/**
 * Upload audio clip to Cloudflare R2
 * Returns the public URL if successful
 */
export async function uploadAudioClip(
  audioBlob: Blob,
  userId: string,
  clipId: string
): Promise<UploadResult> {
  // Validate file size (max 30 seconds ~ 500KB for WAV)
  const MAX_SIZE = 1024 * 1024; // 1MB max
  if (audioBlob.size > MAX_SIZE) {
    return {
      success: false,
      error: 'Audio file too large. Maximum size is 1MB.',
    };
  }

  // Validate audio type
  const validTypes = ['audio/wav', 'audio/webm', 'audio/mp4', 'audio/ogg', 'audio/mpeg'];
  const contentType = audioBlob.type || 'audio/wav';

  if (!validTypes.includes(contentType)) {
    console.warn('Unusual audio type:', contentType, '- proceeding anyway');
  }

  // Generate filename: userId_timestamp_clipId.wav
  const timestamp = Date.now();
  const extension = contentType.split('/')[1] || 'wav';
  const fileName = `${userId}_${timestamp}_${clipId}.${extension}`;

  // Get presigned URL
  const presigned = await getPresignedUrl(fileName, contentType, userId);
  if (!presigned) {
    return {
      success: false,
      error: 'Failed to get upload authorization.',
    };
  }

  // Upload to R2
  const uploaded = await uploadToR2(audioBlob, presigned.uploadUrl);
  if (!uploaded) {
    return {
      success: false,
      error: 'Upload failed. Please try again.',
    };
  }

  return {
    success: true,
    url: presigned.publicUrl,
  };
}

/**
 * Check if R2 is configured
 */
export function isR2Configured(): boolean {
  return !!R2_WORKER_URL;
}

/**
 * Delete an audio clip from R2
 * Note: This requires admin authentication via the worker
 */
export async function deleteAudioClip(
  key: string,
  adminToken: string
): Promise<boolean> {
  if (!R2_WORKER_URL) {
    return false;
  }

  try {
    const response = await fetch(`${R2_WORKER_URL}/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ key }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error deleting from R2:', error);
    return false;
  }
}
