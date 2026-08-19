import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, LayoutDashboard, ClipboardCheck, Award } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import getErrorMessage from '../utils/getErrorMessage';

const FEATURES = [
  { icon: LayoutDashboard, text: 'Real-time dashboards for admins, teachers and students' },
  { icon: ClipboardCheck, text: 'Fast, intuitive attendance tracking' },
  { icon: Award, text: 'Grades and academic records in one place' },
];

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const me = await login(username, password);
      navigate(`/${me.role}`, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Branding side */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-12 text-white lg:flex">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500">
            <GraduationCap size={19} />
          </div>
          <span className="text-lg font-bold">Edunova</span>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-3xl font-bold leading-tight">
            Run your institution with clarity, not chaos.
          </h1>
          <p className="mt-3 text-sm text-slate-300">
            One place for students, teachers, attendance, and academic records — built for modern education teams.
          </p>
          <div className="mt-8 flex flex-col gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <f.icon size={15} />
                </div>
                <span className="text-sm text-slate-200">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-400">© {new Date().getFullYear()} Edunova. All rights reserved.</p>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-fg">
              <GraduationCap size={18} />
            </div>
            <span className="text-lg font-bold text-ink">Edunova</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-ink">Welcome back</h2>
          <p className="mt-1.5 text-sm text-ink-muted">Sign in to your account to continue.</p>

          <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
            {error && (
              <div className="rounded-lg border border-danger/20 bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
                {error}
              </div>
            )}
            <Input
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              autoFocus
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Button type="submit" size="lg" loading={loading} className="mt-2 w-full">
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-ink-faint">
            Accounts are created by your administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
