export type PasswordPolicyResult = {
  length: boolean;
  uppercase: boolean;
  digit: boolean;
  special: boolean;
  score: number;
  isValid: boolean;
};

export function evaluatePasswordPolicy(password: string): PasswordPolicyResult {
  const length = password.length >= 8;
  const uppercase = /[A-Z]/.test(password);
  const digit = /\d/.test(password);
  const special = /[^A-Za-z0-9]/.test(password);

  const score = [length, uppercase, digit, special].filter(Boolean).length;

  return {
    length,
    uppercase,
    digit,
    special,
    score,
    isValid: length && uppercase && digit,
  };
}
