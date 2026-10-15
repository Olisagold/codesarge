import 'server-only';
import {
  createAssessment,
  getAssessment,
  getResult,
  type AssessmentResult,
  type AssessmentStatus,
} from './codeverity';
import { db, now } from './db';
import type { Question } from './exams';
import { HttpError } from './http';
import { newId } from './ids';
import type { User } from './users';
import { MAX_CODE_CHARS } from './validation';

export type Submission = {
  id: string;
  questionId: string;
  code: string;
  status: AssessmentStatus;
  result: AssessmentResult | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
};

type Row = {
  id: string;
  user_id: string;
  question_id: string;
  code: string;
  assessment_id: string;
  status: AssessmentStatus;
  result: string | null;
  error: string | null;
  created_at: string;
  updated_at: string;
};

function toSubmission(r: Row): Submission {
  return {
    id: r.id,
    questionId: r.question_id,
    code: r.code,
    status: r.status,
    result: r.result ? (JSON.parse(r.result) as AssessmentResult) : null,
    error: r.error,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

const isPending = (status: AssessmentStatus) => status === 'queued' || status === 'processing';

export async function submitAnswer(user: User, question: Question, code: string): Promise<Submission> {
  if (!code.trim()) throw new HttpError(422, 'Write some code before submitting.');
  if (code.length > MAX_CODE_CHARS) throw new HttpError(422, 'Code must be 100,000 characters or fewer.');

  // The question's rubric goes with every answer: it is what makes Codeverity return a grade.
  const assessment = await createAssessment({
    language: question.language,
    assignment: { title: question.title, requirements: question.requirements },
    submission: { code },
    rubric: question.rubric,
  });

  const id = newId('sub');
  const ts = now();
  db()
    .prepare(
      `INSERT INTO submissions (id, user_id, question_id, code, assessment_id, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(id, user.id, question.id, code, assessment.id, assessment.status, ts, ts);
  return getRow(id);
}

export function listSubmissions(userId: string, questionId: string): Submission[] {
  const rows = db()
    .prepare('SELECT * FROM submissions WHERE user_id = ? AND question_id = ? ORDER BY created_at DESC LIMIT 20')
    .all(userId, questionId) as Row[];
  return rows.map(toSubmission);
}

// Returns the submission, first checking Codeverity if it is still being marked.
// Webhooks usually get there first; this keeps things moving without them.
export async function getSubmission(user: User, id: string): Promise<Submission> {
  const row = db().prepare('SELECT * FROM submissions WHERE id = ?').get(id) as Row | undefined;
  if (!row || (row.user_id !== user.id && user.role !== 'admin')) throw new HttpError(404, 'Submission not found.');
  if (!isPending(row.status)) return toSubmission(row);

  const assessment = await getAssessment(row.assessment_id);
  if (isPending(assessment.status)) {
    if (assessment.status !== row.status) setStatus(row.assessment_id, assessment.status);
    return getRow(id);
  }

  const outcome = await getResult(row.assessment_id);
  if (outcome.kind === 'completed') markCompleted(row.assessment_id, outcome.result);
  else if (outcome.kind === 'failed') markFailed(row.assessment_id, outcome.message);
  return getRow(id);
}

export function markCompleted(assessmentId: string, result: AssessmentResult) {
  db()
    .prepare(`UPDATE submissions SET status = 'completed', result = ?, error = NULL, updated_at = ? WHERE assessment_id = ?`)
    .run(JSON.stringify(result), now(), assessmentId);
}

export function markFailed(assessmentId: string, message: string) {
  db()
    .prepare(`UPDATE submissions SET status = 'failed', error = ?, updated_at = ? WHERE assessment_id = ?`)
    .run(message, now(), assessmentId);
}

function setStatus(assessmentId: string, status: AssessmentStatus) {
  db()
    .prepare('UPDATE submissions SET status = ?, updated_at = ? WHERE assessment_id = ? AND status IN (?, ?)')
    .run(status, now(), assessmentId, 'queued', 'processing');
}

function getRow(id: string): Submission {
  return toSubmission(db().prepare('SELECT * FROM submissions WHERE id = ?').get(id) as Row);
}
