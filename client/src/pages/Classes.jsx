import React, { useState, useEffect } from 'react';
import { BookOpen, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ClassCard from '../components/classes/ClassCard';
import ClassFilter from '../components/classes/ClassFilter';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();

  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    isFree: '',
    page: 1,
  });

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.keyword) params.append('keyword', filters.keyword);
      if (filters.category) params.append('category', filters.category);
      if (filters.isFree) params.append('isFree', filters.isFree);
      params.append('page', filters.page);
      params.append('limit', 9);

      const res = await api.get(`/classes?${params.toString()}`);
      if (res.data.success) {
        setClasses(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      keyword: '',
      category: '',
      isFree: '',
      page: 1,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            Live Workshops & Classes
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Join interactive live sessions hosted by vetted domain instructors. Upgrade your skillset.
          </p>
        </div>

        {['instructor', 'admin'].includes(userProfile?.role) && (
          <Link
            to="/classes/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 transition self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            Host a Workshop
          </Link>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filter Sidebar */}
        <div className="lg:col-span-1 sticky top-24">
          <ClassFilter
            filters={filters}
            setFilters={setFilters}
            onReset={handleResetFilters}
          />
        </div>

        {/* Classes List */}
        <div className="lg:col-span-3 space-y-6">
          <div className="text-xs text-slate-500">
            Showing <strong className="text-slate-900">{classes.length}</strong> of{' '}
            <strong className="text-slate-900">{pagination.total}</strong> scheduled workshops
          </div>

          {loading ? (
            <LoadingSpinner message="Loading upcoming classes..." />
          ) : classes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
              <p className="font-bold text-slate-800">No scheduled workshops match your criteria</p>
              <p className="text-xs text-slate-400">Try adjusting your filters</p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {classes.map((cls) => (
                <ClassCard key={cls._id} classItem={cls} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pt-8 border-t border-slate-200 flex items-center justify-between">
              <button
                disabled={filters.page <= 1}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <span className="text-xs text-slate-500">
                Page <strong className="text-slate-900">{pagination.page}</strong> of{' '}
                <strong className="text-slate-900">{pagination.pages}</strong>
              </span>

              <button
                disabled={filters.page >= pagination.pages}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
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

export default Classes;

