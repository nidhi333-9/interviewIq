import React from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";

const FinalReport = ({ data }) => {

  if (!data || data.length === 0) {
    return <p className="text-white">No Data Available</p>;
  }

  const totalFrames = data.length;

  // 👀 Eye Contact %
  const goodEye = data.filter(d => d.eye_contact === "Good").length;
  const eyePercent = (goodEye / totalFrames) * 100;

  // 👁️ Blink Count
  const totalBlinks = data.filter(d => d.blink).length;

  // 💯 Confidence Score
  const finalConfidence = (
    eyePercent * 0.6 +
    (100 - totalBlinks) * 0.4
  ).toFixed(2);

  // 📈 Graph Data
  const graphData = data.map((d, i) => ({
    index: i,
    confidence:
      (d.eye_contact === "Good" ? 80 : 40) - (d.blink ? 10 : 0)
  }));

  // 🧠 Feedback
  let feedback = "";
  if (finalConfidence > 80) feedback = "Excellent confidence!";
  else if (finalConfidence > 60) feedback = "Good performance, improve eye contact.";
  else feedback = "Needs improvement. Practice more.";

  return (
    <div className="p-6 text-white">

      <h2 className="text-2xl mb-6">Final Interview Report</h2>

      {/* 📊 Summary */}
      <div className="bg-gray-800 p-4 rounded-xl space-y-2">
        <p>💯 Confidence: {finalConfidence}%</p>
        <p>👀 Eye Contact: {eyePercent.toFixed(2)}%</p>
        <p>👁️ Total Blinks: {totalBlinks}</p>
      </div>

      {/* 📈 Graph */}
      <div className="mt-6">
        <LineChart width={500} height={300} data={graphData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="index" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Line type="monotone" dataKey="confidence" stroke="#00ffcc" />
        </LineChart>
      </div>

      {/* 🧠 Feedback */}
      <p className="mt-6 text-lg">{feedback}</p>

    </div>
  );
};

export default FinalReport;