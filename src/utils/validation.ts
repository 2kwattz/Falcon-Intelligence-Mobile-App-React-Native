export const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const getLoginValidationError = (email: string, password: string): string | null => {
  if (!isValidEmail(email)) return 'Enter a valid email address.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  return null;
};
