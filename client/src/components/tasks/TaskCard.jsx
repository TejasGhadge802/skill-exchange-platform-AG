import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, DollarSign, Calendar, Star, CheckCircle, ArrowRight } from 'lucide-react';
import Badge from '../common/Badge';

const TaskCard = ({ task }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Badge variant={task.status} />
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            {task.category}
          </span>
        </div>

        <Link to={`/tasks/${task._id}`} className="block group">
          <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition line-clamp-1">
            {task.title}
          </h3>
        </Link>

        <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
          {task.description}
        </p>

        {/* Skills Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {task.requiredSkills?.slice(0, 3).map((skill, i) => (
            <span
              key={i}
              className="text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md"
            >
              {skill}
            </span>
          ))}
          {task.requiredSkills?.length > 3 && (
            <span className="text-[11px] font-medium text-slate-400">
              +{task.requiredSkills.length - 3}
            </span>
          )}
        </div>
      </div>

      <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400">Budget</div>
          <div className="text-base font-extrabold text-slate-900">
            ₹{task.budgetMin > 0 ? `${task.budgetMin} - ` : ''}₹{task.budgetMax}
          </div>
        </div>

        <Link
          to={`/tasks/${task._id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg transition"
        >
          View Details
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default TaskCard;

