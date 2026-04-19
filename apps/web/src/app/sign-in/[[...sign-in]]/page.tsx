import { SignIn } from '@clerk/nextjs';

export const metadata = {
  title: 'Sign in',
  description: 'Sign in to your PrivaForge vault.',
};

export default function SignInPage(): React.JSX.Element {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-16">
      <SignIn signUpUrl="/sign-up" fallbackRedirectUrl="/dashboard" />
    </main>
  );
}
