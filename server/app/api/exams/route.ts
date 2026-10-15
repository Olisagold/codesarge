import { requireUser } from '@/lib/auth';
import { listExams } from '@/lib/exams';
import { answeredCounts } from '@/lib/grades';
import { route } from '@/lib/http';

export const GET = route(async () => {
  const user = await requireUser();
  const answered = answeredCounts(user.id);
  const exams = listExams({ publishedOnly: true }).map((e) => ({ ...e, answeredCount: answered[e.id] ?? 0 }));
  return Response.json({ exams });
});
