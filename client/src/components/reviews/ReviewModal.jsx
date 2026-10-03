import React, { useState } from 'react';
import Modal from '../common/Modal';
import StarRating from './StarRating';
import Alert from '../common/Alert';
import api from '../../services/api';

const ReviewModal = ({ isOpen, onClose, taskId, taskTitle, onReviewed }) => {
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
    <Modal isOpen={isOpen} onClose={onClose} title="Leave a Verified Review">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} />}

        <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
          Reviewing completed task: <span className="font-bold text-slate-900 dark:text-white">{taskTitle}</span>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Your Rating</label>
          <div className="flex items-center gap-3">
            <StarRating rating={rating} setRating={setRating} size="lg" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{rating} out of 5</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Feedback & Experience</label>
          <textarea
            required
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Describe communication, quality of work, speed, and overall satisfaction..."
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            Cancel
          </button>
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

