import { useState, useEffect, useCallback } from 'react';
import { isSupabaseConfigured } from '../services/supabase';
import { signInWithEmail, verifyOtp, signOut as authSignOut, getSession, onAuthStateChange, isAllowedEmail } from '../services/auth';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user ? isAllowedEmail(user.email) : false;

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // Get initial session
    getSession().then(session => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email) => {
    return signInWithEmail(email);
  }, []);

  const verify = useCallback(async (email, token) => {
    return verifyOtp(email, token);
  }, []);

  const signOut = useCallback(async () => {
    await authSignOut();
    setUser(null);
  }, []);

  return { user, loading, isAdmin, signIn, verify, signOut };
}
