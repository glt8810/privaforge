'use client';

import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { EncryptedBadge } from '@/components/encrypted-badge';
import { cn } from '@/lib/utils';

type NavItem = {
  href: '/dashboard' | '/dashboard/prompts' | '/dashboard/marketplace' | '/dashboard/settings';
  label: string;
  icon: React.ReactNode;
};

const NAV: ReadonlyArray<NavItem> = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: <DotIcon />,
  },
  {
    href: '/dashboard/prompts',
    label: 'Vault',
    icon: <VaultIcon />,
  },
  {
    href: '/dashboard/marketplace',
    label: 'Marketplace',
    icon: <StoreIcon />,
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: <CogIcon />,
  },
];

export function DashboardSidebar(): React.JSX.Element {
  const pathname = usePathname();
  return (
    <aside className="flex h-dvh w-64 flex-col border-r border-slate-800 bg-[#0b1020] px-4 py-6">
      <Link href="/dashboard" className="mb-8 flex items-center gap-3 px-2">
        <span className="text-lg font-semibold tracking-tight text-slate-100">PrivaForge</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition',
                active
                  ? 'bg-slate-800/80 text-slate-50'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-100',
              )}
            >
              <span className="text-slate-500">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 flex flex-col gap-3 border-t border-slate-800 pt-4">
        <EncryptedBadge />
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-slate-500">Account</span>
          <UserButton />
        </div>
      </div>
    </aside>
  );
}

function DotIcon(): React.JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="3" fill="currentColor" />
    </svg>
  );
}

function VaultIcon(): React.JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 4h16v16H4z M4 9h16 M12 14v4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StoreIcon(): React.JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 7l1-3h16l1 3 M3 7v13h18V7 M3 7h18 M8 11v5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CogIcon(): React.JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
