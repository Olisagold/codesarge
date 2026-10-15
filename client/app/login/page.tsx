'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { login } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const session = login(username, password);
    if (session) router.replace(session.role === 'admin' ? '/admin' : '/quiz');
    else setError('Wrong username or password.');
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Codesarge</h1>
        <p className="mt-1 text-sm text-zinc-500">Sign in to start the quiz.</p>

        <label className="mt-6 block text-sm font-medium">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          autoFocus
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-900"
        />

        <label className="mt-4 block text-sm font-medium">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-900"
        />

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button className="mt-6 w-full rounded-md bg-zinc-900 py-2 font-medium text-white hover:bg-zinc-700">
          Sign in
        </button>
        <p className="mt-4 text-center text-xs text-zinc-400">Admin: admin / admin123 · Student: demo / demo123</p>
      </form>
    </div>
  );
}
