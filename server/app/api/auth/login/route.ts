import { startSession } from '@/lib/auth';
import { HttpError, readJson, route, str } from '@/lib/http';
import { verifyPassword } from '@/lib/password';
import { findByUsername, toUser } from '@/lib/users';

// Checked against when the username doesn't exist, so both cases take the same time.
const DUMMY_HASH = '00000000000000000000000000000000:' + '0'.repeat(128);

export const POST = route(async (req) => {
  const body = await readJson(req);
  const username = str(body.username).trim().toLowerCase();
  const password = str(body.password);

  const row = findByUsername(username);
  const ok = await verifyPassword(password, row?.password_hash ?? DUMMY_HASH);
  if (!row || !ok) throw new HttpError(401, 'Wrong username or password.');

  await startSession(row.id);
  return Response.json({ user: toUser(row) });
});
