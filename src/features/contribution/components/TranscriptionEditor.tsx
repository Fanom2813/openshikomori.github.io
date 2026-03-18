import { useState, useEffect } from 'react';
import { Mic, Check, Loader2, Globe, Languages } from 'lucide-react';
import { useTranscription, isTranscriptionSupported, speechRecognitionLanguages } from '../hooks/useTranscription';
import type { LanguageOption, DialectOption } from '../types';

const languages: LanguageOption[] = [
  { code: 'comorian', label: 'Comorian', labelFr: 'Comorien', labelAr: 'القمرية' },
  { code: 'french', label: 'French', labelFr: 'Français', labelAr: 'الفرنسية' },
  { code: 'arabic', label: 'Arabic', labelAr: 'العربية', labelFr: 'Arabe' },
];

const dialects: DialectOption[] = [
  { code: 'shingazidja', label: 'Shingazidja (Ngazidja)', labelFr: 'Shingazidja (Ngazidja)', labelAr: 'شينغازيجا' },
  { code: 'shindzuani', label: 'Shindzuani (Ndzuani)', labelFr: 'Shindzuani (Ndzuani)', labelAr: 'شيندزواني' },
  { code: 'shimwali', label: 'Shimwali (Mwali)', labelFr: 'Shimwali (Mwali)', labelAr: 'شيموالي' },
  { code: 'shimaore', label: 'Shimaore (Mayotte)', labelFr: 'Shimaore (Mayotte)', labelAr: 'شيماوري' },
];

interface TranscriptionEditorProps {
  initialText?: string;
  audioUrl: string | null;
  onSubmit: (data: {
    transcription: string;
    language: LanguageOption['code'];
    dialect?: DialectOption['code'];
  }) => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export function TranscriptionEditor({
  initialText = '',
  audioUrl,
  onSubmit,
  onBack,
  isSubmitting = false,
}: TranscriptionEditorProps) {
  const [transcription, setTranscription] = useState(initialText);
  const [language, setLanguage] = useState<LanguageOption['code']>('comorian');
  const [dialect, setDialect] = useState<DialectOption['code'] | undefined>(undefined);
  const [autoTranscribeEnabled] = useState(isTranscriptionSupported());

  const {
    text: autoText,
    interimText,
    isListening,
    startTranscription,
    stopTranscription,
    resetTranscription,
  } = useTranscription();

  // Update transcription when auto-text changes
  useEffect(() => {
    if (autoText) {
      setTranscription(prev => prev + (prev ? ' ' : '') + autoText);
    }
  }, [autoText]);

  const handleAutoTranscribe = () => {
    if (isListening) {
      stopTranscription();
    } else {
      resetTranscription();
      const langCode = speechRecognitionLanguages[language] || 'fr-FR';
      startTranscription(langCode);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcription.trim()) return;

    onSubmit({
      transcription: transcription.trim(),
      language,
      dialect,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {/* Audio Player */}
      {audioUrl && (
        <div className="p-4 bg-muted/50 rounded-none border border-border/50">
          <audio
            src={audioUrl}
            controls
            className="w-full h-10"
          />
        </div>
      )}

      {/* Auto-transcribe button */}
      {autoTranscribeEnabled && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleAutoTranscribe}
            className={`flex items-center gap-2 px-4 py-2 rounded-none text-sm font-medium transition-all ${
              isListening
                ? 'bg-red-100 text-red-700 animate-pulse'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            <Mic className="h-4 w-4" />
            {isListening ? 'Stop listening' : 'Auto-transcribe'}
          </button>
        </div>
      )}

      {/* Interim text */}
      {interimText && (
        <p className="text-sm text-muted-foreground italic text-center">
          {interimText}...
        </p>
      )}

      {/* Transcription textarea */}
      <div className="space-y-2">
        <label htmlFor="transcription" className="text-sm font-medium">
          Transcription
        </label>
        <textarea
          id="transcription"
          value={transcription}
          onChange={(e) => setTranscription(e.target.value)}
          placeholder="Type or speak what you hear in the recording..."
          className="w-full min-h-[120px] p-3 rounded border border-input bg-background text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      {/* Language selection */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" />
            Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageOption['code'])}
            className="w-full h-10 px-3 rounded border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {language === 'comorian' && (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Languages className="h-3.5 w-3.5" />
              Dialect (optional)
            </label>
            <select
              value={dialect || ''}
              onChange={(e) => setDialect(e.target.value as DialectOption['code'] || undefined)}
              className="w-full h-10 px-3 rounded border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Any dialect</option>
              {dialects.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 h-11 px-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!transcription.trim() || isSubmitting}
          className="flex-1 h-11 px-4 bg-primary text-primary-foreground font-medium rounded flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Submit
            </>
          )}
        </button>
      </div>
    </form>
  );
}
