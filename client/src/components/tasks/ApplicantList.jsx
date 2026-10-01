import React, { useState } from 'react';
import { CheckCircle, XCircle, Bookmark, Star, MessageSquare, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
        <p className="font-semibold text-slate-700">No proposals received yet</p>
        <p className="text-xs text-slate-400 mt-1">Providers will submit proposals once your task is approved and visible.</p>
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
            className={`bg-white rounded-2xl border p-5 shadow-sm transition ${
              app.status === 'accepted'
                ? 'border-emerald-300 bg-emerald-50/20'
                : app.status === 'shortlisted'
                ? 'border-indigo-200 bg-indigo-50/10'
                : 'border-slate-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                  {app.providerId?.displayName?.charAt(0) || 'P'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{app.providerId?.displayName}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
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
                  <div className="text-xs text-slate-400">Proposed Bid</div>
                  <div className="text-lg font-extrabold text-slate-900">₹{app.proposedPrice}</div>
                  <div className="text-[11px] text-slate-500">{app.proposedDurationDays} days turnaround</div>
                </div>
                <Badge variant={app.status} />
              </div>
            </div>

            <div className="py-3 text-xs text-slate-600 leading-relaxed">
              <p className="font-medium text-slate-800 mb-1">Proposal Pitch:</p>
              <p>{app.pitch}</p>
            </div>

            {/* Action Buttons for Task Owner */}
            {taskStatus === 'approved' && app.status !== 'accepted' && (
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
                {app.status !== 'shortlisted' && (
                  <button
                    disabled={loadingId === app._id}
                    onClick={() => handleAction(app._id, 'shortlist')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    Shortlist
                  </button>
                )}

                {app.status !== 'rejected' && (
                  <button
                    disabled={loadingId === app._id}
                    onClick={() => handleAction(app._id, 'reject')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition"
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

