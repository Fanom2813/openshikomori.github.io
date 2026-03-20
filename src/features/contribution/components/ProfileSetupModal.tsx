import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, ArrowRight } from 'lucide-react';
import { avatarOptions, getAvatarById } from '../data/avatars';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (profile: { displayName: string; avatar: string }) => void;
  isSubmitting?: boolean;
  userEmail?: string;
}

export function ProfileSetupModal({
  isOpen,
  onSubmit,
  isSubmitting = false,
}: ProfileSetupModalProps) {
  const { t } = useTranslation();
  const [displayName, setDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0]!.id);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    onSubmit({
      displayName: displayName.trim(),
      avatar: selectedAvatar,
    });
  };

  const selectedAvatarData = getAvatarById(selectedAvatar);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 text-center border-b border-border">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-3">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{t('auth.profileModal.title')}</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {t('auth.profileModal.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Preview */}
          <div className="flex flex-col items-center p-6 bg-muted/50 rounded-xl">
            {selectedAvatarData && (
              <div
                className="h-24 w-24 rounded-full flex items-center justify-center text-5xl shadow-lg mb-3"
                style={{ backgroundColor: selectedAvatarData.bgColor }}
              >
                {selectedAvatarData.emoji}
              </div>
            )}
            <p className="text-xl font-semibold">
              {displayName.trim() || t('auth.profileModal.previewName')}
            </p>
            <p className="text-sm text-muted-foreground">{t('auth.profileModal.previewRole')}</p>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <label htmlFor="displayName" className="text-sm font-medium">
              {t('auth.profileModal.displayNameLabel')}
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t('auth.profileModal.displayNamePlaceholder')}
              className="w-full h-11 px-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={30}
              required
              autoFocus
            />
          </div>

          {/* Avatar Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('auth.profileModal.avatarLabel')}</label>
            <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 bg-muted/30 rounded-lg">
              {avatarOptions.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={`h-12 w-12 rounded-full flex items-center justify-center text-xl transition-all ${
                    selectedAvatar === avatar.id
                      ? 'ring-2 ring-primary ring-offset-2 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: avatar.bgColor }}
                  title={avatar.label}
                >
                  {avatar.emoji}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!displayName.trim() || isSubmitting}
            className="w-full h-12 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? t('auth.profileModal.submitting') : (
              <>
                {t('auth.profileModal.submitButton')}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
