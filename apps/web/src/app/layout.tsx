import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';

import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

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
    <ClerkProvider
      afterSignOutUrl="/"
      appearance={{
        variables: {
          colorPrimary: '#3b82f6',
          colorBackground: '#0a0e1a',
          colorText: '#f1f5f9',
          colorInputBackground: '#111827',
          colorInputText: '#f1f5f9',
        },
      }}
    >
      <html
        lang="en"
        className={`${inter.variable} ${mono.variable} dark`}
        suppressHydrationWarning
      >
        <body className="min-h-dvh bg-[#0a0e1a] text-slate-100 antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
