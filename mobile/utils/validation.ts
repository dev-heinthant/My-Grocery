export type EmailValidationIssue = 'empty' | 'invalid' | 'non_gmail';

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isGmailAddress(email: string): boolean {
  const normalized = sanitizeEmail(email);
  const parts = normalized.split('@');
  return parts.length === 2 && parts[1] === 'gmail.com';
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

export function isValidQuantity(value: number): boolean {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

export function parseQuantityInput(raw: string): number {
  const parsed = Number(raw.trim());
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 1;
  }
  return Math.round(parsed * 100) / 100;
}

export function formatQuantityBadge(quantity: number, unit: string): string {
  const cleanQty = Number.isInteger(quantity) ? String(quantity) : String(Math.round(quantity * 100) / 100);
  const cleanUnit = unit.trim() || 'pcs';
  return `${cleanQty} ${cleanUnit}`;
}
