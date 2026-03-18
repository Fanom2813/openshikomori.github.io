export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          display_name: string | null;
          avatar: string | null;
          home_island: string | null;
          is_public: boolean;
          contribution_count: number;
          last_contributed_at: string | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          display_name?: string | null;
          avatar?: string | null;
          home_island?: string | null;
          is_public?: boolean;
          contribution_count?: number;
          last_contributed_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          display_name?: string | null;
          avatar?: string | null;
          home_island?: string | null;
          is_public?: boolean;
          contribution_count?: number;
          last_contributed_at?: string | null;
        };
      };
      clips: {
        Row: {
          id: string;
          created_at: string;
          contributed_by: string;
          audio_url: string;
          duration: number;
          language: 'comorian' | 'french' | 'arabic';
          dialect: string | null;
          transcription: string;
          status: 'pending' | 'approved' | 'rejected';
          reviewed_by: string | null;
          reviewed_at: string | null;
          correction_count: number;
          is_duplicate: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          contributed_by: string;
          audio_url: string;
          duration: number;
          language: 'comorian' | 'french' | 'arabic';
          dialect?: string | null;
          transcription: string;
          status?: 'pending' | 'approved' | 'rejected';
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          correction_count?: number;
          is_duplicate?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          contributed_by?: string;
          audio_url?: string;
          duration?: number;
          language?: 'comorian' | 'french' | 'arabic';
          dialect?: string | null;
          transcription?: string;
          status?: 'pending' | 'approved' | 'rejected';
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          correction_count?: number;
          is_duplicate?: boolean;
        };
      };
      corrections: {
        Row: {
          id: string;
          created_at: string;
          clip_id: string;
          original_text: string;
          suggested_text: string;
          suggested_by: string;
          status: 'pending' | 'approved' | 'rejected';
          reviewed_by: string | null;
          reviewed_at: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          clip_id: string;
          original_text: string;
          suggested_text: string;
          suggested_by: string;
          status?: 'pending' | 'approved' | 'rejected';
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          clip_id?: string;
          original_text?: string;
          suggested_text?: string;
          suggested_by?: string;
          status?: 'pending' | 'approved' | 'rejected';
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
