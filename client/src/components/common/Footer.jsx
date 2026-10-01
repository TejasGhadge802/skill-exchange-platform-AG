import React from 'react';
import { Sparkles, Shield, Lock, CreditCard, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold">SkillExchange</span>
            </div>
            <p className="text-xs text-slate-400">
              The premier marketplace for skills, services, escrow-backed freelance tasks, and live interactive workshops.
            </p>
          </div>

          <div>
            <h5 className="font-semibold text-white mb-3 text-sm">Marketplace</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/tasks" className="hover:text-white transition">Browse Tasks</Link></li>
              <li><Link to="/tasks/create" className="hover:text-white transition">Post a Task</Link></li>
              <li><Link to="/classes" className="hover:text-white transition">Explore Workshops</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-white mb-3 text-sm">Security & Trust</h5>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-400" /> Razorpay Escrow Protection</li>
              <li className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-indigo-400" /> Firebase Auth & Token Verification</li>
              <li className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-amber-400" /> INR Payments Supported</li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-white mb-3 text-sm">Platform</h5>
            <p className="text-xs text-slate-400">
              Phases 1-15 Full Stack Implementation with React, Vite, Express, MongoDB & Socket.IO.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} SkillExchange Platform. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-500">
            <span>Built with precision and security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

