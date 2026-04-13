import { useState } from "react";
import Card from "./components/Card";
import Navbar from "./components/Navbar";
import Camera from "./components/Camera";
import Timer from "./components/Timer";
import FinalReport from "./components/Dashboard";

function App() {
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [duration, setDuration] = useState(0);

  const [sessionData, setSessionData] = useState([]);
  const [showReport, setShowReport] = useState(false);

  const handleStart = (time) => {
    setDuration(time);
    setIsInterviewStarted(true);

    setSessionData([]);
    setShowReport(false);
  };

  const handleEnd = () => {
    setIsInterviewStarted(false);
    setShowReport(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <Navbar />

      <section className="flex flex-col items-center justify-center mt-20 px-6">
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-12">
          Practice Smart. Interview Confident. Get Hired.
        </h1>

        {/* ⏳ Timer */}
        {isInterviewStarted && duration > 0 && (
        <Timer
        isActive={isInterviewStarted}
        duration={duration}
        onTimeEnd={handleEnd}
       />
)}

        {/* 🎯 MAIN UI */}
        {showReport ? (
          <FinalReport data={sessionData} />
        ) : (
          <>
            {/* ✅ Card always visible (handles questions + start) */}
            <Card onStart={handleStart} />

            {/* 🎥 Camera only during interview */}
            {isInterviewStarted && (
              <Camera
                isActive={isInterviewStarted}
                setSessionData={setSessionData}
              />
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default App;