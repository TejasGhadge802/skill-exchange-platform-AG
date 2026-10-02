import React, { useState } from 'react';
import Modal from '../common/Modal';
import StarRating from './StarRating';
import Alert from '../common/Alert';
import api from '../../services/api';
import { Star } from 'lucide-react';

const ReviewModal = ({ isOpen, onClose, taskId, taskTitle, onReviewed, mandatory = false }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const res = await api.post('/reviews', {
        taskId,
        rating,
        comment,
      });

      if (res.data.success) {
        onReviewed();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Leave a Verified Review" mandatory={mandatory}>
      {mandatory && (
        <div className="mb-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3.5">
          <Star className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 font-medium">
            Both you and your collaborator must leave a verified review to complete this task. This cannot be skipped.
          </p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} />}

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-600">
          Reviewing completed task: <span className="font-bold text-slate-900">{taskTitle}</span>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-2">Your Rating</label>
          <div className="flex items-center gap-3">
            <StarRating rating={rating} setRating={setRating} size="lg" />
            <span className="text-sm font-bold text-slate-700">{rating} out of 5</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">Feedback & Experience <span className="text-red-500">*</span></label>
          <textarea
            required
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Describe communication, quality of work, speed, and overall satisfaction..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
          {!mandatory && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ReviewModal;

