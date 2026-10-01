import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, ArrowRight, Video } from 'lucide-react';
import Badge from '../common/Badge';

const ClassCard = ({ classItem }) => {
  const isFull = classItem.currentEnrolled >= classItem.maxCapacity;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Badge variant={classItem.status} />
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            {classItem.category}
          </span>
        </div>

        <Link to={`/classes/${classItem._id}`} className="block group">
          <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition line-clamp-1">
            {classItem.title}
          </h3>
        </Link>

        <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
          {classItem.description}
        </p>

        {/* Schedule & Capacity Details */}
        <div className="space-y-1.5 pt-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span>{new Date(classItem.scheduleDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>{classItem.durationMinutes} Minutes Session</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            <span className={isFull ? 'text-rose-600 font-bold' : ''}>
              {classItem.currentEnrolled} / {classItem.maxCapacity} Enrolled {isFull ? '(Full)' : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400">Price</div>
          <div className="text-base font-extrabold text-slate-900">
            {classItem.price === 0 ? <span className="text-emerald-600 font-black">Free</span> : `₹${classItem.price}`}
          </div>
        </div>

        <Link
          to={`/classes/${classItem._id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg transition"
        >
          View Class
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default ClassCard;

