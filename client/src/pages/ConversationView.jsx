import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageSquare, ArrowLeft, ShieldCheck, CheckCircle2, CreditCard, Bell } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import ChatBox from '../components/chat/ChatBox';
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
                fetchConversationData();
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
          fetchConversationData();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment failed');
    }
  };

  if (loading) return <LoadingSpinner message="Opening private workspace..." />;
  if (error || !conversation) return <div className="max-w-4xl mx-auto py-12 px-4"><Alert type="error" message={error || 'Conversation not found'} /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to={`/tasks/${conversation.taskId?._id}`}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition"
            title="Back to Task"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 line-clamp-1">
                {conversation.taskId?.title}
              </h1>
              <Badge variant={conversation.taskId?.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Workspace with <strong className="text-slate-800">{otherParticipant?.displayName}</strong> ({isRequester ? 'Provider' : 'Requester'})
            </p>
          </div>
        </div>

        <Link
          to={`/tasks/${conversation.taskId?._id}`}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg self-start sm:self-auto"
        >
          View Task Details
        </Link>
      </div>

      {paymentSuccess && (
        <Alert
          type="success"
          title="Payment Verified!"
          message="Your escrow payment has been deposited securely. The task is now officially In Progress!"
          onClose={() => setPaymentSuccess(false)}
        />
      )}
      {taskActionMsg && (
        <Alert type="success" message={taskActionMsg} onClose={() => setTaskActionMsg(null)} />
      )}
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Task Status Action Card */}
      {conversation?.taskId?.status === 'in_progress' && (
        <div className="bg-white rounded-2xl border border-indigo-100 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <span>Task is <strong className="text-indigo-600">In Progress</strong></span>
            {conversation.taskId.completionRequestedByProvider && !conversation.taskId.completionConfirmedByRequester && (
              <span className="ml-2 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Bell className="w-3 h-3" /> Provider marked complete — awaiting your confirmation
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isProvider && !conversation.taskId.completionRequestedByProvider && (
              <button onClick={handleRequestCompletion} disabled={taskActionLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition">
                <CheckCircle2 className="w-4 h-4" />
                {taskActionLoading ? 'Sending...' : 'Mark Task as Complete'}
              </button>
            )}
            {isProvider && conversation.taskId.completionRequestedByProvider && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                ✓ Completion Requested
              </span>
            )}
            {isRequester && conversation.taskId.completionRequestedByProvider && !conversation.taskId.completionConfirmedByRequester && (
              <button onClick={handleConfirmCompletion} disabled={taskActionLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition">
                <CheckCircle2 className="w-4 h-4" />
                {taskActionLoading ? 'Confirming...' : 'Confirm Task Completed'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grid: Left Chat Box, Right Terms & Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Chat System (7 cols) */}
        <div className="lg:col-span-7">
          <ChatBox
            conversationId={conversation._id}
            currentUserId={userProfile?._id}
          />
        </div>

        {/* Contract & Negotiation Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <TermsNegotiationCard
            terms={terms}
            task={conversation.taskId}
            isRequester={isRequester}
            isProvider={isProvider}
            onTermsUpdated={(updated) => setTerms(updated)}
            onPaymentInitiated={handleInitiatePayment}
          />

          {/* Participant Info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Collaborator Details</h4>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 font-bold flex items-center justify-center text-slate-700">
                {otherParticipant?.displayName?.charAt(0) || 'U'}
              </div>
              <div>
                <h5 className="font-bold text-slate-900 text-sm">{otherParticipant?.displayName}</h5>
                <span className="text-xs text-slate-400">{otherParticipant?.email}</span>
              </div>
            </div>
            {otherParticipant?.bio && (
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed pt-2 border-t border-slate-100">
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

