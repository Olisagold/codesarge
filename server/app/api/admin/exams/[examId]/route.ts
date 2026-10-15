import { requireUser } from '@/lib/auth';
import { deleteExam, getExam, listQuestions, updateExam } from '@/lib/exams';
import { HttpError, readJson, route } from '@/lib/http';
import { parseExam } from '@/lib/validation';

type Ctx = { params: Promise<{ examId: string }> };

export const GET = route(async (_req, { params }: Ctx) => {
  await requireUser('admin');
  const { examId } = await params;
  return Response.json({ exam: getExam(examId), questions: listQuestions(examId) });
});

// Accepts any of title, description and published.
export const PATCH = route(async (req, { params }: Ctx) => {
  await requireUser('admin');
  const { examId } = await params;
  const body = await readJson(req);
  const current = getExam(examId);

  const fields = parseExam({
    title: 'title' in body ? body.title : current.title,
    description: 'description' in body ? body.description : current.description,
  });
  if ('published' in body && typeof body.published !== 'boolean') {
    throw new HttpError(422, 'Some fields are not valid.', ['Published must be true or false.']);
  }
  const published = typeof body.published === 'boolean' ? body.published : undefined;
  return Response.json({ exam: updateExam(examId, { ...fields, published }) });
});

export const DELETE = route(async (_req, { params }: Ctx) => {
  await requireUser('admin');
  deleteExam((await params).examId);
  return new Response(null, { status: 204 });
});
