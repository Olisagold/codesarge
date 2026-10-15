import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { db, now } from './db';
import { HttpError } from './http';
import type { Role, User } from './users';

const COOKIE = 'codesarge_session';
const SESSION_DAYS = 7;

// Only a hash of the token is stored, so a leaked database can't be used to log in.
const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export async function startSession(userId: string) {
  const token = randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  db()
    .prepare('INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)')
    .run(hashToken(token), userId, expires.toISOString(), now());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires,
  });
}

export async function endSession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) db().prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashToken(token));
  store.delete(COOKIE);
}

export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const row = db()
    .prepare(
      `SELECT u.id, u.username, u.role FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > ?`,
    )
    .get(hashToken(token), now()) as User | undefined;
  return row ?? null;
}

export async function requireUser(role?: Role): Promise<User> {
  const user = await currentUser();
  if (!user) throw new HttpError(401, 'Sign in first.');
  if (role && user.role !== role) throw new HttpError(403, 'You do not have access to this.');
  return user;
}
