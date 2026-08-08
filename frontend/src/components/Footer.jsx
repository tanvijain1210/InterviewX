import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineHeart } from 'react-icons/hi';

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-slate-200 text-slate-600 text-sm relative z-10">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-3 group transition-opacity">
          {/* Points to public/logo.png (or logo.svg) */}
          <img 
            src="/icon.png" 
            alt="InterviewX Logo" 
            className="w-8 h-8 object-contain transition-transform group-hover:scale-105"
          />
          <span className="text-lg font-semibold text-slate-900 tracking-tight">
            Interview<span className="text-cyan-500 font-bold">X</span>
          </span>
        </Link>

        {/* Quick Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-medium text-slate-600">
          <Link to="/interviews" className="hover:text-cyan-600 transition-colors">
            Start Interview
          </Link>
          <Link to="/history" className="hover:text-cyan-600 transition-colors">
            History
          </Link>
          <Link to="/credits" className="hover:text-cyan-600 transition-colors">
            Credits
          </Link>
          <a href="#privacy" className="hover:text-cyan-600 transition-colors">
            Privacy Policy
          </a>
          <a href="#terms" className="hover:text-cyan-600 transition-colors">
            Terms of Service
          </a>
        </div>

        {/* Copyright */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-normal">
          <span>© {new Date().getFullYear()} InterviewX. Built with</span>
          <HiOutlineHeart className="text-rose-500 text-sm stroke-2" />
        </div>

      </div>
    </footer>
  );
}