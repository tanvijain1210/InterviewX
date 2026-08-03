import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HiOutlineDownload,
  HiOutlineRefresh,
  HiOutlineArrowLeft,
  HiOutlineHome,
  HiOutlineShieldCheck,
  HiOutlineChatAlt2,
  HiOutlineCheckCircle
} from 'react-icons/hi';
import { serverUrl } from '../App';

function Step3Report({ interviewId: interviewIdProp, report: initialReport, onBack, theme = 'cyan' }) {
  const navigate = useNavigate();
  // Support two usage patterns:
  //  1. Rendered directly by a parent that already has the data (passes
  //     `interviewId` / `report` as props — e.g. from Step2Interview).
  //  2. Rendered as its own route (e.g. `/report/:id`) with no props at
  //     all — in that case fall back to the URL param so the report still
  //     loads instead of silently rendering nothing.
  const { id: idFromRoute } = useParams();
  const interviewId = interviewIdProp || idFromRoute;

  const [report, setReport] = useState(initialReport || null);
  const [loading, setLoading] = useState(!initialReport && Boolean(interviewId));
  const [error, setError] = useState(null);

  // Dynamic Theme Palette Map
  const themeStyles = {
    cyan: {
      accent: 'text-cyan-400',
      accentBg: 'bg-cyan-400',
      accentBorder: 'border-cyan-800/80',
      btnBg: 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-950/50',
      boxBg: 'bg-cyan-950/20 border-cyan-900/40',
      gradientStop: '#0891b2',
      lineStroke: '#22d3ee',
    },
    emerald: {
      accent: 'text-emerald-400',
      accentBg: 'bg-emerald-400',
      accentBorder: 'border-emerald-800/80',
      btnBg: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/50',
      boxBg: 'bg-emerald-950/20 border-emerald-900/40',
      gradientStop: '#059669',
      lineStroke: '#34d399',
    },
    indigo: {
      accent: 'text-indigo-400',
      accentBg: 'bg-indigo-400',
      accentBorder: 'border-indigo-800/80',
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
    if (val >= 40) {
      return {
        text: 'text-emerald-400',
        bg: 'bg-emerald-500',
        border: 'border-emerald-800/80',
        badgeBg: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80',
        stroke: '#34d399',
      };
    }
    if (val >= 25) {
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
    if (initialReport) {
      setReport(initialReport);
      setLoading(false);
      return;
    }

    if (!interviewId) return;

    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${serverUrl}/api/interview/report/${interviewId}`, {
          withCredentials: true,
        });
        setReport(response.data?.data || response.data);
      } catch (err) {
        console.error('Error fetching interview report:', err);
        setError('Failed to fetch the assessment report. Please try again.');
      } finally {
        setLoading(false);
      }
    };

  const handleDownloadPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[400px] w-full flex flex-col items-center justify-center space-y-4 bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-800 text-slate-300 p-8 shadow-2xl">
        <div className="w-12 h-12 border-4 border-slate-800 border-t-cyan-400 rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wide text-slate-300">Generating Assessment Report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-800 text-slate-300 space-y-4 shadow-2xl">
        <p className="text-rose-400 font-medium">{error}</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold transition-all shadow-lg"
          >
            <HiOutlineHome className="text-base" /> Back to Home
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

  if (!report) {
    return (
      <div className="p-8 text-center bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-800 text-slate-400 space-y-4">
        <p>No assessment report data available.</p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold transition-all shadow-lg mx-auto"
        >
          <HiOutlineHome className="text-base" /> Back to Home
        </button>
      </div>
    );
  }

  // Normalization & Safe extraction across all potential nested structures
  const interviewData =
    report.interview || 
    report.data?.interview || 
    report.data?.data?.interview || 
    report.report?.interview || 
    report.data || 
    report;

  const metrics = 
    report.metrics || 
    report.data?.metrics || 
    report.data?.data?.metrics || 
    report.report?.metrics || 
    {};

  // Robust multi-path lookup for the questions array
  const questions =
    interviewData?.questions ||
    report?.questions ||
    report?.data?.questions ||
    report?.data?.data?.questions ||
    report?.report?.questions ||
    report?.data?.report?.questions ||
    [];

  // Debug logs
  console.log('[Step3Report] raw report:', report);
  console.log('[Step3Report] resolved interviewData:', interviewData);
  console.log('[Step3Report] resolved questions:', questions);

  const rawFinalScore = interviewData.finalScore ?? metrics.finalScore ?? interviewData.overallScore ?? metrics.overallScore ?? 0;
  const finalScore50 = normalizeTo50(rawFinalScore);
  const finalPct = toPercentageFrom50(finalScore50);

  // Averages a raw per-question metric (0-10 scale) across all questions.
  const averageQuestionMetric = (key, altKey) => {
    if (!questions.length) return 0;
    const total = questions.reduce((sum, q) => {
      const val = q[key] ?? q[altKey] ?? 0;
      return sum + (Number(val) || 0);
    }, 0);
    return total / questions.length;
  };

  const avgConf50 = normalizeTo50(
    metrics.avgConfidence ?? interviewData.avgConfidence ?? averageQuestionMetric('confidence', 'confidenceScore')
  );
  const avgComm50 = normalizeTo50(
    metrics.avgCommunication ?? interviewData.avgCommunication ?? averageQuestionMetric('communication', 'communicationScore')
  );
  const avgCorr50 = normalizeTo50(
    metrics.avgCorrectness ?? interviewData.avgCorrectness ?? averageQuestionMetric('correctness', 'correctnessScore')
  );

  const finalScoreColors = getScoreColorConfig(finalScore50);
  const confColors = getScoreColorConfig(avgConf50);
  const commColors = getScoreColorConfig(avgComm50);
  const corrColors = getScoreColorConfig(avgCorr50);

  const performanceFeedback = getPerformanceEvaluation(finalScore50);

  return (
    <div className="w-full space-y-6 text-slate-100 font-sans">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              title="Go back"
              className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-full text-slate-300 transition-all"
            >
              <HiOutlineArrowLeft className="text-lg" />
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            title="Back to Home"
            className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-full text-slate-300 transition-all"
          >
            <HiOutlineHome className="text-lg" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Interview Analytics Dashboard</h1>
            <p className="text-xs text-slate-400">AI-powered performance insights</p>
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

        {/* LEFT COLUMN: 50-point score system */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card 1: Overall Score Gauge (/ 50) */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col items-center text-center space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Overall Score</h3>
            
            {/* SVG Circular Gauge */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`${finalScoreColors.text} transition-all duration-1000 ease-out`}
                  strokeDasharray={`${finalPct}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className={`text-2xl font-extrabold ${finalScoreColors.text}`}>{finalScore50} / 50</span>
                <span className="text-[10px] text-slate-500 font-medium">{finalPct}% Overall</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-200">{performanceFeedback.title}</p>
              <p className="text-xs text-slate-400">{performanceFeedback.subtitle}</p>
            </div>
          </div>

          {/* Card 2: Skill Breakdown (/ 50) */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-slate-200">Skill Breakdown</h3>

            <div className="space-y-4">
              {/* Confidence */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Confidence</span>
                  <span className={confColors.text}>{avgConf50} / 50</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className={`${confColors.bg} h-full rounded-full transition-all duration-500`} style={{ width: `${toPercentageFrom50(avgConf50)}%` }} />
                </div>
              </div>

              {/* Communication */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Communication</span>
                  <span className={commColors.text}>{avgComm50} / 50</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className={`${commColors.bg} h-full rounded-full transition-all duration-500`} style={{ width: `${toPercentageFrom50(avgComm50)}%` }} />
                </div>
              </div>

              {/* Correctness */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Correctness</span>
                  <span className={corrColors.text}>{avgCorr50} / 50</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className={`${corrColors.bg} h-full rounded-full transition-all duration-500`} style={{ width: `${toPercentageFrom50(avgCorr50)}%` }} />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Trend Graph & Question Breakdown */}
        <div className="lg:col-span-8 space-y-6">

          {/* Card 3: Performance Trend Chart */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-200">Performance Trend</h3>

            {questions.length === 0 ? (
              <div className="h-48 w-full flex flex-col items-center justify-center gap-2 text-center">
                <p className="text-sm text-slate-500">No question-level data available for this report yet.</p>
                <p className="text-[11px] text-slate-600">Check the browser console for the raw report shape.</p>
              </div>
            ) : (
            <div className="relative h-48 w-full pt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
                <line x1="0" y1="30" x2="500" y2="30" stroke="#334155" strokeDasharray="4 4" strokeWidth="1" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="#334155" strokeDasharray="4 4" strokeWidth="1" />
                <line x1="0" y1="130" x2="500" y2="130" stroke="#334155" strokeDasharray="4 4" strokeWidth="1" />

                <text x="5" y="25" fill="#94a3b8" fontSize="10">10</text>
                <text x="5" y="75" fill="#94a3b8" fontSize="10">5</text>
                <text x="5" y="125" fill="#94a3b8" fontSize="10">0</text>

                <defs>
                  <linearGradient id="themeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={currentTheme.gradientStop} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={currentTheme.gradientStop} stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {(() => {
                  const pts = questions.map((q, i) => {
                    const x = (i / Math.max(questions.length - 1, 1)) * 440 + 30;
                    const score = q.score ?? q.overallScore ?? 0;
                    const y = 130 - (score / 10) * 100;
                    return { x, y, score };
                  });

                  if (pts.length === 0) return null;

                  const pathD = pts.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '');
                  const areaD = `${pathD} L ${pts[pts.length - 1].x} 130 L ${pts[0].x} 130 Z`;

                  return (
                    <>
                      <path d={areaD} fill="url(#themeGradient)" />
                      <path d={pathD} fill="none" stroke={currentTheme.lineStroke} strokeWidth="3" strokeLinecap="round" />
                      {pts.map((p, idx) => (
                        <circle key={idx} cx={p.x} cy={p.y} r="4" fill={currentTheme.lineStroke} className="hover:r-6 transition-all" />
                      ))}
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
            )}
          </div>

          {/* Card 4: Question Breakdown */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-200">Question Breakdown</h3>

            {questions.length === 0 ? (
              <div className="py-8 text-center space-y-1">
                <p className="text-sm text-slate-500">No individual question data was found in this report.</p>
                <p className="text-[11px] text-slate-600">
                  This usually means the backend response for this report doesn't include a <code>questions</code> array —
                  check the console log for the exact shape.
                </p>
              </div>
            ) : (
            <div className="space-y-4">
              {questions.map((q, idx) => {
                const questionText = q.question || q.questionText || `Question ${idx + 1}`;
                const answerText = q.answer || q.userAnswer || q.userResponse;
                const feedbackText = q.feedback || q.aiFeedback || q.idealAnswer;
                const qScore = q.score ?? q.overallScore;
                const qConf = q.confidence ?? q.confidenceScore ?? q.conf;
                const qComm = q.communication ?? q.communicationScore ?? q.comm;
                const qCorr = q.correctness ?? q.correctnessScore ?? q.acc;

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3"
                  >
                    {/* Question Title & Score */}
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-400">Question {idx + 1}</p>
                        <h4 className="text-sm font-bold text-slate-100 mt-0.5">{questionText}</h4>
                      </div>
                      {qScore !== undefined && qScore !== null && (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border bg-slate-900 border-slate-700 ${currentTheme.accent}`}>
                          {qScore} / 10
                        </span>
                      )}
                    </div>

                    {/* Sub-Metrics Badges (Confidence, Communication, Correctness) */}
                    {(qConf !== undefined || qComm !== undefined || qCorr !== undefined) && (
                      <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <HiOutlineShieldCheck className={`${currentTheme.accent} shrink-0`} />
                          <span>Conf: <strong className="text-slate-100">{qConf ?? '—'}/10</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <HiOutlineChatAlt2 className={`${currentTheme.accent} shrink-0`} />
                          <span>Comm: <strong className="text-slate-100">{qComm ?? '—'}/10</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <HiOutlineCheckCircle className={`${currentTheme.accent} shrink-0`} />
                          <span>Acc: <strong className="text-slate-100">{qCorr ?? '—'}/10</strong></span>
                        </div>
                      </div>
                    )}

                    {/* Recorded User Answer */}
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Your Response</span>
                      <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {answerText && answerText.trim().length > 0 ? (
                          answerText
                        ) : (
                          <span className="italic text-slate-500">No response recorded or question was skipped.</span>
                        )}
                      </p>
                    </div>

                    {/* AI Feedback Box */}
                    <div className={`p-4 rounded-xl border space-y-1 ${currentTheme.boxBg}`}>
                      <span className={`text-[11px] font-bold block ${currentTheme.accent}`}>AI Feedback</span>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {feedbackText || (answerText ? "Good effort. Try adding clearer structure and direct examples." : "You did not submit an answer.")}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default Step3Report;