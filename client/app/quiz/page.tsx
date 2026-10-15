'use client';

import Link from 'next/link';
import AuthGate from '@/components/AuthGate';
import Badge from '@/components/Badge';
import { getScores } from '@/lib/history';
import { questions } from '@/lib/questions';

export default function QuizPage() {
  return (
    <AuthGate>
      {(session) => {
        const scores = getScores(session.username);
        return (
          <>
            <h1 className="text-2xl font-semibold">Questions</h1>
            <p className="mt-1 text-sm text-zinc-500">Pick a question, write your solution, and get it graded.</p>
            <ul className="mt-6 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
              {questions.map((q) => (
                <li key={q.id}>
                  <Link href={`/quiz/${q.id}`} className="flex items-center justify-between gap-4 px-4 py-4 hover:bg-zinc-50">
                    <div>
                      <div className="font-medium">{q.title}</div>
                      <div className="mt-1 flex gap-2">
                        <Badge tone={q.difficulty}>{q.difficulty}</Badge>
                        <Badge>{q.language}</Badge>
                        {q.rubric && <Badge>rubric</Badge>}
                      </div>
                    </div>
                    <span className="text-sm text-zinc-500">
                      {scores[q.id] !== undefined ? `Best: ${Math.round(scores[q.id])}` : 'Not tried'}
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
