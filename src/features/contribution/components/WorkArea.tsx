import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { ContributionMode, ContributionHistoryItem } from './types';
import { AudioRecorder } from './AudioRecorder';
import { TranscriptionEditor } from './TranscriptionEditor';
import { CorrectionQueue } from './CorrectionQueue';
import { CheckCircle, Sparkles, History, ArrowRight, Play, FileText, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WorkAreaProps {
  mode: ContributionMode;
  userId: string;
  onContributionComplete: (type: 'record' | 'correct') => void;
  selectedItem?: ContributionHistoryItem | null;
}

export function WorkArea({ mode, userId, onContributionComplete, selectedItem }: WorkAreaProps) {
  const { t } = useTranslation();
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingStep, setRecordingStep] = useState<'record' | 'transcribe'>('record');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when mode changes
  useEffect(() => {
    setSuccess(false);
    setRecordingStep('record');
    setRecordedBlob(null);
  }, [mode]);

  const handleRecordingComplete = (blob: Blob) => {
    setRecordedBlob(blob);
    setRecordingStep('transcribe');
  };

  const handleCancelRecording = () => {
    setRecordedBlob(null);
    setRecordingStep('record');
  };

  const handleSubmitContribution = async (data: any) => {
    setIsSubmitting(true);
    // In a real app, we'd call the service here
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSuccess(true);
    setIsSubmitting(false);
    onContributionComplete('record');
  };

  const handleContributeAnother = () => {
    setSuccess(false);
    setRecordingStep('record');
    setRecordedBlob(null);
  };

  const handleCorrectionComplete = () => {
    onContributionComplete('correct');
  };

  // 1. Review Mode (When a history item is selected)
  if (selectedItem) {
    return (
      <div className="flex-1 flex flex-col p-6 md:p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-none bg-primary/10 flex items-center justify-center text-primary">
            <History className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{t('contribution.review.title', { defaultValue: 'Review Contribution' })}</h3>
            <p className="text-sm text-muted-foreground">{new Date(selectedItem.date).toLocaleDateString()} at {new Date(selectedItem.date).toLocaleTimeString()}</p>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="p-6 rounded-none bg-muted/30 border border-border space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              <Info className="h-3.5 w-3.5" />
              {t('contribution.review.details', { defaultValue: 'Details' })}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t('contribution.review.type', { defaultValue: 'Type' })}</p>
                <p className="text-sm font-medium capitalize">{selectedItem.type}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t('contribution.review.status', { defaultValue: 'Status' })}</p>
                <div className="flex items-center gap-1.5">
                  <div className={cn(
                    "h-2 w-2 rounded-none",
                    selectedItem.status === 'approved' ? "bg-green-500" : selectedItem.status === 'rejected' ? "bg-red-500" : "bg-amber-500"
                  )} />
                  <p className="text-sm font-medium capitalize">{selectedItem.status}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-none bg-muted/30 border border-border space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              <FileText className="h-3.5 w-3.5" />
              {t('contribution.review.content', { defaultValue: 'Content' })}
            </div>
            <p className="text-lg font-medium italic">"{selectedItem.details}"</p>
          </div>
        </div>

        <div className="mt-auto pt-10 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            {t('contribution.review.note', { defaultValue: 'History items are read-only for now. You can see their status in the sidebar.' })}
          </p>
        </div>
      </div>
    );
  }

  // 2. Success State
  if (success) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="relative mb-8"
        >
          <div className="h-24 w-24 rounded-none bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute -top-2 -right-2 h-10 w-10 bg-amber-100 dark:bg-amber-900/40 rounded-none flex items-center justify-center shadow-sm"
          >
            <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </motion.div>
        </motion.div>

        <h3 className="text-2xl font-bold mb-3">{t('contribution.success.title')}</h3>
        <p className="text-muted-foreground max-w-md mb-10 leading-relaxed">
          {t('contribution.success.message')}
          <br />
          <span className="text-sm font-medium text-primary mt-2 inline-block">
            +10 XP earned! Keep going to reach your daily goal.
          </span>
        </p>

        <Button
          onClick={handleContributeAnother}
          size="lg"
          className="rounded-none px-8 h-12 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all gap-2"
        >
          {t('contribution.success.contributeAnother')}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // 3. Main Work Area
  return (
    <AnimatePresence mode="wait">
      {mode === 'record' ? (
        <motion.div
          key="record"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex-1 flex flex-col"
        >
          {/* Progress Header */}
          <div className="px-6 pt-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              <div className={cn("h-1.5 w-8 rounded-none transition-all duration-500", recordingStep === 'record' ? "bg-primary" : "bg-muted")} />
              <div className={cn("h-1.5 w-8 rounded-none transition-all duration-500", recordingStep === 'transcribe' ? "bg-primary" : "bg-muted")} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {recordingStep === 'record' ? 'Step 1: Speak' : 'Step 2: Review'}
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
            {recordingStep === 'record' ? (
              <AudioRecorder
                onRecordingComplete={handleRecordingComplete}
                onCancel={handleCancelRecording}
              />
            ) : (
              <div className="w-full h-full p-6 md:p-8 overflow-y-auto custom-scrollbar">
                <TranscriptionEditor
                  audioUrl={recordedBlob ? URL.createObjectURL(recordedBlob) : null}
                  onSubmit={handleSubmitContribution}
                  onBack={handleCancelRecording}
                  isSubmitting={isSubmitting}
                />
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="correct"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex-1 flex flex-col"
        >
          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
            <CorrectionQueue
              userId={userId}
              onComplete={handleCorrectionComplete}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
