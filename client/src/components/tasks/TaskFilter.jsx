import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

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

const TaskFilter = ({ filters, setFilters, onReset }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-600" />
          Filter & Search
        </h4>
        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Keyword Search */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Search Keywords</label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            name="keyword"
            value={filters.keyword || ''}
            onChange={handleChange}
            placeholder="e.g. React, logo, translation..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
        <select
          name="category"
          value={filters.category || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Work Mode */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Work Mode</label>
        <select
          name="workMode"
          value={filters.workMode || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Any Work Mode</option>
          <option value="remote">Remote</option>
          <option value="onsite">On-site</option>
          <option value="hybrid">Hybrid</option>
        </select>
      </div>

      {/* Budget Filter */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Min Budget (₹)</label>
          <input
            type="number"
            name="minBudget"
            value={filters.minBudget || ''}
            onChange={handleChange}
            placeholder="0"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Max Budget (₹)</label>
          <input
            type="number"
            name="maxBudget"
            value={filters.maxBudget || ''}
            onChange={handleChange}
            placeholder="50000"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};

export default TaskFilter;

