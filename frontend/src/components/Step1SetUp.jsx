import React, { useState } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HiOutlineDocumentText, 
  HiOutlineCloudUpload, 
  HiOutlineSparkles, 
  HiOutlineShieldCheck, 
  HiOutlineBriefcase,
  HiOutlineCheck,
  HiOutlineTrash,
  HiOutlineSearchCircle,
  HiOutlineCode,
  HiOutlineUserGroup,
  HiOutlineExclamationCircle,
  HiOutlineFolder,
  HiOutlineChip,
  HiOutlineArrowRight
} from 'react-icons/hi';
import { serverUrl } from '../App';

function Step1SetUp({ onStart }) {
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('0-1 years');
  const [mode, setMode] = useState('technical');
  const [file, setFile] = useState(null);

  // Redux & State setup
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.user.userData);

  // Extracted data state from backend AI
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);

  // API Analysis & Submission states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analyzedData, setAnalyzedData] = useState(null);
  const [analysisError, setAnalysisError] = useState('');
  const [validationError, setValidationError] = useState('');

  const modeOptions = [
    { id: 'technical', label: 'Technical', icon: <HiOutlineCode /> },
    { id: 'hr', label: 'HR / Behavioral', icon: <HiOutlineUserGroup /> },
    { id: 'confidence', label: 'Confidence', icon: <HiOutlineShieldCheck /> }
  ];

  const featurePoints = [
    {
      title: 'Hyper-Personalized Questions',
      description: 'AI extracts tech stack, past projects, and experience depth directly from your resume.'
    },
    {
      title: 'Dynamic Experience Scaling',
      description: 'System calibrates depth—from entry-level core concepts to staff-level architecture scenarios.'
    },
    {
      title: 'Instant Skill Gap Analysis',
      description: 'Detailed post-interview feedback highlighting missing keywords, tone, and confidence metrics.'
    }
  ];

  // Button Action 1: Analyze Resume with AI Backend
  const handleAnalyzeResume = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setAnalysisError('');
    setValidationError('');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await axios.post(`${serverUrl}/api/interview/resume`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      const result = response.data;
      if (!result.success) throw new Error(result.message);

      // Set extracted data
      setAnalyzedData(result.data);
      setSkills(result.data.skills || []);
      setProjects(result.data.projects || []);
      if (result.data.role) setRole(result.data.role);
      console.log('Resume analysis successful:', result.data);

    } catch (err) {
      console.error('Error analyzing resume:', err);
      setAnalysisError(
        err.response?.data?.message || err.message || 'An error occurred during resume analysis.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Button Action 2: Submit All Data & Start Interview
  const handleSubmitAll = async () => {
    setValidationError('');
    setAnalysisError('');

    // Client-side validations
    if (!role.trim()) {
      setValidationError('Please enter your target role.');
      return;
    }

    if (userData && userData.credit < 50) {
      setValidationError('Insufficient credits! You need at least 50 credits to start an interview.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${serverUrl}/api/interview/generate-questions`,
        {
          role: role.trim(),
          experience,
          mode,
          skills: skills || [],
          project: projects || [],
          textContent: analyzedData?.parsedText || analyzedData?.summary || '',
        },
        { withCredentials: true }
      );

      const result = response.data;
      console.log('Interview generation response:', result);

      if (result?.success) {
        const { credit } = result.data;

        // Update Redux state if credit is returned
        if (dispatch && credit !== undefined) {
          dispatch({ type: 'UPDATE_USER_CREDITS', payload: credit });
        }

        if (typeof onStart === 'function') {
          onStart(result.data);
        }
      } else {
        setValidationError(result?.message || 'Failed to generate interview questions.');
      }
    } catch (err) {
      console.error('Error submitting interview config:', err);
      if (err.response?.status === 403) {
        setValidationError('Insufficient credits! You need at least 50 credits to start an interview.');
      } else {
        setValidationError(
          err.response?.data?.message || 'An error occurred while generating your interview session.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center p-4 md:p-8 lg:p-12 bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
        
        {/* LEFT COLUMN: Features & Overview */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="lg:col-span-5 space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold tracking-wide shadow-sm shadow-cyan-500/10">
            <HiOutlineSparkles className="text-sm animate-pulse" />
            <span>Step 1 of 3 • Configuration</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-100 leading-[1.15]">
              Tailor Your <br />
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent drop-shadow-sm">
                AI Interview Session
              </span>
            </h1>

            <p className="text-slate-400 text-sm md:text-base leading-relaxed font-normal">
              Upload your resume and select your target position. Our AI engine builds a custom question set reflecting true technical interviews.
            </p>
          </div>

          <div className="space-y-5 pt-2">
            {featurePoints.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-start group">
                <div className="w-7 h-7 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/40 transition-all">
                  <HiOutlineCheck className="text-sm" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">{item.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Privacy Note */}
          <div className="pt-6 border-t border-slate-800/80 flex items-center gap-2.5 text-xs text-slate-500">
            <HiOutlineShieldCheck className="text-lg text-cyan-400/80 shrink-0" />
            <span>Resumes are parsed securely and deleted immediately after analysis.</span>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Interactive Setup Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="lg:col-span-7 bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-cyan-950/20 relative overflow-hidden"
        >
          {/* Ambient Glow Accents */}
          <div className="absolute -top-24 -right-24 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-6 relative z-10">
            
            {/* Target Role Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Target Role <span className="text-rose-400">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                  <HiOutlineBriefcase className="text-lg" />
                </div>
                <input
                  type="text"
                  placeholder="e.g., Full Stack Developer, Frontend Engineer, DevOps"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Select Interview Mode Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Interview Mode
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {modeOptions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id)}
                    className={`py-3 px-3 rounded-2xl text-xs font-medium border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      mode === item.id
                        ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-md shadow-cyan-500/10 font-semibold'
                        : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Level Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Experience Level
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {['0-1 years', '1-3 years', '3-5 years', '5+ years'].map((exp) => (
                  <button
                    key={exp}
                    type="button"
                    onClick={() => setExperience(exp)}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-medium border transition-all cursor-pointer text-center ${
                      experience === exp
                        ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-md shadow-cyan-500/10 font-semibold'
                        : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {exp}
                  </button>
                ))}
              </div>
            </div>

            {/* Resume Upload Drag & Drop Area */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Upload Resume (PDF)
              </label>
              
              {!file ? (
                <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-950/40 hover:bg-slate-950/70 rounded-2xl p-6 text-center transition-all cursor-pointer relative group">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        setFile(e.target.files[0]);
                        setAnalyzedData(null);
                        setSkills([]);
                        setProjects([]);
                        setAnalysisError('');
                        setValidationError('');
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <HiOutlineCloudUpload className="text-2xl" />
                  </div>
                  <p className="text-sm font-medium text-slate-200 group-hover:text-cyan-300 transition-colors">
                    Click to upload or drag & drop PDF
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Maximum file size: 5MB
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-slate-950/80 border border-slate-800 rounded-2xl shadow-inner">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                        <HiOutlineDocumentText className="text-xl" />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
                        <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setAnalyzedData(null);
                        setSkills([]);
                        setProjects([]);
                        setAnalysisError('');
                      }}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-xl transition-colors cursor-pointer"
                    >
                      <HiOutlineTrash className="text-lg" />
                    </button>
                  </div>
                </div>
              )}

              {/* Error Feedback for Analysis */}
              {analysisError && (
                <div className="mt-3 p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
                  <HiOutlineExclamationCircle className="text-lg shrink-0 text-rose-400" />
                  <span>{analysisError}</span>
                </div>
              )}

              {/* Parsed Backend Data Display */}
              <AnimatePresence>
                {analyzedData && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-3 p-4.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-xs space-y-3.5 backdrop-blur-md"
                  >
                    <div className="flex items-center justify-between text-cyan-400 font-semibold border-b border-cyan-500/20 pb-2.5">
                      <span className="flex items-center gap-2">
                        <HiOutlineSparkles className="text-sm" /> Resume Analyzed Successfully
                      </span>
                      {experience && (
                        <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium">
                          {experience}
                        </span>
                      )}
                    </div>

                    {/* Extracted Skills Badges */}
                    {skills.length > 0 && (
                      <div className="space-y-2">
                        <strong className="text-slate-200 flex items-center gap-1.5 font-semibold">
                          <HiOutlineChip className="text-cyan-400 text-base" /> Extracted Skills:
                        </strong>
                        <div className="flex flex-wrap gap-1.5">
                          {skills.map((skill, index) => (
                            <span 
                              key={index}
                              className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 text-[11px] font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Extracted Projects */}
                    {projects.length > 0 && (
                      <div className="space-y-2">
                        <strong className="text-slate-200 flex items-center gap-1.5 font-semibold">
                          <HiOutlineFolder className="text-cyan-400 text-base" /> Extracted Projects:
                        </strong>
                        <ul className="space-y-1.5 text-slate-400">
                          {projects.map((proj, index) => (
                            <li key={index} className="flex items-center gap-2 text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                              <span className="truncate">{proj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* General Validation Error Display */}
            {validationError && (
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5">
                <HiOutlineExclamationCircle className="text-lg shrink-0 text-amber-400" />
                <span>{validationError}</span>
              </div>
            )}

            {/* ACTION BUTTONS CONTAINER */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              
              {/* BUTTON 1: ANALYZE RESUME */}
              <button
                type="button"
                disabled={isAnalyzing || isSubmitting || !file}
                onClick={handleAnalyzeResume}
                className="py-3.5 px-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-cyan-300 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:border-cyan-500/40 active:scale-[0.99]"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Resume...</span>
                  </>
                ) : (
                  <>
                    <HiOutlineSearchCircle className="text-lg text-cyan-400" />
                    <span>{analyzedData ? 'Re-Analyze Resume' : 'Analyze Resume'}</span>
                  </>
                )}
              </button>

              {/* BUTTON 2: SUBMIT ALL & START */}
              <button
                type="button"
                disabled={isSubmitting || isAnalyzing}
                onClick={handleSubmitAll}
                className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Generating Questions...</span>
                  </>
                ) : (
                  <>
                    <span>Submit & Start Session</span>
                    <HiOutlineArrowRight className="text-base" />
                  </>
                )}
              </button>

            </div>

          </div>
        </motion.div>

      </div>
    </div>
  );
}

export default Step1SetUp;