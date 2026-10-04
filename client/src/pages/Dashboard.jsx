import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Briefcase,
  BookOpen,
  DollarSign,
  Star,
  CheckCircle,
  Clock,
  Users,
  ShieldAlert,
  ArrowRight,
  PlusCircle,
  Settings,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProfileSettingsTab from '../components/profile/ProfileSettingsTab';

const Dashboard = () => {
  const { userProfile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState(userProfile?.role || 'requester');
  const [stats, setStats] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const [myProviderTasks, setMyProviderTasks] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [myClasses, setMyClasses] = useState([]);
  const [myEnrolledClasses, setMyEnrolledClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.role) {
      setActiveTab(userProfile.role);
    }
  }, [userProfile]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, tasksRes, providerTasksRes, appsRes, classesRes, enrolledRes] = await Promise.all([
          api.get('/users/dashboard/stats'),
          api.get('/tasks/my/posted'),
          api.get('/tasks/my/provider').catch(() => ({ data: { data: [] } })),
          api.get('/applications/my/submitted'),
          api.get('/classes/my/hosted').catch(() => ({ data: { data: [] } })),
          api.get('/classes/my/enrolled').catch(() => ({ data: { data: [] } })),
        ]);

        if (statsRes.data.success) setStats(statsRes.data.data);
        if (tasksRes.data.success) setMyTasks(tasksRes.data.data);
        if (providerTasksRes.data.success) setMyProviderTasks(providerTasksRes.data.data);
        if (appsRes.data.success) setMyApplications(appsRes.data.data);
        if (classesRes.data.success) setMyClasses(classesRes.data.data);
        if (enrolledRes.data.success) setMyEnrolledClasses(enrolledRes.data.data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleRoleSwitch = async (newRole) => {
    try {
      await api.put('/auth/profile', { role: newRole });
      await refreshProfile();
      setActiveTab(newRole);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <LoadingSpinner message="Loading dashboard metrics..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner with Profile & Switcher */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="dashboard-user-avatar w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-indigo-500/20">
            {userProfile?.displayName?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-950 dark:text-white">{userProfile?.displayName}</h1>
              <Badge variant="primary" className="uppercase font-bold">
                {userProfile?.role}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{userProfile?.email}</p>
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300 mt-2">
              <span className="flex items-center gap-1 text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {userProfile?.ratingAverage || 5.0} ({userProfile?.ratingCount || 0} reviews)
              </span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                ₹{userProfile?.earningsTotal || 0} Total Earnings
              </span>
            </div>
          </div>
        </div>

        {/* Quick Role View Switcher */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl self-stretch sm:self-auto">
          {['requester', 'provider', 'instructor', ...(userProfile?.role === 'admin' ? ['admin'] : [])].map(
            (r) => (
              <button
                key={r}
                onClick={() => setActiveTab(r)}
                className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-xl capitalize transition ${
                  activeTab === r
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {r}
              </button>
            )
          )}
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-xl capitalize transition flex items-center gap-1 ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" /> Profile
          </button>
        </div>
      </div>

      {/* Profile Settings Tab */}
      {activeTab === 'profile' && (
        <ProfileSettingsTab userProfile={userProfile} onProfileUpdated={refreshProfile} />
      )}

      {/* Role-Specific Metric Cards */}
      {activeTab === 'requester' && stats?.requesterStats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Tasks Posted</span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                {stats.requesterStats.totalPosted}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase">In Progress</span>
              <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {stats.requesterStats.activeTasks}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Completed</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {stats.requesterStats.completedTasks}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Pending Proposals</span>
              <div className="text-2xl sm:text-3xl font-black text-amber-500 dark:text-amber-400 mt-1">
                {stats.requesterStats.pendingProposals}
              </div>
            </div>
          </div>

          {/* My Posted Tasks List */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">My Posted Tasks</h3>
              <Link
                to="/tasks/create"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Post Task
              </Link>
            </div>

            {myTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">You haven't posted any tasks yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {myTasks.map((t) => (
                  <div key={t._id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Link to={`/tasks/${t._id}`} className="font-bold text-slate-900 dark:text-white text-sm hover:text-indigo-600 dark:hover:text-indigo-400">
                        {t.title}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>₹{t.budgetMax}</span>
                        <span>•</span>
                        <span>{t.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={t.status} />
                      <Link
                        to={`/tasks/${t._id}`}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tasks I'm Currently Doing as Provider */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">Services I'm Doing</h3>
            </div>

            {myProviderTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                You're not currently working on any tasks as a provider.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {myProviderTasks.map((t) => (
                  <div key={t._id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Link to={`/tasks/${t._id}`} className="font-bold text-slate-900 dark:text-white text-sm hover:text-violet-600 dark:hover:text-violet-400">
                        {t.title}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        {t.requesterId?.displayName && (
                          <>
                            <span>by {t.requesterId.displayName}</span>
                            <span>•</span>
                          </>
                        )}
                        <span>₹{t.agreedPrice || t.budgetMax}</span>
                        <span>•</span>
                        <span>{t.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={t.status} />
                      <Link
                        to={`/tasks/${t._id}`}
                        className="p-1.5 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 rounded-lg"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'provider' && stats?.providerStats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Proposals Submitted</span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                {stats.providerStats.totalApplications}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Active Work</span>
              <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {stats.providerStats.activeProjects}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Delivered Tasks</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {stats.providerStats.completedProjects}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Earned Revenue</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                ₹{stats.providerStats.totalEarnings}
              </div>
            </div>
          </div>

          {/* My Submitted Applications */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">My Submitted Proposals</h3>

            {myApplications.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No proposals submitted yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {myApplications.map((app) => (
                  <div key={app._id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Link to={`/tasks/${app.taskId?._id}`} className="font-bold text-slate-900 dark:text-white text-sm hover:text-indigo-600 dark:hover:text-indigo-400">
                        {app.taskId?.title}
                      </Link>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Bid: <strong className="text-slate-800 dark:text-slate-200">₹{app.proposedPrice}</strong> • {app.proposedDurationDays} Days Turnaround
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={app.status} />
                      <Link
                        to={`/tasks/${app.taskId?._id}`}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'instructor' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Hosted Classes</span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                {stats?.instructorStats?.totalClasses || myClasses.length}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Published Live</span>
              <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {stats?.instructorStats?.publishedClasses || 0}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs col-span-2 lg:col-span-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Enrolled Students</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {stats?.instructorStats?.totalStudents || 0}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">My Workshops & Classes</h3>
              <Link
                to="/classes/create"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Host New Workshop
              </Link>
            </div>

            {myClasses.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No workshops hosted yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {myClasses.map((c) => (
                  <div key={c._id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Link to={`/classes/${c._id}`} className="font-bold text-slate-900 dark:text-white text-sm hover:text-indigo-600 dark:hover:text-indigo-400">
                        {c.title}
                      </Link>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(c.scheduleDate).toLocaleDateString()} • {c.currentEnrolled}/{c.maxCapacity} Enrolled
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={c.status} />
                      <Link to={`/classes/${c._id}`} className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg">
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enrolled Workshops Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">Workshops I Am Attending</h3>
        {myEnrolledClasses.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">You haven't enrolled in any workshops yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myEnrolledClasses.map((c) => (
              <div key={c._id} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{c.title}</h4>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date(c.scheduleDate).toLocaleDateString()}
                </div>
                <Link
                  to={`/classes/${c._id}`}
                  className="inline-block text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                >
                  Join / View Details →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

