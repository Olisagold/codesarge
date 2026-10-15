import { startSession } from '@/lib/auth';
import { readJson, route, str } from '@/lib/http';
import { registerStudent } from '@/lib/users';

// Open sign up creates students only. Admins come from the seed.
export const POST = route(async (req) => {
  const body = await readJson(req);
  const user = await registerStudent(str(body.username), str(body.password));
  await startSession(user.id);
  return Response.json({ user }, { status: 201 });
});
