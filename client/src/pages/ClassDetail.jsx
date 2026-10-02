import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Users,
  Video,
  CheckCircle2,
  Send,
  Star,
  ShieldCheck,
  CreditCard,
  Lock,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';
import Alert from '../components/common/Alert';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EnrollmentModal from '../components/classes/EnrollmentModal';

const ClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const [classDoc, setClassDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/classes/${id}`);
      if (res.data.success) {
        setClassDoc(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load class details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassDetails();
  }, [id, currentUser]);

  const isInstructor = userProfile && classDoc && classDoc.instructorId?._id === userProfile._id;
  const isEnrolled = classDoc?.isEnrolled;
  const isFull = classDoc && classDoc.currentEnrolled >= classDoc.maxCapacity;
  const isStartingSoon = (() => {
    if (!classDoc?.scheduleDate) return false;
    const now = Date.now();
    const start = new Date(classDoc.scheduleDate).getTime();
    return start > now && start - now <= 2 * 60 * 60 * 1000; // within 2 hours
  })();

  // Submit draft for moderation
  const handleSubmitForApproval = async () => {
    try {
      setActionLoading(true);
      const res = await api.post(`/classes/${id}/submit`);
      if (res.data.success) {
        setSuccessMsg('Workshop submitted for moderation approval!');
        fetchClassDetails();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit class');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading workshop details..." />;
  if (error || !classDoc) return <div className="max-w-4xl mx-auto py-12 px-4"><Alert type="error" message={error || 'Class not found'} /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />}
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Class Starting Soon Reminder Banner */}
      {isEnrolled && isStartingSoon && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5">
          <span className="text-xl">🔔</span>
          <div>
            <p className="text-sm font-bold text-amber-900">This workshop starts in less than 2 hours!</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Scheduled for{' '}
              <strong>
                {new Date(classDoc.scheduleDate).toLocaleTimeString(undefined, {
                  hour: '2-digit', minute: '2-digit',
                })}
              </strong>
              {classDoc.meetingUrl && (
                <>
                  {' — '}
                  <a href={classDoc.meetingUrl} target="_blank" rel="noopener noreferrer"
                    className="font-bold text-indigo-600 hover:text-indigo-800 underline">
                    Join Now ↗
                  </a>
                </>
              )}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Workshop Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Badge variant={classDoc.status} />
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {classDoc.category}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                Created {new Date(classDoc.createdAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              {classDoc.title}
            </h1>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Workshop Curriculum & Details
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {classDoc.description}
              </p>
            </div>

            {/* Enrolled Access / Meeting Link */}
            {isEnrolled && (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  You are Enrolled in this Workshop!
                </div>
                {classDoc.meetingUrl ? (
                  <div className="pt-2 flex items-center gap-2">
                    <span className="text-xs text-emerald-800 font-semibold">Live Meeting URL:</span>
                    <a
                      href={classDoc.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1"
                    >
                      <Video className="w-3.5 h-3.5" /> Join Video Session
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-emerald-700">
                    The instructor will post the live meeting URL before the session begins.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Schedule, Fee & Enrollment Trigger */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Price</span>
              <div className="text-3xl font-black text-slate-900 mt-1">
                {classDoc.price === 0 ? (
                  <span className="text-emerald-600">FREE</span>
                ) : (
                  <>₹{classDoc.price} <span className="text-xs text-slate-400 font-semibold">INR</span></>
                )}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Date & Time</span>
                <span className="font-bold text-slate-800">
                  {new Date(classDoc.scheduleDate).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Duration</span>
                <span className="font-bold text-slate-800">{classDoc.durationMinutes} Minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Seat Capacity</span>
                <span className={`font-bold ${isFull ? 'text-rose-600' : 'text-slate-800'}`}>
                  {classDoc.currentEnrolled} / {classDoc.maxCapacity} seats filled
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              {isInstructor && ['draft', 'rejected'].includes(classDoc.status) && (
                <button
                  disabled={actionLoading}
                  onClick={handleSubmitForApproval}
                  className="w-full py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit Workshop for Approval
                </button>
              )}

              {!isInstructor && classDoc.status === 'approved' && !isEnrolled && (
                <button
                  disabled={isFull}
                  onClick={() => {
                    if (!currentUser) return navigate('/login');
                    setEnrollModalOpen(true);
                  }}
                  className="w-full py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 rounded-xl shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2"
                >
                  {isFull ? 'Workshop Full' : classDoc.price === 0 ? 'Enroll for Free' : `Enroll for ₹${classDoc.price}`}
                </button>
              )}

              {isEnrolled && (
                <div className="w-full py-3 text-center text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
                  ✓ Enrolled Successfully
                </div>
              )}
            </div>
          </div>

          {/* Instructor Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Instructor</h4>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 font-black text-lg flex items-center justify-center">
                {classDoc.instructorId?.displayName?.charAt(0) || 'I'}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{classDoc.instructorId?.displayName}</h4>
                <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {classDoc.instructorId?.ratingAverage || 5.0} ({classDoc.instructorId?.ratingCount || 0} reviews)
                </div>
              </div>
            </div>
            {classDoc.instructorId?.bio && (
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {classDoc.instructorId.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      <EnrollmentModal
        isOpen={enrollModalOpen}
        onClose={() => setEnrollModalOpen(false)}
        classDoc={classDoc}
        onEnrolled={() => {
          setSuccessMsg('Successfully enrolled in the workshop!');
          fetchClassDetails();
        }}
      />
    </div>
  );
};

export default ClassDetail;

