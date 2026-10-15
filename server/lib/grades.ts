import 'server-only';
import { db } from './db';

// A grade is Codeverity's rubric_score (0 to 10) from a completed submission.
// score is not used: it rates the feedback, not the student's code.

export function bestGrades(userId: string, examId: string): Record<string, number> {
  const rows = db()
    .prepare(
      `SELECT s.question_id, MAX(json_extract(s.result, '$.rubric_score')) AS grade
       FROM submissions s JOIN questions q ON q.id = s.question_id
       WHERE s.user_id = ? AND q.exam_id = ? AND s.status = 'completed'
       GROUP BY s.question_id`,
    )
    .all(userId, examId) as { question_id: string; grade: number | null }[];
  return Object.fromEntries(rows.filter((r) => r.grade !== null).map((r) => [r.question_id, r.grade as number]));
}

export function answeredCounts(userId: string): Record<string, number> {
  const rows = db()
    .prepare(
      `SELECT q.exam_id, COUNT(DISTINCT s.question_id) AS answered
       FROM submissions s JOIN questions q ON q.id = s.question_id
       WHERE s.user_id = ? AND s.status = 'completed'
       GROUP BY q.exam_id`,
    )
    .all(userId) as { exam_id: string; answered: number }[];
  return Object.fromEntries(rows.map((r) => [r.exam_id, r.answered]));
}
