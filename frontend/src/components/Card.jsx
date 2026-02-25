const Card = () => {
  return (
    <>
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        {/* Upload */}
        <label className="text-sm text-gray-300 mb-2 block">
          Upload Resume
        </label>
        <input
          type="file"
          className="w-full mb-5 p-2 rounded-lg bg-black/40 border border-white/10 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
        />

        {/* Job Role */}
        <label className="text-sm text-gray-300 mb-2 block">Job Role</label>
        <input
          type="text"
          placeholder="Enter Job Role"
          className="w-full mb-5 p-3 rounded-lg bg-black/40 border border-white/10 focus:outline-none focus:border-indigo-500"
        />

        {/* Time */}
        <label className="text-sm text-gray-300 mb-3 block">
          Select Duration
        </label>

        <div className="flex gap-4 mb-6">
          {["5", "10", "15"].map((time) => (
            <label
              key={time}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/40 border border-white/10 cursor-pointer hover:border-indigo-500"
            >
              <input type="radio" name="time" className="accent-indigo-500" />
              {time} min
            </label>
          ))}
        </div>

        {/* Button */}
        <button className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition font-semibold">
          Start Interview
        </button>
      </div>
    </>
  );
};

export default Card;
