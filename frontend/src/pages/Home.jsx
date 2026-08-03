import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HiOutlineSparkles, 
  HiOutlinePlay, 
  HiOutlineClock, 
  HiOutlineMicrophone, 
  HiOutlineX,
  HiOutlineCode,
  HiOutlineUserGroup,
  HiOutlineShieldCheck,
  HiOutlineCreditCard,
  HiOutlineLightningBolt,
  HiOutlineChartBar,
  HiOutlineAcademicCap
} from 'react-icons/hi';
import { FaRobot } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Home() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.userData);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleProtectedAction = (targetRoute) => {
    if (user) {
      navigate(targetRoute);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleAuthRedirect = () => {
    setShowAuthModal(false);
    navigate('/auth');
  };

  // How It Works Steps Data
  const steps = [
    {
      step: 'STEP 1',
      icon: <FaRobot className="text-cyan-400 text-xl" />,
      title: 'Role & Experience Selection',
      description: 'AI adjusts difficulty dynamically based on your targeted job role.',
    },
    {
      step: 'STEP 2',
      icon: <HiOutlineMicrophone className="text-cyan-400 text-xl" />,
      title: 'Smart Voice Interview',
      description: 'Dynamic follow-up questions adapt organically to your answers.',
    },
    {
      step: 'STEP 3',
      icon: <HiOutlineClock className="text-cyan-400 text-xl" />,
      title: 'Timer Based Simulation',
      description: 'Experience real interview pressure with active time tracking.',
    }
  ];

  // AI Capabilities Data
  const capabilities = [
    {
      icon: <HiOutlineLightningBolt className="text-2xl text-cyan-400" />,
      title: 'Real-Time Adaptation',
      description: 'Questions adjust on the fly based on your speech clarity, technical depth, and response confidence.',
      badge: 'Adaptive Engine'
    },
    {
      icon: <HiOutlineChartBar className="text-2xl text-cyan-400" />,
      title: 'Instant Deep Scoring',
      description: 'Comprehensive post-interview analysis dissecting technical accuracy, tone, and communication style.',
      badge: '98.5% Accuracy'
    },
    {
      icon: <HiOutlineAcademicCap className="text-2xl text-cyan-400" />,
      title: 'Targeted Role Simulations',
      description: 'Custom AI personas trained for specific roles—from Full-Stack Engineers to HR Managers.',
      badge: 'Custom AI Models'
    }
  ];

  // Interview Modes Data
  const modes = [
    {
      title: 'HR Interview Mode',
      description: 'Behavioral and communication-based evaluation.',
      icon: <HiOutlineUserGroup className="text-3xl text-cyan-400" />,
      route: '/interview?mode=hr'
    },
    {
      title: 'Technical Mode',
      description: 'Deep technical questioning tailored to specific engineering roles.',
      icon: <HiOutlineCode className="text-3xl text-cyan-400" />,
      route: '/interview?mode=technical'
    },
    {
      title: 'Confidence Detection',
      description: 'Analyze pitch, speech clarity, and tonal confidence insights.',
      icon: <HiOutlineShieldCheck className="text-3xl text-cyan-400" />,
      route: '/interview?mode=confidence'
    },
    {
      title: 'Credits System',
      description: 'Unlock premium mock interview sessions effortlessly.',
      icon: <HiOutlineCreditCard className="text-3xl text-cyan-400" />,
      route: '/credits'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 1. Header Navigation */}
      <Navbar />

      {/* 2. Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-12 md:py-20 flex flex-col items-center justify-center relative">
        
        {/* Glow Overlay */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none" />

        {/* Hero Section */}
        <div className="text-center max-w-3xl mb-20 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs md:text-sm font-medium mb-6 shadow-sm shadow-cyan-500/10"
          >
            <HiOutlineSparkles className="text-base" />
            <span>Next-Gen AI Interview Practice</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-slate-100 mb-6"
          >
            AI Powered Smart <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
              Interview Platform
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-base md:text-xl font-normal max-w-2xl mx-auto leading-relaxed"
          >
            Master technical coding rounds and behavioral HR interviews with adaptive AI. Get instant scoring, detailed feedback, and review past mock interviews.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => handleProtectedAction('/interview')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-semibold text-base shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <HiOutlinePlay className="text-xl" />
              <span>Start AI Interview</span>
            </button>

            <button
              onClick={() => handleProtectedAction('/history')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 font-semibold text-base hover:bg-slate-850 hover:border-cyan-500/40 transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-md"
            >
              <HiOutlineClock className="text-xl text-cyan-400" />
              <span>Interview History</span>
            </button>
          </motion.div>
        </div>

        {/* 3. How It Works Workflow Steps */}
        <section className="w-full mb-28 relative z-10">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              How It <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Three simple steps to prepare and elevate your interview confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 pt-4">
            {steps.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.15 }}
                whileHover={{ y: -6 }}
                className="relative bg-slate-900/80 border border-slate-800/80 rounded-3xl p-7 pt-10 backdrop-blur-md hover:border-cyan-500/40 transition-all shadow-xl shadow-slate-950/50 flex flex-col items-center text-center group"
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-slate-950 rounded-2xl border border-cyan-500/30 shadow-lg shadow-cyan-500/10 flex items-center justify-center group-hover:border-cyan-400 group-hover:scale-105 transition-all">
                  {item.icon}
                </div>

                <span className="text-[11px] font-extrabold tracking-widest text-cyan-400 uppercase mb-3">
                  {item.step}
                </span>

                <h3 className="text-lg font-bold text-slate-100 mb-2 leading-snug group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 4. AI Capabilities Section */}
        <section className="w-full mb-28 relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              Core AI <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Capabilities</span>
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Engineered to simulate real-world interviews with precise feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {capabilities.map((cap, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 rounded-3xl p-6 backdrop-blur-md transition-all shadow-xl flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {cap.icon}
                    </div>
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-cyan-400">
                      {cap.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition-colors mb-2">
                    {cap.title}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                    {cap.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 5. Multiple Interview Modes */}
        <section className="w-full relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              Multiple Interview{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Modes
              </span>
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Choose the right evaluation flow for your preparation needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {modes.map((mode, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
                onClick={() => handleProtectedAction(mode.route)}
                className="bg-slate-900/80 rounded-3xl p-6 border border-slate-800 hover:border-cyan-500/50 backdrop-blur-md shadow-xl flex items-center justify-between gap-5 cursor-pointer transition-all group relative overflow-hidden"
              >
                <div className="flex-1">
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-400 transition-colors mb-1.5">
                    {mode.title}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                    {mode.description}
                  </p>
                </div>

                <div className="w-14 h-14 shrink-0 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all">
                  {mode.icon}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

      </main>

      {/* 6. Authentication Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
              >
                <HiOutlineX className="text-lg" />
              </button>

              <div className="flex items-center justify-center mb-4">
                <img 
                  src="/logo.png" 
                  alt="App Logo" 
                  className="w-10 h-10 object-contain"
                />
              </div>

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-100">
                  Authentication Required
                </h3>
                <p className="text-sm text-slate-400 mt-1.5">
                  Please sign in to start your interview session or view history.
                </p>
              </div>

              <button
                onClick={handleAuthRedirect}
                className="w-full py-3 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-medium cursor-pointer shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-all"
              >
                Go to Sign In Page
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. Footer Component */}
      <Footer />
    </div>
  );
}