// frontend/src/components/Card.jsx
import { useState } from "react";
import { useInterview, STAGE } from "../hooks/useInterview";
import SetupView from "./Interview/SetupView";
import InterviewView from "./Interview/InterviewView";
import SummaryView from "./Interview/SummaryView";

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

  // Form states stay here as they are unique to the Setup process
  const [file, setFile] = useState(null);
  const [role, setRole] = useState("");
  const [time, setTime] = useState("");

  const handleStart = () => {
    if (!file || !role || !time) {
      setData((prev) => ({ ...prev, error: "Please fill all fields." }));
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("role", role);
    formData.append("time", parseInt(time));
    startInterview(formData);
  };

  const scoreColor = (s) => {
    if (s >= 8) return "text-green-400";
    if (s >= 5) return "text-yellow-400";
    return "text-red-400";
  };

  // ── Render Logic ──
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
      />
    );
  }

  if (stage === STAGE.FINISHED) {
    return <SummaryView summary={data.summary} scoreColor={scoreColor} />;
  }

  return (
    <InterviewView
      {...data}
      stage={stage}
      onStopAndSubmit={submitAnswer}
      onStartListening={() => setStage(STAGE.LISTENING)}
      onRetry={() => askQuestion(data.question, data.questionNum)}
      onNext={
        () =>
          data.summary
            ? setStage(STAGE.FINISHED)
            : askQuestion(data.nextQuestion, data.questionNum + 1) // ✅ use nextQuestion
      }
      scoreColor={scoreColor}
    />
  );
};

export default Card;
