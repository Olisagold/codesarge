import { requireUser } from '@/lib/auth';
import { createExam, listExams } from '@/lib/exams';
import { readJson, route } from '@/lib/http';
import { parseExam } from '@/lib/validation';

export const GET = route(async () => {
  await requireUser('admin');
  return Response.json({ exams: listExams({ publishedOnly: false }) });
});

export const POST = route(async (req) => {
  await requireUser('admin');
  const exam = createExam(parseExam(await readJson(req)));
  return Response.json({ exam }, { status: 201 });
});
