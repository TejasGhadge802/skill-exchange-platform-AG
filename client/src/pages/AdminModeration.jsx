import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, XCircle, FileText, BookOpen, AlertTriangle, History } from 'lucide-react';
import api from '../services/api';
import Badge from '../components/common/Badge';
import Alert from '../components/common/Alert';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AdminModeration = () => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [classes, setClasses] = useState([]);
  const [reports, setReports] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [notes, setNotes] = useState({});
  const [feedback, setFeedback] = useState(null);

  const fetchModerationData = async () => {
    try {
      setLoading(true);
      const [tRes, cRes, rRes, lRes] = await Promise.all([
        api.get('/admin/moderation/tasks'),
        api.get('/admin/moderation/classes'),
        api.get('/admin/reports'),
        api.get('/admin/audit-logs'),
      ]);

      if (tRes.data.success) setTasks(tRes.data.data);
      if (cRes.data.success) setClasses(cRes.data.data);
      if (rRes.data.success) setReports(rRes.data.data);
      if (lRes.data.success) setAuditLogs(lRes.data.data);
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to load moderation data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModerationData();
  }, []);

  const handleModerateTask = async (id, decision) => {
    try {
      setActionLoading(id);
      const res = await api.patch(`/admin/moderation/tasks/${id}`, {
        decision,
        moderationNotes: notes[id] || '',
      });
      if (res.data.success) {
        setFeedback({ type: 'success', message: `Task ${decision}d successfully` });
        fetchModerationData();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Moderation action failed' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleModerateClass = async (id, decision) => {
    try {
      setActionLoading(id);
      const res = await api.patch(`/admin/moderation/classes/${id}`, {
        decision,
        moderationNotes: notes[id] || '',
      });
      if (res.data.success) {
        setFeedback({ type: 'success', message: `Class ${decision}d successfully` });
        fetchModerationData();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Moderation action failed' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolveReport = async (id, status) => {
    try {
      setActionLoading(id);
      const res = await api.patch(`/admin/reports/${id}/resolve`, {
        status,
        resolutionNotes: notes[id] || '',
      });
      if (res.data.success) {
        setFeedback({ type: 'success', message: `Report ${status}` });
        fetchModerationData();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Report action failed' });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading moderation queues..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-950 tracking-tight flex items-center gap-2.5">
          <ShieldAlert className="w-8 h-8 text-rose-600" />
          Admin Moderation & Governance
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review pending tasks, workshop curriculums, user dispute reports, and inspect system audit logs.
        </p>
      </div>

      {feedback && (
        <Alert
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            activeTab === 'tasks' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          Pending Tasks ({tasks.length})
        </button>

        <button
          onClick={() => setActiveTab('classes')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            activeTab === 'classes' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Pending Workshops ({classes.length})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            activeTab === 'reports' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Dispute Reports ({reports.filter((r) => r.status === 'pending').length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            activeTab === 'audit' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          Audit Trail
        </button>
      </div>

      {/* Tasks Queue */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center text-xs text-slate-400">
              No tasks currently pending approval.
            </div>
          ) : (
            tasks.map((t) => (
              <div key={t._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{t.title}</h3>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Posted by <strong>{t.requesterId?.displayName}</strong> ({t.requesterId?.email})
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-900">₹{t.budgetMax} INR</span>
                    <div className="text-[11px] text-slate-400">{t.category}</div>
                  </div>
                </div>

                <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                  {t.description}
                </p>

                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="text"
                    placeholder="Moderation notes or reason for rejection..."
                    value={notes[t._id] || ''}
                    onChange={(e) => setNotes({ ...notes, [t._id]: e.target.value })}
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      disabled={actionLoading === t._id}
                      onClick={() => handleModerateTask(t._id, 'reject')}
                      className="px-4 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                    <button
                      disabled={actionLoading === t._id}
                      onClick={() => handleModerateTask(t._id, 'approve')}
                      className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm rounded-xl transition flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve & Publish
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Classes Queue */}
      {activeTab === 'classes' && (
        <div className="space-y-4">
          {classes.length === 0 ? (
            <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center text-xs text-slate-400">
              No classes currently pending approval.
            </div>
          ) : (
            classes.map((c) => (
              <div key={c._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{c.title}</h3>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Instructor: <strong>{c.instructorId?.displayName}</strong> ({c.instructorId?.email})
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-900">
                      {c.price === 0 ? 'FREE' : `₹${c.price} INR`}
                    </span>
                    <div className="text-[11px] text-slate-400">{c.category} • {c.maxCapacity} seats</div>
                  </div>
                </div>

                <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                  {c.description}
                </p>

                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="text"
                    placeholder="Moderation feedback..."
                    value={notes[c._id] || ''}
                    onChange={(e) => setNotes({ ...notes, [c._id]: e.target.value })}
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      disabled={actionLoading === c._id}
                      onClick={() => handleModerateClass(c._id, 'reject')}
                      className="px-4 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                    <button
                      disabled={actionLoading === c._id}
                      onClick={() => handleModerateClass(c._id, 'approve')}
                      className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm rounded-xl transition flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve Workshop
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reports Queue */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center text-xs text-slate-400">
              No dispute reports filed.
            </div>
          ) : (
            reports.map((r) => (
              <div key={r._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-400">
                    Target: {r.targetType} (ID: {r.targetId})
                  </span>
                  <Badge variant={r.status} />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Reason: {r.reason}</h4>
                {r.details && <p className="text-xs text-slate-600">{r.details}</p>}

                {r.status === 'pending' && (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      disabled={actionLoading === r._id}
                      onClick={() => handleResolveReport(r._id, 'dismissed')}
                      className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                    >
                      Dismiss
                    </button>
                    <button
                      disabled={actionLoading === r._id}
                      onClick={() => handleResolveReport(r._id, 'resolved')}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                    >
                      Mark Resolved
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Immutable Admin Action Trail</h3>
          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.map((log) => (
              <div key={log._id} className="py-2.5 flex items-center justify-between gap-4">
                <div>
                  <strong className="text-slate-900 capitalize">{log.actionType.replace(/_/g, ' ')}</strong> on{' '}
                  <span className="text-slate-600">{log.targetModel}</span>
                  {log.notes && <div className="text-slate-400 mt-0.5">{log.notes}</div>}
                </div>
                <span className="text-slate-400 shrink-0">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminModeration;

