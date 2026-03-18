import { useState, useRef, useCallback, useEffect } from 'react';

interface TranscriptionState {
  text: string;
  isListening: boolean;
  confidence: number;
  error: string | null;
  interimText: string;
}

interface TranscriptionActions {
  startTranscription: (language?: string) => void;
  stopTranscription: () => void;
  resetTranscription: () => void;
  setText: (text: string) => void;
}

// Extend Window interface for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export function useTranscription(): TranscriptionState & TranscriptionActions {
  const [text, setTextState] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startTranscription = useCallback((language?: string) => {
    // Check for SpeechRecognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    try {
      setError(null);
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language || 'fr-FR'; // Default to French
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        let totalConfidence = 0;
        let resultCount = 0;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
            totalConfidence += result[0].confidence;
            resultCount++;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        if (finalTranscript) {
          setTextState(prev => prev + finalTranscript);
        }
        setInterimText(interimTranscript);

        if (resultCount > 0) {
          setConfidence(totalConfidence / resultCount);
        }
      };

      recognition.onerror = (event) => {
        if (event.error === 'no-speech') {
          // No speech detected is not a fatal error
          return;
        }
        if (event.error === 'aborted') {
          // User aborted, not an error
          return;
        }
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start transcription';
      setError(message);
    }
  }, []);

  const stopTranscription = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimText('');
  }, []);

  const resetTranscription = useCallback(() => {
    stopTranscription();
    setTextState('');
    setInterimText('');
    setConfidence(0);
    setError(null);
  }, [stopTranscription]);

  const setText = useCallback((newText: string) => {
    setTextState(newText);
  }, []);

  return {
    text,
    interimText,
    isListening,
    confidence,
    error,
    startTranscription,
    stopTranscription,
    resetTranscription,
    setText,
  };
}

// Check if transcription is supported
export function isTranscriptionSupported(): boolean {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

// Language mapping for speech recognition
export const speechRecognitionLanguages: Record<string, string> = {
  comorian: 'fr-FR', // No specific code, use French as fallback
  french: 'fr-FR',
  arabic: 'ar-SA',
};
