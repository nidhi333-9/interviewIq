import { useEffect, useState } from "react";

function Timer({ isActive, duration, onTimeEnd }) {
  const [timeLeft, setTimeLeft] = useState(duration * 60);

  useEffect(() => {
    if (!isActive) return;

    setTimeLeft(duration * 60); // reset when interview starts

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeEnd(); // ⏹ end interview
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, duration]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="text-xl font-semibold mt-4">
      {minutes}:{seconds.toString().padStart(2, "0")}
    </div>
  );
}

export default Timer;
