import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Menu,
  X,
  PlusCircle,
  BookOpen,
  Briefcase,
  LayoutDashboard,
  ShieldAlert,
  User as UserIcon,
  LogOut,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationCenter from '../notifications/NotificationCenter';

const Navbar = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 bg-clip-text text-transparent">
                  SkillExchange
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/tasks"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                  isActive('/tasks')
                    ? 'text-indigo-600 bg-indigo-50/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                Find Tasks
              </Link>
              <Link
                to="/classes"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                  isActive('/classes')
                    ? 'text-indigo-600 bg-indigo-50/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Workshops & Classes
              </Link>

              {currentUser && (
                <Link
                  to="/dashboard"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                    isActive('/dashboard')
                      ? 'text-indigo-600 bg-indigo-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              )}

              {userProfile?.role === 'admin' && (
                <Link
                  to="/admin/moderation"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                    isActive('/admin/moderation')
                      ? 'text-rose-600 bg-rose-50 font-semibold'
                      : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50/50'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  Moderation
                </Link>
              )}
            </nav>
          </div>

          {/* Right Header Controls */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <>
                <Link
                  to="/tasks/create"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  Post Task
                </Link>

                <NotificationCenter />

                {/* User Menu & Role Indicator */}
                <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                  <div className="flex flex-col items-end text-right">
                    <span className="text-xs font-bold text-slate-800 line-clamp-1">
                      {userProfile?.displayName || currentUser.email?.split('@')[0]}
                    </span>
                    <span className="text-[10px] font-semibold text-indigo-600 capitalize bg-indigo-50 px-1.5 py-0.5 rounded">
                      {userProfile?.role || 'Member'}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            {currentUser && <NotificationCenter />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/tasks"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            <Briefcase className="w-5 h-5 text-indigo-600" />
            Find Tasks
          </Link>
          <Link
            to="/classes"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Workshops & Classes
          </Link>

          {currentUser ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                <LayoutDashboard className="w-5 h-5 text-indigo-600" />
                Dashboard
              </Link>
              <Link
                to="/tasks/create"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                <PlusCircle className="w-5 h-5 text-indigo-600" />
                Post a Task
              </Link>
              {userProfile?.role === 'admin' && (
                <Link
                  to="/admin/moderation"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-rose-700 hover:bg-rose-50"
                >
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  Admin Moderation
                </Link>
              )}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-slate-900">{userProfile?.displayName}</div>
                  <div className="text-xs text-indigo-600 capitalize">{userProfile?.role}</div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="px-3 py-1.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2 text-center text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2 text-center text-sm font-semibold text-white bg-indigo-600 rounded-lg"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;

