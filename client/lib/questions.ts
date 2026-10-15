import type { Rubric } from './types';

export type Question = {
  id: string;
  title: string;
  language: string;
  difficulty: 'easy' | 'medium' | 'hard';
  requirements: string;
  starter: string;
  rubric?: Rubric;
};

export const questions: Question[] = [
  {
    id: 'fizzbuzz',
    title: 'FizzBuzz',
    language: 'python',
    difficulty: 'easy',
    requirements:
      'Write a function fizzbuzz(n) that returns a list of strings for 1..n. ' +
      'Multiples of 3 become "Fizz", multiples of 5 become "Buzz", multiples of both become "FizzBuzz", ' +
      'and every other number is its own string.',
    starter: 'def fizzbuzz(n):\n    pass\n',
  },
  {
    id: 'palindrome',
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
    id: 'two-sum',
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
    id: 'lru-cache',
    title: 'LRU cache',
    language: 'typescript',
    difficulty: 'hard',
    requirements:
      'Implement a class LRUCache with a constructor(capacity), get(key) returning the value or -1, ' +
      'and put(key, value). When full, put evicts the least recently used key. get and put must both be O(1).',
    starter: 'class LRUCache {\n  constructor(capacity: number) {}\n\n  get(key: number): number {\n    return -1;\n  }\n\n  put(key: number, value: number): void {}\n}\n',
  },
];

export function getQuestion(id: string) {
  return questions.find((q) => q.id === id);
}
