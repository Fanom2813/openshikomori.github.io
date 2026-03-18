import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { Mic, Edit3, ArrowLeft } from 'lucide-react';
import { WorkArea } from './WorkArea';
import { StatsPanel } from './StatsPanel';
import { useUserDashboard } from '../hooks/useStats';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { ContributionMode } from '../types';
import type { ContributionHistoryItem } from './types';

interface ContributionWorkspaceProps {
  user: {
    uid: string;
    profile?: {
      displayName: string;
      avatar?: string;
      isPublic: boolean;
    };
  };
}

export function ContributionWorkspace({ user }: ContributionWorkspaceProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  
  const view = location.pathname.includes('/stats') ? 'stats' : 'contribute';
  
  const [activeMode, setActiveMode] = useState<ContributionMode>('record');
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<ContributionHistoryItem | null>(null);

  // Single optimized query fetches all dashboard data
  const { data: dashboard, recordContribution } = useUserDashboard(user.uid);

  const handleContributionComplete = async (type: 'record' | 'correct') => {
    await recordContribution(type);
  };

  const totalXP = dashboard?.stats.xpTotal ?? 0;
  const totalWords = dashboard?.stats.wordsPreserved ?? 0;

  const history = dashboard?.history.map((h) => ({
    id: h.id,
    type: h.activityType === 'recording' ? 'record' : 'correct',
    date: h.createdAt,
    status: h.status,
    details: h.details || '',
  })) ?? [];

  const dailyProgress = dashboard?.stats
    ? {
        current: dashboard.stats.dailyProgress,
        goal: dashboard.stats.dailyGoal,
      }
    : { current: 0, goal: 10 };

  const userStats = dashboard?.stats
    ? {
        recordings: dashboard.stats.recordingsCount,
        corrections: dashboard.stats.correctionsCount,
        reviews: 0,
      }
    : { recordings: 0, corrections: 0, reviews: 0 };

  const handleBackToWork = () => {
    setSelectedHistoryItem(null);
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background overflow-x-hidden">
      <main className="w-full flex flex-col min-w-0 bg-muted/10 min-h-[calc(100vh-3.5rem)]">
        {/* Content Stage */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {view === 'contribute' ? (
            <div className="w-full max-w-5xl mx-auto p-4 md:p-8 lg:p-12 space-y-8">
              {selectedHistoryItem ? (
                <div className="flex items-center justify-between mb-4">
                  <Button variant="ghost" size="sm" onClick={handleBackToWork} className="gap-2 rounded-none">
                    <ArrowLeft className="h-4 w-4" />
                    {t('common.back', { defaultValue: 'Back to task' })}
                  </Button>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest bg-muted px-3 py-1 rounded-none">
                    {t('contribution.history.reviewing', { defaultValue: 'Reviewing Entry' })}
                  </span>
                </div>
              ) : (
                /* Mode Switcher Pill */
                <div className="flex justify-center">
                  <div className="inline-flex p-1 bg-background border border-border rounded-none shadow-sm">
                    <button
                      onClick={() => setActiveMode('record')}
                      className={cn(
                        "flex items-center gap-2 px-8 py-3 rounded-none text-sm font-bold transition-all duration-200",
                        activeMode === 'record'
                          ? "bg-primary text-primary-foreground shadow-md ring-1 ring-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <Mic className="h-4 w-4" />
                      {t('contribution.modes.record', { defaultValue: 'Speak' })}
                    </button>
                    <button
                      onClick={() => setActiveMode('correct')}
                      className={cn(
                        "flex items-center gap-2 px-8 py-3 rounded-none text-sm font-bold transition-all duration-200",
                        activeMode === 'correct'
                          ? "bg-primary text-primary-foreground shadow-md ring-1 ring-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <Edit3 className="h-4 w-4" />
                      {t('contribution.modes.correct', { defaultValue: 'Listen' })}
                    </button>
                  </div>
                </div>
              )}

              {/* Work Area Stage */}
              <div className="bg-card border border-border rounded-none shadow-2xl shadow-primary/5 overflow-hidden min-h-[600px] flex flex-col transition-all duration-500 hover:shadow-primary/10">
                <WorkArea
                  mode={activeMode}
                  userId={user.uid}
                  onContributionComplete={handleContributionComplete}
                  selectedItem={selectedHistoryItem}
                />
              </div>
            </div>
          ) : (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <StatsPanel
                userStats={userStats}
                streak={dashboard?.stats.currentStreak ?? 0}
                personalBestStreak={dashboard?.stats.bestStreak ?? 0}
                badges={dashboard?.badges ?? []}
                weeklyData={dashboard?.weeklyData ?? []}
                dailyProgress={dailyProgress}
                history={history}
                totalXP={totalXP}
                totalWords={totalWords}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
