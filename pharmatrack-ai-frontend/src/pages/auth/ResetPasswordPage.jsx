import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '@/components/common/Icon';
import Button from '@/components/ui/Button';
import { resetPassword } from '@/services/authService';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!token) {
      setError('Reset token is missing. Please use the link from your email.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-8">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-primary/10 bg-surface-container">
          <Icon name="lock" className="text-2xl text-primary" />
        </div>
        <h1 className="mb-2 font-headline text-2xl font-semibold text-on-surface">Set New Password</h1>
        <p className="text-sm text-on-surface-variant">Choose a strong password for your account</p>
      </div>

      {success ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-primary/20 bg-primary/10 px-4 py-6 text-center">
          <Icon name="check_circle" className="text-3xl text-primary" />
          <p className="text-sm text-on-surface">
            Password updated successfully. Redirecting to login…
          </p>
        </div>
      ) : (
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label htmlFor="newPassword" className="ml-1 text-xs font-medium uppercase tracking-wider text-on-surface-variant">
              New Password
            </label>
            <div className="group relative">
              <Icon
                name="lock"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-primary"
              />
              <input
                id="newPassword"
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full rounded-xl border border-primary/10 bg-surface-container/40 py-3 pl-10 pr-4 text-sm text-on-surface shadow-inner placeholder:text-on-surface-variant/40 transition-all focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirm" className="ml-1 text-xs font-medium uppercase tracking-wider text-on-surface-variant">
              Confirm Password
            </label>
            <div className="group relative">
              <Icon
                name="lock_clock"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-primary"
              />
              <input
                id="confirm"
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat new password"
                className="w-full rounded-xl border border-primary/10 bg-surface-container/40 py-3 pl-10 pr-4 text-sm text-on-surface shadow-inner placeholder:text-on-surface-variant/40 transition-all focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Updating…' : 'Update Password'}
            {!loading && <Icon name="check" className="text-base" />}
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
