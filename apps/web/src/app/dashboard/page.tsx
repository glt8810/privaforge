import { currentUser } from '@clerk/nextjs/server';

export const metadata = {
  title: 'Overview',
};

export default async function DashboardOverviewPage(): Promise<React.JSX.Element> {
  const user = await currentUser();
  const greetingName =
    user?.firstName ?? user?.username ?? user?.emailAddresses[0]?.emailAddress ?? 'there';

  return (
    <section className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="font-mono text-xs tracking-widest text-slate-500 uppercase">Dashboard</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-100">
          Welcome, {greetingName}.
        </h1>
        <p className="max-w-2xl text-slate-400">
          Your vault is end-to-end encrypted. We cannot read your prompts, your titles, or your tags
          — only you can, in this browser, using the passphrase you will set up next.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card title="Unlock your vault" status="Next step">
          Set up a master passphrase to derive the encryption key that protects your prompts.
          <br />
          <span className="mt-3 inline-block font-mono text-xs text-slate-500">
            Coming in the next PR.
          </span>
        </Card>
        <Card title="Create your first prompt" status="After unlock">
          Write a prompt, and we will encrypt its title and body in your browser before it ever
          touches our servers.
        </Card>
        <Card title="Crypto audit" status="Pending">
          An independent cryptography review is required before any production launch. The full
          envelope format and KDF parameters are documented in ADR-0002.
        </Card>
      </div>
    </section>
  );
}

function Card({
  title,
  status,
  children,
}: {
  title: string;
  status: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <article className="rounded-lg border border-slate-800 bg-slate-900/40 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
        <span className="rounded border border-slate-700 px-2 py-0.5 text-[10px] tracking-widest text-slate-400 uppercase">
          {status}
        </span>
      </div>
      <p className="mt-3 text-sm text-slate-400">{children}</p>
    </article>
  );
}
