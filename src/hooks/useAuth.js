/*
 * useAuth.js Authentication hook. Wraps Supabase auth for sign-in,
 * sign-up, sign-out, and password reset. Exposes the current user object.
 */
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient.js';

// Manages auth session state and exposes all auth actions.
export function useAuth() {
  const [user,         setUser]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [resetMode,    setResetMode]    = useState(false); // true when user arrives via reset link

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      // Supabase fires PASSWORD_RECOVERY when the user clicks the reset link
      if (event === 'PASSWORD_RECOVERY') setResetMode(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Send reset email
  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin, // redirects back to the app
    });
    return { data, error };
  };

  // Called after user clicks the email link and sets a new password
  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (!error) setResetMode(false);
    return { data, error };
  };

  return { user, loading, resetMode, signUp, signIn, signOut, resetPassword, updatePassword };
}
