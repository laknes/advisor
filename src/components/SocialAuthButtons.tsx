import { signIn } from 'next-auth/react';
import { Button } from './Button';

const GoogleIcon = () => (
  <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
  </svg>
);

const AppleIcon = () => (
  <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
    <path fill="currentColor" d="M16.37 12.14c-.01-2.13 1.74-3.15 1.82-3.2-.99-1.45-2.54-1.65-3.09-1.67-1.3-.14-2.56.79-3.23.79-.68 0-1.7-.77-2.8-.75-1.44.02-2.78.84-3.52 2.12-1.51 2.62-.38 6.47 1.08 8.59.73 1.03 1.58 2.18 2.69 2.14 1.08-.04 1.49-.69 2.79-.69 1.3 0 1.67.69 2.8.67 1.16-.02 1.89-1.03 2.61-2.07.84-1.18 1.17-2.35 1.18-2.41-.03-.01-2.26-.87-2.33-3.52z" />
    <path fill="currentColor" d="M14.26 5.89c.6-.73 1.01-1.73.9-2.74-.87.04-1.95.58-2.58 1.3-.56.65-1.06 1.69-.93 2.66.98.08 1.99-.5 2.61-1.22z" />
  </svg>
);

export function SocialAuthButtons() {
  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/en/dashboard', redirect: true });
  };

  const handleAppleLogin = () => {
    signIn('apple', { callbackUrl: '/en/dashboard', redirect: true });
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <Button
        type="button"
        variant="secondary"
        fullWidth
        onClick={handleGoogleLogin}
        className="h-12 bg-white text-secondary-900 hover:bg-slate-100 border-white/70 shadow-sm"
      >
        <GoogleIcon />
        <span>گوگل</span>
      </Button>
      <Button
        type="button"
        variant="secondary"
        fullWidth
        onClick={handleAppleLogin}
        className="h-12 bg-white text-secondary-900 hover:bg-slate-100 border-white/70 shadow-sm"
      >
        <AppleIcon />
        <span>اپل آیدی</span>
      </Button>
    </div>
  );
}
