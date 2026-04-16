import { useState, useEffect } from "react";
import { useInterview, STAGE } from "../hooks/useInterview";
import SetupView from "./Interview/SetupView";
import InterviewView from "./Interview/InterviewView";
import SummaryView from "./Interview/SummaryView";
import Camera from "./Camera";
import Timer from "./Timer";

const Card = () => {
  const {
    stage,
    setStage,
    data,
    setData,
    startInterview,
    submitAnswer,
    askQuestion,
  } = useInterview();

  const [file, setFile] = useState(null);
  const [role, setRole] = useState("");
  const [time, setTime] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [sessionData, setSessionData] = useState([]);

  const isInterviewActive = stage !== STAGE.SETUP && stage !== STAGE.FINISHED;

  // ✅ Moved before early returns, fixed all 3 bugs
  const forceFinish = () => {
    const totalBlinks = sessionData.filter((p) => p.blink).length;
    const eyeContactPoints = sessionData.filter(
      (p) => p.eye_contact === "Looking at screen",
    ).length; // ✅ added .length

    const eyeContactPercent = sessionData.length
      ? Math.round((eyeContactPoints / sessionData.length) * 100)
      : 0;

    const confidence =
      eyeContactPercent >= 70
        ? "High"
        : eyeContactPercent >= 40
          ? "Medium"
          : "Low";

    const avgScore = data.scores.length
      ? Math.round(
          (data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 100,
        ) / 100
      : 0;

    const summary = {
      average_score: avgScore,
      performance:
        data.scores.length === 0
          ? "No Answers"
          : avgScore >= 8
            ? "Excellent"
            : avgScore >= 6
              ? "Good"
              : avgScore >= 4
                ? "Average"
                : "Needs Improvement",
      total_questions: data.answered?.length || 0,
      details: data.answered || [],
      camera: {
        total_blinks: totalBlinks,
        eye_contact_percent: eyeContactPercent,
        confidence,
      },
    };

    setData((prev) => ({ ...prev, summary }));
    setStage(STAGE.FINISHED); // ✅ fixed from details()
  };

  // ✅ Enrich backend summary with camera data when interview finishes normally
  useEffect(() => {
    if (data.summary && !data.summary.camera && sessionData.length > 0) {
      const totalBlinks = sessionData.filter((p) => p.blink).length;
      const eyeContactPoints = sessionData.filter(
        (p) => p.eye_contact === "Looking at screen",
      ).length;
      const eyeContactPercent = Math.round(
        (eyeContactPoints / sessionData.length) * 100,
      );
      const confidence =
        eyeContactPercent >= 70
          ? "High"
          : eyeContactPercent >= 40
            ? "Medium"
            : "Low";

      setData((prev) => ({
        ...prev,
        summary: {
          ...prev.summary,
          camera: {
            total_blinks: totalBlinks,
            eye_contact_percent: eyeContactPercent,
            confidence,
          },
        },
      }));
    }
  }, [data.summary]);

  const handleStart = async () => {
    if (!file || !role || !time) {
      setData((prev) => ({ ...prev, error: "Please fill all fields." }));
      return;
    }
    setIsStarting(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("role", role);
    formData.append("time", parseInt(time));
    await startInterview(formData);
    setIsStarting(false);
  };

  const handleTimeEnd = () => forceFinish(); // ✅ uses forceFinish

  const scoreColor = (s) => {
    if (s >= 8) return "text-green-400";
    if (s >= 5) return "text-yellow-400";
    return "text-red-400";
  };

  if (stage === STAGE.SETUP) {
    return (
      <SetupView
        file={file}
        setFile={setFile}
        role={role}
        setRole={setRole}
        time={time}
        setTime={setTime}
        onStart={handleStart}
        error={data.error}
        isLoading={isStarting}
      />
    );
  }

  if (stage === STAGE.FINISHED) {
    return <SummaryView summary={data.summary} scoreColor={scoreColor} />;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Timer
        isActive={isInterviewActive}
        duration={parseInt(time)}
        onTimeEnd={handleTimeEnd}
      />
      <InterviewView
        {...data}
        stage={stage}
        onStopAndSubmit={submitAnswer}
        onStartListening={() => setStage(STAGE.LISTENING)}
        onRetry={() => askQuestion(data.question, data.questionNum)}
        onNext={() =>
          data.summary
            ? setStage(STAGE.FINISHED)
            : askQuestion(data.nextQuestion, data.questionNum + 1)
        }
        scoreColor={scoreColor}
      />
      <Camera isActive={isInterviewActive} setSessionData={setSessionData} />
    </div>
  );
};

export default Card;
