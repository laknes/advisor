import { createHash } from 'crypto';

const RESET_TTL_MS = 1000 * 60 * 30;
const resetStore = new Map<string, { userId: string; email: string; expiresAt: number }>();

function buildKey(userId: string, email: string) {
  return createHash('sha256').update(`${userId}:${email}:${process.env.JWT_SECRET || 'fallback-secret'}`).digest('hex');
}

export function createPasswordResetToken(userId: string, email: string) {
  const token = createHash('sha256')
    .update(`${userId}:${email}:${Date.now()}:${Math.random().toString(36).slice(2)}`)
    .digest('hex')
    .slice(0, 32);

  const expiresAt = Date.now() + RESET_TTL_MS;
  resetStore.set(token, { userId, email: email.toLowerCase(), expiresAt });

  return { token, expiresAt };
}

export function consumePasswordResetToken(token: string, email: string) {
  const record = resetStore.get(token);
  if (!record) return null;
  if (record.email !== email.toLowerCase()) return null;
  if (record.expiresAt < Date.now()) {
    resetStore.delete(token);
    return null;
  }

  resetStore.delete(token);
  return { userId: record.userId, email: record.email };
}
