import React from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { FcGoogle } from 'react-icons/fc';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../utils/firebase';
import { serverUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import { useNavigate } from 'react-router-dom';

function Auth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleAuth = async () => {
    try {
      const response = await signInWithPopup(auth, provider);
      let User = response.user;
      let name = User.displayName;
      let email = User.email;

      const result = await axios.post(
        `${serverUrl}/api/auth/googleAuth`,
        { name, email },
        { withCredentials: true }
      );

      // 🎯 FIX: Dispatch result.data.user (or fallback to result.data)
      if (result.data && result.data.user) {
        dispatch(setUserData(result.data.user));
      } 
      navigate('/');
    } catch (error) {
      console.error('Authentication error:', error);
      dispatch(setUserData(null));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 p-8 shadow-xl shadow-slate-200/50"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-3">
            <motion.img
              whileHover={{ scale: 1.05, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
              src="/icon.png"
              alt="InterviewX Logo"
              className="w-9 h-9 object-contain cursor-pointer"
            />
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              InterviewX
            </h2>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="text-center mb-8 space-y-1"
        >
          <h1 className="text-lg font-semibold text-slate-900">
            Continue with AI Smart Interview
          </h1>
          <p className="text-sm text-slate-500">
            Sign in to start with
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          whileHover={{ scale: 1.02, borderColor: 'rgba(6, 182, 212, 0.4)' }}
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-slate-100 border border-slate-300 text-slate-800 font-medium cursor-pointer shadow-sm transition-colors hover:bg-slate-200"
          onClick={handleGoogleAuth}
        >
          <FcGoogle className="text-xl" />
          <span>Continue with Google</span>
        </motion.button>
      </motion.div>
    </div>
  );
}

export default Auth;