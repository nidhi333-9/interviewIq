// components/Interview/SetupView.jsx
import Button from "../UI/Button";

const SetupView = ({
  file,
  setFile,
  role,
  setRole,
  time,
  setTime,
  onStart,
  error,
  isLoading,
}) => {
  return (
    <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-500">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="text-indigo-500">⚙️</span> Interview Setup
      </h2>

      {/* ── 1. Resume Upload ── */}
      <label className="text-sm text-gray-400 mb-2 block font-medium">
        Upload Resume
      </label>
      <div className="relative group mb-5">
        <input
          type="file"
          accept=".pdf"
          className="w-full p-2 rounded-lg bg-black/40 border border-white/10 text-xs
                   file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0
                   file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 
                   cursor-pointer transition-all focus:ring-1 focus:ring-indigo-500"
          onChange={(e) => setFile(e.target.files[0])}
        />
        {file && (
          <p className="text-[10px] text-green-400 mt-1 italic animate-pulse">
            ✓ Selected: {file.name}
          </p>
        )}
      </div>

      {/* ── 2. Job Role Input ── */}
      <label className="text-sm text-gray-400 mb-2 block font-medium">
        Job Role
      </label>
      <input
        type="text"
        placeholder="e.g. Frontend Engineer"
        className="w-full mb-5 p-3 rounded-lg bg-black/40 border border-white/10
                 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 
                 transition-all text-sm"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      />

      {/* ── 3. Duration Selection ── */}
      <label className="text-sm text-gray-400 mb-3 block font-medium">
        Interview Duration
      </label>
      <div className="grid grid-cols-4 gap-2 mb-8">
        {["5", "10", "15", "30"].map((t) => (
          <label
            key={t}
            className={`flex items-center justify-center py-2 rounded-lg bg-black/40
                     border cursor-pointer transition-all duration-300
                     ${
                       time === t
                         ? "border-indigo-500 bg-indigo-500/20 text-white shadow-[0_0_10px_rgba(99,102,241,0.2)]"
                         : "border-white/10 text-gray-400 hover:border-white/30"
                     }`}
          >
            <input
              type="radio"
              name="time"
              value={t}
              checked={time === t}
              onChange={(e) => setTime(e.target.value)}
              className="hidden"
            />
            <span className="text-xs font-semibold">{t}m</span>
          </label>
        ))}
      </div>

      {/* ── 4. Error Message ── */}
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 p-3 rounded-lg mb-5 animate-bounce">
          <span className="text-xs text-red-400">⚠️ {error}</span>
        </div>
      )}

      {/* ── 5. Atomic Button ── */}
      <Button
        onClick={onStart}
        variant="primary"
        className="w-full py-4 text-base"
        isLoading={isLoading}
      >
        Launch Interview 🚀
      </Button>

      <p className="text-center text-[10px] text-gray-500 mt-4 uppercase tracking-widest">
        Powered by AI Evaluation
      </p>
    </div>
  );
};

export default SetupView;
