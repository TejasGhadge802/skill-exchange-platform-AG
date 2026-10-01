import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-8xl font-black text-indigo-600">404</h1>
      <h2 className="text-2xl font-bold text-slate-900 mt-4">Page Not Found</h2>
      <p className="text-xs text-slate-500 mt-2 max-w-sm">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition"
      >
        <Home className="w-4 h-4" />
        Return Home
      </Link>
    </div>
  );
};

export default NotFound;

