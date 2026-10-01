import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, ArrowRight, Save, Send } from 'lucide-react';
import api from '../services/api';
import Alert from '../components/common/Alert';

const CATEGORIES = [
  'Web Development',
  'Mobile Apps',
  'UI/UX Design',
  'Writing & Content',
  'Data Science & AI',
  'Video & Animation',
  'Marketing & SEO',
  'Teaching & Tutoring',
  'Other',
];

const CreateTask = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    requiredSkills: '',
    workMode: 'remote',
    location: '',
    budgetMin: '',
    budgetMax: '',
    deadline: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (submitForModeration = false) => {
    if (!formData.title || !formData.description || !formData.budgetMax) {
      return setError('Please fill in title, description, and maximum budget.');
    }

    try {
      setLoading(true);
      setError(null);

      const res = await api.post('/tasks/draft', {
        ...formData,
        budgetMin: formData.budgetMin ? Number(formData.budgetMin) : 0,
        budgetMax: Number(formData.budgetMax),
      });

      if (res.data.success) {
        const taskId = res.data.data._id;
        if (submitForModeration) {
          await api.post(`/tasks/${taskId}/submit`);
        }
        navigate(`/tasks/${taskId}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-950 tracking-tight flex items-center gap-2.5">
          <Briefcase className="w-8 h-8 text-indigo-600" />
          Post a New Task
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Create a clear task scope. Save as draft or submit immediately for moderation approval.
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">Task Title *</label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Build an authentication flow with Firebase and Node.js"
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
            <label className="block text-xs font-bold text-slate-800 mb-1">Work Mode</label>
            <select
              name="workMode"
              value={formData.workMode}
              onChange={handleChange}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="remote">Remote</option>
              <option value="onsite">On-site</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">Detailed Description *</label>
          <textarea
            name="description"
            required
            rows={6}
            value={formData.description}
            onChange={handleChange}
            placeholder="Specify all deliverables, requirements, acceptance criteria, and expected turnaround..."
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Required Skills (comma-separated)
          </label>
          <input
            type="text"
            name="requiredSkills"
            value={formData.requiredSkills}
            onChange={handleChange}
            placeholder="React, TypeScript, Tailwind, MongoDB"
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Min Budget (₹ INR)</label>
            <input
              type="number"
              name="budgetMin"
              value={formData.budgetMin}
              onChange={handleChange}
              placeholder="e.g. 5000"
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Max Budget (₹ INR) *</label>
            <input
              type="number"
              name="budgetMax"
              required
              value={formData.budgetMax}
              onChange={handleChange}
              placeholder="e.g. 15000"
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Location (if onsite/hybrid)</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Mumbai / Bangalore"
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Deadline Date</label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
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

export default CreateTask;

