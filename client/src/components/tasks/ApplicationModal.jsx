import React, { useState } from 'react';
import Modal from '../common/Modal';
import Alert from '../common/Alert';
import api from '../../services/api';

const ApplicationModal = ({ isOpen, onClose, taskId, taskBudgetMax, onSubmitted }) => {
  const [pitch, setPitch] = useState('');
  const [proposedPrice, setProposedPrice] = useState(taskBudgetMax || '');
  const [proposedDurationDays, setProposedDurationDays] = useState(7);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      const res = await api.post(`/applications/task/${taskId}`, {
        pitch,
        proposedPrice: Number(proposedPrice),
        proposedDurationDays: Number(proposedDurationDays),
      });

      if (res.data.success) {
        onSubmitted(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit proposal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Your Proposal">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} />}

        <div>
          <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Your Pitch & Approach</label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Explain why you are the best fit, relevant experience, and how you will deliver the requirements.
          </p>
          <textarea
            required
            rows={4}
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            placeholder="I have 4+ years of experience with React, Node.js..."
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Your Bid Price (₹ INR)</label>
            <input
              type="number"
              required
              min={1}
              value={proposedPrice}
              onChange={(e) => setProposedPrice(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Delivery Time (Days)</label>
            <input
              type="number"
              required
              min={1}
              value={proposedDurationDays}
              onChange={(e) => setProposedDurationDays(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm transition"
          >
            {submitting ? 'Submitting...' : 'Send Proposal'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ApplicationModal;

