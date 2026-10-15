'use client';

import type { Rubric, RubricCriterion } from '@/lib/types';
import { input, label, secondaryButton } from './ui';

const MAX_CRITERIA = 10;

export default function RubricEditor({ rubric, onChange }: { rubric: Rubric; onChange: (r: Rubric) => void }) {
  const total = rubric.criteria.reduce((sum, c) => sum + (c.weight || 0), 0);

  function update(i: number, patch: Partial<RubricCriterion>) {
    onChange({ ...rubric, criteria: rubric.criteria.map((c, j) => (j === i ? { ...c, ...patch } : c)) });
  }

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold">Rubric</h2>
        <span className={`text-sm font-medium ${total === 100 ? 'text-green-700' : 'text-red-600'}`}>
          Total weight: {total} / 100
        </span>
      </div>
      <p className="mt-1 text-sm text-zinc-500">
        Tell the AI what matters for this question. Each criterion is graded 0 to 10, and the student’s grade is the
        weighted average. Be specific in the descriptions: that is what the models look for.
      </p>

      <div className="mt-4 space-y-3">
        {rubric.criteria.map((c, i) => (
          <div key={i} className="rounded-lg border border-zinc-200 p-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className={label}>Name</label>
                <input
                  value={c.name}
                  maxLength={100}
                  onChange={(e) => update(i, { name: e.target.value })}
                  placeholder="Edge cases"
                  className={`mt-1 ${input}`}
                />
              </div>
              <div className="w-24">
                <label className={label}>Weight</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={c.weight || ''}
                  onChange={(e) => update(i, { weight: Math.round(Number(e.target.value)) })}
                  className={`mt-1 ${input}`}
                />
              </div>
            </div>
            <label className={`mt-3 ${label}`}>What to look for</label>
            <textarea
              value={c.description}
              maxLength={500}
              rows={2}
              onChange={(e) => update(i, { description: e.target.value })}
              placeholder="Returns None for an empty list and handles all-negative lists."
              className={`mt-1 ${input}`}
            />
            {rubric.criteria.length > 1 && (
              <button
                type="button"
                onClick={() => onChange({ ...rubric, criteria: rubric.criteria.filter((_, j) => j !== i) })}
                className="mt-2 text-sm text-red-700 hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      {rubric.criteria.length < MAX_CRITERIA && (
        <button
          type="button"
          onClick={() =>
            onChange({ ...rubric, criteria: [...rubric.criteria, { name: '', description: '', weight: Math.max(1, 100 - total) }] })
          }
          className={`mt-3 ${secondaryButton}`}
        >
          Add criterion
        </button>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Learner level</label>
          <select
            value={rubric.learner_level ?? ''}
            onChange={(e) =>
              onChange({ ...rubric, learner_level: (e.target.value || undefined) as Rubric['learner_level'] })
            }
            className={`mt-1 ${input}`}
          >
            <option value="">Not set</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <p className="mt-1 text-xs text-zinc-500">Sets the tone and depth of the feedback.</p>
        </div>
        <div>
          <label className={label}>Notes for the marker (optional)</label>
          <textarea
            value={rubric.notes ?? ''}
            maxLength={1000}
            rows={3}
            onChange={(e) => onChange({ ...rubric, notes: e.target.value || undefined })}
            placeholder="Accept any O(n) approach. Do not penalise missing type hints."
            className={`mt-1 ${input}`}
          />
        </div>
      </div>
    </div>
  );
}
