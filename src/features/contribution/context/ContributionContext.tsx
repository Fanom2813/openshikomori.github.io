import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { useUpdateProfile } from '../hooks/useContributions';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface ContributionContextType {
  // Modal state
  isEntryModalOpen: boolean;
  isProfileModalOpen: boolean;

  // Actions
  openContributionModal: () => void;
  closeEntryModal: () => void;
  closeProfileModal: () => void;

  // Auth handlers
  handleEmailAuth: (email: string, password: string, isSignUp: boolean) => Promise<void>;
  handleAnonymousAuth: () => Promise<void>;
  handleProfileSetup: (profile: { displayName: string; avatar: string }) => Promise<void>;
  convertAnonymousToPermanent: (email: string, password: string) => Promise<boolean>;

  // Loading states
  isAuthLoading: boolean;
  isProfileSubmitting: boolean;

  // Error state
  authError: string | null;
  clearAuthError: () => void;

  // User type
  isAnonymous: boolean;
}

const ContributionContext = createContext<ContributionContextType | null>(null);

export function ContributionProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { user, loading: authLoading, refreshUser, hasPublicProfile } = useAuth();
  const { isUpdating: isProfileSubmitting, updateProfile } = useUpdateProfile(user?.uid);

  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check auth status when modal opens to determine flow
  useEffect(() => {
    if (!isEntryModalOpen || authLoading) return;

    if (user?.uid) {
      // User is already authenticated
      if (!hasPublicProfile) {
        // User needs profile setup
        setIsEntryModalOpen(false);
        setIsProfileModalOpen(true);
      } else {
        // Fully authenticated - navigate to contribute page
        setIsEntryModalOpen(false);
        navigate('/contribute');
      }
    }
    // If no user, entry modal stays open for auth
  }, [isEntryModalOpen, user, authLoading, hasPublicProfile, navigate]);

  // Check for existing session on mount (for OAuth callbacks if we add them later)
  useEffect(() => {
    const checkSession = async () => {
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await refreshUser();
      }
    };
    checkSession();
  }, [refreshUser]);

  const openContributionModal = useCallback(() => {
    if (authLoading) return;

    if (user?.uid) {
      if (!hasPublicProfile) {
        setIsProfileModalOpen(true);
      } else {
        navigate('/contribute');
      }
      return;
    }

    setAuthError(null);
    setIsEntryModalOpen(true);
  }, [user, authLoading, hasPublicProfile, navigate]);

  const closeEntryModal = useCallback(() => {
    setIsEntryModalOpen(false);
    setAuthError(null);
  }, []);

  const closeProfileModal = useCallback(() => {
    setIsProfileModalOpen(false);
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const handleAnonymousAuth = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthError('Supabase not configured');
      return;
    }

    setIsAuthLoading(true);
    setAuthError(null);

    try {
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        setAuthError(error.message);
        return;
      }

      if (data.user) {
        await refreshUser();
        // Anonymous users don't need profile setup, go straight to contribute
        setIsEntryModalOpen(false);
        navigate('/contribute');
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Anonymous sign-in failed');
    } finally {
      setIsAuthLoading(false);
    }
  }, [refreshUser, navigate]);

  const convertAnonymousToPermanent = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthError('Supabase not configured');
      return false;
    }

    // Check if user is anonymous
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser?.is_anonymous) {
      setAuthError('Only anonymous users can be converted');
      return false;
    }

    setIsAuthLoading(true);
    setAuthError(null);

    try {
      // Link email identity to anonymous user using updateUser
      const { error: updateError } = await supabase.auth.updateUser({
        email,
        password,
      });

      if (updateError) {
        if (updateError.message.includes('already registered')) {
          setAuthError('An account with this email already exists.');
        } else if (updateError.message.includes('password')) {
          setAuthError('Password must be at least 6 characters.');
        } else {
          setAuthError(updateError.message);
        }
        return false;
      }

      // User is now permanent - refresh and show profile setup
      await refreshUser();
      return true;
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Failed to convert account');
      return false;
    } finally {
      setIsAuthLoading(false);
    }
  }, [refreshUser]);

  const handleEmailAuth = useCallback(async (email: string, password: string, isSignUp: boolean) => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthError('Supabase not configured');
      return;
    }

    setIsAuthLoading(true);
    setAuthError(null);

    try {
      if (isSignUp) {
        // Sign up with email/password
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          // Handle specific error messages
          if (error.message.includes('already registered')) {
            setAuthError('An account with this email already exists. Please sign in instead.');
          } else if (error.message.includes('password')) {
            setAuthError('Password must be at least 6 characters long.');
          } else {
            setAuthError(error.message);
          }
          return;
        }

        if (data.user) {
          await refreshUser();
          // After sign up, user needs profile setup
          setIsEntryModalOpen(false);
          setIsProfileModalOpen(true);
        }
      } else {
        // Sign in with email/password
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // Handle specific error messages (don't reveal if email exists)
          if (error.message.includes('Invalid login credentials')) {
            setAuthError('Invalid email or password. Please try again.');
          } else {
            setAuthError(error.message);
          }
          return;
        }

        if (data.user) {
          await refreshUser();
          setIsEntryModalOpen(false);

          // Check if profile is needed
          const { data: profile } = await supabase
            .from('users')
            .select('is_public, display_name')
            .eq('id', data.user.id)
            .single();

          if (!(profile as any)?.is_public) {
            setIsProfileModalOpen(true);
          } else {
            navigate('/contribute');
          }
        }
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    } finally {
      setIsAuthLoading(false);
    }
  }, [refreshUser, navigate]);

  const handleProfileSetup = useCallback(async (profile: { displayName: string; avatar: string }) => {
    if (!user?.uid) return;

    try {
      const success = await updateProfile({
        displayName: profile.displayName,
        avatar: profile.avatar,
        isPublic: true,
      });

      if (success) {
        setIsProfileModalOpen(false);
        await refreshUser();
        navigate('/contribute');
      }
    } catch (err) {
      console.error('Profile setup failed:', err);
    }
  }, [user?.uid, updateProfile, refreshUser, navigate]);

  return (
    <ContributionContext.Provider
      value={{
        isEntryModalOpen,
        isProfileModalOpen,
        openContributionModal,
        closeEntryModal,
        closeProfileModal,
        handleEmailAuth,
        handleAnonymousAuth,
        handleProfileSetup,
        convertAnonymousToPermanent,
        isAuthLoading,
        isProfileSubmitting,
        authError,
        clearAuthError,
        isAnonymous: user?.uid ? !hasPublicProfile : false,
      }}
    >
      {children}
    </ContributionContext.Provider>
  );
}

export function useContribution() {
  const context = useContext(ContributionContext);
  if (!context) {
    throw new Error('useContribution must be used within a ContributionProvider');
  }
  return context;
}
