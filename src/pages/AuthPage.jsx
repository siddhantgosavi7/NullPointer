import { KeyRound, Mail, ShieldCheck, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useApp } from '../context/AppContext';

export function AuthPage() {
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('Farmer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, register, notify } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    setError('');
  }, [mode]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (mode === 'register') {
        register({ name, email, password, role });
      } else if (mode === 'login') {
        login({ email, password });
      } else {
        notify('Reset instructions will be added when email delivery is connected.');
      }

      navigate(fromPath, { replace: true });
    } catch (authError) {
      setError(authError.message || 'Authentication failed.');
      notify(authError.message || 'Authentication failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[.9fr_1.1fr]">
      <div>
        <p className="text-sm font-black uppercase tracking-wide text-leaf-600">Secure access</p>
        <h1 className="mt-2 text-4xl font-black text-slate-950 dark:text-white">Welcome to your smart farming workspace</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400">Create an account or sign in to access disease detection, weather alerts, reports, and history.</p>
      </div>
      <Card>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="mb-5 grid grid-cols-3 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            {['login', 'register', 'forgot'].map((item) => (
              <button key={item} type="button" onClick={() => setMode(item)} className={`rounded-lg px-3 py-2 text-sm font-bold capitalize ${mode === item ? 'bg-white shadow-sm dark:bg-slate-950' : ''}`}>
                {item === 'forgot' ? 'Reset' : item}
              </button>
            ))}
          </div>
          {mode === 'register' && (
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Full name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-slate-950" placeholder="Enter your name" />
            </label>
          )}
          {mode === 'register' && (
            <div>
              <label className="mb-2 block text-sm font-bold">Select role</label>
              <div className="grid gap-2 sm:grid-cols-3">
                {['Farmer', 'Agriculture Expert', 'Admin'].map((item) => (
                  <button key={item} type="button" onClick={() => setRole(item)} className={`rounded-lg border p-3 text-sm font-bold ${role === item ? 'border-leaf-600 bg-leaf-50 text-leaf-800 dark:bg-leaf-950' : 'border-slate-200 dark:border-white/10'}`}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
          <Field icon={Mail} label="Email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          {mode !== 'forgot' && <Field icon={KeyRound} label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />}
          {mode === 'forgot' && <Field icon={ShieldCheck} label="Recovery email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your registered email" />}
          {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 dark:bg-red-950 dark:text-red-100">{error}</p>}
          <Button type="submit" disabled={submitting}>
            <UserPlus size={18} /> {submitting ? 'Please wait...' : mode === 'login' ? 'Login' : mode === 'register' ? 'Create account' : 'Send reset instructions'}
          </Button>
        </form>
      </Card>
    </section>
  );
}

function Field({ icon: Icon, label, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold">{label}</span>
      <span className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 dark:border-white/10 dark:bg-slate-950">
        <Icon size={18} className="text-leaf-600" />
        <input className="w-full bg-transparent outline-none" {...props} />
      </span>
    </label>
  );
}
