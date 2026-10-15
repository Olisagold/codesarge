const tones = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-amber-100 text-amber-800',
  hard: 'bg-red-100 text-red-800',
  neutral: 'bg-zinc-100 text-zinc-700',
};

export default function Badge({ tone = 'neutral', children }: { tone?: keyof typeof tones; children: React.ReactNode }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}
