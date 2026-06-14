import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/common/Icon';
import Button from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="glass-panel rounded-2xl p-8">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-primary/10 bg-surface-container">
          <Icon name="lock_reset" className="text-2xl text-primary" />
        </div>
        <h1 className="mb-2 font-headline text-2xl font-semibold text-on-surface">Reset Your Password</h1>
        <p className="text-sm text-on-surface-variant">Enter your email to receive a reset link</p>
      </div>

      {submitted ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-primary/20 bg-primary/10 px-4 py-6 text-center">
          <Icon name="mark_email_read" className="text-3xl text-primary" />
          <p className="text-sm text-on-surface">
            If an account exists for <span className="font-medium text-on-surface">{email}</span>, a reset link has
            been sent.
          </p>
        </div>
      ) : (
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="ml-1 text-xs font-medium uppercase tracking-wider text-on-surface-variant">
              Email Address
            </label>
            <div className="group relative">
              <Icon
                name="mail"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-primary"
              />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@pharmatrack.com"
                className="w-full rounded-xl border border-primary/10 bg-surface-container/40 py-3 pl-10 pr-4 text-sm text-on-surface shadow-inner placeholder:text-on-surface-variant/40 transition-all focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </div>
          </div>
          <Button type="submit" className="w-full">
            Send Reset Link
            <Icon name="send" className="text-base" />
          </Button>
        </form>
      )}

      <div className="mt-8 border-t border-primary/5 pt-6 text-center">
        <Link
          to="/login"
          className="group inline-flex items-center justify-center gap-2 text-sm text-on-surface-variant transition-colors hover:text-primary"
        >
          <Icon name="arrow_back" className="text-base transition-transform group-hover:-translate-x-1" />
          Return to Login
        </Link>
      </div>
    </div>
  );
}
