import Link from 'next/link';

export default function NotFound(): React.JSX.Element {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-mono text-sm text-slate-400">404</p>
      <h1 className="text-3xl font-bold">Nothing to decrypt here.</h1>
      <Link href="/" className="text-brand-400 hover:underline">
        Back to safety →
      </Link>
    </main>
  );
}
