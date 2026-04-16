const ProgressBar = ({ current, total }) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between text-[10px] uppercase tracking-wider text-gray-500 mb-2">
        <span>Progress</span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
        <div
          className="bg-indigo-500 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(99,102,241,0.5)]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
