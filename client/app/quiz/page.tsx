'use client';

import Link from 'next/link';
import AuthGate from '@/components/AuthGate';
import { card } from '@/components/ui';
import { listExams } from '@/lib/exams';
import { getGrades } from '@/lib/history';

export default function QuizPage() {
  return (
    <AuthGate>
      {(session) => {
        const exams = listExams().filter((e) => e.published);
        const grades = getGrades(session.username);
        return (
          <>
            <h1 className="text-2xl font-semibold">Exams</h1>
            <p className="mt-1 text-sm text-zinc-500">Pick an exam, answer the questions, and get each one marked.</p>
            {exams.length === 0 ? (
              <p className="mt-6 text-sm text-zinc-500">No exams are published yet.</p>
            ) : (
              <ul className={`mt-6 divide-y divide-zinc-200 ${card}`}>
                {exams.map((exam) => {
                  const done = exam.questions.filter((q) => grades[q.id] !== undefined).length;
                  return (
                    <li key={exam.id}>
                      <Link href={`/quiz/${exam.id}`} className="flex items-center justify-between gap-4 px-4 py-4 hover:bg-zinc-50">
                        <div>
                          <div className="font-medium">{exam.title}</div>
                          {exam.description && <div className="mt-0.5 text-sm text-zinc-500">{exam.description}</div>}
                        </div>
                        <span className="shrink-0 text-sm text-zinc-500">{done} / {exam.questions.length} answered</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        );
      }}
    </AuthGate>
  );
}
