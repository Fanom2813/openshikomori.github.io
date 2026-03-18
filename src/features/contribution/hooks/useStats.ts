import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

export interface UserStats {
  xpTotal: number;
  xpDaily: number;
  currentStreak: number;
  bestStreak: number;
  recordingsCount: number;
  correctionsCount: number;
  wordsPreserved: number;
  dailyProgress: number;
  dailyGoal: number;
  lastContributionDate?: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'volume' | 'consistency' | 'quality' | 'special';
  tier: 1 | 2 | 3;
  xpReward: number;
  earnedAt?: Date;
  locked: boolean;
}

export interface ContributionActivity {
  id: string;
  createdAt: Date;
  activityType: 'recording' | 'correction' | 'review';
  xpEarned: number;
  details?: string;
  status: 'pending' | 'approved' | 'rejected';
  referenceId?: string;
  audioUrl?: string;
}

export interface WeeklyData {
  day: string;
  count: number;
}

export interface DashboardData {
  stats: UserStats;
  badges: Badge[];
  history: ContributionActivity[];
  weeklyData: WeeklyData[];
}

export function useUserDashboard(userId: string | undefined) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!userId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Single optimized query gets everything
      const { data: result, error: supabaseError } = await supabase.rpc(
        'get_user_dashboard',
        { user_uuid: userId }
      );

      if (supabaseError) throw supabaseError;

      // Parse the JSON result
      const parsed = result as {
        stats: {
          xpTotal: number;
          xpDaily: number;
          currentStreak: number;
          bestStreak: number;
          recordingsCount: number;
          correctionsCount: number;
          wordsPreserved: number;
          dailyProgress: number;
          dailyGoal: number;
          lastContributionDate?: string;
        };
        badges: Badge[];
        history: Array<{
          id: string;
          createdAt: string;
          activityType: 'recording' | 'correction' | 'review';
          xpEarned: number;
          details?: string;
          status: 'pending' | 'approved' | 'rejected';
          referenceId?: string;
          audioUrl?: string;
        }>;
        weeklyData: WeeklyData[];
      };

      setData({
        stats: {
          xpTotal: parsed.stats.xpTotal,
          xpDaily: parsed.stats.xpDaily,
          currentStreak: parsed.stats.currentStreak || (parsed.stats as any).current_streak || 0,
          bestStreak: parsed.stats.bestStreak || (parsed.stats as any).best_streak || 0,
          recordingsCount: parsed.stats.recordingsCount,
          correctionsCount: parsed.stats.correctionsCount,
          wordsPreserved: parsed.stats.wordsPreserved,
          dailyProgress: parsed.stats.dailyProgress,
          dailyGoal: parsed.stats.dailyGoal,
          lastContributionDate: parsed.stats.lastContributionDate
            ? new Date(parsed.stats.lastContributionDate)
            : undefined,
        },
        badges: parsed.badges,
        history: parsed.history.map((h) => ({
          ...h,
          createdAt: new Date(h.createdAt),
        })),
        weeklyData: parsed.weeklyData,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const recordContribution = useCallback(
    async (
      activityType: 'recording' | 'correction' | 'review',
      referenceId?: string,
      metadata?: Record<string, unknown>
    ) => {
      if (!userId) return null;

      try {
        // Validate if referenceId is a valid UUID before passing to RPC
        // Supabase RPC expects a UUID type for reference_id, not just any string
        const isUuid = referenceId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(referenceId);
        
        const { data: result, error } = await supabase.rpc('record_contribution_v2', {
          user_uuid: userId,
          activity_type: activityType,
          reference_id: isUuid ? referenceId : null,
          metadata: metadata || {},
        });

        if (error) throw error;

        // Refresh dashboard after recording
        await fetchDashboard();

        return result as {
          xpEarned: number;
          streak: number;
          badgesEarned: Array<{ id: string; name: string; icon: string; tier: number }>;
        };
      } catch (err) {
        console.error('Failed to record contribution:', err);
        return null;
      }
    },
    [userId, fetchDashboard]
  );

  return {
    data,
    loading,
    error,
    refetch: fetchDashboard,
    recordContribution,
  };
}

// Legacy hooks for backward compatibility - now use the single dashboard query
export function useUserStats(userId: string | undefined) {
  const { data, loading, error, refetch, recordContribution } = useUserDashboard(userId);

  return {
    stats: data?.stats || null,
    loading,
    error,
    refetch,
    recordContribution,
  };
}

export function useUserBadges(userId: string | undefined) {
  const { data, loading, error, refetch } = useUserDashboard(userId);

  return {
    badges: data?.badges || [],
    loading,
    error,
    refetch,
  };
}

export function useContributionHistory(userId: string | undefined, _limit: number = 10) {
  const { data, loading, error, refetch } = useUserDashboard(userId);

  return {
    activities: data?.history || [],
    loading,
    error,
    refetch,
  };
}

export function useWeeklyData(userId: string | undefined) {
  const { data, loading, error, refetch } = useUserDashboard(userId);

  return {
    weeklyData: data?.weeklyData || [],
    loading,
    error,
    refetch,
  };
}

// Leaderboard still needs separate query as it's a different dataset
export function useLeaderboard(limit: number = 50) {
  const [leaders, setLeaders] = useState<
    Array<{
      userId: string;
      displayName: string;
      avatar?: string;
      xpTotal: number;
      recordingsCount: number;
      correctionsCount: number;
      currentStreak: number;
      rank: number;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase.rpc('get_leaderboard', {
        limit_count: limit,
      });

      if (supabaseError) throw supabaseError;

      setLeaders(
        (data || []).map(
          (item: {
            user_id: string;
            display_name: string;
            avatar: string;
            xp_total: number;
            recordings_count: number;
            corrections_count: number;
            current_streak: number;
            rank: number;
          }) => ({
            userId: item.user_id,
            displayName: item.display_name,
            avatar: item.avatar,
            xpTotal: item.xp_total,
            recordingsCount: item.recordings_count,
            correctionsCount: item.corrections_count,
            currentStreak: item.current_streak,
            rank: item.rank,
          })
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    leaders,
    loading,
    error,
    refetch: fetchLeaderboard,
  };
}
