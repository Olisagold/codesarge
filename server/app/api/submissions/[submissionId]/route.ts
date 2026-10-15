import { requireUser } from '@/lib/auth';
import { route } from '@/lib/http';
import { getSubmission } from '@/lib/submissions';

type Ctx = { params: Promise<{ submissionId: string }> };

export const GET = route(async (_req, { params }: Ctx) => {
  const user = await requireUser();
  return Response.json({ submission: await getSubmission(user, (await params).submissionId) });
});
