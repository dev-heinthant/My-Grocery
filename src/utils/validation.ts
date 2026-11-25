import { EmailValidationIssue } from '../types/grocery';

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateEmailAddress(
  rawEmail: string,
  options: { requireGmail?: boolean } = {}
): { normalized: string; issue: EmailValidationIssue | null } {
  const trimmed = rawEmail.trim();
  if (!trimmed) {
    return { normalized: '', issue: 'empty' };
  }

  const normalized = trimmed.toLowerCase();
  if (/\s/.test(normalized)) {
    return { normalized, issue: 'invalid' };
  }

  const parts = normalized.split('@');
  if (parts.length !== 2) {
    return { normalized, issue: 'invalid' };
  }

  const [localPart, domainPart] = parts;
  if (
    !localPart ||
    !domainPart ||
    localPart.startsWith('.') ||
    localPart.endsWith('.') ||
    localPart.includes('..') ||
    domainPart.startsWith('.') ||
    domainPart.endsWith('.') ||
    domainPart.includes('..') ||
    !domainPart.includes('.')
  ) {
    return { normalized, issue: 'invalid' };
  }

  const tld = domainPart.split('.').pop() ?? '';
  if (tld.length < 2) {
    return { normalized, issue: 'invalid' };
  }

  if (options.requireGmail && domainPart !== 'gmail.com') {
    return { normalized, issue: 'non_gmail' };
  }

  return { normalized, issue: null };
}
