import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Icon from '@/components/common/Icon';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-10">
        <h2 className="mb-2 font-headline text-3xl font-bold text-on-surface">Welcome Back</h2>
        <p className="text-on-surface-variant">Enter your credentials to access the secure portal.</p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
          <Icon name="error" className="text-base" />
          {error}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="group space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-on-surface-variant transition-colors group-focus-within:text-primary"
          >
            Corporate Email
          </label>
          <div className="flex items-center rounded-lg border border-outline-variant bg-surface-container-highest/60 backdrop-blur-md transition-all duration-200 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/40">
            <div className="pl-4 text-on-surface-variant transition-colors group-focus-within:text-primary">
              <Icon name="mail" />
            </div>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@pharmatrack.com"
              className="w-full border-none bg-transparent py-3 pl-3 pr-4 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-0"
            />
          </div>
        </div>

        <div className="group space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-on-surface-variant transition-colors group-focus-within:text-primary"
          >
            Password
          </label>
          <div className="flex items-center rounded-lg border border-outline-variant bg-surface-container-highest/60 backdrop-blur-md transition-all duration-200 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/40">
            <div className="pl-4 text-on-surface-variant transition-colors group-focus-within:text-primary">
              <Icon name="lock" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
              className="w-full border-none bg-transparent py-3 pl-3 pr-4 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-0"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="pr-4 text-on-surface-variant transition-colors hover:text-primary"
            >
              <Icon name={showPassword ? 'visibility' : 'visibility_off'} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end text-sm">
          <Link to="/forgot-password" className="font-medium text-primary transition-colors hover:text-primary/80">
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
          <Icon name="arrow_forward" />
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-on-surface-variant">
        <p>Protected by AI Advanced Encryption. Unauthorized access is prohibited.</p>
      </div>
    </>
  );
}
