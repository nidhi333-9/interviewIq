import { useState } from "react";
import axios from "axios";
const Card = () => {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState("");
  const [time, setTime] = useState("");

  const handleSubmit = async () => {
    if (!file || !role || !time) {
      alert("Please fill all fields");
      return;
    }
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("role", role);
    formData.append("time", time);

    try {
      const res = await axios.post("http://localhost:8000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <>
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        {/* Upload */}
        <label className="text-sm text-gray-300 mb-2 block">
          Upload Resume
        </label>
        <input
          type="file"
          accept=".pdf"
          className="w-full mb-5 p-2 rounded-lg bg-black/40 border border-white/10 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
          onChange={(e) => setFile(e.target.files[0])}
        />

        {/* Job Role */}
        <label className="text-sm text-gray-300 mb-2 block">Job Role</label>
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Enter Job Role"
          className="w-full mb-5 p-3 rounded-lg bg-black/40 border border-white/10 focus:outline-none focus:border-indigo-500"
        />

        {/* Time */}
        <label className="text-sm text-gray-300 mb-3 block">
          Select Duration
        </label>

        <div className="flex gap-4 mb-6">
          {["5", "10", "15"].map((t) => (
            <label
              key={t}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/40 border border-white/10 cursor-pointer hover:border-indigo-500"
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

        {/* Button */}
        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition font-semibold"
        >
          Start Interview
        </button>
      </div>
    </>
  );
};

export default Card;
