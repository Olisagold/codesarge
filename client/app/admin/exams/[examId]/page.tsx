'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AuthGate from '@/components/AuthGate';
import Badge from '@/components/Badge';
import { card, dangerButton, input, label, primaryButton, secondaryButton } from '@/components/ui';
import { deleteExam, deleteQuestion, getExam, saveExam, type Exam } from '@/lib/exams';

export default function AdminExamPage() {
  const { examId } = useParams<{ examId: string }>();
  const router = useRouter();
  const [exam, setExam] = useState<Exam | null | undefined>(undefined);
  const [saved, setSaved] = useState(false);

  useEffect(() => setExam(getExam(examId) ?? null), [examId]);

  function update(patch: Partial<Exam>) {
    if (!exam) return;
    setExam({ ...exam, ...patch });
    setSaved(false);
  }

  return (
    <AuthGate role="admin">
      {() => {
        if (exam === undefined) return null;
        if (exam === null) return <p>Exam not found. <Link href="/admin" className="underline">Back to exams</Link></p>;

        const canPublish = exam.questions.length > 0;
        return (
          <>
            <Link href="/admin" className="text-sm text-zinc-500 hover:text-zinc-900">← All exams</Link>

            <div className={`mt-3 p-4 ${card}`}>
              <div className="grid gap-3">
                <div>
                  <label className={label}>Title</label>
                  <input value={exam.title} maxLength={200} onChange={(e) => update({ title: e.target.value })} className={`mt-1 ${input}`} />
                </div>
                <div>
                  <label className={label}>Description</label>
                  <input value={exam.description} onChange={(e) => update({ description: e.target.value })} className={`mt-1 ${input}`} />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={exam.published}
                    disabled={!canPublish && !exam.published}
                    onChange={(e) => update({ published: e.target.checked })}
                  />
                  Published (students can see and take this exam)
                  {!canPublish && <span className="text-zinc-400">: add a question first</span>}
                </label>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button
                  disabled={!exam.title.trim()}
                  onClick={() => {
                    saveExam({ ...exam, title: exam.title.trim(), description: exam.description.trim() });
                    setSaved(true);
                  }}
                  className={primaryButton}
                >
                  Save exam
                </button>
                {saved && <span className="text-sm text-green-700">Saved</span>}
                <button
                  onClick={() => {
                    if (!confirm(`Delete "${exam.title}" and all its questions?`)) return;
                    deleteExam(exam.id);
                    router.push('/admin');
                  }}
                  className={`ml-auto ${dangerButton}`}
                >
                  Delete exam
                </button>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Questions</h2>
              <Link href={`/admin/exams/${exam.id}/questions/new`} className={primaryButton}>Add question</Link>
            </div>

            {exam.questions.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-500">No questions yet. Add one to start building the exam.</p>
            ) : (
              <ul className={`mt-4 divide-y divide-zinc-200 ${card}`}>
                {exam.questions.map((q, i) => (
                  <li key={q.id} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div>
                      <div className="font-medium">{i + 1}. {q.title}</div>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <Badge tone={q.difficulty}>{q.difficulty}</Badge>
                        <Badge>{q.language}</Badge>
                        <Badge>{q.rubric.criteria.length} rubric criteria</Badge>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Link href={`/admin/exams/${exam.id}/questions/${q.id}`} className={secondaryButton}>Edit</Link>
                      <button
                        onClick={() => {
                          if (!confirm(`Delete "${q.title}"?`)) return;
                          deleteQuestion(exam.id, q.id);
                          setExam(getExam(exam.id) ?? null);
                        }}
                        className={dangerButton}
                      >
                        Delete
                      </button>
                    </div>
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
