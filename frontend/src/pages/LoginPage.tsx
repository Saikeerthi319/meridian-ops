import { FormEvent, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { ErrorBanner } from '../components/ui';

export function LoginPage() {
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || '/';

  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('Password@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (token) return <Navigate to="/" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-panel lg:grid-cols-2">
        <div className="relative hidden bg-ink-950 p-10 text-white lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(196,92,38,0.35),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(111,148,135,0.35),transparent_40%)]" />
          <div className="relative">
            <p className="font-display text-4xl font-bold">Meridian Ops</p>
            <p className="mt-4 max-w-sm text-ink-200">
              Wholesale operations portal for customers, stock, and sales challans — role-aware and
              stock-safe.
            </p>
            <ul className="mt-10 space-y-3 text-sm text-ink-300">
              <li>Admin · Sales · Warehouse · Accounts</li>
              <li>Demo password: Password@123</li>
            </ul>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-8 sm:p-10">
          <h1 className="font-display text-3xl font-bold text-ink-950">Sign in</h1>
          <p className="mt-2 text-sm text-ink-500">Use a seeded role account to explore the portal.</p>
          {error ? <div className="mt-4"><ErrorBanner message={error} /></div> : null}
          <div className="mt-8 space-y-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
