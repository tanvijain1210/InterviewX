import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Home from './pages/Home';
import Auth from './pages/Auth';
import InterviewPage from './pages/InterviewPage';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from './redux/userSlice';
import Pricing from './pages/Pricing';
import InterviewHistory from './pages/InterviewHistory'
import InterviewReport from './pages/InterviewReport';

export const serverUrl = "https://interviewx-1ee4.onrender.com";

export default function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  // Access user data from Redux store
  const user = useSelector((state) => state.user?.userData);

  useEffect(() => {
    let isMounted = true;

    const getUser = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/user/current-user`, {
          withCredentials: true,
          timeout: 5000 // 5-second timeout to prevent infinite loading
        });

        console.log("Full API Response Data:", result.data);

        if (isMounted) {
          if (result.data?.success) {
            dispatch(setUserData(result.data.user));
          } else {
            dispatch(setUserData(null));
          }
        }
      } catch (error) {
        console.error("Failed to fetch user:", error?.response?.data || error.message);
        if (isMounted) {
          dispatch(setUserData(null));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getUser();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  // Loading Screen Spinner
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-white-950 flex flex-col items-center justify-center text-slate-100 font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-400">Verifying Session...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home user={user} />} />
      <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/" replace />} />
      <Route path="/interview" element={user ? <InterviewPage /> : <Navigate to="/auth" replace />} />
      <Route path= '/history'  element={<InterviewHistory/>} />
      <Route path="/interview-report/:id" element={<InterviewReport />} />
      <Route path='/pricing' element= {<Pricing/>}/>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}