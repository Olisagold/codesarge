'use client';

// Mock Codeverity client. Same shapes as the real API:
//   POST /v1/assessments              -> AssessmentOut (202, status "queued")
//   GET  /v1/assessments/{id}         -> AssessmentOut
//   GET  /v1/assessments/{id}/result  -> AssessmentResult, 409 while unfinished
// Replace the bodies with fetch calls to Next route handlers when wiring the real API.

import type { AssessmentCreate, AssessmentOut, AssessmentResult } from './types';

type Stored = { out: AssessmentOut; body: AssessmentCreate; startedAt: number };

const store = new Map<string, Stored>();

const QUEUED_MS = 1500;
const DONE_MS = 4500;

export class NotFinishedError extends Error {}

export async function createAssessment(body: AssessmentCreate): Promise<AssessmentOut> {
  await delay(300);
  const out: AssessmentOut = {
    id: 'asm_' + Math.random().toString(36).slice(2, 12),
    status: 'queued',
    language: body.language,
    created_at: new Date().toISOString(),
    completed_at: null,
  };
  store.set(out.id, { out, body, startedAt: Date.now() });
  return out;
}

export async function getAssessment(id: string): Promise<AssessmentOut> {
  await delay(150);
  const s = mustGet(id);
  const elapsed = Date.now() - s.startedAt;
  if (elapsed >= DONE_MS) {
    s.out = { ...s.out, status: 'completed', completed_at: s.out.completed_at ?? new Date().toISOString() };
  } else if (elapsed >= QUEUED_MS) {
    s.out = { ...s.out, status: 'processing' };
  }
  return s.out;
}

export async function getResult(id: string): Promise<AssessmentResult> {
  const out = await getAssessment(id);
  if (out.status !== 'completed') throw new NotFinishedError(out.status);
  const { body } = mustGet(id);

  // Rough fake score so different submissions look different.
  const lines = body.submission.code.split('\n').filter((l) => l.trim()).length;
  const stub = /\bpass\b|^\s*$/m.test(body.submission.code) && lines < 4;
  const score = stub ? 22 : Math.min(95, 55 + lines * 3);

  return {
    assessment_id: id,
    status: 'completed',
    score,
    confidence: 0.82,
    criteria: { correctness: score, readability: Math.min(100, score + 5), efficiency: Math.max(0, score - 10) },
    feedback: {
      summary: stub
        ? 'The submission is still the starter code, so most requirements are not met.'
        : 'Solid attempt that covers the main requirements. A few edge cases need attention.',
      issues: stub ? ['Function body is empty.'] : ['Edge cases such as empty input are not handled.'],
      suggestions: ['Add a couple of quick tests for the edge cases in the requirements.'],
    },
    rubric_score: body.rubric ? score : null,
    rubric_scores: body.rubric
      ? body.rubric.criteria.map((c) => ({ name: c.name, weight: c.weight, score, comment: 'Mock comment.' }))
      : null,
    simulated: true,
  };
}

function mustGet(id: string): Stored {
  const s = store.get(id);
  if (!s) throw new Error('Assessment not found.');
  return s;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
