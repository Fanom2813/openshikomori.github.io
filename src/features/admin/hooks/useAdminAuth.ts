import { useState, useEffect, useCallback } from 'react';
import { signInAdmin, signOutAdmin, getCurrentAdmin, checkIsAdmin, type AdminUser } from '../services/adminAuth';
import { supabase, isSupabaseConfigured } from '../../contribution/services/supabase';

interface AdminAuthState {
  admin: AdminUser | null;
  loading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
}

export function useAdminAuth() {
  const [state, setState] = useState<AdminAuthState>({
    admin: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  });

  // Check auth status on mount
  useEffect(() => {
    let mounted = true;

    const checkAuth = async (source: string) => {
      console.log(`Admin Auth [${source}]: Checking status...`);
      if (!isSupabaseConfigured) {
        console.warn(`Admin Auth [${source}]: Supabase not configured`);
        if (mounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: new Error('Supabase not configured'),
          }));
        }
        return;
      }

      try {
        const admin = await getCurrentAdmin();
        console.log(`Admin Auth [${source}]: Check complete, admin:`, admin?.email || 'none');
        if (mounted) {
          setState({
            admin,
            loading: false,
            error: null,
            isAuthenticated: !!admin,
          });
        }
      } catch (err) {
        console.error(`Admin Auth [${source}]: Check failed:`, err);
        if (mounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: err instanceof Error ? err : new Error('Auth check failed'),
          }));
        }
      }
    };

    // Initial check
    checkAuth('Init');

    // Safety timeout: Ensure loading is cleared even if Supabase hangs
    const safetyTimeout = setTimeout(() => {
      if (mounted && state.loading) {
        console.warn('Admin Auth: Safety timeout reached, forcing loading state to false');
        setState(prev => ({ ...prev, loading: false }));
      }
    }, 5000);

    // Listen for auth changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log(`Admin Auth [Event]: ${event}`);
          if (!mounted) return;

          // For any meaningful auth change, re-verify admin status
          if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
            if (session?.user) {
              try {
                const isAdmin = await checkIsAdmin(session.user.id);
                if (isAdmin) {
                  const admin = await getCurrentAdmin();
                  if (mounted) {
                    setState({
                      admin,
                      loading: false,
                      error: null,
                      isAuthenticated: true,
                    });
                  }
                } else {
                  console.warn('Admin Auth: Logged in user is not an admin');
                  if (mounted) {
                    setState({
                      admin: null,
                      loading: false,
                      error: null,
                      isAuthenticated: false,
                    });
                  }
                }
              } catch (err) {
                console.error('Admin Auth: Change handling failed:', err);
              }
            } else {
              // No user session
              if (mounted) {
                setState({
                  admin: null,
                  loading: false,
                  error: null,
                  isAuthenticated: false,
                });
              }
            }
          } else if (event === 'SIGNED_OUT') {
            if (mounted) {
              setState({
                admin: null,
                loading: false,
                error: null,
                isAuthenticated: false,
              });
            }
          }
        }
      );

      return () => {
        mounted = false;
        clearTimeout(safetyTimeout);
        subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { user, error } = await signInAdmin(email, password);

      if (error || !user) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error || new Error('Login failed'),
          isAuthenticated: false,
        }));
        return false;
      }

      setState({
        admin: user,
        loading: false,
        error: null,
        isAuthenticated: true,
      });
      return true;
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err : new Error('Login failed'),
        isAuthenticated: false,
      }));
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    await signOutAdmin();
    setState({
      admin: null,
      loading: false,
      error: null,
      isAuthenticated: false,
    });
  }, []);

  return {
    ...state,
    login,
    logout,
  };
}
