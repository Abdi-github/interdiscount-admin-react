// ─── Zod-compatible, standalone validators ────────────────────────────────────

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^(\+41|0041|0)[1-9]\d{8}$/;
// Requires uppercase, lowercase, digit, and special char, min 8 chars
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function isValidPassword(password: string): boolean {
  return PASSWORD_REGEX.test(password);
}

export function isNonEmptyString(value: string): boolean {
  return value.trim().length > 0;
}

export function isPositiveNumber(value: number): boolean {
  return !isNaN(value) && value > 0;
}

// Accepts ISO date strings
export function isValidDate(value: string): boolean {
  return !isNaN(Date.parse(value));
}
