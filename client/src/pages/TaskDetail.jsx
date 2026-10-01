import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Clock,
  Star,
  CheckCircle,
  MessageSquare,
  Edit,
  Trash2,
  Send,
  ShieldCheck,
  Award,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';
import Alert from '../components/common/Alert';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ApplicationModal from '../components/tasks/ApplicationModal';
import ApplicantList from '../components/tasks/ApplicantList';
import ReviewModal from '../components/reviews/ReviewModal';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const [task, setTask] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/tasks/${id}`);
      if (res.data.success) {
        setTask(res.data.data);

        // If requester is viewing, fetch received applications
        if (currentUser && res.data.data.requesterId?._id === userProfile?._id) {
          const appRes = await api.get(`/applications/task/${id}`);
          if (appRes.data.success) {
            setApplications(appRes.data.data);
          }
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [id, currentUser, userProfile]);

  const isOwner = userProfile && task && task.requesterId?._id === userProfile._id;
  const isAssignedProvider = userProfile && task && task.assignedProviderId?._id === userProfile._id;

  // Submit draft for moderation
  const handleSubmitForApproval = async () => {
    try {
      setActionLoading(true);
      const res = await api.post(`/tasks/${id}/submit`);
      if (res.data.success) {
        setSuccessMessage('Task submitted for moderation review!');
        fetchTaskDetails();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit task');
    } finally {
      setActionLoading(false);
    }
  };

  // Provider requests completion
  const handleRequestCompletion = async () => {
    try {
      setActionLoading(true);
      const res = await api.post(`/tasks/${id}/request-completion`);
      if (res.data.success) {
        setSuccessMessage('Completion requested from requester!');
        fetchTaskDetails();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request completion');
    } finally {
      setActionLoading(false);
    }
  };

  // Requester confirms completion
  const handleConfirmCompletion = async () => {
    try {
      setActionLoading(true);
      const res = await api.post(`/tasks/${id}/confirm-completion`);
      if (res.data.success) {
        setSuccessMessage('Task confirmed completed! You can now review your provider.');
        fetchTaskDetails();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete task');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete draft
  const handleDeleteTask = async () => {
    if (!window.confirm('Are you sure you want to delete this task draft?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task');
    }
  };

  if (loading) return <LoadingSpinner message="Loading task details..." />;
  if (error || !task) return <div className="max-w-4xl mx-auto py-12 px-4"><Alert type="error" message={error || 'Task not found'} /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />}
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Task Moderation Rejection Warning */}
      {task.status === 'rejected' && task.moderationNotes && (
        <Alert
          type="warning"
          title="Moderation Feedback"
          message={`Your task was not approved: "${task.moderationNotes}". Please edit the details and resubmit.`}
        />
      )}

      {/* Main Grid: Details Left, Meta & Actions Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Content & Lifecycle) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Badge variant={task.status} />
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {task.category}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                Posted {new Date(task.createdAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              {task.title}
            </h1>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Project Description
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {task.description}
              </p>
            </div>

            {/* Required Skills */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Required Skills & Tech
              </h3>
              <div className="flex flex-wrap gap-2">
                {task.requiredSkills?.map((skill, i) => (
                  <span
                    key={i}
                    className="text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-lg"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Task Completion Banner */}
            {task.status === 'in_progress' && (
              <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  Task is In Progress (Escrow Funded)
                </div>

                {isAssignedProvider && !task.completionRequestedByProvider && (
                  <button
                    disabled={actionLoading}
                    onClick={handleRequestCompletion}
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition"
                  >
                    Request Task Completion Confirmation
                  </button>
                )}

                {isAssignedProvider && task.completionRequestedByProvider && (
                  <p className="text-xs text-indigo-700 font-medium">
                    You have requested completion. Awaiting requester verification.
                  </p>
                )}

                {isOwner && task.completionRequestedByProvider && (
                  <div className="space-y-2">
                    <p className="text-xs text-indigo-700">
                      The provider has requested completion. Please review the deliverables and confirm.
                    </p>
                    <button
                      disabled={actionLoading}
                      onClick={handleConfirmCompletion}
                      className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition"
                    >
                      Confirm Completion & Release Escrow
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Completed Task Review Prompt */}
            {task.status === 'completed' && (isOwner || isAssignedProvider) && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-emerald-900 text-sm font-bold">
                  <Award className="w-5 h-5 text-emerald-600" />
                  Task Successfully Completed!
                </div>
                <button
                  onClick={() => setReviewModalOpen(true)}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <Star className="w-3.5 h-3.5 fill-white" />
                  Leave Review
                </button>
              </div>
            )}
          </div>

          {/* Proposals Section (Only visible to Requester when approved) */}
          {isOwner && ['approved', 'provider_selected', 'payment_pending', 'in_progress', 'completed'].includes(task.status) && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Received Proposals ({applications.length})
              </h2>
              <ApplicantList
                applications={applications}
                taskId={task._id}
                taskStatus={task.status}
                onUpdate={fetchTaskDetails}
              />
            </div>
          )}
        </div>

        {/* Right Column: Budget, Meta & Action Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Budget Range</span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                ₹{task.budgetMin > 0 ? `${task.budgetMin} - ` : ''}₹{task.budgetMax} <span className="text-xs text-slate-400 font-semibold">INR</span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Work Mode</span>
                <span className="font-bold text-slate-800 capitalize">{task.workMode}</span>
              </div>
              {task.location && (
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Location</span>
                  <span className="font-bold text-slate-800">{task.location}</span>
                </div>
              )}
              {task.deadline && (
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Deadline</span>
                  <span className="font-bold text-slate-800">{new Date(task.deadline).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Action Buttons depending on role and state */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              {/* Draft / Rejected Owner Controls */}
              {isOwner && ['draft', 'rejected'].includes(task.status) && (
                <>
                  <button
                    disabled={actionLoading}
                    onClick={handleSubmitForApproval}
                    className="w-full py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Submit for Approval
                  </button>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Link
                      to={`/tasks/${task._id}/edit`}
                      className="py-2 text-center text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center justify-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </Link>
                    <button
                      onClick={handleDeleteTask}
                      className="py-2 text-center text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </>
              )}

              {/* Provider Apply Button */}
              {!isOwner && task.status === 'approved' && (
                <button
                  onClick={() => {
                    if (!currentUser) return navigate('/login');
                    setApplyModalOpen(true);
                  }}
                  className="w-full py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit a Proposal
                </button>
              )}
            </div>
          </div>

          {/* Requester Profile Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Posted By</h4>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 font-black text-lg flex items-center justify-center">
                {task.requesterId?.displayName?.charAt(0) || 'U'}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{task.requesterId?.displayName}</h4>
                <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {task.requesterId?.ratingAverage || 5.0} ({task.requesterId?.ratingCount || 0} reviews)
                </div>
              </div>
            </div>
            {task.requesterId?.bio && (
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {task.requesterId.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ApplicationModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        taskId={task._id}
        taskBudgetMax={task.budgetMax}
        onSubmitted={() => {
          setSuccessMessage('Your proposal was submitted successfully!');
          fetchTaskDetails();
        }}
      />

      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        taskId={task._id}
        taskTitle={task.title}
        onReviewed={() => {
          setSuccessMessage('Thank you! Your review has been recorded.');
          fetchTaskDetails();
        }}
      />
    </div>
  );
};

export default TaskDetail;

