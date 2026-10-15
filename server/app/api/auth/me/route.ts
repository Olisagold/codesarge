import { requireUser } from '@/lib/auth';
import { route } from '@/lib/http';

export const GET = route(async () => {
  return Response.json({ user: await requireUser() });
});
