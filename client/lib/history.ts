'use client';

// Best rubric grade (0 to 10) per question per user, kept in localStorage.

const key = (username: string) => `codesarge.grades.${username}`;

export function getGrades(username: string): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(key(username)) ?? '{}');
  } catch {
    return {};
  }
}

export function saveGrade(username: string, questionId: string, grade: number) {
  const grades = getGrades(username);
  grades[questionId] = Math.max(grades[questionId] ?? 0, grade);
  localStorage.setItem(key(username), JSON.stringify(grades));
}
