import { Session, User } from '@supabase/supabase-js';
import { TRANSLATIONS } from '../constants/translations';
import { EmailValidationIssue, Language, UserProfile } from '../types/grocery';
import { validateEmailAddress } from '../utils/validation';
import { clearPersistedAuthSession, getSupabaseClient } from './supabaseClient';

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

export function subscribeToAuthChanges(
  callback: (session: Session | null, user: UserProfile | null) => void
): () => void {
  const supabase = getSupabaseClient();
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    // Always require explicit sign-in on fresh page load; never auto-restore INITIAL_SESSION
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
  const emailCheck = validateEmailAddress(email, { requireGmail: false });
  if (emailCheck.issue) {
    return {
      user: null,
      error: getEmailValidationMessage(emailCheck.issue, language),
    };
  }

  if (!password) {
    return {
      user: null,
      error:
        language === 'my'
          ? 'ကျေးဇူးပြု၍ စကားဝှက် ရိုက်ထည့်ပါ။'
          : 'Please enter your password.',
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

  if (password.length < 6) {
    return {
      user: null,
      error: t.passwordMinLength,
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
  newName: string,
  language: Language
): Promise<{ user: UserProfile | null; error: string | null }> {
  const t = TRANSLATIONS[language];
  const trimmed = newName.trim();
  if (!trimmed) {
    return { user: null, error: t.usernameCannotBeEmpty };
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.updateUser({
      data: { display_name: trimmed },
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
  newPassword: string,
  language: Language
): Promise<{ error: string | null }> {
  const t = TRANSLATIONS[language];
  if (newPassword.length < 6) {
    return { error: t.passwordMinLength };
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
    await supabase.auth.signOut({ scope: 'local' });
  } catch {
    // Ignore errors so local state still signs out cleanly
  } finally {
    clearPersistedAuthSession();
  }
}
