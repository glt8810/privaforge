import { SignUp } from '@clerk/nextjs';

export const metadata = {
  title: 'Create account',
  description:
    'Create your PrivaForge account to start managing prompts with end-to-end encryption.',
};

export default function SignUpPage(): React.JSX.Element {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-16">
      <SignUp signInUrl="/sign-in" fallbackRedirectUrl="/dashboard" />
    </main>
  );
}
