import { useMemo, useState } from 'react';
import { ArrowRight, LockKeyhole, Mail, Shield } from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store.js';

function FloatingField({ label, type, value, onChange, icon: Icon, name }) {
  const isRaised = value.length > 0;

  return (
    <label className="group relative block">
      <span
        className={`pointer-events-none absolute left-12 transition-all duration-200 ${
          isRaised ? 'top-3 text-xs text-indigo-200' : 'top-1/2 -translate-y-1/2 text-sm text-slate-400'
        }`}
      >
        {label}
      </span>
      <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition group-focus-within:text-indigo-200" />
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="h-16 w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 pt-5 text-sm text-white outline-none transition placeholder:text-transparent focus:border-indigo-400/60 focus:bg-white/10"
        placeholder={label}
        autoComplete={type === 'password' ? 'current-password' : 'email'}
      />
    </label>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loginLoading, login } = useAuthStore();
  const [form, setForm] = useState({
    email: 'admin@hrms.com',
    password: 'Admin@123',
    remember: true,
  });

  const rolePreview = useMemo(() => {
    return form.email.includes('admin') ? 'Admin' : form.email ? 'Employee' : 'Role';
  }, [form.email]);

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard'} replace />;
  }

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const loggedInUser = await login({
      email: form.email,
      password: form.password,
    });

    const from = location.state?.from?.pathname;
    navigate(from || (loggedInUser.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard'), {
      replace: true,
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-hero-gradient px-4 py-12">
      <div className="absolute left-[-10%] top-10 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="absolute right-[-6%] top-1/3 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="absolute bottom-[-10%] left-1/3 h-96 w-96 rounded-full bg-sky-400/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-6rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="hidden lg:block">
            <div className="max-w-xl space-y-6">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                <Shield className="h-4 w-4 text-indigo-200" />
                Smart Employee Management System
              </p>
              <div className="space-y-4">
                <h1 className="text-6xl font-semibold leading-tight text-white">
                  <span className="bg-gradient-to-r from-sky-200 via-indigo-200 to-violet-200 bg-clip-text text-transparent">
                    HRMS Pro
                  </span>
                  <br />
                  for modern teams.
                </h1>
                <p className="max-w-lg text-lg leading-8 text-slate-200/80">
                  Secure admin and employee access, local SQLite data, and a polished workspace we can grow into
                  analytics, tasks, leaves, and AI support.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  'JWT-based authentication',
                  'Role-based route protection',
                  'SQLite-backed user records',
                  'Warm, premium glass UI',
                ].map((feature) => (
                  <div key={feature} className="glass-panel rounded-3xl p-5 shadow-glow">
                    <p className="text-sm text-slate-200">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="glass-panel mx-auto w-full max-w-md rounded-[32px] border border-white/10 p-8 shadow-glow">
            <div className="mb-8 flex items-start justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Welcome back</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">Sign in to continue</h2>
              </div>
              <div className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-100">
                {rolePreview}
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <FloatingField
                label="Email address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                icon={Mail}
              />
              <FloatingField
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                icon={LockKeyhole}
              />

              <label className="flex items-center justify-between gap-3 text-sm text-slate-300">
                <span className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={form.remember}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500"
                  />
                  Remember me
                </span>
                <span className="text-slate-400">Local device session</span>
              </label>

              <button
                type="submit"
                disabled={loginLoading}
                className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-400 to-violet-500 font-medium text-white transition duration-300 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loginLoading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing you in...
                  </>
                ) : (
                  <>
                    Access workspace
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              <p className="font-medium text-white">Default access</p>
              <p className="mt-2">Admin: `admin@hrms.com` / `Admin@123`</p>
              <p className="mt-1">Employee example: `aarav.mehta@hrms.com` / `Employee@123`</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
