'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSession, logout, type Session } from '@/lib/auth';

export default function AuthGate({ children }: { children: (session: Session) => React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const s = getSession();
    if (!s) router.replace('/login');
    else setSession(s);
  }, [router]);

  if (!session) return null;

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link href="/quiz" className="font-semibold">
            Codesarge
          </Link>
          <div className="flex items-center gap-3 text-sm text-zinc-600">
            <span>{session.username}</span>
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
