import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Sparkles, ArrowRight, Briefcase, Wrench, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/common/Alert';

const Register = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('requester');
  const [hoveredRole, setHoveredRole] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { registerWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      return setError('Password must be at least 6 characters long');
    }

    try {
      setLoading(true);
      setError(null);
      const res = await registerWithEmail(email, password, displayName, role);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.error || 'Failed to create account');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await loginWithGoogle();
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.error || 'Google sign-up failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md shadow-indigo-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
          <p className="text-xs text-slate-500">Join the Skill Exchange ecosystem</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Primary Role <span className="font-normal text-slate-400">(hover to learn more)</span>
            </label>
            <div className="space-y-2">
              {[
                {
                  id: 'requester',
                  icon: Briefcase,
                  label: 'Requester',
                  desc: 'Post tasks, hire skilled providers, review proposals, and pay securely through Razorpay escrow.',
                  color: 'indigo',
                },
                {
                  id: 'provider',
                  icon: Wrench,
                  label: 'Provider',
                  desc: 'Browse published tasks, submit proposals with your price, chat with requesters, and get paid upon completion.',
                  color: 'emerald',
                },
                {
                  id: 'instructor',
                  icon: GraduationCap,
                  label: 'Instructor',
                  desc: 'Create and publish classes or live workshops, manage enrollments, and share your expertise with learners.',
                  color: 'amber',
                },
              ].map(({ id, icon: Icon, label, desc, color }) => {
                const isActive = role === id;
                const isRevealed = hoveredRole === id;
                const colorMap = {
                  indigo: {
                    border: isActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40',
                    icon: isActive ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600',
                    title: isActive ? 'text-indigo-700' : 'text-slate-800',
                    desc: 'text-indigo-600/80',
                  },
                  emerald: {
                    border: isActive ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40',
                    icon: isActive ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-600',
                    title: isActive ? 'text-emerald-700' : 'text-slate-800',
                    desc: 'text-emerald-700/80',
                  },
                  amber: {
                    border: isActive ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-amber-300 hover:bg-amber-50/40',
                    icon: isActive ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-600',
                    title: isActive ? 'text-amber-700' : 'text-slate-800',
                    desc: 'text-amber-700/80',
                  },
                };
                const c = colorMap[color];
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setRole(id)}
                    onMouseEnter={() => setHoveredRole(id)}
                    onMouseLeave={() => setHoveredRole(null)}
                    onTouchStart={() => setHoveredRole(id)}
                    onTouchEnd={() => setHoveredRole(null)}
                    className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 active:scale-[0.98] ${c.border}`}
                  >
                    <div className={`mt-0.5 w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center transition-colors duration-200 ${c.icon}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className={`text-sm font-bold transition-colors duration-200 ${c.title}`}>{label}</div>
                      <div className={`text-xs mt-0.5 leading-relaxed transition-all duration-200 overflow-hidden ${
                        isRevealed ? `max-h-20 opacity-100 ${c.desc}` : 'max-h-0 opacity-0'
                      }`}>
                        {desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400 font-semibold">Or sign up with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full py-2.5 px-4 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition flex items-center justify-center gap-3"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Sign Up with Google
        </button>

        <p className="text-center text-xs text-slate-500 pt-2">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-800">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

