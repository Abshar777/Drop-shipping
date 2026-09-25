// Validation rules shared by the sign-up form (instant feedback) and the API (authoritative).
// Pure module: no server-only imports.

export const PASSWORD_MIN_LENGTH = 8;
export const NAME_MAX_LENGTH = 80;
export const EMAIL_MAX_LENGTH = 254;

// Practical email check: something@something.tld, no spaces.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(email: string): boolean {
  return email.length <= EMAIL_MAX_LENGTH && EMAIL_RE.test(email);
}

/** At least 8 characters with a letter and a number. */
export function isStrongEnough(password: string): boolean {
  return password.length >= PASSWORD_MIN_LENGTH && /[A-Za-z]/.test(password) && /\d/.test(password);
}

export type AuthErrorCode =
  | "invalid_body"
  | "name_required"
  | "email_required"
  | "invalid_email"
  | "password_required"
  | "password_weak"
  | "password_mismatch"
  | "email_exists"
  | "already_signed_in"
  | "invalid_credentials"
  | "too_many_attempts"
  | "server_error";

export type AuthField = "name" | "email" | "password" | "confirmPassword";

/** User-facing messages. Codes let the storefront show them in the visitor's language. */
export const AUTH_MESSAGES: Record<AuthErrorCode, string> = {
  invalid_body: "We couldn't read the form. Please try again.",
  name_required: "Please enter your name.",
  email_required: "Please enter your email address.",
  invalid_email: "Please enter a valid email address, like name@example.com.",
  password_required: "Please enter a password.",
  password_weak: `Password must be at least ${PASSWORD_MIN_LENGTH} characters and include a letter and a number.`,
  password_mismatch: "Password and confirm password do not match.",
  email_exists: "An account with this email address already exists. Please sign in instead or use a different email address.",
  already_signed_in: "You're already signed in. Log out first to create another account.",
  invalid_credentials: "The email or password is incorrect.",
  too_many_attempts: "Too many attempts. Please wait a few minutes and try again.",
  server_error: "Something went wrong on our side. Please try again in a moment.",
};

export type SignupInput = { name?: unknown; email?: unknown; password?: unknown; confirmPassword?: unknown };

export type SignupValidation =
  | { ok: true; name: string; email: string; password: string }
  | { ok: false; code: AuthErrorCode; field: AuthField };

const str = (v: unknown) => (typeof v === "string" ? v : "");

/** Checks every rule and reports the first failure, in the order the fields appear on the form. */
export function validateSignup(input: SignupInput): SignupValidation {
  const name = str(input.name).trim().slice(0, NAME_MAX_LENGTH);
  const email = str(input.email).trim().toLowerCase();
  const password = str(input.password);
  const confirm = input.confirmPassword;

  if (!name) return { ok: false, code: "name_required", field: "name" };
  if (!email) return { ok: false, code: "email_required", field: "email" };
  if (!isValidEmail(email)) return { ok: false, code: "invalid_email", field: "email" };
  if (!password) return { ok: false, code: "password_required", field: "password" };
  if (!isStrongEnough(password)) return { ok: false, code: "password_weak", field: "password" };
  // Confirmation is optional for API clients but enforced whenever it is sent (the form always sends it).
  if (confirm !== undefined && str(confirm) !== password) return { ok: false, code: "password_mismatch", field: "confirmPassword" };

  return { ok: true, name, email, password };
}
