// frontend/src/components/Card.jsx
import { useState, useEffect, useRef } from "react";
import axios from "axios";

// ── TTS: speaks the question out loud ──────────────────────────────────────
const speak = (text, onEnd) => {
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = 0.95;
  utter.pitch = 1;
  if (onEnd) utter.onend = onEnd;

  // Pick a natural voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(
    (v) => v.name.includes("Samantha") || v.name.includes("Google US English"),
  );
  if (preferred) utter.voice = preferred;

  window.speechSynthesis.speak(utter);
};

// ── STT: listens to user answer ────────────────────────────────────────────
const createRecognition = () => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const r = new SR();
  r.lang = "en-US";
  r.interimResults = true;
  r.continuous = true;
  return r;
};

// ── Stages ─────────────────────────────────────────────────────────────────
const STAGE = {
  SETUP: "setup",
  ASKING: "asking",
  LISTENING: "listening",
  EVALUATING: "evaluating",
  RESULT: "result",
  FINISHED: "finished",
};

const Card = () => {
  // Setup state
  const [file, setFile] = useState(null);
  const [role, setRole] = useState("");
  const [time, setTime] = useState("");

  // Interview state
  const [stage, setStage] = useState(STAGE.SETUP);
  const [question, setQuestion] = useState("");
  const [questionNum, setQuestionNum] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [scores, setScores] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef(null);
  const transcriptRef = useRef(""); // live ref to avoid stale closure

  // Sync transcript to ref
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // ── Start Interview ──────────────────────────────────────────────────────
  const handleStart = async () => {
    if (!file || !role || !time) {
      setError("Please fill all fields before starting.");
      return;
    }
    setError("");
    setStage(STAGE.ASKING);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("role", role);
    formData.append("time", parseInt(time));

    try {
      const res = await axios.post(
        "http://localhost:8000/start_interview",
        formData,
      );
      setTotalQuestions(res.data.total_questions);
      askQuestion(res.data.first_question, 1);
    } catch (err) {
      setError("Failed to start interview. Is the backend running?");
      setStage(STAGE.SETUP);
    }
  };

  // ── Ask a question (TTS) ─────────────────────────────────────────────────
  const askQuestion = (q, num) => {
    setQuestion(q);
    setQuestionNum(num);
    setTranscript("");
    transcriptRef.current = "";
    setFeedback(null);
    setStage(STAGE.ASKING);
    setIsSpeaking(true);

    speak(q, () => {
      setIsSpeaking(false);
      startListening(); // auto-start mic after question is spoken
    });
  };

  // ── Start Listening (STT) ────────────────────────────────────────────────
  const startListening = () => {
    setStage(STAGE.LISTENING);
    const rec = createRecognition();
    if (!rec) {
      setError("Speech recognition not supported. Use Chrome.");
      return;
    }
    recognitionRef.current = rec;

    rec.onresult = (e) => {
      let full = "";
      for (let i = 0; i < e.results.length; i++) {
        full += e.results[i][0].transcript;
      }
      setTranscript(full);
      transcriptRef.current = full;
    };

    rec.onerror = (e) => console.error("STT error:", e.error);
    rec.start();
  };

  // ── Stop Listening & Submit ──────────────────────────────────────────────
  const stopAndSubmit = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    const answer = transcriptRef.current.trim();
    if (!answer) {
      setError("No answer detected. Please try again.");
      setStage(STAGE.LISTENING);
      return;
    }

    setStage(STAGE.EVALUATING);
    setError("");

    try {
      const res = await axios.post("http://localhost:8000/submit_answer", {
        question,
        answer,
      });

      setFeedback({ ...res.data.score, next_question: res.data.next_question });
      setScores((prev) => [...prev, res.data.score.score]);
      setStage(STAGE.RESULT);

      if (res.data.message === "Interview finished") {
        setSummary(res.data.summary);
      }
    } catch (err) {
      setError("Evaluation failed. Try again.");
      setStage(STAGE.LISTENING);
    }
  };

  // ── Next Question ────────────────────────────────────────────────────────
  const handleNext = () => {
    if (summary) {
      setStage(STAGE.FINISHED);
      return;
    }
    if (feedback?.next_question) {
      askQuestion(feedback.next_question, questionNum + 1);
    }
  };

  // ── Average score color ──────────────────────────────────────────────────
  const scoreColor = (s) => {
    if (s >= 8) return "text-green-400";
    if (s >= 5) return "text-yellow-400";
    return "text-red-400";
  };

  // ════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════

  // ── SETUP SCREEN ─────────────────────────────────────────────────────────
  if (stage === STAGE.SETUP)
    return (
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        <label className="text-sm text-gray-300 mb-2 block">
          Upload Resume
        </label>
        <input
          type="file"
          accept=".pdf"
          className="w-full mb-5 p-2 rounded-lg bg-black/40 border border-white/10
                   file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0
                   file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <label className="text-sm text-gray-300 mb-2 block">Job Role</label>
        <input
          type="text"
          placeholder="e.g. Data Engineer"
          className="w-full mb-5 p-3 rounded-lg bg-black/40 border border-white/10
                   text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />

        <label className="text-sm text-gray-300 mb-3 block">
          Select Duration
        </label>
        <div className="flex gap-4 mb-6">
          {["5", "10", "15", "30"].map((t) => (
            <label
              key={t}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/40
                       border border-white/10 cursor-pointer hover:border-indigo-500"
            >
              <input
                type="radio"
                name="time"
                value={t}
                onChange={(e) => setTime(e.target.value)}
                className="accent-indigo-500"
              />
              {t} min
            </label>
          ))}
        </div>

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        <button
          onClick={handleStart}
          className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500
                   transition font-semibold"
        >
          Start Interview
        </button>
      </div>
    );

  // ── FINISHED SCREEN ───────────────────────────────────────────────────────
  if (stage === STAGE.FINISHED && summary) {
    const avg = summary.average_score;
    return (
      <div
        className="w-full max-w-lg bg-white/5 backdrop-blur-xl border border-white/10
                      rounded-2xl p-8 shadow-2xl"
      >
        <h2 className="text-2xl font-bold text-center mb-2">
          Interview Complete 🎉
        </h2>
        <p className="text-center text-gray-400 mb-6">Here's how you did</p>

        <div className="flex justify-center mb-6">
          <div className="text-center">
            <p className={`text-6xl font-bold ${scoreColor(avg)}`}>{avg}</p>
            <p className="text-gray-400 mt-1">Average Score / 10</p>
            <p className={`text-lg font-semibold mt-2 ${scoreColor(avg)}`}>
              {summary.performance}
            </p>
          </div>
        </div>

        <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
          {summary.details.map((d, i) => (
            <div
              key={i}
              className="bg-black/30 rounded-xl p-4 border border-white/10"
            >
              <p className="text-sm text-gray-300 mb-1">
                Q{i + 1}: {d.question}
              </p>
              <p className="text-xs text-gray-400 italic mb-2">"{d.answer}"</p>
              <div className="flex items-center gap-3">
                <span className={`font-bold text-lg ${scoreColor(d.score)}`}>
                  {d.score}/10
                </span>
                <span className="text-xs text-gray-300">{d.feedback}</span>
              </div>
              {d.missed_points?.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Missed points:</p>
                  {d.missed_points.map((mp, j) => (
                    <p key={j} className="text-xs text-red-400">
                      • {mp}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full mt-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500
                     transition font-semibold"
        >
          Start New Interview
        </button>
      </div>
    );
  }

  // ── INTERVIEW SCREEN ──────────────────────────────────────────────────────
  return (
    <div
      className="w-full max-w-lg bg-white/5 backdrop-blur-xl border border-white/10
                    rounded-2xl p-8 shadow-2xl"
    >
      {/* Progress */}
      <div className="flex justify-between text-xs text-gray-400 mb-4">
        <span>
          Question {questionNum} {totalQuestions > 0 && `of ${totalQuestions}`}
        </span>
        <span>
          {scores.length > 0 &&
            `Avg: ${(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)}/10`}
        </span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-1.5 mb-6">
        <div
          className="bg-indigo-500 h-1.5 rounded-full transition-all"
          style={{
            width: totalQuestions
              ? `${(questionNum / totalQuestions) * 100}%`
              : "0%",
          }}
        />
      </div>

      {/* Question */}
      <div className="bg-black/30 rounded-xl p-5 mb-6 border border-white/10 min-h-[80px]">
        {isSpeaking && (
          <div className="flex items-center gap-2 text-indigo-400 text-xs mb-2">
            <span className="animate-pulse">🔊</span> Speaking...
          </div>
        )}
        <p className="text-white leading-relaxed">
          {question || "Loading question..."}
        </p>
      </div>

      {/* Transcript */}
      {(stage === STAGE.LISTENING ||
        stage === STAGE.RESULT ||
        stage === STAGE.EVALUATING) && (
        <div className="bg-black/20 rounded-xl p-4 mb-5 border border-white/5 min-h-[60px]">
          <p className="text-xs text-gray-500 mb-1">Your answer:</p>
          <p className="text-gray-300 text-sm italic">
            {transcript || (stage === STAGE.LISTENING ? "Listening..." : "—")}
          </p>
        </div>
      )}

      {/* Feedback */}
      {stage === STAGE.RESULT && feedback && (
        <div className="bg-black/30 rounded-xl p-4 mb-5 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <span
              className={`text-2xl font-bold ${scoreColor(feedback.score)}`}
            >
              {feedback.score}/10
            </span>
            <span className="text-sm text-gray-300">{feedback.feedback}</span>
          </div>
          {feedback.missed_points?.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Could improve on:</p>
              {feedback.missed_points.map((mp, i) => (
                <p key={i} className="text-xs text-yellow-400">
                  • {mp}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {stage === STAGE.LISTENING && (
          <button
            onClick={stopAndSubmit}
            className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-500
                       transition font-semibold flex items-center justify-center gap-2"
          >
            <span className="animate-pulse">🎙</span> Stop & Submit Answer
          </button>
        )}

        {stage === STAGE.EVALUATING && (
          <button
            disabled
            className="w-full py-3 rounded-lg bg-gray-700 transition font-semibold
                       flex items-center justify-center gap-2 opacity-60"
          >
            <span className="animate-spin">⏳</span> Evaluating...
          </button>
        )}

        {stage === STAGE.RESULT && (
          <>
            <button
              onClick={() => askQuestion(question, questionNum)}
              className="flex-1 py-3 rounded-lg bg-white/10 hover:bg-white/20
                         transition font-semibold text-sm"
            >
              🔁 Retry
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500
                         transition font-semibold text-sm"
            >
              {summary ? "See Summary →" : "Next Question →"}
            </button>
          </>
        )}

        {stage === STAGE.ASKING && !isSpeaking && (
          <button
            onClick={startListening}
            className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-500
                       transition font-semibold flex items-center justify-center gap-2"
          >
            🎙 Start Answering
          </button>
        )}
      </div>
    </div>
  );
};

export default Card;
