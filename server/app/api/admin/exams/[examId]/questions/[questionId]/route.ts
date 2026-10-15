import { requireUser } from '@/lib/auth';
import { deleteQuestion, getQuestion, updateQuestion } from '@/lib/exams';
import { readJson, route } from '@/lib/http';
import { parseQuestion } from '@/lib/validation';

type Ctx = { params: Promise<{ examId: string; questionId: string }> };

export const GET = route(async (_req, { params }: Ctx) => {
  await requireUser('admin');
  const { examId, questionId } = await params;
  return Response.json({ question: getQuestion(examId, questionId) });
});

export const PUT = route(async (req, { params }: Ctx) => {
  await requireUser('admin');
  const { examId, questionId } = await params;
  const question = updateQuestion(examId, questionId, parseQuestion(await readJson(req)));
  return Response.json({ question });
});

export const DELETE = route(async (_req, { params }: Ctx) => {
  await requireUser('admin');
  const { examId, questionId } = await params;
  deleteQuestion(examId, questionId);
  return new Response(null, { status: 204 });
});
