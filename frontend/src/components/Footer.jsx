import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineHeart } from 'react-icons/hi';

export default function Footer() {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 text-slate-400 text-sm relative z-10">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          {/* Points to public/logo.png (or logo.svg) */}
          <img 
            src="/icon.png" 
            alt="InterviewX Logo" 
            className="w-7 h-7 object-contain"
          />
          <span className="text-base font-extrabold text-slate-100 tracking-tight">
            Interview<span className="text-cyan-400">X</span>
          </span>
        </Link>

        {/* Quick Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <Link to="/interviews" className="hover:text-cyan-400 transition-colors">
            Start Interview
          </Link>
          <Link to="/history" className="hover:text-cyan-400 transition-colors">
            History
          </Link>
          <Link to="/credits" className="hover:text-cyan-400 transition-colors">
            Credits
          </Link>
          <a href="#privacy" className="hover:text-cyan-400 transition-colors">
            Privacy Policy
          </a>
          <a href="#terms" className="hover:text-cyan-400 transition-colors">
            Terms of Service
          </a>
        </div>

        {/* Copyright */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} InterviewX. Built with</span>
          <HiOutlineHeart className="text-red-400 text-sm" />
        </div>

      </div>
    </footer>
  );
}