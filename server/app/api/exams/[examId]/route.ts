import { requireUser } from '@/lib/auth';
import { getVisibleExam, listQuestions } from '@/lib/exams';
import { bestGrades } from '@/lib/grades';
import { route } from '@/lib/http';

type Ctx = { params: Promise<{ examId: string }> };

export const GET = route(async (_req, { params }: Ctx) => {
  const user = await requireUser();
  const exam = getVisibleExam((await params).examId, user);
  const grades = bestGrades(user.id, exam.id);
  const questions = listQuestions(exam.id).map((q) => ({ ...q, bestGrade: grades[q.id] ?? null }));
  return Response.json({ exam, questions });
});
