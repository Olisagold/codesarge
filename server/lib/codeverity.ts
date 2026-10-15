import 'server-only';
import { HttpError } from './http';
import type { Rubric } from './validation';

// Server side client for the Codeverity public API. The API key never leaves
// this process. Shapes mirror apps/api/app/schemas/assessments.py.

export type AssessmentStatus = 'queued' | 'processing' | 'completed' | 'failed';

export type AssessmentCreate = {
  language: string;
  assignment: { title: string; requirements: string };
  submission: { code: string };
  rubric?: Rubric;
};

export type AssessmentOut = {
  id: string;
  status: AssessmentStatus;
  language: string;
  created_at: string;
  completed_at: string | null;
};

export type AssessmentResult = {
  assessment_id: string;
  status: AssessmentStatus;
  score: number;
  confidence: number;
  criteria: Record<string, number>;
  feedback: { summary: string; issues: string[]; suggestions: string[] };
  rubric_score: number | null;
  rubric_scores: { name: string; weight: number; score: number; comment: string }[] | null;
  simulated: boolean;
};

export type ResultOutcome =
  | { kind: 'completed'; result: AssessmentResult }
  | { kind: 'pending'; status: AssessmentStatus }
  | { kind: 'failed'; message: string; code: string | null };

const TIMEOUT_MS = 15_000;

export function createAssessment(body: AssessmentCreate) {
  return call<AssessmentOut>('/v1/assessments', { method: 'POST', body: JSON.stringify(body) });
}

export function getAssessment(id: string) {
  return call<AssessmentOut>(`/v1/assessments/${encodeURIComponent(id)}`);
}

// 409 means still running and 422 means the assessment failed; both are normal outcomes here.
export async function getResult(id: string): Promise<ResultOutcome> {
  const res = await send(`/v1/assessments/${encodeURIComponent(id)}/result`);
  const data = await res.json().catch(() => ({}));
  if (res.ok) return { kind: 'completed', result: data as AssessmentResult };
  if (res.status === 409) return { kind: 'pending', status: data.status ?? 'processing' };
  if (res.status === 422) {
    return { kind: 'failed', message: data.detail ?? 'The assessment could not be completed.', code: data.code ?? null };
  }
  throw upstreamError(res.status, data);
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await send(path, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw upstreamError(res.status, data);
  return data as T;
}

async function send(path: string, init?: RequestInit): Promise<Response> {
  const key = process.env.CODEVERITY_API_KEY;
  if (!key) throw new HttpError(503, 'Marking is not set up yet: CODEVERITY_API_KEY is missing on the server.');
  const base = process.env.CODEVERITY_API_URL ?? 'http://localhost:8000';
  try {
    return await fetch(`${base}${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (e) {
    console.error('Codeverity request failed', e);
    throw new HttpError(502, 'Could not reach the marking service. Try again shortly.');
  }
}

function upstreamError(status: number, data: { detail?: unknown }): HttpError {
  console.error('Codeverity error', status, JSON.stringify(data));
  if (status === 429) return new HttpError(429, 'Too many answers are being marked right now. Try again in a minute.');
  if (status === 401) return new HttpError(502, 'The marking service rejected our API key.');
  if (status === 404) return new HttpError(404, 'Assessment not found on the marking service.');
  const detail = typeof data.detail === 'string' ? data.detail : 'The marking service returned an error.';
  return new HttpError(502, detail);
}
