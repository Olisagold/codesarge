'use client';

// Best score per question per user, kept in localStorage.

const key = (username: string) => `codesarge.scores.${username}`;

export function getScores(username: string): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(key(username)) ?? '{}');
  } catch {
    return {};
  }
}

export function saveScore(username: string, questionId: string, score: number) {
  const scores = getScores(username);
  scores[questionId] = Math.max(scores[questionId] ?? 0, score);
  localStorage.setItem(key(username), JSON.stringify(scores));
}
