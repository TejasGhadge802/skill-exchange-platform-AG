import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  BookOpen,
  Briefcase,
  CheckCircle,
  Star,
  Search,
} from 'lucide-react';
import api from '../services/api';
import TaskCard from '../components/tasks/TaskCard';
import ClassCard from '../components/classes/ClassCard';

const Home = () => {
  const [featuredTasks, setFeaturedTasks] = useState([]);
  const [featuredClasses, setFeaturedClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [taskRes, classRes] = await Promise.all([
          api.get('/tasks?limit=3'),
          api.get('/classes?limit=3'),
        ]);
        if (taskRes.data.success) setFeaturedTasks(taskRes.data.data);
        if (classRes.data.success) setFeaturedClasses(classRes.data.data);
      } catch (err) {
        console.warn('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 bg-gradient-to-b from-indigo-50/70 via-white to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Skill & Service Exchange Marketplace</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-[1.15]">
              Trade Skills. Complete Tasks.{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 bg-clip-text text-transparent">
                Grow Together.
              </span>
            </h1>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Hire vetted specialists for custom tasks with Razorpay escrow protection, or join interactive live workshops hosted by industry instructors.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                to="/tasks"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition"
              >
                <Briefcase className="w-4 h-4" />
                Browse Tasks
              </Link>
              <Link
                to="/classes"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition"
              >
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Explore Workshops
              </Link>
              <Link
                to="/tasks/create"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition"
              >
                Post a Task
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Razorpay Escrow Security</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Funds stay safely in escrow until you confirm the task is complete. No surprises, no risk.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Real-time Negotiation & Chat</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Communicate in real-time, negotiate milestone terms in INR, and collaborate seamlessly before locking contracts.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Verified Dual Rating Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Only verified project participants can review each other, guaranteeing 100% authentic reputations.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Tasks */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Featured Tasks</h2>
            <p className="text-xs text-slate-500 mt-1">Discover opportunities needing your specific skill set</p>
          </div>
          <Link
            to="/tasks"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            View all tasks <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {featuredTasks.length === 0 ? (
          <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center text-slate-500 text-xs">
            No published tasks at the moment. Be the first to <Link to="/tasks/create" className="text-indigo-600 font-bold underline">post a task</Link>!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredTasks.map((t) => (
              <TaskCard key={t._id} task={t} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Classes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Upcoming Workshops & Classes</h2>
            <p className="text-xs text-slate-500 mt-1">Join interactive live learning sessions hosted by experts</p>
          </div>
          <Link
            to="/classes"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            View all workshops <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {featuredClasses.length === 0 ? (
          <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center text-slate-500 text-xs">
            No workshops scheduled currently. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredClasses.map((c) => (
              <ClassCard key={c._id} classItem={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;

