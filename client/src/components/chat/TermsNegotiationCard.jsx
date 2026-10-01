import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  Edit3,
  CreditCard,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import Badge from '../common/Badge';
import Modal from '../common/Modal';
import Alert from '../common/Alert';
import api from '../../services/api';

const TermsNegotiationCard = ({
  terms,
  task,
  isRequester,
  isProvider,
  onTermsUpdated,
  onPaymentInitiated,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [price, setPrice] = useState(terms?.price || 1000);
  const [durationDays, setDurationDays] = useState(terms?.durationDays || 7);
  const [notes, setNotes] = useState(terms?.notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePropose = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const res = await api.post(`/terms/conversation/${terms.conversationId}/propose`, {
        price: Number(price),
        durationDays: Number(durationDays),
        notes,
      });

      if (res.data.success) {
        setModalOpen(false);
        onTermsUpdated(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to propose terms');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      setLoading(true);
      const res = await api.post(`/terms/${terms._id}/accept`);
      if (res.data.success) {
        onTermsUpdated(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept terms');
    } finally {
      setLoading(false);
    }
  };

  if (!terms) {
    return (
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500">
        No active terms draft yet.
      </div>
    );
  }

  const isMutuallyAccepted = terms.status === 'mutually_accepted';
  const hasCurrentUserAccepted = isRequester ? terms.requesterAccepted : terms.providerAccepted;

  return (
    <div className="bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 border border-indigo-100 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-indigo-100/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Contract Terms & Milestones</h4>
            <span className="text-[10px] text-slate-400 font-medium">Version {terms.version}</span>
          </div>
        </div>
        <Badge variant={terms.status} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400">Total Price</span>
          <div className="text-lg font-black text-slate-900">₹{terms.price}</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400">Duration</span>
          <div className="text-lg font-black text-slate-900">{terms.durationDays} Days</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-slate-400">Currency</span>
          <div className="text-lg font-black text-indigo-600">INR (₹)</div>
        </div>
      </div>

      {terms.notes && (
        <div className="p-3 bg-white/80 rounded-xl border border-slate-100 text-xs text-slate-600">
          <span className="font-semibold text-slate-800">Notes:</span> {terms.notes}
        </div>
      )}

      {/* Dual Agreement Status Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div
          className={`flex items-center gap-2 p-2.5 rounded-xl border ${
            terms.requesterAccepted
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-slate-50 text-slate-500 border-slate-200'
          }`}
        >
          <CheckCircle2 className={`w-4 h-4 ${terms.requesterAccepted ? 'text-emerald-500' : 'text-slate-400'}`} />
          <span>Requester: {terms.requesterAccepted ? 'Agreed' : 'Pending'}</span>
        </div>

        <div
          className={`flex items-center gap-2 p-2.5 rounded-xl border ${
            terms.providerAccepted
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-slate-50 text-slate-500 border-slate-200'
          }`}
        >
          <CheckCircle2 className={`w-4 h-4 ${terms.providerAccepted ? 'text-emerald-500' : 'text-slate-400'}`} />
          <span>Provider: {terms.providerAccepted ? 'Agreed' : 'Pending'}</span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
        {!isMutuallyAccepted && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition"
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
            Propose Counter-Terms
          </button>
        )}

        {!isMutuallyAccepted && !hasCurrentUserAccepted && (
          <button
            onClick={handleAccept}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm rounded-lg transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {loading ? 'Accepting...' : 'Accept These Terms'}
          </button>
        )}

        {/* Razorpay Escrow Pay Button for Requester */}
        {isMutuallyAccepted && isRequester && task?.status === 'payment_pending' && (
          <button
            onClick={onPaymentInitiated}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-500/20 rounded-xl transition"
          >
            <CreditCard className="w-4 h-4" />
            Pay ₹{terms.price} to Escrow via Razorpay
          </button>
        )}

        {isMutuallyAccepted && task?.status === 'in_progress' && (
          <div className="w-full flex items-center justify-center gap-2 p-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Payment of ₹{terms.price} Secured in Escrow. Work is in progress!
          </div>
        )}
      </div>

      {/* Propose Terms Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Propose Updated Terms">
        <form onSubmit={handlePropose} className="space-y-4">
          {error && <Alert type="error" message={error} />}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Agreed Price (₹ INR)</label>
              <input
                type="number"
                required
                min={1}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Duration (Days)</label>
              <input
                type="number"
                required
                min={1}
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Scope & Deliverable Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Outline deliverables, deadlines, revision limits..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
            >
              {loading ? 'Submitting...' : 'Submit Proposed Terms'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TermsNegotiationCard;

