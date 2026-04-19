import { cn } from '@/lib/utils';

interface EncryptedBadgeProps {
  readonly className?: string;
  readonly label?: string;
}

export function EncryptedBadge({
  className,
  label = 'E2EE · Client-side only',
}: EncryptedBadgeProps): React.JSX.Element {
  return (
    <div
      role="status"
      aria-label="End-to-end encrypted"
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-vault-500/30 bg-vault-500/10 px-3 py-1 font-mono text-xs text-vault-500',
        className,
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      {label}
    </div>
  );
}
