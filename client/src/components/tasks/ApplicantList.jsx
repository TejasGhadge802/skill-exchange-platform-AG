import React, { useState } from 'react';
import { CheckCircle, XCircle, Bookmark, Star, MessageSquare, ArrowRight, ExternalLink, Globe, Linkedin, Github } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Badge from '../common/Badge';
import Alert from '../common/Alert';
import api from '../../services/api';

const ApplicantList = ({ applications, taskId, taskStatus, onUpdate }) => {
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAction = async (appId, action) => {
    try {
      setLoadingId(appId);
      setError(null);

      if (action === 'shortlist') {
        await api.patch(`/applications/${appId}/shortlist`);
        onUpdate();
      } else if (action === 'reject') {
        await api.patch(`/applications/${appId}/reject`);
        onUpdate();
      } else if (action === 'accept') {
        const res = await api.post(`/applications/${appId}/accept`);
        if (res.data.success) {
          navigate(`/conversations/${res.data.data.conversationId}`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} proposal`);
    } finally {
      setLoadingId(null);
    }
  };

  if (applications.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500 dark:text-slate-400">
        <p className="font-semibold text-slate-700 dark:text-slate-200">No proposals received yet</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Providers will submit proposals once your task is approved and visible.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && <Alert type="error" message={error} />}

      <div className="space-y-3">
        {applications.map((app) => (
          <div
            key={app._id}
            className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-sm transition ${
              app.status === 'accepted'
                ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/20'
                : app.status === 'shortlisted'
                ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/10 dark:bg-indigo-950/20'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <Link
                  to={`/users/${app.providerId?._id}`}
                  className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-sm hover:scale-105 transition-transform shrink-0"
                  title="View Candidate Profile"
                >
                  {app.providerId?.displayName?.charAt(0) || 'P'}
                </Link>
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/users/${app.providerId?._id}`}
                      className="font-bold text-slate-900 dark:text-white text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center gap-1 group"
                    >
                      <span>{app.providerId?.displayName}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <Link
                      to={`/users/${app.providerId?._id}`}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 px-2 py-0.5 rounded-md transition"
                    >
                      View Portfolio ↗
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1 text-amber-500 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {app.providerId?.ratingAverage || 5.0} ({app.providerId?.ratingCount || 0} reviews)
                    </span>
                    <span>•</span>
                    <span>{app.providerId?.location || 'Remote'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-slate-400 dark:text-slate-500">Proposed Bid</div>
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white">₹{app.proposedPrice}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{app.proposedDurationDays} days turnaround</div>
                </div>
                <Badge variant={app.status} />
              </div>
            </div>

            <div className="py-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p className="font-medium text-slate-800 dark:text-slate-200 mb-1">Proposal Pitch:</p>
              <p>{app.pitch}</p>
            </div>

            {/* Action Buttons for Task Owner */}
            {taskStatus === 'approved' && app.status !== 'accepted' && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-end gap-2">
                {app.status !== 'shortlisted' && (
                  <button
                    disabled={loadingId === app._id}
                    onClick={() => handleAction(app._id, 'shortlist')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-lg transition"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    Shortlist
                  </button>
                )}

                {app.status !== 'rejected' && (
                  <button
                    disabled={loadingId === app._id}
                    onClick={() => handleAction(app._id, 'reject')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-lg transition"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject
                  </button>
                )}

                <button
                  disabled={loadingId === app._id}
                  onClick={() => handleAction(app._id, 'accept')}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm rounded-lg transition"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {loadingId === app._id ? 'Accepting...' : 'Accept & Start Chat'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApplicantList;

