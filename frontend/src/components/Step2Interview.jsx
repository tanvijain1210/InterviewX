import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineClock,
  HiOutlinePaperAirplane,
  HiOutlineQuestionMarkCircle,
  HiOutlineChevronRight,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineVolumeUp,
  HiOutlineMicrophone,
  HiOutlineStop
} from 'react-icons/hi';
import { serverUrl } from '../App';

function Step2Interview({ interviewData, onFinish }) {
  // Extract identifiers and questions array
  const { interviewId: idFromData, _id: interviewIdFromData, id, questions = [], username } = interviewData || {};
  const interviewId = idFromData || interviewIdFromData || id;

  // Flow Phases: 'intro' | 'question' | 'feedback'
  const [phase, setPhase] = useState('intro');

  // Question Navigation and Text State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stores the response object from backend: response.data.data.question
  const [evaluationResult, setEvaluationResult] = useState(null);

  // Report generation (fires once the last question's feedback is dismissed)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [reportData, setReportData] = useState(null);

  // ---------------- Voice (AI asks / user answers) ----------------
  const [isSpeaking, setIsSpeaking] = useState(false);     // AI reading the question aloud
  const [isListening, setIsListening] = useState(false);   // Mic capturing user's spoken answer
  const [voiceInputSupported, setVoiceInputSupported] = useState(true);
  const [voiceOutputSupported, setVoiceOutputSupported] = useState(true);

  const recognitionRef = useRef(null);
  // Holds the "committed" text (typed + previously finalized speech) so that
  // interim speech results can be layered on top without wiping manual edits.
  const baseAnswerRef = useRef('');
  // Some browsers report speechSynthesis.getVoices() as empty until the
  // 'voiceschanged' event fires, and utterances queued before that can be silent.
  const voicesReadyRef = useRef(false);
  const preferredVoiceRef = useRef(null);

  // Timer Configuration
  const currentQuestion = questions[currentIndex] || {};
  const timeLimit = currentQuestion.timeLimit || currentQuestion.timelimit || 60;
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  // Tracks whether the intro/welcome message has already been spoken, so it
  // only auto-plays once rather than re-firing on every re-render.
  const introSpokenRef = useRef(false);
  const introText = `Welcome, ${username || 'Candidate'}! You are ready to start your AI evaluated interview. The AI will read each question aloud. You can answer by typing or speaking, whichever is easier.`;

  // Set up SpeechRecognition once on mount
  useEffect(() => {
    const SpeechRecognitionImpl = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionImpl) {
      setVoiceInputSupported(false);
    } else {
      const recognition = new SpeechRecognitionImpl();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalChunk += `${transcript} `;
          } else {
            interim += transcript;
          }
        }

        if (finalChunk) {
          baseAnswerRef.current = `${baseAnswerRef.current} ${finalChunk}`.trim();
        }

        setAnswerText(`${baseAnswerRef.current} ${interim}`.trim());
      };

      recognition.onerror = (event) => {
        console.error('🎤 Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    if (!window.speechSynthesis) {
      setVoiceOutputSupported(false);
    } else {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          voicesReadyRef.current = true;
          preferredVoiceRef.current =
            voices.find((v) => /en-US|en_US/.test(v.lang) && /Google|Natural|Neural/i.test(v.name)) ||
            voices.find((v) => v.lang === 'en-US') ||
            voices.find((v) => v.lang?.startsWith('en')) ||
            voices[0];
        }
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;

      // Warm-up: Chrome/Edge's speech engine has a real cold-start delay
      // (often 1-3s) on the very first utterance of a page session. Firing
      // a silent, near-instant utterance immediately reduces that delay for
      // the first real question, since the engine is already "spun up" by
      // the time the user clicks Start Interview.
      try {
        const warmup = new SpeechSynthesisUtterance(' ');
        warmup.volume = 0;
        window.speechSynthesis.speak(warmup);
      } catch (e) {
        // no-op: warm-up is best-effort only
      }
    }

    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speakQuestion = useCallback((text) => {
    if (!text || !window.speechSynthesis) return;

    const doSpeak = () => {
      const wasSpeaking = window.speechSynthesis.speaking || window.speechSynthesis.pending;
      window.speechSynthesis.cancel();

      const startSpeaking = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1;
        utterance.volume = 1;
        if (preferredVoiceRef.current) {
          utterance.voice = preferredVoiceRef.current;
        }
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);

        // Chrome bug workaround: long utterances can get silently paused.
        // Nudging resume() periodically while speaking keeps audio flowing.
        const keepAlive = setInterval(() => {
          if (!window.speechSynthesis.speaking) {
            clearInterval(keepAlive);
            return;
          }
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }, 4000);
      };

      // Chrome/Edge can silently stall if speak() is called immediately
      // after cancel() while something was actively speaking. A tiny delay
      // only in that case avoids the stall without adding lag to the
      // common case (nothing was speaking, e.g. the very first question).
      if (wasSpeaking) {
        setTimeout(startSpeaking, 60);
      } else {
        startSpeaking();
      }
    };

    // If voices haven't loaded yet, wait briefly rather than speaking with none.
    if (!voicesReadyRef.current && window.speechSynthesis.getVoices().length === 0) {
      setTimeout(doSpeak, 150);
    } else {
      doSpeak();
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (e) {
      // no-op: recognition may already be stopped
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    baseAnswerRef.current = answerText;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      console.error('🎤 Could not start recognition:', e);
    }
  }, [isListening, answerText]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Best-effort: try to have the AI speak the welcome/intro message as soon
  // as the interview screen loads. Some browsers (notably Safari) block
  // speech that isn't triggered by a direct user gesture, so this may be
  // silently blocked — the speaker icon next to the welcome message lets
  // the user trigger it manually in that case.
  useEffect(() => {
    if (phase !== 'intro' || introSpokenRef.current || !voiceOutputSupported) return;
    introSpokenRef.current = true;
    speakQuestion(introText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, voiceOutputSupported]);

  // Reset timer and answer when switching questions, then have the AI ask it aloud
  useEffect(() => {
    if (phase !== 'question') return;

    const nextLimit = questions[currentIndex]?.timeLimit || questions[currentIndex]?.timelimit || 60;
    setTimeLeft(nextLimit);
    setAnswerText('');
    baseAnswerRef.current = '';
    setEvaluationResult(null);

    // NOTE: speakQuestion is intentionally NOT called here anymore.
    // It's triggered directly inside handleStartInterview / handleNextFromFeedback
    // (the actual click handlers) instead, for two reasons:
    //   1. Browsers require speechSynthesis.speak() to run synchronously inside
    //      a user gesture, or it can be silently blocked.
    //   2. Calling it here AS WELL caused speakQuestion to fire twice per
    //      question (once from the click handler, once from this effect),
    //      which meant a second speechSynthesis.cancel() interrupted the
    //      utterance that had just started — Chrome introduces a noticeable
    //      stall when speak() is called immediately after cancel(), which is
    //      exactly the "pause before speaking" symptom this was causing.

    return () => {
      window.speechSynthesis?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, phase, questions]);

  // Handle countdown timer
  useEffect(() => {
    if (phase !== 'question' || isSubmitting) return;

    if (timeLeft <= 0) {
      stopListening();
      submitAnswerToBackend(answerText || 'No answer provided');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase, isSubmitting]);

  // Start interview from intro
  const handleStartInterview = () => {
    // Unlock/trigger speech synthesis directly inside this click handler —
    // browsers require audio playback to originate from a user gesture.
    speakQuestion(questions[0]?.question);
    setPhase('question');
  };

  // Submit Answer API Call
  const submitAnswerToBackend = async (textToSend) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    stopListening();
    window.speechSynthesis?.cancel();

    // 1. Define clean base URL and endpoint
    const baseUrl = (serverUrl || 'http://localhost:8000').replace(/\/$/, '');
    const targetUrl = `${baseUrl}/api/interview/submit-answer`;

    const activeInterviewId = interviewData?._id || interviewData?.id || interviewId;

    const payload = {
      interviewId: activeInterviewId,
      questionIndex: currentIndex,
      answer: textToSend.trim(),
      timeTaken: Math.max(0, timeLimit - timeLeft)
    };

    console.log("🚀 Payload being sent:", payload);
    console.log("📍 Target Endpoint:", targetUrl);

    try {
      const response = await axios.post(targetUrl, payload, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("✅ Response:", response.data);

      if (response.data && response.data.success) {
        setEvaluationResult(response.data.data?.question);
      }
    } catch (error) {
      // 🔴 Corrected error logging (uses targetUrl instead of endpoint)
      console.error("❌ AXIOS ERROR DETAILED:", {
        message: error.message,
        url: targetUrl,
        status: error.response?.status,
        data: error.response?.data
      });

      // Fallback state
      setEvaluationResult({
        question: currentQuestion.question || 'Question',
        answer: textToSend || 'No answer submitted',
        feedback: `Server Error (${error.response?.status || 'Network'}): ${error.response?.data?.message || error.message}`,
        score: 0,
        confidence: 0,
        communication: 0,
        correctness: 0
      });
    } finally {
      setIsSubmitting(false);
      setPhase('feedback');
    }
  };

  const handleSubmitAnswer = () => {
    submitAnswerToBackend(answerText);
  };

  // Calls the backend to generate the final interview report once all
  // questions have been answered. Returns the report data (or null on failure)
  // so the caller can decide what to do with it.
  const generateReport = async () => {
    const baseUrl = (serverUrl || 'http://localhost:8000').replace(/\/$/, '');
    const targetUrl = `${baseUrl}/api/interview/generate-report`;
    const activeInterviewId = interviewData?._id || interviewData?.id || interviewId;

    setIsGeneratingReport(true);
    setReportError(null);

    try {
      const response = await axios.post(
        targetUrl,
        { interviewId: activeInterviewId },
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      console.log('📄 Report generated:', response.data);

      if (response.data && response.data.success) {
        return response.data.data || response.data;
      }

      setReportError('Report generation did not return a successful response.');
      return null;
    } catch (error) {
      console.error('❌ REPORT GENERATION ERROR:', {
        message: error.message,
        url: targetUrl,
        status: error.response?.status,
        data: error.response?.data
      });
      setReportError(
        `Could not generate report (${error.response?.status || 'Network'}): ${
          error.response?.data?.message || error.message
        }`
      );
      return null;
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Handle step progression after looking at feedback
  const handleNextFromFeedback = async () => {
    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      // Trigger inside the click handler itself so autoplay restrictions don't block it.
      speakQuestion(questions[nextIndex]?.question);
      setCurrentIndex(nextIndex);
      setPhase('question');
    } else {
      setIsSubmitting(true);
      const report = await generateReport();
      setIsSubmitting(false);

      if (report) {
        setReportData(report);
        setPhase('report');
      }
      // If report generation failed, reportError is already set and the
      // "Finish Interview" button stays visible so the user can retry.
    }
  };

  // Called from the final report screen once the user is done reviewing it.
  const handleFinishAndExit = async () => {
    if (typeof onFinish === 'function') {
      await onFinish(reportData);
    }
  };

  // Timer style helper
  const getTimerStyles = () => {
    if (timeLeft > 20) return 'border-cyan-200 bg-cyan-50 text-cyan-600';
    if (timeLeft > 10) return 'border-amber-200 bg-amber-50 text-amber-600';
    return 'border-rose-200 bg-rose-50 text-rose-600 animate-pulse';
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center p-4 md:p-8 bg-slate-50 text-slate-800">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6 items-start">

        {/* LEFT SECTION — AI Speaking Panel */}
        <div className="md:sticky md:top-8 p-6 rounded-3xl bg-white border border-slate-200 backdrop-blur-md shadow-xl shadow-slate-200/50 flex flex-col items-center text-center gap-5">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <div
              className={`absolute inset-0 rounded-full blur-xl transition-all duration-500 ${
                isSpeaking ? 'bg-cyan-500/50 scale-125' : isListening ? 'bg-rose-500/30 scale-110' : 'bg-cyan-50 scale-100'
              }`}
            />
            <div
              className={`relative w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-600 flex items-center justify-center text-2xl text-white shadow-lg shadow-cyan-500/25 transition-transform duration-300 ${
                isSpeaking ? 'scale-105' : 'scale-100'
              }`}
            >
              <HiOutlineSparkles />
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-900">AI Interviewer</p>
            <p
              className={`text-xs font-semibold uppercase tracking-wide ${
                isSpeaking ? 'text-cyan-600' : isListening ? 'text-rose-600' : 'text-slate-500'
              }`}
            >
              {isSpeaking
                ? 'Speaking…'
                : isListening
                ? 'Listening to you…'
                : phase === 'question'
                ? 'Waiting for your answer'
                : phase === 'feedback'
                ? 'Reviewing your answer'
                : 'Ready to begin'}
            </p>
          </div>

          {/* Voice activity waveform */}
          <div className="flex items-end justify-center gap-1 h-10 w-full">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <motion.span
                key={i}
                className={`w-1.5 rounded-full ${
                  isSpeaking ? 'bg-cyan-400' : isListening ? 'bg-rose-400' : 'bg-slate-300'
                }`}
                initial={{ height: '18%' }}
                animate={
                  isSpeaking || isListening
                    ? { height: ['18%', '85%', '35%', '100%', '25%'] }
                    : { height: '18%' }
                }
                transition={{
                  duration: 0.9,
                  repeat: isSpeaking || isListening ? Infinity : 0,
                  repeatType: 'loop',
                  delay: i * 0.07,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            {username ? `Interviewing ${username}` : 'AI-evaluated interview'}
          </p>

          {isGeneratingReport && (
            <div className="w-full pt-3 border-t border-slate-200/80 space-y-1.5">
              <p className="text-[11px] font-semibold text-cyan-600 flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                Generating your report…
              </p>
            </div>
          )}
        </div>

        {/* RIGHT SECTION — Progress + Step Panel */}
        <div className="grid grid-cols-1 gap-6 items-start">

        {/* Progress Tracker Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-3">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
            <span>Interview Progress</span>
            <span className="text-cyan-600 font-bold">
              Question {currentIndex + 1} of {questions.length || 1}
            </span>
          </div>

          <div
            className="grid gap-1.5"
            style={{ gridTemplateColumns: `repeat(${questions.length || 1}, minmax(0, 1fr))` }}
          >
            {(questions.length ? questions : [1]).map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'bg-cyan-400 shadow-sm shadow-cyan-500/50'
                    : idx < currentIndex
                    ? 'bg-slate-300'
                    : 'bg-slate-100'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Dynamic Step Panel */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-xl shadow-slate-200/50 space-y-6"
        >
          <AnimatePresence mode="wait">
            
            {/* 1. INTRO PHASE */}
            {phase === 'intro' && (
              <motion.div
                key="intro-phase"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 text-center py-8"
              >
                <div className="w-16 h-16 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center text-2xl mx-auto shadow-lg shadow-cyan-500/20">
                  <HiOutlineSparkles />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Welcome, {username || 'Candidate'}!
                  </h2>
                  <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                    You are ready to start your AI-evaluated interview. The AI will read each question aloud —
                    answer by typing or speaking, whichever is easier.
                  </p>
                  {!voiceOutputSupported || !voiceInputSupported ? (
                    <p className="text-[11px] text-amber-600/90 max-w-md mx-auto leading-relaxed">
                      Note: full voice support isn't available in this browser. Typed answers will still work fine —
                      try Chrome or Edge for voice features.
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={handleStartInterview}
                  className="py-3.5 px-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Start Interview</span>
                  <HiOutlineChevronRight />
                </button>
              </motion.div>
            )}

            {/* 2. QUESTION & ANSWER PHASE */}
            {phase === 'question' && (
              <motion.div
                key="question-phase"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center gap-1.5">
                    <HiOutlineQuestionMarkCircle />
                    {currentQuestion.difficulty || 'Technical'} Level
                  </span>

                  <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all ${getTimerStyles()}`}>
                    <HiOutlineClock className="text-sm" />
                    <span>{timeLeft}s Remaining</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <p className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                        Question #{currentIndex + 1}
                      </p>
                      <h2 className="text-lg md:text-xl font-semibold text-slate-900 leading-snug">
                        {currentQuestion.question || 'Please write your response below.'}
                      </h2>
                    </div>

                    {voiceOutputSupported && (
                      <button
                        type="button"
                        onClick={() => speakQuestion(currentQuestion.question)}
                        title={isSpeaking ? 'AI is speaking...' : 'Replay question aloud'}
                        className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                          isSpeaking
                            ? 'bg-cyan-100 border-cyan-300 text-cyan-700 animate-pulse'
                            : 'bg-slate-100 border-slate-300 text-slate-500 hover:text-cyan-600 hover:border-cyan-200'
                        }`}
                      >
                        <HiOutlineVolumeUp className="text-lg" />
                      </button>
                    )}
                  </div>

                  {isSpeaking && (
                    <p className="text-[11px] text-cyan-600/80 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      AI is asking the question...
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Your Response
                    </label>

                    {voiceInputSupported && (
                      <button
                        type="button"
                        onClick={toggleListening}
                        disabled={isSubmitting}
                        title={isListening ? 'Stop recording' : 'Answer by speaking'}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-wide transition-all cursor-pointer disabled:opacity-50 ${
                          isListening
                            ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse'
                            : 'bg-slate-100 border-slate-300 text-slate-500 hover:text-cyan-600 hover:border-cyan-200'
                        }`}
                      >
                        {isListening ? (
                          <>
                            <HiOutlineStop className="text-sm" />
                            <span>Stop Listening</span>
                          </>
                        ) : (
                          <>
                            <HiOutlineMicrophone className="text-sm" />
                            <span>Speak Answer</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <textarea
                    rows={6}
                    value={answerText}
                    onChange={(e) => {
                      baseAnswerRef.current = e.target.value;
                      setAnswerText(e.target.value);
                    }}
                    placeholder="Type your complete answer here, or tap 'Speak Answer' to use your voice..."
                    className={`w-full p-4 bg-slate-50 border rounded-2xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-1 transition-all resize-none ${
                      isListening
                        ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-400'
                        : 'border-slate-200 focus:border-cyan-400 focus:ring-cyan-400'
                    }`}
                  />

                  {isListening && (
                    <p className="text-[11px] text-rose-600/90 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                      Listening... speak clearly, then tap "Stop Listening" when done.
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => submitAnswerToBackend('No answer provided')}
                    className="text-xs text-slate-500 hover:text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Skip Question
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting || !answerText.trim()}
                    onClick={handleSubmitAnswer}
                    className="py-3 px-6 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 active:scale-[0.99] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Evaluating...' : 'Submit Response'}</span>
                    <HiOutlineChevronRight className="text-sm" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* 3. EVALUATION & FEEDBACK PHASE */}
            {phase === 'feedback' && evaluationResult && (
              <motion.div
                key="feedback-phase"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 py-2"
              >
                <div className="flex items-center gap-2 text-cyan-600 font-semibold text-sm">
                  <HiOutlineCheckCircle className="text-lg" />
                  <span>Recorded Response for Question #{currentIndex + 1}</span>
                </div>

                {/* Recap of Question and Submitted Answer */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Question
                    </p>
                    <p className="text-sm font-semibold text-slate-800">
                      {evaluationResult.question || currentQuestion.question}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Submitted Answer
                    </p>
                    <p className="text-xs text-slate-600 italic mt-0.5">
                      "{evaluationResult.answer || answerText}"
                    </p>
                  </div>
                </div>

                {/* Metric Grid */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Overall</p>
                    <p className="text-lg font-bold text-cyan-600">
                      {evaluationResult.score ?? 0}/10
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Correctness</p>
                    <p className="text-lg font-bold text-emerald-600">
                      {evaluationResult.correctness ?? 0}/10
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Communication</p>
                    <p className="text-lg font-bold text-indigo-600">
                      {evaluationResult.communication ?? 0}/10
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Confidence</p>
                    <p className="text-lg font-bold text-amber-600">
                      {evaluationResult.confidence ?? 0}/10
                    </p>
                  </div>
                </div>

                {/* AI Feedback */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-600 uppercase tracking-wider">
                    <HiOutlineSparkles />
                    <span>Evaluation Breakdown</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {evaluationResult.feedback}
                  </p>
                </div>

                {/* Report generation error (only relevant on the final question) */}
                {reportError && currentIndex === questions.length - 1 && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600">
                    {reportError}
                  </div>
                )}

                {/* Next Step / Finish Button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleNextFromFeedback}
                    className="py-3 px-6 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 active:scale-[0.99] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>
                      {currentIndex === questions.length - 1
                        ? isGeneratingReport
                          ? 'Generating Report...'
                          : isSubmitting
                          ? 'Finishing Up...'
                          : 'Finish Interview'
                        : 'Next Question'}
                    </span>
                    {currentIndex === questions.length - 1 ? (
                      <HiOutlinePaperAirplane className="text-sm rotate-90" />
                    ) : (
                      <HiOutlineChevronRight className="text-sm" />
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* 4. FINAL REPORT PHASE */}
            {phase === 'report' && reportData && (
              <motion.div
                key="report-phase"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2 text-cyan-600 font-semibold text-sm">
                  <HiOutlineCheckCircle className="text-lg" />
                  <span>Your Interview Report</span>
                </div>

                {/* Overall score, if the backend provides one under any common key */}
                {(reportData.overallScore ?? reportData.score ?? reportData.totalScore) !== undefined && (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Overall Score
                    </p>
                    <p className="text-3xl font-bold text-cyan-600">
                      {reportData.overallScore ?? reportData.score ?? reportData.totalScore}
                      <span className="text-base text-slate-500">/10</span>
                    </p>
                  </div>
                )}

                {/* Summary, if provided */}
                {(reportData.summary || reportData.overview) && (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-600 uppercase tracking-wider">
                      <HiOutlineSparkles />
                      <span>Summary</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {reportData.summary || reportData.overview}
                    </p>
                  </div>
                )}

                {/* Strengths / Improvements, if provided as arrays */}
                {(Array.isArray(reportData.strengths) || Array.isArray(reportData.improvements)) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.isArray(reportData.strengths) && (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-emerald-200 space-y-2">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                          Strengths
                        </p>
                        <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                          {reportData.strengths.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {Array.isArray(reportData.improvements) && (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-amber-200 space-y-2">
                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                          Areas to Improve
                        </p>
                        <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                          {reportData.improvements.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Recommendation, if provided */}
                {reportData.recommendation && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Recommendation
                    </p>
                    <p className="text-sm text-slate-600">{reportData.recommendation}</p>
                  </div>
                )}

                {/* Fallback: raw report data, in case the backend shape doesn't
                    match any of the fields above. Ensures nothing is hidden. */}
                {!reportData.summary &&
                  !reportData.overview &&
                  !Array.isArray(reportData.strengths) &&
                  !Array.isArray(reportData.improvements) &&
                  !reportData.recommendation && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Report Data
                      </p>
                      <pre className="text-[11px] text-slate-600 whitespace-pre-wrap break-words">
                        {JSON.stringify(reportData, null, 2)}
                      </pre>
                    </div>
                  )}

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleFinishAndExit}
                    className="py-3 px-6 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 active:scale-[0.99] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Continue</span>
                    <HiOutlineChevronRight className="text-sm" />
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Step2Interview;