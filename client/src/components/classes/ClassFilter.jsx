import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

const CATEGORIES = [
  'Programming & Tech',
  'Design & Creative',
  'Marketing & Business',
  'Music & Audio',
  'Languages & Academics',
  'Health & Fitness',
  'Other',
];

const ClassFilter = ({ filters, setFilters, onReset }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 'true' : '') : value,
      page: 1,
    }));
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Filter Workshops
        </h4>
        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Search Workshops</label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            name="keyword"
            value={filters.keyword || ''}
            onChange={handleChange}
            placeholder="e.g. Masterclass, Python..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
        <select
          name="category"
          value={filters.category || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="pt-2">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            name="isFree"
            checked={filters.isFree === 'true'}
            onChange={handleChange}
            className="w-4 h-4 text-indigo-600 dark:text-indigo-500 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 focus:ring-indigo-500"
          />
          Show Free Workshops Only
        </label>
      </div>
    </div>
  );
};

export default ClassFilter;

