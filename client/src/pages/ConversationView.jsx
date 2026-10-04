import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageSquare, ArrowLeft, ShieldCheck, CheckCircle2, User, Bell, ExternalLink } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import TermsNegotiationCard from '../components/chat/TermsNegotiationCard';
import Badge from '../components/common/Badge';
import Alert from '../components/common/Alert';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ReviewModal from '../components/reviews/ReviewModal';

const ConversationView = () => {
  const { id } = useParams();
  const { currentUser, userProfile } = useAuth();
  const { socket } = useSocket();

  const [conversation, setConversation] = useState(null);
  const [terms, setTerms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [taskActionLoading, setTaskActionLoading] = useState(false);
  const [taskActionMsg, setTaskActionMsg] = useState(null);

  const fetchConversationData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [convRes, termsRes] = await Promise.all([
        api.get(`/conversations/${id}`),
        api.get(`/terms/conversation/${id}`),
      ]);

      if (convRes.data.success) {
        setConversation(convRes.data.data);
      }
      if (termsRes.data.success) {
        setTerms(termsRes.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversationData();
  }, [id]);

  const isRequester = userProfile && conversation && conversation.requesterId?._id === userProfile._id;
  const isProvider = userProfile && conversation && conversation.providerId?._id === userProfile._id;
  const otherParticipant = isRequester ? conversation?.providerId : conversation?.requesterId;

  // Listen for review_requested notification via socket (for provider)
  useEffect(() => {
    if (!socket) return;
    const handler = (notification) => {
      if (notification.type === 'review_requested') {
        setReviewModalOpen(true);
      }
    };
    socket.on('notification', handler);
    return () => socket.off('notification', handler);
  }, [socket]);

  // Provider: Request task completion
  const handleRequestCompletion = async () => {
    try {
      setTaskActionLoading(true);
      const res = await api.post(`/tasks/${conversation.taskId._id}/request-completion`);
      if (res.data.success) {
        setTaskActionMsg('Completion request sent to requester!');
        fetchConversationData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request completion');
    } finally {
      setTaskActionLoading(false);
    }
  };

  // Requester: Confirm task completion
  const handleConfirmCompletion = async () => {
    try {
      setTaskActionLoading(true);
      const res = await api.post(`/tasks/${conversation.taskId._id}/confirm-completion`);
      if (res.data.success) {
        setTaskActionMsg('Task marked as completed!');
        await fetchConversationData();
        setReviewModalOpen(true); // requester sees review modal
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm completion');
    } finally {
      setTaskActionLoading(false);
    }
  };

  // Handle Razorpay Escrow Checkout
  const handleInitiatePayment = async () => {
    try {
      setError(null);
      const res = await api.post('/payments/order/task', {
        taskId: conversation.taskId._id,
        termsId: terms._id,
      });

      if (!res.data.success) throw new Error(res.data.message);

      const { orderId, amount, currency, keyId } = res.data.data;

      if (window.Razorpay) {
        const options = {
          key: keyId,
          amount,
          currency,
          name: 'Skill Exchange Escrow',
          description: `Escrow for Task: ${conversation.taskId.title}`,
          order_id: orderId,
          prefill: {
            name: userProfile?.displayName || '',
            email: userProfile?.email || '',
          },
          handler: async (response) => {
            try {
              const verifyRes = await api.post('/payments/verify', {
                razorpayOrderId: response.razorpay_order_id || orderId,
                razorpayPaymentId: response.razorpay_payment_id || `pay_mock_${Date.now()}`,
                razorpaySignature: response.razorpay_signature || 'mock_sig',
              });
              if (verifyRes.data.success) {
                setPaymentSuccess(true);
                await fetchConversationData();
                // Prompt mandatory review modal
                setReviewModalOpen(true);
              }
            } catch (vErr) {
              setError(vErr.response?.data?.message || 'Payment verification failed');
            }
          },
          theme: { color: '#4f46e5' },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Mock verification fallback in development mode
        const verifyRes = await api.post('/payments/verify', {
          razorpayOrderId: orderId,
          razorpayPaymentId: `pay_mock_${Date.now()}`,
          razorpaySignature: 'mock_sig',
        });
        if (verifyRes.data.success) {
          setPaymentSuccess(true);
          await fetchConversationData();
          setReviewModalOpen(true);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment failed');
    }
  };

  const openHalfScreenChat = () => {
    window.dispatchEvent(
      new CustomEvent('open_chat_widget', {
        detail: {
          conversationId: conversation._id,
          conversation,
        },
      })
    );
  };

  if (loading) return <LoadingSpinner message="Opening workspace & contract terms..." />;
  if (error || !conversation) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <Alert type="error" message={error || 'Conversation not found'} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner / Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            to={`/tasks/${conversation.taskId?._id}`}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            title="Back to Task"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 dark:text-white line-clamp-1">
                {conversation.taskId?.title}
              </h1>
              <Badge variant={conversation.taskId?.status} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Workspace with <strong className="text-slate-800 dark:text-slate-200">{otherParticipant?.displayName}</strong> ({isRequester ? 'Provider' : 'Requester'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Button to trigger the Half-Screen Rectangular Chat Widget */}
          <button
            onClick={openHalfScreenChat}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition"
          >
            <MessageSquare className="w-4 h-4" />
            Open Chat (Half Screen)
          </button>

          <Link
            to={`/tasks/${conversation.taskId?._id}`}
            className="text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3.5 py-2 rounded-xl transition"
          >
            View Task Details
          </Link>
        </div>
      </div>

      {paymentSuccess && (
        <Alert
          type="success"
          title="Escrow Payment Verified!"
          message="Your payment is safely held in escrow. The task is now officially In Progress!"
          onClose={() => setPaymentSuccess(false)}
        />
      )}
      {taskActionMsg && (
        <Alert type="success" message={taskActionMsg} onClose={() => setTaskActionMsg(null)} />
      )}
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Task Status Action Card */}
      {conversation?.taskId?.status === 'in_progress' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-indigo-100 dark:border-indigo-900/50 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Task is Active & In Progress</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isProvider
                  ? 'Deliver your work and mark the task as completed when finished.'
                  : 'Collaborate with your provider and confirm completion once satisfied.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Provider: Mark as complete */}
            {isProvider && !conversation.taskId.completionRequestedByProvider && (
              <button
                onClick={handleRequestCompletion}
                disabled={taskActionLoading}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                {taskActionLoading ? 'Submitting...' : 'Mark Task as Complete'}
              </button>
            )}

            {isProvider && conversation.taskId.completionRequestedByProvider && (
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3.5 py-2 rounded-xl flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Completion Requested (Waiting for Requester)
              </span>
            )}

            {/* Requester: Confirm completion */}
            {isRequester && conversation.taskId.completionRequestedByProvider && !conversation.taskId.completionConfirmedByRequester && (
              <button
                onClick={handleConfirmCompletion}
                disabled={taskActionLoading}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition shadow-md shadow-indigo-600/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                {taskActionLoading ? 'Confirming...' : 'Confirm Task Completed'}
              </button>
            )}

            <button
              onClick={openHalfScreenChat}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
            >
              <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Chat
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace: Full-width contract & collaborator details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Contract & Negotiation Panel (2 cols) */}
        <div className="lg:col-span-2">
          <TermsNegotiationCard
            terms={terms}
            task={conversation.taskId}
            isRequester={isRequester}
            isProvider={isProvider}
            onTermsUpdated={(updated) => setTerms(updated)}
            onPaymentInitiated={handleInitiatePayment}
          />
        </div>

        {/* Collaborator Details & Quick Chat Launcher (1 col) */}
        <div className="space-y-6">
          {/* Quick Chat Launcher Card */}
          <div className="workspace-quick-chat-card bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-lg shadow-indigo-600/10 space-y-4">
            <div className="quick-chat-icon-box w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="quick-chat-title font-black text-base text-white">Direct Real-Time Chat</h3>
              <p className="quick-chat-desc text-xs text-indigo-100 mt-1 leading-relaxed">
                Need to discuss deliverables, files, or milestones? Open the half-screen chat drawer anytime.
              </p>
            </div>
            <button
              onClick={openHalfScreenChat}
              className="quick-chat-btn w-full py-2.5 bg-white text-indigo-600 hover:bg-indigo-50 font-black text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Open Workspace Chat
            </button>
          </div>

          {/* Participant Info */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Collaborator Profile
            </h4>
            <Link
              to={`/users/${otherParticipant?._id}`}
              className="flex items-center gap-3.5 group hover:opacity-90 transition"
            >
              <div className="collaborator-avatar w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-700 font-bold flex items-center justify-center text-white text-lg shadow-xs group-hover:scale-105 transition-transform shrink-0">
                {otherParticipant?.displayName?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <h5 className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition flex items-center gap-1">
                  <span>{otherParticipant?.displayName}</span>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">View Profile ↗</span>
                </h5>
                <span className="text-xs text-slate-400 block truncate">{otherParticipant?.email}</span>
                <span className="inline-block text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md mt-1">
                  {isRequester ? 'Service Provider' : 'Task Requester'}
                </span>
              </div>
            </Link>

            {otherParticipant?.bio && (
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-3 border-t border-slate-100 dark:border-slate-800">
                {otherParticipant.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Mandatory Review Modal — triggers after payment OR task completion */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        taskId={conversation?.taskId?._id}
        taskTitle={conversation?.taskId?.title}
        mandatory
        onReviewed={() => {
          setReviewModalOpen(false);
          fetchConversationData();
        }}
      />
    </div>
  );
};

export default ConversationView;
