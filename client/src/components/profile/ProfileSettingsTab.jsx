import React, { useState, useEffect } from 'react';
import { Linkedin, Github, Globe, Twitter, Save, Loader, Check, Plus, Trash2, Link as LinkIcon } from 'lucide-react';
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

  const [customLinks, setCustomLinks] = useState(
    userProfile?.customLinks && Array.isArray(userProfile.customLinks)
      ? userProfile.customLinks
      : []
  );

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userProfile) {
      setForm({
        displayName: userProfile.displayName || '',
        bio: userProfile.bio || '',
        location: userProfile.location || '',
        hourlyRate: userProfile.hourlyRate || 0,
        skills: (userProfile.skills || []).join(', '),
        portfolioUrl: userProfile.portfolioUrl || '',
        linkedinUrl: userProfile.linkedinUrl || '',
        githubUrl: userProfile.githubUrl || '',
        twitterUrl: userProfile.twitterUrl || '',
      });
      setCustomLinks(
        userProfile.customLinks && Array.isArray(userProfile.customLinks)
          ? userProfile.customLinks
          : []
      );
    }
  }, [userProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCustomLinkChange = (index, field, value) => {
    setCustomLinks((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addCustomLink = () => {
    if (customLinks.length >= 3) return;
    setCustomLinks((prev) => [...prev, { title: '', url: '' }]);
  };

  const removeCustomLink = (index) => {
    setCustomLinks((prev) => prev.filter((_, i) => i !== index));
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
        customLinks: customLinks
          .filter((l) => l.title?.trim() || l.url?.trim())
          .slice(0, 3)
          .map((l) => ({
            title: l.title?.trim() || '',
            url: l.url?.trim() || '',
          })),
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

  const inputClass =
    'w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50 focus:bg-white transition';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Basic Info */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
          Basic Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Display Name</label>
            <input
              type="text"
              name="displayName"
              value={form.displayName}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="City, Country"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={3}
            placeholder="Tell others about your expertise and experience..."
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Hourly Rate (₹)</label>
            <input
              type="number"
              name="hourlyRate"
              min={0}
              value={form.hourlyRate}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Skills (comma-separated)</label>
            <input
              type="text"
              name="skills"
              value={form.skills}
              onChange={handleChange}
              placeholder="React, Node.js, Figma..."
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Social & Portfolio Links */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Portfolio & Social Links</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Showcase your work and accounts so clients can evaluate your profile.
          </p>
        </div>

        {/* Standard Links */}
        <div className="space-y-3.5">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-indigo-600 flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">Portfolio Website</label>
              <input
                type="url"
                name="portfolioUrl"
                value={form.portfolioUrl}
                onChange={handleChange}
                placeholder="https://yourportfolio.com"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Linkedin className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn</label>
              <input
                type="url"
                name="linkedinUrl"
                value={form.linkedinUrl}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/yourname"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Github className="w-5 h-5 text-slate-800 flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">GitHub</label>
              <input
                type="url"
                name="githubUrl"
                value={form.githubUrl}
                onChange={handleChange}
                placeholder="https://github.com/yourusername"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Twitter className="w-5 h-5 text-sky-500 flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">Twitter / X</label>
              <input
                type="url"
                name="twitterUrl"
                value={form.twitterUrl}
                onChange={handleChange}
                placeholder="https://twitter.com/yourhandle"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Extra Custom Links (Max 3) */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Extra Custom Links ({customLinks.length}/3)
              </h4>
              <p className="text-[11px] text-slate-400">
                Add up to 3 custom links (e.g. Behance, Dribbble, Medium, Case Studies).
              </p>
            </div>

            <button
              type="button"
              disabled={customLinks.length >= 3}
              onClick={addCustomLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-40 disabled:pointer-events-none rounded-xl transition shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Link</span>
            </button>
          </div>

          {customLinks.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-dashed border-slate-200 text-center">
              <p className="text-xs text-slate-400">
                No custom links added yet. Click <strong className="text-indigo-600">+ Add Link</strong> to showcase extra work.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {customLinks.map((link, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-2.5 group"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 hidden sm:flex">
                    <LinkIcon className="w-3.5 h-3.5" />
                  </div>

                  <div className="w-full sm:w-1/3">
                    <input
                      type="text"
                      placeholder="Title (e.g. Behance)"
                      value={link.title}
                      onChange={(e) => handleCustomLinkChange(idx, 'title', e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="w-full sm:flex-1">
                    <input
                      type="url"
                      placeholder="https://behance.net/..."
                      value={link.url}
                      onChange={(e) => handleCustomLinkChange(idx, 'url', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeCustomLink(idx)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition self-end sm:self-center shrink-0"
                    title="Remove Link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className={`inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl shadow-md transition ${
            success
              ? 'bg-emerald-600 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20 text-white'
          }`}
        >
          {loading ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : success ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {loading ? 'Saving...' : success ? 'Saved Successfully!' : 'Save Profile Changes'}
        </button>
      </div>
    </form>
  );
};

export default ProfileSettingsTab;
