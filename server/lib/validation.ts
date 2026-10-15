import 'server-only';
import { HttpError, str } from './http';

// Limits match AssessmentCreate in the Codeverity API, so a saved question
// never gets a 422 from Codeverity when a student submits an answer.

export type Difficulty = 'easy' | 'medium' | 'hard';
export type LearnerLevel = 'beginner' | 'intermediate' | 'advanced';
export type RubricCriterion = { name: string; description: string; weight: number };
export type Rubric = { criteria: RubricCriterion[]; learner_level?: LearnerLevel; notes?: string };

export type ExamInput = { title: string; description: string };
export type QuestionInput = {
  title: string;
  language: string;
  difficulty: Difficulty;
  requirements: string;
  starter: string;
  rubric: Rubric;
};

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
const LEARNER_LEVELS: LearnerLevel[] = ['beginner', 'intermediate', 'advanced'];
export const MAX_CODE_CHARS = 100_000;

export function parseExam(body: Record<string, unknown>): ExamInput {
  const errors: string[] = [];
  const title = str(body.title).trim();
  const description = str(body.description).trim();
  if (!title) errors.push('Title is required.');
  if (title.length > 200) errors.push('Title must be 200 characters or fewer.');
  if (description.length > 1000) errors.push('Description must be 1,000 characters or fewer.');
  fail(errors);
  return { title, description };
}

export function parseQuestion(body: Record<string, unknown>): QuestionInput {
  const errors: string[] = [];
  const title = str(body.title).trim();
  const language = str(body.language).trim().toLowerCase();
  const difficulty = str(body.difficulty) as Difficulty;
  const requirements = str(body.requirements).trim();
  const starter = str(body.starter);

  if (!title) errors.push('Title is required.');
  if (title.length > 200) errors.push('Title must be 200 characters or fewer.');
  if (!language) errors.push('Language is required.');
  if (language.length > 50) errors.push('Language must be 50 characters or fewer.');
  if (!DIFFICULTIES.includes(difficulty)) errors.push('Difficulty must be easy, medium or hard.');
  if (!requirements) errors.push('Requirements are required.');
  if (requirements.length > 10_000) errors.push('Requirements must be 10,000 characters or fewer.');
  if (starter.length > MAX_CODE_CHARS) errors.push('Starter code must be 100,000 characters or fewer.');

  const rubric = parseRubric(body.rubric, errors);
  fail(errors);
  return { title, language, difficulty, requirements, starter, rubric };
}

function parseRubric(value: unknown, errors: string[]): Rubric {
  const raw = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
  const list = Array.isArray(raw.criteria) ? raw.criteria : [];

  const criteria = list.map((item, i): RubricCriterion => {
    const c = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
    const name = str(c.name).trim();
    const description = str(c.description).trim();
    const weight = typeof c.weight === 'number' ? c.weight : NaN;
    const label = name || `Criterion ${i + 1}`;
    if (!name) errors.push(`Criterion ${i + 1} needs a name.`);
    if (name.length > 100) errors.push(`${label}: name must be 100 characters or fewer.`);
    if (!description) errors.push(`${label}: description is required.`);
    if (description.length > 500) errors.push(`${label}: description must be 500 characters or fewer.`);
    if (!Number.isInteger(weight) || weight < 1 || weight > 100)
      errors.push(`${label}: weight must be a whole number from 1 to 100.`);
    return { name, description, weight };
  });

  if (criteria.length < 1 || criteria.length > 10) errors.push('The rubric needs 1 to 10 criteria.');
  const total = criteria.reduce((sum, c) => sum + (Number.isFinite(c.weight) ? c.weight : 0), 0);
  if (criteria.length && total !== 100) errors.push(`Weights add up to ${total}. They must add up to 100.`);
  const names = criteria.map((c) => c.name.toLowerCase());
  if (new Set(names).size !== names.length) errors.push('Criteria names must be unique.');

  const rubric: Rubric = { criteria };
  const level = str(raw.learner_level);
  if (level) {
    if (LEARNER_LEVELS.includes(level as LearnerLevel)) rubric.learner_level = level as LearnerLevel;
    else errors.push('Learner level must be beginner, intermediate or advanced.');
  }
  const notes = str(raw.notes).trim();
  if (notes.length > 1000) errors.push('Notes must be 1,000 characters or fewer.');
  if (notes) rubric.notes = notes;
  return rubric;
}

function fail(errors: string[]) {
  if (errors.length) throw new HttpError(422, 'Some fields are not valid.', errors);
}
