import 'server-only';
import { db, now } from './db';
import { HttpError } from './http';
import { newId } from './ids';
import { hashPassword } from './password';

export type Role = 'admin' | 'student';
export type User = { id: string; username: string; role: Role };
type UserRow = User & { password_hash: string };

const USERNAME = /^[a-z0-9_]{3,30}$/;

export function findByUsername(username: string): UserRow | undefined {
  return db().prepare('SELECT * FROM users WHERE username = ?').get(username) as UserRow | undefined;
}

export function toUser({ id, username, role }: User): User {
  return { id, username, role };
}

export async function registerStudent(username: string, password: string): Promise<User> {
  const name = username.trim().toLowerCase();
  const errors: string[] = [];
  if (!USERNAME.test(name)) errors.push('Username must be 3 to 30 characters: letters, numbers or underscores.');
  if (password.length < 8 || password.length > 128) errors.push('Password must be 8 to 128 characters.');
  if (errors.length) throw new HttpError(422, 'Some fields are not valid.', errors);
  if (findByUsername(name)) throw new HttpError(409, 'That username is taken.');
  return insertUser(name, await hashPassword(password), 'student');
}

export function insertUser(username: string, passwordHash: string, role: Role): User {
  const user = { id: newId('usr'), username, role };
  db()
    .prepare('INSERT INTO users (id, username, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(user.id, username, passwordHash, role, now());
  return user;
}
