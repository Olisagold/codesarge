'use client';

// Mini auth for the quiz. Users are hardcoded and the session lives in
// localStorage. Swap this for a real backend once the UI is settled.

const USERS: Record<string, string> = {
  demo: 'demo123',
  student: 'password',
};

const KEY = 'codesarge.session';

export type Session = { username: string };

export function login(username: string, password: string): Session | null {
  const name = username.trim().toLowerCase();
  if (USERS[name] !== password) return null;
  const session = { username: name };
  localStorage.setItem(KEY, JSON.stringify(session));
  return session;
}

export function logout() {
  localStorage.removeItem(KEY);
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}
