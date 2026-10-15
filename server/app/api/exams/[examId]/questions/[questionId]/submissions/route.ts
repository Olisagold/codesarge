import { requireUser } from '@/lib/auth';
import { getQuestion, getVisibleExam } from '@/lib/exams';
import { readJson, route, str } from '@/lib/http';
import { listSubmissions, submitAnswer } from '@/lib/submissions';

type Ctx = { params: Promise<{ examId: string; questionId: string }> };

export const GET = route(async (_req, { params }: Ctx) => {
  const user = await requireUser();
  const { examId, questionId } = await params;
  getVisibleExam(examId, user);
  const question = getQuestion(examId, questionId);
  return Response.json({ submissions: listSubmissions(user.id, question.id) });
});

// Queues the answer with Codeverity. Poll GET /api/submissions/{id} for the grade.
export const POST = route(async (req, { params }: Ctx) => {
  const user = await requireUser();
  const { examId, questionId } = await params;
  getVisibleExam(examId, user);
  const question = getQuestion(examId, questionId);
  const body = await readJson(req);
  const submission = await submitAnswer(user, question, str(body.code));
  return Response.json({ submission }, { status: 202 });
});
