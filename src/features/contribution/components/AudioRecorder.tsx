import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Play, RotateCcw, AlertCircle } from 'lucide-react';
import { useAudioRecorder, formatDuration } from '../hooks/useAudioRecorder';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
  onCancel: () => void;
}

export function AudioRecorder({ onRecordingComplete, onCancel }: AudioRecorderProps) {
  const {
    recordingState,
    audioBlob,
    audioUrl,
    duration,
    error,
    waveformData,
    startRecording,
    stopRecording,
    resetRecording,
    requestPermission,
  } = useAudioRecorder();

  const [isPlaying, setIsPlaying] = useState(false);

  const handleStart = async () => {
    if (recordingState === 'idle') {
      const permitted = await requestPermission();
      if (permitted) {
        await startRecording();
      }
    } else {
      await startRecording();
    }
  };

  const handleStop = () => {
    stopRecording();
  };

  const handleComplete = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob, duration);
    }
  };

  const handlePlay = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlaying(false);
      audio.play();
      setIsPlaying(true);
    }
  };

  const isRecording = recordingState === 'recording';
  const hasRecording = recordingState === 'stopped' && audioBlob;

  return (
    <div className="flex flex-col items-center justify-center gap-10 p-10 w-full max-w-md mx-auto">
      {/* Status & Duration */}
      <div className="text-center space-y-2">
        <div className="h-6">
          <AnimatePresence mode="wait">
            {isRecording ? (
              <motion.div
                key="recording"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center gap-2 text-red-500 font-bold text-xs uppercase tracking-widest"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-none bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-none h-2 w-2 bg-red-500" />
                </span>
                Recording
              </motion.div>
            ) : hasRecording ? (
              <motion.span
                key="review"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400"
              >
                Review Recording
              </motion.span>
            ) : (
              <motion.span
                key="ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
              >
                Ready to Record
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className="text-6xl font-black tracking-tighter tabular-nums text-foreground">
          {formatDuration(duration)}
        </div>
      </div>

      {/* Waveform Visualization (Center Stage) */}
      <div className="h-24 w-full flex items-center justify-center px-4">
        {(isRecording || hasRecording) ? (
          <div className="flex items-center gap-1 h-full w-full max-w-xs">
            {waveformData.length > 0 ? (
              waveformData.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ height: 4 }}
                  animate={{ height: `${Math.max(4, value * 100)}%` }}
                  className="flex-1 bg-primary rounded-none transition-all duration-75"
                />
              ))
            ) : (
              Array.from({ length: 32 }).map((_, index) => (
                <div
                  key={index}
                  className="flex-1 bg-primary/20 rounded-none h-2"
                />
              ))
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1 h-2 w-full max-w-xs opacity-20">
            {Array.from({ length: 32 }).map((_, index) => (
              <div key={index} className="flex-1 bg-muted-foreground rounded-none h-2" />
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-8 w-full">
        {!hasRecording ? (
          <div className="relative">
            {isRecording ? (
              <button
                type="button"
                onClick={handleStop}
                className="h-24 w-24 flex items-center justify-center rounded-none bg-red-500 text-white hover:bg-red-600 transition-all shadow-[0_0_30px_rgba(239,68,68,0.4)] active:scale-90 ring-4 ring-red-500/20"
              >
                <Square className="h-8 w-8 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStart}
                disabled={recordingState === 'requesting'}
                className="h-28 w-28 flex items-center justify-center rounded-none bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/30 disabled:opacity-50 group"
              >
                {recordingState === 'requesting' ? (
                  <span className="h-8 w-8 border-4 border-current border-t-transparent rounded-none animate-spin" />
                ) : (
                  <Mic className="h-10 w-10 group-hover:scale-110 transition-transform" />
                )}
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-6 animate-in fade-in zoom-in duration-300">
            <button
              type="button"
              onClick={resetRecording}
              className="h-14 w-14 flex items-center justify-center rounded-none border-2 border-border hover:bg-muted hover:border-muted-foreground/30 transition-all group"
              title="Record again"
            >
              <RotateCcw className="h-6 w-6 text-muted-foreground group-hover:rotate-[-45deg] transition-transform" />
            </button>

            <button
              type="button"
              onClick={handlePlay}
              disabled={isPlaying}
              className="h-20 w-20 flex items-center justify-center rounded-none bg-background border-4 border-primary text-primary hover:bg-primary/5 transition-all active:scale-90 shadow-lg"
            >
              <Play className="h-10 w-10 fill-current ml-1" />
            </button>

            <button
              type="button"
              onClick={handleComplete}
              className="h-14 px-8 bg-primary text-primary-foreground font-bold rounded-none hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95"
            >
              Continue
            </button>
          </div>
        )}
      </div>

      {/* Instructions */}
      <p className="text-sm font-medium text-muted-foreground/60 text-center">
        {!hasRecording
          ? 'Tap the mic and speak clearly'
          : 'Sounds good? Let\'s transcribe it.'}
      </p>
    </div>
  );
}
