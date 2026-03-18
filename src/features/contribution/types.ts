// User (Firestore: users/{userId})
export interface User {
  uid: string;

  // Soft Identity - optional, for community recognition
  profile?: {
    displayName: string;
    avatar: string;
    isPublic: boolean;
  };

  contributionCount: {
    recordings: number;
    corrections: number;
    reviews: number;
  };

  createdAt: Date;
  lastActiveAt: Date;
}

// Audio Clip (Firestore: clips/{clipId})
export interface Clip {
  id: string;
  audioUrl: string;
  duration: number;
  language: 'comorian' | 'french' | 'arabic';
  dialect?: 'shingazidja' | 'shindzuani' | 'shimwali' | 'shimaore';

  transcription: {
    text: string;
    source: 'auto' | 'manual' | 'corrected';
    confidence?: number;
  };

  contributedBy: string;
  contributorProfile?: {
    displayName: string;
    avatar: string;
  };
  isAnonymous: boolean;
  contributedAt: Date;

  status: 'pending' | 'approved' | 'rejected' | 'needs_review';
  reviewedBy?: string;
  reviewedAt?: Date;

  correctionsCount: number;
  latestCorrection?: {
    text: string;
    suggestedBy: string;
    suggestedAt: Date;
  };
}

// Correction Suggestion (Firestore: corrections/{correctionId})
export interface Correction {
  id: string;
  clipId: string;
  originalText: string;
  suggestedText: string;
  suggestedBy: string;
  suggestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewNote?: string;
}

// Admin Config (Firestore: config/admin)
export interface AdminConfig {
  adminUids: string[];
  dailyUploadLimit: number;
}

// Avatar option for soft identity
export interface AvatarOption {
  id: string;
  emoji: string;
  label: string;
  bgColor: string;
}

// Recording state
export type RecordingState = 'idle' | 'requesting' | 'recording' | 'paused' | 'stopped';

// Contribution method
export type ContributionMethod = 'record' | 'correct';

// Language options
export interface LanguageOption {
  code: 'comorian' | 'french' | 'arabic';
  label: string;
  labelFr: string;
  labelAr: string;
}

// Dialect options
export interface DialectOption {
  code: 'shingazidja' | 'shindzuani' | 'shimwali' | 'shimaore';
  label: string;
  labelFr: string;
  labelAr: string;
}
