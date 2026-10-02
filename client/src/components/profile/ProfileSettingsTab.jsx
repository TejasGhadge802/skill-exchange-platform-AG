import React, { useState } from 'react';
import { Linkedin, Github, Globe, Twitter, Save, Loader, Check } from 'lucide-react';
import api from '../../services/api';
import Alert from '../common/Alert';

const ProfileSettingsTab = ({ userProfile, onProfileUpdated }) => {
  const [form, setForm] = useState({
    displayName: userProfile?.displayName || '',
    bio: userProfile?.bio || '',
    location: userProfile?.location || '',
    hourlyRate: userProfile?.hourlyRate || 0,
    skills: (userProfile?.skills || []).join(', '),
    portfolioUrl: userProfile?.portfolioUrl || '',
    linkedinUrl: userProfile?.linkedinUrl || '',
    githubUrl: userProfile?.githubUrl || '',
    twitterUrl: userProfile?.twitterUrl || '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const payload = {
        ...form,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        hourlyRate: Number(form.hourlyRate),
      };
      const res = await api.put('/users/profile', payload);
      if (res.data.success) {
        setSuccess(true);
        if (onProfileUpdated) onProfileUpdated();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Basic Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">Basic Information</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Display Name</label>
            <input type="text" name="displayName" value={form.displayName} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
            <input type="text" name="location" value={form.location} onChange={handleChange} placeholder="City, Country" className={inputClass} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Bio</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} rows={3}
            placeholder="Tell others about your expertise and experience..."
            className={inputClass} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Hourly Rate (₹)</label>
            <input type="number" name="hourlyRate" min={0} value={form.hourlyRate} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Skills (comma-separated)</label>
            <input type="text" name="skills" value={form.skills} onChange={handleChange}
              placeholder="React, Node.js, Figma..." className={inputClass} />
          </div>
        </div>
      </div>

      {/* Social & Portfolio Links */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">Portfolio & Social Links</h3>
        <p className="text-xs text-slate-500">Showcase your work. These links will be visible on your public profile.</p>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">Portfolio Website</label>
              <input type="url" name="portfolioUrl" value={form.portfolioUrl} onChange={handleChange}
                placeholder="https://yourportfolio.com" className={inputClass} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Linkedin className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn</label>
              <input type="url" name="linkedinUrl" value={form.linkedinUrl} onChange={handleChange}
                placeholder="https://linkedin.com/in/yourname" className={inputClass} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Github className="w-4 h-4 text-slate-700 flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">GitHub</label>
              <input type="url" name="githubUrl" value={form.githubUrl} onChange={handleChange}
                placeholder="https://github.com/yourusername" className={inputClass} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Twitter className="w-4 h-4 text-sky-500 flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">Twitter / X</label>
              <input type="url" name="twitterUrl" value={form.twitterUrl} onChange={handleChange}
                placeholder="https://twitter.com/yourhandle" className={inputClass} />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button type="submit" disabled={loading}
          className={`inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl shadow-sm transition ${
            success
              ? 'bg-emerald-600 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}>
          {loading ? <Loader className="w-4 h-4 animate-spin" /> : success ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {loading ? 'Saving...' : success ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default ProfileSettingsTab;
