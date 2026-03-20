import { supabase, isSupabaseConfigured } from '../../contribution/services/supabase';

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'superadmin';
  createdAt: Date;
}

export async function signInAdmin(email: string, password: string): Promise<{ user: AdminUser | null; error: Error | null }> {
  if (!supabase || !isSupabaseConfigured) {
    return { user: null, error: new Error('Supabase not configured') };
  }

  try {
    // Sign in with email/password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return { user: null, error: authError || new Error('Authentication failed') };
    }

    // Check if user is in admin_config table
    const { data: adminData, error: adminError } = await supabase
      .from('admin_config')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (adminError || !adminData) {
      // Not an admin - sign out immediately
      await supabase.auth.signOut();
      return { user: null, error: new Error('Access denied: Not an admin') };
    }

    const adminUser: AdminUser = {
      id: authData.user.id,
      email: authData.user.email!,
      role: (adminData.role || 'admin') as 'admin' | 'superadmin',
      createdAt: new Date(adminData.created_at || new Date().toISOString()),
    };

    return { user: adminUser, error: null };
  } catch (err) {
    return { user: null, error: err instanceof Error ? err : new Error('Login failed') };
  }
}

export async function signOutAdmin(): Promise<{ error: Error | null }> {
  if (!supabase) return { error: new Error('Supabase not configured') };
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  if (!supabase || !isSupabaseConfigured) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Verify admin status
  const { data: adminData } = await supabase
    .from('admin_config')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!adminData) return null;

  return {
    id: user.id,
    email: user.email!,
    role: (adminData.role || 'admin') as 'admin' | 'superadmin',
    createdAt: new Date(adminData.created_at || new Date().toISOString()),
  };
}

export async function checkIsAdmin(userId: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;

  const { data } = await supabase
    .from('admin_config')
    .select('user_id')
    .eq('user_id', userId)
    .single();

  return !!data;
}
