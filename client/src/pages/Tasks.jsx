import React, { useState, useEffect } from 'react';
import { Briefcase, PlusCircle, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import TaskCard from '../components/tasks/TaskCard';
import TaskFilter from '../components/tasks/TaskFilter';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    workMode: '',
    minBudget: '',
    maxBudget: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.keyword) params.append('keyword', filters.keyword);
      if (filters.category) params.append('category', filters.category);
      if (filters.workMode) params.append('workMode', filters.workMode);
      if (filters.minBudget) params.append('minBudget', filters.minBudget);
      if (filters.maxBudget) params.append('maxBudget', filters.maxBudget);
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);
      params.append('page', filters.page);
      params.append('limit', 9);

      const res = await api.get(`/tasks?${params.toString()}`);
      if (res.data.success) {
        setTasks(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      keyword: '',
      category: '',
      workMode: '',
      minBudget: '',
      maxBudget: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            Task Marketplace
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Explore active tasks, submit competitive bids, and collaborate with verified requesters.
          </p>
        </div>

        <Link
          to="/tasks/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Post New Task
        </Link>
      </div>

      {/* Main Grid: Filters Sidebar + Tasks List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filter Sidebar */}
        <div className="lg:col-span-1 sticky top-24">
          <TaskFilter
            filters={filters}
            setFilters={setFilters}
            onReset={handleResetFilters}
          />
        </div>

        {/* Tasks Container */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Showing <strong className="text-slate-900 dark:text-slate-100">{tasks.length}</strong> of{' '}
              <strong className="text-slate-900 dark:text-slate-100">{pagination.total}</strong> published tasks
            </span>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Sort:</span>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  setFilters((prev) => ({ ...prev, sortBy, sortOrder, page: 1 }));
                }}
                className="px-2.5 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="budgetMax-desc">Highest Budget</option>
                <option value="budgetMax-asc">Lowest Budget</option>
              </select>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading marketplace tasks..." />
          ) : tasks.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
              <p className="font-bold text-slate-800 dark:text-slate-200">No matching tasks found</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Try widening your filters or search keywords</p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg transition"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {tasks.map((task) => (
                <TaskCard key={task._id} task={task} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                disabled={filters.page <= 1}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <span className="text-xs text-slate-500 dark:text-slate-400">
                Page <strong className="text-slate-900 dark:text-slate-100">{pagination.page}</strong> of{' '}
                <strong className="text-slate-900 dark:text-slate-100">{pagination.pages}</strong>
              </span>

              <button
                disabled={filters.page >= pagination.pages}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;

