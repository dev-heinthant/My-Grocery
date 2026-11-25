import { Session, User } from '@supabase/supabase-js';
import * as Network from 'expo-network';
import { TRANSLATIONS } from '@/constants/translations';
import {
  clearPersistedAuthSession,
  getSupabaseClient,
} from '@/services/supabaseClient';
import { Language, UserProfile } from '@/types/grocery';
import { EmailValidationIssue, validateEmailAddress } from '@/utils/validation';

export interface AuthActionResult {
  user: UserProfile | null;
  error: string | null;
  requiresEmailConfirmation?: boolean;
  isRateLimited?: boolean;
}

export function getEmailValidationMessage(
  issue: EmailValidationIssue,
  language: Language
): string {
  const t = TRANSLATIONS[language];
  switch (issue) {
    case 'empty':
      return t.emailRequiredError;
    case 'non_gmail':
      return t.gmailRequiredError;
    case 'invalid':
    default:
      return t.emailInvalidError;
  }
}

export function mapSupabaseUser(user: User | null | undefined): UserProfile | null {
  if (!user) return null;
  const email = user.email || '';
  const metaName =
    typeof user.user_metadata?.display_name === 'string'
      ? user.user_metadata.display_name.trim()
      : '';
  const fallbackName = email ? email.split('@')[0] : 'Member';
  return {
    id: user.id,
    email,
    displayName: metaName || fallbackName,
  };
}

export async function checkIsOnline(): Promise<boolean> {
  try {
    const state = await Network.getNetworkStateAsync();
    if (!state.isConnected) return false;
    if (state.isInternetReachable === false) return false;
    return true;
  } catch {
    return true;
  }
}

export async function getStoredSession(): Promise<Session | null> {
  const supabase = getSupabaseClient();
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

export function subscribeToAuthChanges(
  callback: (session: Session | null, user: UserProfile | null) => void
): () => void {
  const supabase = getSupabaseClient();
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    // Never auto-restore a session on startup; require explicit login
    if (event === 'INITIAL_SESSION') {
      return;
    }

    callback(session, mapSupabaseUser(session?.user));
  });
  return () => {
    data.subscription.unsubscribe();
  };
}

export async function signInWithEmail(
  email: string,
  password: string,
  language: Language
): Promise<AuthActionResult> {
  // Existing users with non-Gmail domains are allowed to sign in
  const emailCheck = validateEmailAddress(email, { requireGmail: false });
  if (emailCheck.issue) {
    return {
      user: null,
      error: getEmailValidationMessage(emailCheck.issue, language),
    };
  }

  const online = await checkIsOnline();
  if (!online) {
    return {
      user: null,
      error:
        language === 'my'
          ? 'အကောင့်ဝင်ရန် အင်တာနက်ချိတ်ဆက်မှု လိုအပ်ပါသည်။'
          : 'An internet connection is required to sign in.',
    };
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailCheck.normalized,
      password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    return {
      user: mapSupabaseUser(data.user),
      error: null,
    };
  } catch (err) {
    return {
      user: null,
      error:
        err instanceof Error
          ? err.message
          : 'Unable to reach the sign-in service. Please try again.',
    };
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
  language: Language
): Promise<AuthActionResult> {
  const t = TRANSLATIONS[language];
  const trimmedName = displayName.trim();
  if (!trimmedName) {
    return {
      user: null,
      error: t.usernameCannotBeEmpty,
    };
  }

  const emailCheck = validateEmailAddress(email, { requireGmail: true });
  if (emailCheck.issue) {
    return {
      user: null,
      error: getEmailValidationMessage(emailCheck.issue, language),
    };
  }

  const online = await checkIsOnline();
  if (!online) {
    return {
      user: null,
      error:
        language === 'my'
          ? 'အကောင့်အသစ်ဖွင့်ရန် အင်တာနက်ချိတ်ဆက်မှု လိုအပ်ပါသည်။'
          : 'An internet connection is required to create an account.',
    };
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email: emailCheck.normalized,
      password,
      options: {
        data: {
          display_name: trimmedName,
        },
      },
    });

    if (error) {
      const msg = error.message || '';
      const rateLimited =
        msg.toLowerCase().includes('rate limit') || error.status === 429;
      return {
        user: null,
        isRateLimited: rateLimited,
        error: rateLimited
          ? language === 'my'
            ? 'အကောင့်ဖွင့်မှု အကြိမ်ရေ များပြားနေပါသည်။ ခေတ္တစောင့်ဆိုင်းပြီး ထပ်မံကြိုးစားပါ။'
            : 'Too many sign-up attempts right now. Please wait a few minutes and try again.'
          : msg,
      };
    }

    if (data.user && data.session) {
      return {
        user: mapSupabaseUser(data.user),
        error: null,
      };
    }

    if (data.user && !data.session) {
      return {
        user: null,
        requiresEmailConfirmation: true,
        error:
          language === 'my'
            ? 'အကောင့်ဖွင့်ပြီးပါပြီ။ အီးမေးလ် စစ်ဆေးအတည်ပြုပြီးနောက် ပြန်လည်ဝင်ရောက်ပါ။'
            : 'Account created. Please verify your email inbox before signing in.',
      };
    }

    return {
      user: null,
      error: 'Sign-up did not return a user session.',
    };
  } catch (err) {
    return {
      user: null,
      error: err instanceof Error ? err.message : 'Sign-up failed.',
    };
  }
}

export async function updateUserDisplayName(
  newName: string
): Promise<{ user: UserProfile | null; error: string | null }> {
  const online = await checkIsOnline();
  if (!online) {
    return { user: null, error: 'Internet connection required to update profile.' };
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.updateUser({
      data: { display_name: newName.trim() },
    });
    if (error) return { user: null, error: error.message };
    return { user: mapSupabaseUser(data.user), error: null };
  } catch (err) {
    return {
      user: null,
      error: err instanceof Error ? err.message : 'Failed to update display name.',
    };
  }
}

export async function updateUserPassword(
  newPassword: string
): Promise<{ error: string | null }> {
  const online = await checkIsOnline();
  if (!online) {
    return { error: 'Internet connection required to change password.' };
  }

  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error ? error.message : null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Failed to update password.',
    };
  }
}

export async function signOutSession(): Promise<void> {
  const supabase = getSupabaseClient();
  try {
    // scope: 'local' clears the active client session without revoking server account state
    await supabase.auth.signOut({ scope: 'local' });
  } catch {
    // Ignore errors so local state still signs out cleanly
  } finally {
    await clearPersistedAuthSession();
  }
}
