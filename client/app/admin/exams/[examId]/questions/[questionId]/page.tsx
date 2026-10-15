'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AuthGate from '@/components/AuthGate';
import RubricEditor from '@/components/RubricEditor';
import { card, input, label, primaryButton } from '@/components/ui';
import { getExam, newId, saveQuestion, validateQuestion, type Exam, type Question } from '@/lib/exams';

const blank = (): Question => ({
  id: newId('q'),
  title: '',
  language: 'python',
  difficulty: 'easy',
  requirements: '',
  starter: '',
  rubric: {
    criteria: [
      { name: 'Correctness', description: 'Meets every requirement, including edge cases.', weight: 60 },
      { name: 'Readability', description: 'Clear names and simple structure.', weight: 40 },
    ],
  },
});

export default function AdminQuestionPage() {
  const { examId, questionId } = useParams<{ examId: string; questionId: string }>();
  const router = useRouter();
  const [exam, setExam] = useState<Exam | null | undefined>(undefined);
  const [question, setQuestion] = useState<Question | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const e = getExam(examId) ?? null;
    setExam(e);
    if (!e) return;
    setQuestion(questionId === 'new' ? blank() : e.questions.find((q) => q.id === questionId) ?? null);
  }, [examId, questionId]);

  function update(patch: Partial<Question>) {
    if (question) setQuestion({ ...question, ...patch });
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!question) return;
    const cleaned: Question = {
      ...question,
      title: question.title.trim(),
      language: question.language.trim().toLowerCase(),
      rubric: {
        ...question.rubric,
        notes: question.rubric.notes?.trim() || undefined,
        criteria: question.rubric.criteria.map((c) => ({ ...c, name: c.name.trim(), description: c.description.trim() })),
      },
    };
    const problems = validateQuestion(cleaned);
    setErrors(problems);
    if (problems.length) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    saveQuestion(examId, cleaned);
    router.push(`/admin/exams/${examId}`);
  }

  return (
    <AuthGate role="admin">
      {() => {
        if (exam === undefined) return null;
        if (!exam || !question) return <p>Question not found. <Link href="/admin" className="underline">Back to exams</Link></p>;

        return (
          <form onSubmit={save}>
            <Link href={`/admin/exams/${exam.id}`} className="text-sm text-zinc-500 hover:text-zinc-900">← {exam.title}</Link>
            <h1 className="mt-2 text-2xl font-semibold">{questionId === 'new' ? 'New question' : 'Edit question'}</h1>

            {errors.length > 0 && (
              <ul className="mt-4 list-disc rounded-lg border border-red-200 bg-red-50 py-3 pl-8 pr-4 text-sm text-red-700">
                {errors.map((err) => <li key={err}>{err}</li>)}
              </ul>
            )}

            <div className={`mt-6 grid gap-4 p-4 ${card}`}>
              <div>
                <label className={label}>Title</label>
                <input value={question.title} maxLength={200} onChange={(e) => update({ title: e.target.value })} placeholder="Find the maximum number" className={`mt-1 ${input}`} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={label}>Language</label>
                  <input value={question.language} maxLength={50} list="languages" onChange={(e) => update({ language: e.target.value })} className={`mt-1 ${input}`} />
                  <datalist id="languages">
                    {['python', 'javascript', 'typescript', 'java', 'c', 'cpp', 'go', 'rust'].map((l) => <option key={l} value={l} />)}
                  </datalist>
                </div>
                <div>
                  <label className={label}>Difficulty</label>
                  <select value={question.difficulty} onChange={(e) => update({ difficulty: e.target.value as Question['difficulty'] })} className={`mt-1 ${input}`}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={label}>Requirements</label>
                <textarea
                  value={question.requirements}
                  maxLength={10_000}
                  rows={5}
                  onChange={(e) => update({ requirements: e.target.value })}
                  placeholder="Write a function find_max(numbers) that returns the largest number. Return None for an empty list."
                  className={`mt-1 ${input}`}
                />
                <p className="mt-1 text-xs text-zinc-500">Students see this, and the AI marks against it. Spell out inputs, outputs and edge cases.</p>
              </div>
              <div>
                <label className={label}>Starter code (optional)</label>
                <textarea
                  value={question.starter}
                  rows={5}
                  spellCheck={false}
                  onChange={(e) => update({ starter: e.target.value })}
                  className={`mt-1 font-mono ${input}`}
                />
              </div>
            </div>

            <div className={`mt-6 p-4 ${card}`}>
              <RubricEditor rubric={question.rubric} onChange={(rubric) => update({ rubric })} />
            </div>

            <div className="mt-6 flex gap-3">
              <button className={primaryButton}>Save question</button>
              <Link href={`/admin/exams/${exam.id}`} className="rounded-md px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900">Cancel</Link>
            </div>
          </form>
        );
      }}
    </AuthGate>
  );
}
