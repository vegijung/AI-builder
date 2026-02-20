import { supabase, isSupabaseConfigured } from './supabase';

const ALLOWED_DOMAIN = import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN || '@mmgmc.ch';

export function isAllowedEmail(email) {
  return email?.toLowerCase().endsWith(ALLOWED_DOMAIN);
}

export async function signInWithEmail(email) {
  if (!isSupabaseConfigured()) throw new Error('Supabase is not configured');
  if (!isAllowedEmail(email)) throw new Error('Only @mmgmc.ch email addresses are allowed');

  const { data, error } = await supabase.auth.signInWithOtp({
    email: email.toLowerCase(),
    options: { shouldCreateUser: true },
  });

  if (error) throw error;
  return data;
}

export async function verifyOtp(email, token) {
  if (!isSupabaseConfigured()) throw new Error('Supabase is not configured');

  const { data, error } = await supabase.auth.verifyOtp({
    email: email.toLowerCase(),
    token,
    type: 'email',
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  if (!isSupabaseConfigured()) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export function onAuthStateChange(callback) {
  if (!isSupabaseConfigured()) return { data: { subscription: { unsubscribe: () => {} } } };
  return supabase.auth.onAuthStateChange(callback);
}
