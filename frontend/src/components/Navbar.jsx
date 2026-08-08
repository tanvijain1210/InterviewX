import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HiOutlineSparkles, 
  HiOutlineLogout, 
  HiOutlineUser, 
  HiOutlineCog, 
  HiOutlineMenu, 
  HiX,
  HiOutlineClock
} from 'react-icons/hi';
import axios from 'axios';
import { setUserData } from '../redux/userSlice';
import { serverUrl } from '../App';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Ref for closing profile dropdown when clicking outside
  const dropdownRef = useRef(null);

  // Redux User State
  const user = useSelector((state) => state.user.userData);

  // Safely extract the user's initial for avatar fallback
  const userInitial = (user?.name || user?.displayName || user?.email || 'U')
    .charAt(0)
    .toUpperCase();

  // Safely get user credits count from DB properties
  const userCredits = user?.credit ?? user?.credits ?? 0;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      dispatch(setUserData(null));
      setShowDropdown(false);
      setMobileMenuOpen(false);
      navigate('/auth');
    }
  };

  const handlePricingClick = () => {
    setMobileMenuOpen(false);
    navigate('/pricing');
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 py-3.5 text-slate-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* 1. InterviewX Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-3 group" 
          onClick={() => setMobileMenuOpen(false)}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-full overflow-hidden shadow-sm bg-black border border-slate-900 flex items-center justify-center"
          >
            <img 
              src="/icon.png" 
              alt="InterviewX Logo" 
              className="w-full h-full object-contain p-1"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement.innerText = 'X';
              }}
            />
          </motion.div>
          <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-cyan-600 transition-colors">
            Interview<span className="text-cyan-500">X</span>
          </span>
        </Link>

        {/* 2. Main Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center gap-6 font-medium text-sm">
          <Link to="/" className="text-slate-600 hover:text-cyan-600 transition-colors">
            Dashboard
          </Link>
          <Link to="/interviews" className="text-slate-600 hover:text-cyan-600 transition-colors">
            Interviews
          </Link>
          <Link to="/history" className="text-slate-600 hover:text-cyan-600 transition-colors">
            History
          </Link>
          <Link to="/pricing" className="text-slate-600 hover:text-cyan-600 transition-colors">
            Pricing
          </Link>
        </div>

        {/* 3. Right Side Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">

          {user && (
            <>
              {/* 🕒 Interview History Quick Access Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/history');
                }}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:text-cyan-600 hover:bg-slate-100 transition-colors cursor-pointer group relative"
                aria-label="Interview History"
                title="View Interview History"
              >
                <HiOutlineClock className="text-lg group-hover:rotate-[-12deg] transition-transform" />
              </motion.button>

              {/* ⚡ Credits Badge Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={handlePricingClick}
                className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl cursor-pointer group transition-all hover:border-slate-300"
                title="Click to view pricing & buy credits"
              >
                <HiOutlineSparkles className="text-cyan-500 text-base group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold text-slate-800">
                  {userCredits}
                </span>
                <span className="hidden sm:inline text-xs text-slate-500 group-hover:text-cyan-600 transition-colors">
                  Credits
                </span>
                <span className="text-[10px] font-semibold bg-cyan-50 text-cyan-600 border border-cyan-200 px-1.5 py-0.5 rounded-md">
                  + Buy
                </span>
              </motion.button>
            </>
          )}

          {/* User Profile / Initial Avatar or Sign In */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                {/* Profile Picture or First Letter Initial */}
                {user.profilePic || user.photoURL ? (
                  <img 
                    src={user.profilePic || user.photoURL} 
                    alt="Profile" 
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-cyan-500/30" 
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {userInitial}
                  </div>
                )}
                
                <span className="hidden md:inline text-sm font-medium text-slate-800">
                  {user.name || user.displayName || 'User'}
                </span>
                <span className={`text-xs text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </motion.button>

              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {showDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 p-2 shadow-xl z-50"
                  >
                    <div className="px-3 py-2">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {user.name || user.displayName || 'User'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{user.email || ''}</p>
                    </div>

                    <div className="h-px bg-slate-100 my-1" />

                    <Link 
                      to="/history" 
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <HiOutlineClock className="text-base text-cyan-600" />
                      <span>Interview History</span>
                    </Link>

                    <Link 
                      to="/profile" 
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <HiOutlineUser className="text-base text-slate-400" />
                      <span>My Profile</span>
                    </Link>

                    <Link 
                      to="/settings" 
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <HiOutlineCog className="text-base text-slate-400" />
                      <span>Settings</span>
                    </Link>

                    <div className="h-px bg-slate-100 my-1" />

                    <button 
                      onClick={handleLogout} 
                      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-medium cursor-pointer"
                    >
                      <HiOutlineLogout className="text-base" />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link 
                to="/auth" 
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-white font-medium text-sm shadow-sm hover:bg-cyan-600 transition-colors"
              >
                Sign In
              </Link>
            </motion.div>
          )}

          {/* Mobile Navigation Drawer Button */}
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="md:hidden p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <HiX className="text-xl" /> : <HiOutlineMenu className="text-xl" />}
          </motion.button>
        </div>

      </div>

      {/* Mobile Drawer Menu Links */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-100 flex flex-col gap-3 font-medium text-sm text-center">
          <Link 
            to="/" 
            className="py-1 text-slate-600 hover:text-cyan-600 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link 
            to="/interviews" 
            className="py-1 text-slate-600 hover:text-cyan-600 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Interviews
          </Link>
          <Link 
            to="/history" 
            className="py-1 text-cyan-600 hover:text-cyan-700 transition-colors flex items-center justify-center gap-1.5"
            onClick={() => setMobileMenuOpen(false)}
          >
            <HiOutlineClock className="text-base" />
            Interview History
          </Link>
          <Link 
            to="/pricing" 
            className="py-1 text-slate-600 hover:text-cyan-600 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Pricing
          </Link>
        </div>
      )}
    </nav>
  );
}