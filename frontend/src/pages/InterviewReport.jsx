import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  HiOutlineArrowLeft,
  HiOutlineDownload,
  HiOutlineRefresh,
  HiOutlineShieldCheck,
  HiOutlineChatAlt2,
  HiOutlineCheckCircle,
  HiOutlineBriefcase,
  HiOutlineAcademicCap
} from 'react-icons/hi';
import { serverUrl } from '../App';

function InterviewReport({ theme = 'cyan' }) {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [interviewData, setInterviewData] = useState(location.state?.interview || null);
  const [metrics, setMetrics] = useState(location.state?.metrics || null);
  const [loading, setLoading] = useState(!location.state?.interview && Boolean(id));
  const [error, setError] = useState(null);

  // Dynamic Theme Palette Map
  const themeStyles = {
    cyan: {
      accent: 'text-cyan-400',
      accentBg: 'bg-cyan-400',
      btnBg: 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-950/50',
      boxBg: 'bg-cyan-950/20 border-cyan-900/40',
      gradientStop: '#0891b2',
      lineStroke: '#22d3ee',
    },
    emerald: {
      accent: 'text-emerald-400',
      accentBg: 'bg-emerald-400',
      btnBg: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/50',
      boxBg: 'bg-emerald-950/20 border-emerald-900/40',
      gradientStop: '#059669',
      lineStroke: '#34d399',
    },
    indigo: {
      accent: 'text-indigo-400',
      accentBg: 'bg-indigo-400',
      btnBg: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-950/50',
      boxBg: 'bg-indigo-950/20 border-indigo-900/40',
      gradientStop: '#4f46e5',
      lineStroke: '#818cf8',
    }
  };

  const currentTheme = themeStyles[theme] || themeStyles.cyan;

  // Utility to scale a score into a score out of 50
  const normalizeTo50 = (val) => {
    const raw = Number(val) || 0;
    const score = raw > 10 ? raw : raw * 5;
    return Math.min(50, Math.max(0, Math.round(score * 10) / 10));
  };

  // Convert a score out of 50 to a percentage (0 - 100%)
  const toPercentageFrom50 = (scoreOutOf50) => {
    return Math.min(100, Math.max(0, Math.round((scoreOutOf50 / 50) * 100)));
  };

  // Dynamic score color resolver based on score out of 50
  const getScoreColorConfig = (scoreOutOf50) => {
    const val = Number(scoreOutOf50) || 0;
    if (val >= 40) { // 80%+
      return {
        text: 'text-emerald-400',
        bg: 'bg-emerald-500',
        border: 'border-emerald-800/80',
        badgeBg: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80',
        stroke: '#34d399',
      };
    }
    if (val >= 25) { // 50%+
      return {
        text: 'text-amber-400',
        bg: 'bg-amber-500',
        border: 'border-amber-800/80',
        badgeBg: 'bg-amber-950/80 text-amber-400 border-amber-800/80',
        stroke: '#fbbf24',
      };
    }
    return {
      text: 'text-rose-400',
      bg: 'bg-rose-500',
      border: 'border-rose-800/80',
      badgeBg: 'bg-rose-950/80 text-rose-400 border-rose-800/80',
      stroke: '#f43f5e',
    };
  };

  // Dynamic performance evaluation label based on score out of 50
  const getPerformanceEvaluation = (scoreOutOf50) => {
    const score = Number(scoreOutOf50) || 0;
    if (score >= 45) return { title: 'Exceptional Mastery!', subtitle: 'Outstanding accuracy, clarity, and structural depth throughout.' };
    if (score >= 40) return { title: 'Excellent Performance!', subtitle: 'Consistently strong answers with minor refinement areas.' };
    if (score >= 35) return { title: 'Good Performance', subtitle: 'Solid core knowledge shown, work on providing deeper examples.' };
    if (score >= 25) return { title: 'Average Performance', subtitle: 'Basic understanding demonstrated. Practice clarity and timing.' };
    return { title: 'Needs Improvement', subtitle: 'Re-evaluate fundamental concepts and re-attempt practice sessions.' };
  };

  useEffect(() => {
    if (!interviewData && id) {
      const fetchInterviewDetail = async () => {
        try {
          setLoading(true);
          setError(null);
          const res = await axios.get(`${serverUrl}/api/interview/report/${id}`, {
            withCredentials: true,
          });

          const fetchedInterview = res.data?.data?.interview || res.data?.interview || res.data?.data || res.data;
          const fetchedMetrics = res.data?.data?.metrics || res.data?.metrics || {};

          setInterviewData(fetchedInterview);
          setMetrics(fetchedMetrics);
        } catch (err) {
          console.error("Failed to fetch interview report:", err);
          setError("Failed to load assessment report. Please try again.");
        } finally {
          setLoading(false);
        }
      };

      fetchInterviewDetail();
    }
  }, [id, interviewData]);

  const handleDownloadPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-8">
        <div className="w-12 h-12 border-4 border-slate-800 border-t-cyan-400 rounded-full animate-spin" />
        <p className="mt-4 text-sm font-semibold tracking-wide text-slate-400">Generating Assessment Report...</p>
      </div>
    );
  }

  if (error || !interviewData) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-8 space-y-4">
        <p className="text-rose-400 font-medium">{error || "No interview report data available."}</p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/history')}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold transition-all shadow-lg"
          >
            Back to History
          </button>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all shadow-lg"
          >
            <HiOutlineRefresh className="text-base" /> Retry Loading
          </button>
        </div>
      </div>
    );
  }

  // Metric Normalizations (Out of 50)
  const questions = interviewData.questions || [];
  const rawFinalScore = interviewData.finalScore ?? metrics?.finalScore ?? interviewData.overallScore ?? metrics?.overallScore ?? 0;
  const finalScore50 = normalizeTo50(rawFinalScore);
  const finalPct = toPercentageFrom50(finalScore50);

  const avgConf50 = normalizeTo50(metrics?.avgConfidence ?? interviewData.avgConfidence);
  const avgComm50 = normalizeTo50(metrics?.avgCommunication ?? interviewData.avgCommunication);
  const avgCorr50 = normalizeTo50(metrics?.avgCorrectness ?? interviewData.avgCorrectness);

  const finalScoreColors = getScoreColorConfig(finalScore50);
  const confColors = getScoreColorConfig(avgConf50);
  const commColors = getScoreColorConfig(avgComm50);
  const corrColors = getScoreColorConfig(avgCorr50);

  const performanceFeedback = getPerformanceEvaluation(finalScore50);

  return (
    <div className="min-h-[calc(100vh-80px)] w-full p-4 md:p-8 bg-slate-950 text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-full text-slate-300 transition-all"
            >
              <HiOutlineArrowLeft className="text-lg" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                {interviewData.role && (
                  <h1 className="text-2xl font-bold text-slate-100 tracking-tight capitalize">
                    {interviewData.role} Interview Report
                  </h1>
                )}
                {interviewData.mode && (
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${currentTheme.accent} bg-slate-900 border-slate-700`}>
                    {interviewData.mode}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <HiOutlineBriefcase className="text-slate-500" />
                  Exp: {interviewData.experience || 'N/A'}
                </span>
                <span className="flex items-center gap-1">
                  <HiOutlineAcademicCap className="text-slate-500" />
                  {questions.length} Questions
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleDownloadPDF}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-white font-semibold rounded-xl text-xs transition-all shadow-lg ${currentTheme.btnBg}`}
          >
            <HiOutlineDownload className="text-base" /> Download PDF
          </button>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block print:space-y-6">

          {/* LEFT COLUMN: Step 3 Report Overview & Breakdown Cards */}
          <div className="lg:col-span-4 space-y-5">

            {/* Card 1: Overall Performance Score Header Card */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800/90 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/50">
                  Step 3 Assessment Report
                </span>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${finalScoreColors.badgeBg}`}>
                  {finalPct}% Overall
                </span>
              </div>

              <div className="space-y-1 mb-5">
                <p className="text-xs font-semibold text-slate-400">Total Score</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-5xl font-black tracking-tight ${finalScoreColors.text}`}>
                    {finalScore50}
                  </span>
                  <span className="text-lg font-bold text-slate-500">/ 50</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                <div className="flex items-center gap-2">
                  <HiOutlineShieldCheck className={`text-base ${finalScoreColors.text}`} />
                  <p className={`text-xs font-bold ${finalScoreColors.text}`}>
                    {performanceFeedback.title}
                  </p>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed pl-6">
                  {performanceFeedback.subtitle}
                </p>
              </div>
            </div>

            {/* Card 2: Session Metadata */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800/90 shadow-xl space-y-3.5">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider px-1">
                Session Metadata
              </h3>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-medium">Target Role</span>
                  <p className="font-semibold text-slate-200 capitalize truncate">
                    {interviewData.role || 'Software Engineer'}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-medium">Experience</span>
                  <p className="font-semibold text-slate-200 truncate">
                    {interviewData.experience || 'Entry Level'}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-medium">Interview Mode</span>
                  <p className="font-semibold text-cyan-400 capitalize truncate">
                    {interviewData.mode || 'Technical'}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-medium">Questions Evaluated</span>
                  <p className="font-semibold text-slate-200">
                    {questions.length} Questions
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Skill & Performance Breakdown Cards */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800/90 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Skill Performance Metrics
                </h3>
                <span className="text-[10px] font-semibold text-slate-500">Out of 50</span>
              </div>

              <div className="space-y-4 pt-1">
                {/* Confidence */}
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <HiOutlineShieldCheck className={`${confColors.text} text-sm`} />
                      <span className="font-semibold text-slate-200">Confidence & Delivery</span>
                    </div>
                    <span className={`font-bold ${confColors.text}`}>{avgConf50} / 50</span>
                  </div>
                  <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`${confColors.bg} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${toPercentageFrom50(avgConf50)}%` }}
                    />
                  </div>
                </div>

                {/* Communication */}
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <HiOutlineChatAlt2 className={`${commColors.text} text-sm`} />
                      <span className="font-semibold text-slate-200">Communication Clarity</span>
                    </div>
                    <span className={`font-bold ${commColors.text}`}>{avgComm50} / 50</span>
                  </div>
                  <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`${commColors.bg} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${toPercentageFrom50(avgComm50)}%` }}
                    />
                  </div>
                </div>

                {/* Technical Accuracy */}
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <HiOutlineCheckCircle className={`${corrColors.text} text-sm`} />
                      <span className="font-semibold text-slate-200">Technical Accuracy</span>
                    </div>
                    <span className={`font-bold ${corrColors.text}`}>{avgCorr50} / 50</span>
                  </div>
                  <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`${corrColors.bg} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${toPercentageFrom50(avgCorr50)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Performance Trend & Question Breakdown */}
          <div className="lg:col-span-8 space-y-6">

            {/* Performance Trend Chart */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800/90 shadow-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Performance Trend
              </h3>

              <div className="relative h-48 w-full pt-4">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
                  <line x1="0" y1="30" x2="500" y2="30" stroke="#334155" strokeDasharray="4 4" strokeWidth="1" />
                  <line x1="0" y1="80" x2="500" y2="80" stroke="#334155" strokeDasharray="4 4" strokeWidth="1" />
                  <line x1="0" y1="130" x2="500" y2="130" stroke="#334155" strokeDasharray="4 4" strokeWidth="1" />

                  <text x="5" y="25" fill="#94a3b8" fontSize="10">50</text>
                  <text x="5" y="75" fill="#94a3b8" fontSize="10">25</text>
                  <text x="5" y="125" fill="#94a3b8" fontSize="10">0</text>

                  <defs>
                    <linearGradient id="themeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={currentTheme.gradientStop} stopOpacity="0.4" />
                      <stop offset="100%" stopColor={currentTheme.gradientStop} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {(() => {
                    const pts = questions.map((q, i) => {
                      const x = (i / Math.max(questions.length - 1, 1)) * 440 + 35;
                      const qScore50 = normalizeTo50(q.score ?? q.overallScore);
                      const y = 130 - (qScore50 / 50) * 100;
                      return { x, y, score50: qScore50 };
                    });

                    if (pts.length === 0) return null;

                    const pathD = pts.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '');
                    const areaD = `${pathD} L ${pts[pts.length - 1].x} 130 L ${pts[0].x} 130 Z`;

                    return (
                      <>
                        <path d={areaD} fill="url(#themeGradient)" />
                        <path d={pathD} fill="none" stroke={currentTheme.lineStroke} strokeWidth="3" strokeLinecap="round" />
                        {pts.map((p, idx) => {
                          const pColors = getScoreColorConfig(p.score50);
                          return (
                            <circle
                              key={idx}
                              cx={p.x}
                              cy={p.y}
                              r="5"
                              fill={pColors.stroke}
                              className="hover:r-7 transition-all cursor-pointer"
                            />
                          );
                        })}
                      </>
                    );
                  })()}
                </svg>

                <div className="flex justify-between text-[11px] text-slate-400 px-6 pt-2">
                  {questions.map((_, i) => (
                    <span key={i}>Q{i + 1}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Question Breakdown */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800/90 shadow-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Question Breakdown
              </h3>

              <div className="space-y-4">
                {questions.length === 0 ? (
                  <p className="text-xs text-slate-500">No question details available for this session.</p>
                ) : (
                  questions.map((q, idx) => {
                    const questionText = q.question || q.questionText || (typeof q === 'string' ? q : `Question ${idx + 1}`);
                    const answerText = q.answer || q.userAnswer;
                    const feedbackText = q.feedback || q.idealAnswer;

                    const qScore50 = normalizeTo50(q.score ?? q.overallScore);
                    const qConf50 = normalizeTo50(q.confidence ?? q.confidenceScore);
                    const qComm50 = normalizeTo50(q.communication ?? q.communicationScore);
                    const qCorr50 = normalizeTo50(q.correctness ?? q.correctnessScore);

                    const qScoreColors = getScoreColorConfig(qScore50);
                    const qConfColors = getScoreColorConfig(qConf50);
                    const qCommColors = getScoreColorConfig(qComm50);
                    const qCorrColors = getScoreColorConfig(qCorr50);

                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3"
                      >
                        {/* Header & Score Badge */}
                        <div className="flex justify-between items-start gap-3">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-slate-400">Question {idx + 1}</p>
                            <h4 className="text-sm font-bold text-slate-100">{questionText}</h4>
                            {q.difficulty && (
                              <span className="inline-block text-[10px] uppercase font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                Difficulty: {q.difficulty}
                              </span>
                            )}
                          </div>
                          {(q.score !== undefined || q.overallScore !== undefined) && (
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border shrink-0 ${qScoreColors.badgeBg}`}>
                              {qScore50} / 50
                            </span>
                          )}
                        </div>

                        {/* Per-Question Sub-Metrics Grid */}
                        {(q.confidence !== undefined || q.communication !== undefined || q.correctness !== undefined) && (
                          <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px]">
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <HiOutlineShieldCheck className={`${qConfColors.text} shrink-0 text-sm`} />
                              <span>Conf: <strong className={qConfColors.text}>{qConf50}/50</strong></span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <HiOutlineChatAlt2 className={`${qCommColors.text} shrink-0 text-sm`} />
                              <span>Comm: <strong className={qCommColors.text}>{qComm50}/50</strong></span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <HiOutlineCheckCircle className={`${qCorrColors.text} shrink-0 text-sm`} />
                              <span>Acc: <strong className={qCorrColors.text}>{qCorr50}/50</strong></span>
                            </div>
                          </div>
                        )}

                        {/* Candidate Answer */}
                        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Your Response</span>
                          <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                            {answerText && answerText.trim().length > 0 ? (
                              answerText
                            ) : (
                              <span className="italic text-slate-500">No response recorded or time limit exceeded.</span>
                            )}
                          </p>
                        </div>

                        {/* AI Feedback Box */}
                        <div className={`p-4 rounded-xl border space-y-1 ${currentTheme.boxBg}`}>
                          <span className={`text-[11px] font-bold block ${currentTheme.accent}`}>
                            {q.feedback ? "AI Feedback" : "Ideal Answer"}
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {feedbackText || (answerText ? "Good effort. Try adding clearer structure and direct examples." : "You did not submit an answer.")}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default InterviewReport;