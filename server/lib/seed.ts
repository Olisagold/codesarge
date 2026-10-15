import 'server-only';
import type Database from 'better-sqlite3';
import { scryptSync, randomBytes } from 'node:crypto';
import type { QuestionInput } from './validation';

// Runs once, when the users table is empty: creates the accounts and a sample exam. Synchronous because it runs while
// the connection is being opened.
export function seed(conn: Database.Database) {
  const { n } = conn.prepare('SELECT COUNT(*) AS n FROM users').get() as { n: number };
  if (n > 0) return;

  const insert = conn.prepare(
    'INSERT INTO users (id, username, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)',
  );
  const createdAt = new Date().toISOString();
  const users: [string, string, string][] = [
    [process.env.ADMIN_USERNAME ?? 'admin', process.env.ADMIN_PASSWORD ?? 'admin123', 'admin'],
    ['demo', 'demo123', 'student'],
    ['student', 'password', 'student'],
  ];
  const insertExam = conn.prepare(
    'INSERT INTO exams (id, title, description, published, created_at, updated_at) VALUES (?, ?, ?, 1, ?, ?)',
  );
  const insertQuestion = conn.prepare(
    `INSERT INTO questions (id, exam_id, position, title, language, difficulty, requirements, starter, rubric, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  conn.transaction(() => {
    for (const [username, password, role] of users) {
      insert.run(id('usr'), username.toLowerCase(), hash(password), role, createdAt);
    }
    const examId = id('exam');
    insertExam.run(examId, 'Coding basics', 'Four short problems covering loops, strings, lookups and data structures.', createdAt, createdAt);
    sampleQuestions.forEach((q, i) => {
      insertQuestion.run(id('q'), examId, i + 1, q.title, q.language, q.difficulty, q.requirements, q.starter, JSON.stringify(q.rubric), createdAt, createdAt);
    });
  })();
}

const id = (prefix: string) => `${prefix}_${randomBytes(9).toString('base64url')}`;

// Same "<salt hex>:<hash hex>" format as lib/password.ts.
function hash(password: string) {
  const salt = randomBytes(16);
  return `${salt.toString('hex')}:${scryptSync(password, salt, 64).toString('hex')}`;
}

const sampleQuestions: QuestionInput[] = [
  {
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
];
