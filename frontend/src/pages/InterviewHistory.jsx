import React, { useEffect, useState } from 'react';
import { serverUrl } from '../App';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineClipboardList,
  HiOutlineCalendar,
  HiOutlineChevronRight,
  HiOutlineSparkles,
  HiOutlineExclamationCircle
} from 'react-icons/hi';

function InterviewHistory() {
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getMyInterviews = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/interview/getAllInterviews`, {
          withCredentials: true,
        });
        setInterviews(result.data);
      } catch (err) {
        console.error("Error fetching interviews:", err);
        setError('Could not load your interview history. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    getMyInterviews();
  }, []);

  const interviewList = interviews?.data?.interviews || interviews?.interviews || (Array.isArray(interviews) ? interviews : []);

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return null;
    }
  };

  const capitalize = (str) =>
    typeof str === 'string' && str.length ? str.charAt(0).toUpperCase() + str.slice(1) : str;

  const getScoreStyles = (score) => {
    if (score === undefined || score === null) return 'text-slate-500 bg-slate-100 border-slate-300';
    if (score >= 7) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 4) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  const handleCardClick = (interview, id) => {
    navigate(`/interview-report/${id}`, { state: { interview } });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full p-4 md:p-8 bg-slate-50 text-slate-800">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <HiOutlineClipboardList className="text-cyan-600" />
            Interview History
          </h1>
          <p className="text-sm text-slate-500">
            Review your past AI-evaluated interviews and track your progress.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-20 rounded-2xl bg-white border border-slate-200 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-sm text-rose-700">
            <HiOutlineExclamationCircle className="text-xl shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && interviewList.length === 0 && (
          <div className="p-10 rounded-3xl bg-white border border-slate-200 text-center space-y-3 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center text-xl mx-auto">
              <HiOutlineSparkles />
            </div>
            <p className="text-sm text-slate-500">
              You haven't taken any interviews yet. Start one to see your history here.
            </p>
          </div>
        )}

        {/* Interview Card Grid */}
        {!isLoading && !error && interviewList.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {interviewList.map((interview, idx) => {
              const id = interview._id || interview.id || idx;
              const role = interview.role ? capitalize(interview.role) : `Interview #${idx + 1}`;
              const date = formatDate(interview.createdAt);
              const score = interview.finalScore ?? interview.overallScore;
              const status = interview.status;

              return (
                <motion.button
                  key={id}
                  type="button"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => handleCardClick(interview, id)}
                  className="text-left p-5 rounded-2xl bg-white border border-slate-200 hover:border-cyan-400 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col gap-4"
                >
                  {/* Top: role + score */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-bold text-slate-900 truncate">{role}</p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {interview.mode && (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 uppercase tracking-wide text-[10px] font-semibold text-cyan-700">
                            {interview.mode}
                          </span>
                        )}
                        {status && (
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full border uppercase tracking-wide text-[10px] font-semibold ${
                              /incomplet/i.test(status)
                                ? 'bg-amber-50 border-amber-200 text-amber-700'
                                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            }`}
                          >
                            {status}
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className={`shrink-0 px-3 py-1.5 rounded-full border text-xs font-bold whitespace-nowrap ${
                        /incomplet/i.test(status || '')
                          ? 'text-slate-500 bg-slate-100 border-slate-300'
                          : getScoreStyles(score)
                      }`}
                    >
                      {/incomplet/i.test(status || '')
                        ? '—'
                        : score !== undefined && score !== null
                        ? `${score}/50`
                        : 'Pending'}
                    </div>
                  </div>

                  {/* Bottom: date + experience + chevron */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-200">
                    <div className="flex items-center gap-3">
                      {date && (
                        <span className="flex items-center gap-1">
                          <HiOutlineCalendar className="text-sm" />
                          {date}
                        </span>
                      )}
                      {interview.experience && (
                        <span className="text-slate-400">{interview.experience}</span>
                      )}
                    </div>
                    <HiOutlineChevronRight className="text-slate-400" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default InterviewHistory;