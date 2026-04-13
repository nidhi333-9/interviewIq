const ScoreBadge = ({ score, size = "md" }) => {
  const getColor = (s) => {
    if (s >= 8) return "text-green-400 bg-green-400/10 border-green-400/20";
    if (s >= 5) return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
    return "text-red-400 bg-red-400/10 border-red-400/20";
  };

  const sizeClasses =
    size === "lg" ? "text-3xl px-4 py-2" : "text-sm px-2 py-1";

  return (
    <span
      className={`font-bold rounded-lg border ${sizeClasses} ${getColor(score)}`}
    >
      {score}/10
    </span>
  );
};

export default ScoreBadge;
