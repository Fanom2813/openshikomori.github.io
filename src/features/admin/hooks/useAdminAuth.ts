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
    const checkAuth = async () => {
      if (!isSupabaseConfigured) {
        setState({
          admin: null,
          loading: false,
          error: new Error('Supabase not configured'),
          isAuthenticated: false,
        });
        return;
      }

      const admin = await getCurrentAdmin();
      setState({
        admin,
        loading: false,
        error: null,
        isAuthenticated: !!admin,
      });
    };

    checkAuth();

    // Listen for auth changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (session?.user) {
            const isAdmin = await checkIsAdmin(session.user.id);
            if (isAdmin) {
              const admin = await getCurrentAdmin();
              setState({
                admin,
                loading: false,
                error: null,
                isAuthenticated: true,
              });
            } else {
              // User is logged in but not admin
              await signOutAdmin();
              setState({
                admin: null,
                loading: false,
                error: new Error('Access denied'),
                isAuthenticated: false,
              });
            }
          } else {
            setState({
              admin: null,
              loading: false,
              error: null,
              isAuthenticated: false,
            });
          }
        }
      );

      return () => subscription.unsubscribe();
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

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
