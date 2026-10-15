import { endSession } from '@/lib/auth';
import { route } from '@/lib/http';

export const POST = route(async () => {
  await endSession();
  return new Response(null, { status: 204 });
});
