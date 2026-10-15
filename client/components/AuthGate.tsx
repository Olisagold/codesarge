'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSession, logout, type Role, type Session } from '@/lib/auth';

type Props = {
  role?: Role;
  children: (session: Session) => React.ReactNode;
};

export default function AuthGate({ role, children }: Props) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const s = getSession();
    if (!s) router.replace('/login');
    else if (role && s.role !== role) router.replace(s.role === 'admin' ? '/admin' : '/quiz');
    else setSession(s);
  }, [router, role]);

  if (!session) return null;

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href={session.role === 'admin' ? '/admin' : '/quiz'} className="font-semibold">
              Codesarge
            </Link>
            {session.role === 'admin' && (
              <nav className="flex gap-3 text-sm text-zinc-600">
                <Link href="/admin" className="hover:text-zinc-900">Exams</Link>
                <Link href="/quiz" className="hover:text-zinc-900">Student view</Link>
              </nav>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-zinc-600">
            <span>
              {session.username}
              {session.role === 'admin' && <span className="ml-1 text-xs text-zinc-400">(admin)</span>}
            </span>
            <button
              onClick={() => {
                logout();
                router.replace('/login');
              }}
              className="rounded-md border border-zinc-300 px-2.5 py-1 hover:bg-zinc-100"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">{children(session)}</main>
    </div>
  );
}
