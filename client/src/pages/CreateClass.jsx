import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Save, Send } from 'lucide-react';
import api from '../services/api';
import Alert from '../components/common/Alert';

const CATEGORIES = [
  'Programming & Tech',
  'Design & Creative',
  'Marketing & Business',
  'Music & Audio',
  'Languages & Academics',
  'Health & Fitness',
  'Other',
];

const CreateClass = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Programming & Tech',
    price: 0,
    maxCapacity: 25,
    scheduleDate: '',
    durationMinutes: 60,
    meetingUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (submitForModeration = false) => {
    if (!formData.title || !formData.description || !formData.scheduleDate) {
      return setError('Please fill in title, description, and schedule date.');
    }

    try {
      setLoading(true);
      setError(null);

      const res = await api.post('/classes/draft', {
        ...formData,
        price: Number(formData.price),
        maxCapacity: Number(formData.maxCapacity),
        durationMinutes: Number(formData.durationMinutes),
      });

      if (res.data.success) {
        const classId = res.data.data._id;
        if (submitForModeration) {
          await api.post(`/classes/${classId}/submit`);
        }
        navigate(`/classes/${classId}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-950 tracking-tight flex items-center gap-2.5">
          <BookOpen className="w-8 h-8 text-indigo-600" />
          Host a Workshop or Class
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Share your expertise with learners. Offer free community classes or paid live masterclasses.
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">Workshop Title *</label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Master React 19 & Full-Stack Node Architecture"
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Price (₹ INR, 0 for Free)</label>
            <input
              type="number"
              name="price"
              min={0}
              value={formData.price}
              onChange={handleChange}
              placeholder="0"
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">Curriculum & Agenda *</label>
          <textarea
            name="description"
            required
            rows={5}
            value={formData.description}
            onChange={handleChange}
            placeholder="Detail what attendees will learn, prerequisites, and takeaway resources..."
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Schedule Date & Time *</label>
            <input
              type="datetime-local"
              name="scheduleDate"
              required
              value={formData.scheduleDate}
              onChange={handleChange}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Duration (Minutes)</label>
            <input
              type="number"
              name="durationMinutes"
              min={15}
              value={formData.durationMinutes}
              onChange={handleChange}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Max Capacity (Seats)</label>
            <input
              type="number"
              name="maxCapacity"
              min={1}
              value={formData.maxCapacity}
              onChange={handleChange}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">Meeting Link (Zoom/Google Meet)</label>
          <input
            type="url"
            name="meetingUrl"
            value={formData.meetingUrl}
            onChange={handleChange}
            placeholder="https://meet.google.com/xyz-abc-def"
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <p className="text-[11px] text-slate-400 mt-1">Visible only to confirmed enrolled participants.</p>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit(false)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            <Save className="w-4 h-4" />
            Save as Draft
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit(true)}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 rounded-xl transition"
          >
            <Send className="w-4 h-4" />
            Save & Submit for Approval
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateClass;

