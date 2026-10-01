import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/common/Alert';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { loginWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await loginWithEmail(email, password);
      if (res.success) {
        navigate(redirectPath, { replace: true });
      } else {
        setError(res.error || 'Failed to sign in');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await loginWithGoogle();
      if (res.success) {
        navigate(redirectPath, { replace: true });
      } else {
        setError(res.error || 'Google sign-in failed');
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
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-500">Sign in to manage tasks, proposals, and workshops</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <Link to="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                Forgot password?
              </Link>
            </div>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2"
          >
            {loading ? 'Signing In...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400 font-semibold">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
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
          Google Sign-In
        </button>

        <p className="text-center text-xs text-slate-500 pt-2">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-800">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

