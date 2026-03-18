import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Loader2, LogIn, UserPlus, User } from 'lucide-react';

interface EntryChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmailAuth: (email: string, password: string, isSignUp: boolean) => Promise<void>;
  onAnonymousAuth: () => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export function EntryChoiceModal({
  isOpen,
  onClose,
  onEmailAuth,
  onAnonymousAuth,
  isLoading = false,
  error,
}: EntryChoiceModalProps) {
  const { t } = useTranslation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    await onEmailAuth(email.trim(), password.trim(), isSignUp);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 text-center border-b border-border">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {isSignUp ? t('auth.entryModal.signUpTitle') : t('auth.entryModal.signInTitle')}
          </h2>
          <p className="text-muted-foreground text-sm">
            {isSignUp
              ? t('auth.entryModal.signUpSubtitle')
              : t('auth.entryModal.signInSubtitle')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error message */}
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
              {error}
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              {t('auth.entryModal.emailLabel')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.entryModal.emailPlaceholder')}
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              {t('auth.entryModal.passwordLabel')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.entryModal.passwordPlaceholder')}
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
                minLength={6}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {isSignUp && t('auth.entryModal.passwordHint')}
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !email.trim() || !password.trim()}
            className="w-full h-12 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isSignUp ? t('auth.entryModal.creatingAccount') : t('auth.entryModal.signingIn')}
              </>
            ) : (
              <>
                {isSignUp ? (
                  <>
                    <UserPlus className="h-4 w-4" />
                    {t('auth.entryModal.signUpButton')}
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    {t('auth.entryModal.signInButton')}
                  </>
                )}
              </>
            )}
          </button>

          {/* Toggle Sign In/Sign Up */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-primary hover:underline"
            >
              {isSignUp
                ? t('auth.entryModal.hasAccount')
                : t('auth.entryModal.noAccount')}
            </button>
          </div>

          {/* Anonymous Option */}
          <div className="relative pt-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">{t('common:or', 'or')}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onAnonymousAuth}
            disabled={isLoading}
            className="w-full h-12 px-4 flex items-center justify-center gap-3 rounded-lg font-medium bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <User className="h-5 w-5" />
            {t('auth.entryModal.anonymousButton')}
          </button>

          {/* Info */}
          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              {t('auth.entryModal.footerInfo')}
            </p>
            <p className="text-[10px] text-muted-foreground/70 mt-1">
              {t('auth.entryModal.anonymousInfo')}
            </p>
          </div>
        </form>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <span className="sr-only">{t('auth.entryModal.closeAria')}</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
