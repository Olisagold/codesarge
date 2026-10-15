'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import AuthGate from '@/components/AuthGate';
import Badge from '@/components/Badge';
import Result from '@/components/Result';
import { createAssessment, getAssessment, getResult } from '@/lib/codeverity';
import { saveScore } from '@/lib/history';
import { getQuestion } from '@/lib/questions';
import type { AssessmentResult, AssessmentStatus } from '@/lib/types';

const POLL_MS = 1000;

export default function QuestionPage() {
  const { id } = useParams<{ id: string }>();
  const question = getQuestion(id);

  const [code, setCode] = useState(question?.starter ?? '');
  const [status, setStatus] = useState<AssessmentStatus | 'submitting' | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState('');
  const cancelled = useRef(false);

  useEffect(() => () => void (cancelled.current = true), []);

  if (!question) {
    return (
      <AuthGate>
        {() => (
          <p>
            Question not found. <Link href="/quiz" className="underline">Back to questions</Link>
          </p>
        )}
      </AuthGate>
    );
  }

  const busy = status === 'submitting' || status === 'queued' || status === 'processing';

  async function submit(username: string) {
    if (!question) return;
    setError('');
    setResult(null);
    setStatus('submitting');
    try {
      const created = await createAssessment({
        language: question.language,
        assignment: { title: question.title, requirements: question.requirements },
        submission: { code },
        rubric: question.rubric,
      });
      setStatus(created.status);

      let current = created;
      while (current.status === 'queued' || current.status === 'processing') {
        await new Promise((r) => setTimeout(r, POLL_MS));
        if (cancelled.current) return;
        current = await getAssessment(created.id);
        setStatus(current.status);
      }
      if (current.status === 'failed') {
        setError('The assessment could not be completed.');
        return;
      }

      const res = await getResult(created.id);
      setResult(res);
      saveScore(username, question.id, res.score);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      setStatus('failed');
    }
  }

  return (
    <AuthGate>
      {(session) => (
        <>
          <Link href="/quiz" className="text-sm text-zinc-500 hover:text-zinc-900">
            ← All questions
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">{question.title}</h1>
          <div className="mt-2 flex gap-2">
            <Badge tone={question.difficulty}>{question.difficulty}</Badge>
            <Badge>{question.language}</Badge>
          </div>
          <p className="mt-4 text-zinc-700">{question.requirements}</p>

          {question.rubric && (
            <div className="mt-4 rounded-lg bg-zinc-100 p-3 text-sm">
              <div className="font-medium">Graded on</div>
              <ul className="mt-1 space-y-0.5 text-zinc-700">
                {question.rubric.criteria.map((c) => (
                  <li key={c.name}>
                    {c.name} ({c.weight}%): {c.description}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Tab') return;
              e.preventDefault();
              const el = e.currentTarget;
              const { selectionStart: s, selectionEnd: end } = el;
              setCode(code.slice(0, s) + '  ' + code.slice(end));
              requestAnimationFrame(() => el.setSelectionRange(s + 2, s + 2));
            }}
            spellCheck={false}
            rows={14}
            disabled={busy}
            className="mt-6 w-full rounded-xl border border-zinc-300 bg-zinc-950 p-4 font-mono text-sm text-zinc-100 outline-none focus:border-zinc-900 disabled:opacity-70"
          />

          <div className="mt-3 flex items-center gap-4">
            <button
              onClick={() => submit(session.username)}
              disabled={busy || !code.trim()}
              className="rounded-md bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
            >
              {busy ? 'Grading…' : 'Submit'}
            </button>
            {status && status !== 'completed' && status !== 'failed' && (
              <span className="text-sm text-zinc-500">Status: {status}</span>
            )}
            {error && <span className="text-sm text-red-600">{error}</span>}
          </div>

          {result && <Result result={result} />}
        </>
      )}
    </AuthGate>
  );
}
