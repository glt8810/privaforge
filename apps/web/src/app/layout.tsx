import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';

import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'PrivaForge AI — Your prompts. Your keys. Your control.',
    template: '%s · PrivaForge',
  },
  description:
    'Privacy-first, zero-knowledge AI prompt engineering & management. End-to-end encrypted by default.',
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0a0e1a',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-dvh bg-[#0a0e1a] text-slate-100 antialiased">{children}</body>
    </html>
  );
}
