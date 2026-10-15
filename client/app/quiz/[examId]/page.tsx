'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import AuthGate from '@/components/AuthGate';
import Badge from '@/components/Badge';
import { card } from '@/components/ui';
import { getExam } from '@/lib/exams';
import { getGrades } from '@/lib/history';

export default function ExamPage() {
  const { examId } = useParams<{ examId: string }>();
  return (
    <AuthGate>
      {(session) => {
        const exam = getExam(examId);
        // Admins can preview drafts; students only see published exams.
        if (!exam || (!exam.published && session.role !== 'admin'))
          return <p>Exam not found. <Link href="/quiz" className="underline">Back to exams</Link></p>;

        const grades = getGrades(session.username);
        return (
          <>
            <Link href="/quiz" className="text-sm text-zinc-500 hover:text-zinc-900">← All exams</Link>
            <h1 className="mt-2 text-2xl font-semibold">{exam.title}</h1>
            {exam.description && <p className="mt-1 text-sm text-zinc-500">{exam.description}</p>}
            <ul className={`mt-6 divide-y divide-zinc-200 ${card}`}>
              {exam.questions.map((q, i) => (
                <li key={q.id}>
                  <Link href={`/quiz/${exam.id}/${q.id}`} className="flex items-center justify-between gap-4 px-4 py-4 hover:bg-zinc-50">
                    <div>
                      <div className="font-medium">{i + 1}. {q.title}</div>
                      <div className="mt-1 flex gap-2">
                        <Badge tone={q.difficulty}>{q.difficulty}</Badge>
                        <Badge>{q.language}</Badge>
                      </div>
                    </div>
                    <span className="shrink-0 text-sm text-zinc-500">
                      {grades[q.id] !== undefined ? `Best: ${grades[q.id].toFixed(1)} / 10` : 'Not tried'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        );
      }}
    </AuthGate>
  );
}
