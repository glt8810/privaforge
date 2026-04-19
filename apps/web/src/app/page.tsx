import Link from 'next/link';

import { EncryptedBadge } from '@/components/encrypted-badge';

export default function LandingPage(): React.JSX.Element {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col items-center justify-center gap-10 px-6 py-24">
      <EncryptedBadge />

      <h1 className="to-brand-300 bg-gradient-to-br from-white bg-clip-text text-center text-5xl font-bold tracking-tight text-transparent sm:text-7xl">
        Your prompts.
        <br />
        Your keys.
        <br />
        Your control.
      </h1>

      <p className="max-w-2xl text-center text-lg text-slate-300">
        PrivaForge is the zero-knowledge, end-to-end encrypted home for your AI prompts. Optimize,
        version, collaborate, and monetize — without a single byte of your content ever reaching our
        servers unencrypted.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/sign-up"
          className="bg-brand-500 shadow-brand-500/30 hover:bg-brand-400 rounded-lg px-6 py-3 font-semibold text-white shadow-lg transition"
        >
          Create account
        </Link>
        <Link
          href="/sign-in"
          className="rounded-lg border border-slate-700 px-6 py-3 font-semibold text-slate-100 transition hover:border-slate-500"
        >
          Sign in
        </Link>
      </div>

      <p className="mt-8 font-mono text-xs text-slate-500">
        Build status: Phase 0 scaffold · Crypto audit: pending · Not yet production.
      </p>
    </main>
  );
}
