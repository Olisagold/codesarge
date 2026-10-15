import type { AssessmentResult } from '@/lib/types';

export default function Result({ result }: { result: AssessmentResult }) {
  const { feedback } = result;
  return (
    <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Result</h2>
        {result.simulated && <span className="text-xs text-amber-700">simulated</span>}
      </div>

      <div className="mt-4 flex items-end gap-8">
        <div>
          <div className="text-4xl font-semibold">
            {result.rubric_score !== null ? result.rubric_score.toFixed(1) : '–'}
            <span className="text-lg font-normal text-zinc-400"> / 10</span>
          </div>
          <div className="text-xs text-zinc-500">your grade</div>
        </div>
        <div>
          <div className="text-lg font-medium">{result.score.toFixed(1)} / 10</div>
          <div className="text-xs text-zinc-500">feedback quality</div>
        </div>
        <div>
          <div className="text-lg font-medium">{Math.round(result.confidence * 100)}%</div>
          <div className="text-xs text-zinc-500">confidence</div>
        </div>
      </div>

      {result.rubric_scores && (
        <div className="mt-5 space-y-3">
          {result.rubric_scores.map((r) => (
            <div key={r.name}>
              <div className="flex justify-between text-sm">
                <span className="font-medium">{r.name} <span className="font-normal text-zinc-400">({r.weight}%)</span></span>
                <span className="text-zinc-500">{r.score.toFixed(1)} / 10</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-zinc-100">
                <div className="h-1.5 rounded-full bg-zinc-900" style={{ width: `${Math.min(100, r.score * 10)}%` }} />
              </div>
              <p className="mt-1 text-sm text-zinc-600">{r.comment}</p>
            </div>
          ))}
        </div>
      )}

      <p className="mt-5 text-sm">{feedback.summary}</p>
      <List title="Issues" items={feedback.issues} />
      <List title="Suggestions" items={feedback.suggestions} />
    </section>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium">{title}</h3>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-zinc-700">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
