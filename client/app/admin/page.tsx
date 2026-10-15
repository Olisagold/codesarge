'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import AuthGate from '@/components/AuthGate';
import Badge from '@/components/Badge';
import { card, input, label, primaryButton } from '@/components/ui';
import { listExams, newId, saveExam } from '@/lib/exams';

export default function AdminPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  function create(e: React.FormEvent) {
    e.preventDefault();
    const exam = {
      id: newId('exam'),
      title: title.trim(),
      description: description.trim(),
      published: false,
      questions: [],
      createdAt: new Date().toISOString(),
    };
    saveExam(exam);
    router.push(`/admin/exams/${exam.id}`);
  }

  return (
    <AuthGate role="admin">
      {() => {
        const exams = listExams();
        return (
          <>
            <h1 className="text-2xl font-semibold">Exams</h1>
            <p className="mt-1 text-sm text-zinc-500">Create exams, add questions, and set the rubric the AI marks against.</p>

            <form onSubmit={create} className={`mt-6 p-4 ${card}`}>
              <h2 className="font-semibold">New exam</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={label}>Title</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} placeholder="Week 3: Arrays" className={`mt-1 ${input}`} />
                </div>
                <div>
                  <label className={label}>Description</label>
                  <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" className={`mt-1 ${input}`} />
                </div>
              </div>
              <button disabled={!title.trim()} className={`mt-4 ${primaryButton}`}>Create exam</button>
            </form>

            {exams.length === 0 ? (
              <p className="mt-6 text-sm text-zinc-500">No exams yet.</p>
            ) : (
              <ul className={`mt-6 divide-y divide-zinc-200 ${card}`}>
                {exams.map((exam) => (
                  <li key={exam.id}>
                    <Link href={`/admin/exams/${exam.id}`} className="flex items-center justify-between gap-4 px-4 py-4 hover:bg-zinc-50">
                      <div>
                        <div className="font-medium">{exam.title}</div>
                        {exam.description && <div className="mt-0.5 text-sm text-zinc-500">{exam.description}</div>}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-sm text-zinc-500">
                          {exam.questions.length} question{exam.questions.length === 1 ? '' : 's'}
                        </span>
                        <Badge tone={exam.published ? 'easy' : 'neutral'}>{exam.published ? 'published' : 'draft'}</Badge>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        );
      }}
    </AuthGate>
  );
}
