import { requireUser } from '@/lib/auth';
import { createQuestion } from '@/lib/exams';
import { readJson, route } from '@/lib/http';
import { parseQuestion } from '@/lib/validation';

type Ctx = { params: Promise<{ examId: string }> };

export const POST = route(async (req, { params }: Ctx) => {
  await requireUser('admin');
  const { examId } = await params;
  const question = createQuestion(examId, parseQuestion(await readJson(req)));
  return Response.json({ question }, { status: 201 });
});
