import React, { useState } from 'react';
import { Calendar, Clock, CreditCard, CheckCircle2 } from 'lucide-react';
import Modal from '../common/Modal';
import Alert from '../common/Alert';
import api from '../../services/api';

const EnrollmentModal = ({ isOpen, onClose, classDoc, onEnrolled }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleEnrollFree = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.post(`/classes/${classDoc._id}/enroll-free`);
      if (res.data.success) {
        onEnrolled();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enroll');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollPaid = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.post(`/classes/${classDoc._id}/pay`, { classId: classDoc._id });
      if (!res.data.success) throw new Error(res.data.message);

      const { orderId, amount, currency, keyId } = res.data.data;

      const confirmEnrollment = async (rzOrderId) => {
        await api.post(`/classes/${classDoc._id}/enroll-paid`, { classId: classDoc._id });
        onEnrolled();
        onClose();
      };

      // Launch Razorpay Checkout
      if (window.Razorpay) {
        const options = {
          key: keyId,
          amount,
          currency,
          name: 'Skill Exchange Platform',
          description: `Workshop: ${classDoc.title}`,
          order_id: orderId,
          handler: async (response) => {
            try {
              await confirmEnrollment(response.razorpay_order_id || orderId);
            } catch (vErr) {
              setError(vErr.response?.data?.message || 'Enrollment confirmation failed');
            }
          },
          theme: { color: '#4f46e5' },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Fallback mock for dev
        await confirmEnrollment(orderId);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment checkout error');
    } finally {
      setLoading(false);
    }
  };

  if (!classDoc) return null;

  const isFree = classDoc.price === 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Class Enrollment">
      <div className="space-y-4">
        {error && <Alert type="error" message={error} />}

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
          <h4 className="font-bold text-slate-900 text-base">{classDoc.title}</h4>
          <p className="text-xs text-slate-500 line-clamp-2">{classDoc.description}</p>
          <div className="flex items-center gap-4 text-xs text-slate-600 pt-2 border-t border-slate-200">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              {new Date(classDoc.scheduleDate).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              {classDoc.durationMinutes} min
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
          <span className="font-semibold text-slate-700 text-sm">Enrollment Fee</span>
          <span className="text-xl font-extrabold text-indigo-600">
            {isFree ? 'FREE' : `₹${classDoc.price} INR`}
          </span>
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={isFree ? handleEnrollFree : handleEnrollPaid}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm flex items-center gap-1.5"
          >
            {isFree ? <CheckCircle2 className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
            {loading ? 'Processing...' : isFree ? 'Enroll for Free' : `Pay ₹${classDoc.price} & Enroll`}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EnrollmentModal;

