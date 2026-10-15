'use client';

// Exams and questions, kept in localStorage until there is a backend.
// Admins write them; students only see published exams.

import type { Rubric } from './types';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type Question = {
  id: string;
  title: string;
  language: string;
  difficulty: Difficulty;
  requirements: string;
  starter: string;
  rubric: Rubric;
};

export type Exam = {
  id: string;
  title: string;
  description: string;
  published: boolean;
  questions: Question[];
  createdAt: string;
};

const KEY = 'codesarge.exams';

export function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function listExams(): Exam[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Exam[];
  } catch {
    // Fall through to the seed data.
  }
  write(seed);
  return seed;
}

export function getExam(id: string) {
  return listExams().find((e) => e.id === id);
}

export function saveExam(exam: Exam) {
  const exams = listExams();
  const i = exams.findIndex((e) => e.id === exam.id);
  if (i === -1) exams.unshift(exam);
  else exams[i] = exam;
  write(exams);
}

export function deleteExam(id: string) {
  write(listExams().filter((e) => e.id !== id));
}

export function saveQuestion(examId: string, question: Question) {
  const exam = getExam(examId);
  if (!exam) return;
  const i = exam.questions.findIndex((q) => q.id === question.id);
  if (i === -1) exam.questions.push(question);
  else exam.questions[i] = question;
  saveExam(exam);
}

export function deleteQuestion(examId: string, questionId: string) {
  const exam = getExam(examId);
  if (!exam) return;
  saveExam({ ...exam, questions: exam.questions.filter((q) => q.id !== questionId) });
}

// Same limits as AssessmentCreate in the Codeverity API, so a saved question
// never gets a 422 when a student submits it.
export function validateQuestion(q: Question): string[] {
  const errors: string[] = [];
  if (!q.title.trim()) errors.push('Title is required.');
  if (q.title.length > 200) errors.push('Title must be 200 characters or fewer.');
  if (!q.language.trim()) errors.push('Language is required.');
  if (q.language.length > 50) errors.push('Language must be 50 characters or fewer.');
  if (!q.requirements.trim()) errors.push('Requirements are required.');
  if (q.requirements.length > 10_000) errors.push('Requirements must be 10,000 characters or fewer.');

  const { criteria, notes } = q.rubric;
  if (criteria.length < 1 || criteria.length > 10) errors.push('The rubric needs 1 to 10 criteria.');
  criteria.forEach((c, i) => {
    const label = c.name.trim() || `Criterion ${i + 1}`;
    if (!c.name.trim()) errors.push(`Criterion ${i + 1} needs a name.`);
    if (c.name.length > 100) errors.push(`${label}: name must be 100 characters or fewer.`);
    if (!c.description.trim()) errors.push(`${label}: description is required.`);
    if (c.description.length > 500) errors.push(`${label}: description must be 500 characters or fewer.`);
    if (!Number.isInteger(c.weight) || c.weight < 1 || c.weight > 100)
      errors.push(`${label}: weight must be a whole number from 1 to 100.`);
  });
  const total = criteria.reduce((sum, c) => sum + c.weight, 0);
  if (total !== 100) errors.push(`Weights add up to ${total}. They must add up to 100.`);
  const names = criteria.map((c) => c.name.trim().toLowerCase());
  if (new Set(names).size !== names.length) errors.push('Criteria names must be unique.');
  if (notes && notes.length > 1000) errors.push('Notes must be 1,000 characters or fewer.');
  return errors;
}

function write(exams: Exam[]) {
  localStorage.setItem(KEY, JSON.stringify(exams));
}

const seed: Exam[] = [
  {
    id: 'exam_basics',
    title: 'Coding basics',
    description: 'Four short problems covering loops, strings, lookups and data structures.',
    published: true,
    createdAt: '2026-10-15T00:00:00.000Z',
    questions: [
      {
        id: 'q_fizzbuzz',
        title: 'FizzBuzz',
        language: 'python',
        difficulty: 'easy',
        requirements:
          'Write a function fizzbuzz(n) that returns a list of strings for 1..n. ' +
          'Multiples of 3 become "Fizz", multiples of 5 become "Buzz", multiples of both become "FizzBuzz", ' +
          'and every other number is its own string.',
        starter: 'def fizzbuzz(n):\n    pass\n',
        rubric: {
          learner_level: 'beginner',
          criteria: [
            { name: 'Correctness', description: 'Right output for 1..n, including multiples of 15.', weight: 70 },
            { name: 'Readability', description: 'Clear names and simple control flow.', weight: 30 },
          ],
        },
      },
      {
        id: 'q_palindrome',
        title: 'Valid palindrome',
        language: 'javascript',
        difficulty: 'easy',
        requirements:
          'Write a function isPalindrome(s) that returns true when s reads the same forwards and backwards, ' +
          'ignoring case and any character that is not a letter or digit.',
        starter: 'function isPalindrome(s) {\n  \n}\n',
        rubric: {
          learner_level: 'beginner',
          criteria: [
            { name: 'Correctness', description: 'Handles mixed case, punctuation and empty strings.', weight: 60 },
            { name: 'Readability', description: 'Clear names and simple control flow.', weight: 40 },
          ],
        },
      },
      {
        id: 'q_two_sum',
        title: 'Two sum',
        language: 'python',
        difficulty: 'medium',
        requirements:
          'Write a function two_sum(nums, target) that returns the indices of the two numbers that add up to target. ' +
          'Assume exactly one solution exists. Aim for better than O(n^2) time.',
        starter: 'def two_sum(nums, target):\n    pass\n',
        rubric: {
          learner_level: 'intermediate',
          criteria: [
            { name: 'Correctness', description: 'Returns the right pair of indices.', weight: 50 },
            { name: 'Efficiency', description: 'Runs in O(n) using a lookup table.', weight: 30 },
            { name: 'Readability', description: 'Clear names and no dead code.', weight: 20 },
          ],
        },
      },
      {
        id: 'q_lru',
        title: 'LRU cache',
        language: 'typescript',
        difficulty: 'hard',
        requirements:
          'Implement a class LRUCache with a constructor(capacity), get(key) returning the value or -1, ' +
          'and put(key, value). When full, put evicts the least recently used key. get and put must both be O(1).',
        starter:
          'class LRUCache {\n  constructor(capacity: number) {}\n\n  get(key: number): number {\n    return -1;\n  }\n\n  put(key: number, value: number): void {}\n}\n',
        rubric: {
          learner_level: 'advanced',
          notes: 'Accept a Map based solution; a hand written linked list is not required.',
          criteria: [
            { name: 'Correctness', description: 'Evicts the least recently used key and updates recency on get.', weight: 50 },
            { name: 'Complexity', description: 'get and put are O(1).', weight: 30 },
            { name: 'Type safety', description: 'Uses TypeScript types without any.', weight: 20 },
          ],
        },
      },
    ],
  },
];
