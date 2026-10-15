import 'server-only';
import { db, now } from './db';
import { HttpError } from './http';
import { newId } from './ids';
import type { ExamInput, QuestionInput, Rubric } from './validation';

export type Exam = {
  id: string;
  title: string;
  description: string;
  published: boolean;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
};

export type Question = QuestionInput & { id: string; examId: string; position: number };

type ExamRow = {
  id: string;
  title: string;
  description: string;
  published: number;
  question_count: number;
  created_at: string;
  updated_at: string;
};

type QuestionRow = Omit<Question, 'examId' | 'rubric'> & { exam_id: string; rubric: string };

const EXAM_SELECT = `SELECT e.*, (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id) AS question_count FROM exams e`;

function toExam(r: ExamRow): Exam {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    published: r.published === 1,
    questionCount: r.question_count,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function toQuestion(r: QuestionRow): Question {
  return {
    id: r.id,
    examId: r.exam_id,
    position: r.position,
    title: r.title,
    language: r.language,
    difficulty: r.difficulty,
    requirements: r.requirements,
    starter: r.starter,
    rubric: JSON.parse(r.rubric) as Rubric,
  };
}

// ── Exams ────────────────────────────────────────────────

export function listExams({ publishedOnly }: { publishedOnly: boolean }): Exam[] {
  const where = publishedOnly ? ' WHERE e.published = 1' : '';
  const rows = db().prepare(`${EXAM_SELECT}${where} ORDER BY e.created_at DESC`).all() as ExamRow[];
  return rows.map(toExam);
}

export function getExam(id: string): Exam {
  const row = db().prepare(`${EXAM_SELECT} WHERE e.id = ?`).get(id) as ExamRow | undefined;
  if (!row) throw new HttpError(404, 'Exam not found.');
  return toExam(row);
}

export function createExam(input: ExamInput): Exam {
  const id = newId('exam');
  const ts = now();
  db()
    .prepare('INSERT INTO exams (id, title, description, published, created_at, updated_at) VALUES (?, ?, ?, 0, ?, ?)')
    .run(id, input.title, input.description, ts, ts);
  return getExam(id);
}

export function updateExam(id: string, patch: Partial<ExamInput> & { published?: boolean }): Exam {
  const exam = getExam(id);
  if (patch.published && exam.questionCount === 0) {
    throw new HttpError(422, 'Add at least one question before publishing.');
  }
  db()
    .prepare('UPDATE exams SET title = ?, description = ?, published = ?, updated_at = ? WHERE id = ?')
    .run(
      patch.title ?? exam.title,
      patch.description ?? exam.description,
      (patch.published ?? exam.published) ? 1 : 0,
      now(),
      id,
    );
  return getExam(id);
}

export function deleteExam(id: string) {
  getExam(id);
  db().prepare('DELETE FROM exams WHERE id = ?').run(id);
}

// ── Questions ────────────────────────────────────────────

export function listQuestions(examId: string): Question[] {
  const rows = db().prepare('SELECT * FROM questions WHERE exam_id = ? ORDER BY position').all(examId) as QuestionRow[];
  return rows.map(toQuestion);
}

export function getQuestion(examId: string, questionId: string): Question {
  const row = db()
    .prepare('SELECT * FROM questions WHERE exam_id = ? AND id = ?')
    .get(examId, questionId) as QuestionRow | undefined;
  if (!row) throw new HttpError(404, 'Question not found.');
  return toQuestion(row);
}

export function createQuestion(examId: string, input: QuestionInput): Question {
  getExam(examId);
  const id = newId('q');
  const ts = now();
  const { next } = db()
    .prepare('SELECT COALESCE(MAX(position), 0) + 1 AS next FROM questions WHERE exam_id = ?')
    .get(examId) as { next: number };
  db()
    .prepare(
      `INSERT INTO questions (id, exam_id, position, title, language, difficulty, requirements, starter, rubric, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(id, examId, next, input.title, input.language, input.difficulty, input.requirements, input.starter, JSON.stringify(input.rubric), ts, ts);
  touchExam(examId);
  return getQuestion(examId, id);
}

export function updateQuestion(examId: string, questionId: string, input: QuestionInput): Question {
  getQuestion(examId, questionId);
  db()
    .prepare(
      `UPDATE questions SET title = ?, language = ?, difficulty = ?, requirements = ?, starter = ?, rubric = ?, updated_at = ?
       WHERE exam_id = ? AND id = ?`,
    )
    .run(input.title, input.language, input.difficulty, input.requirements, input.starter, JSON.stringify(input.rubric), now(), examId, questionId);
  touchExam(examId);
  return getQuestion(examId, questionId);
}

export function deleteQuestion(examId: string, questionId: string) {
  getQuestion(examId, questionId);
  db().prepare('DELETE FROM questions WHERE exam_id = ? AND id = ?').run(examId, questionId);
  // An exam with no questions can't stay published.
  db().prepare(
    'UPDATE exams SET published = 0 WHERE id = ? AND NOT EXISTS (SELECT 1 FROM questions WHERE exam_id = ?)',
  ).run(examId, examId);
  touchExam(examId);
}

function touchExam(examId: string) {
  db().prepare('UPDATE exams SET updated_at = ? WHERE id = ?').run(now(), examId);
}

// Students only see published exams. Admins can open drafts to preview them.
export function getVisibleExam(id: string, user: { role: string }): Exam {
  const exam = getExam(id);
  if (!exam.published && user.role !== 'admin') throw new HttpError(404, 'Exam not found.');
  return exam;
}
