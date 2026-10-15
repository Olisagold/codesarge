import 'server-only';
import type Database from 'better-sqlite3';
import { scryptSync, randomBytes } from 'node:crypto';

// Runs once, when the users table is empty. Synchronous because it runs while
// the connection is being opened.
export function seed(conn: Database.Database) {
  const { n } = conn.prepare('SELECT COUNT(*) AS n FROM users').get() as { n: number };
  if (n > 0) return;

  const insert = conn.prepare(
    'INSERT INTO users (id, username, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)',
  );
  const createdAt = new Date().toISOString();
  const users: [string, string, string][] = [
    [process.env.ADMIN_USERNAME ?? 'admin', process.env.ADMIN_PASSWORD ?? 'admin123', 'admin'],
    ['demo', 'demo123', 'student'],
    ['student', 'password', 'student'],
  ];
  conn.transaction(() => {
    for (const [username, password, role] of users) {
      insert.run(`usr_${randomBytes(9).toString('base64url')}`, username.toLowerCase(), hash(password), role, createdAt);
    }
  })();
}

// Same "<salt hex>:<hash hex>" format as lib/password.ts.
function hash(password: string) {
  const salt = randomBytes(16);
  return `${salt.toString('hex')}:${scryptSync(password, salt, 64).toString('hex')}`;
}
