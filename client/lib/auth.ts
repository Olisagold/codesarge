'use client';

// Mini auth for the quiz. Users are hardcoded and the session lives in
// localStorage. Swap this for a real backend once the UI is settled.

export type Role = 'admin' | 'student';

const USERS: Record<string, { password: string; role: Role }> = {
  admin: { password: 'admin123', role: 'admin' },
  demo: { password: 'demo123', role: 'student' },
  student: { password: 'password', role: 'student' },
};

const KEY = 'codesarge.session';

export type Session = { username: string; role: Role };

export function login(username: string, password: string): Session | null {
  const name = username.trim().toLowerCase();
  const user = USERS[name];
  if (!user || user.password !== password) return null;
  const session = { username: name, role: user.role };
  localStorage.setItem(KEY, JSON.stringify(session));
  return session;
}

export function logout() {
  localStorage.removeItem(KEY);
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    const session = raw ? (JSON.parse(raw) as Session) : null;
    // Sessions saved before roles existed have no role; make them sign in again.
    return session?.role ? session : null;
  } catch {
    return null;
  }
}
