const Button = ({
  children,
  onClick,
  variant = "primary",
  isLoading = false,
  disabled = false,
  className = "",
}) => {
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20",
    danger: "bg-red-600 hover:bg-red-500 shadow-red-600/20",
    success: "bg-green-600 hover:bg-green-500 shadow-green-600/20",
    ghost: "bg-white/10 hover:bg-white/20 border border-white/10",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        relative py-3 px-6 rounded-xl font-bold transition-all active:scale-95
        flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 
        disabled:cursor-not-allowed text-white ${variants[variant]} ${className}
      `}
    >
      {isLoading ? (
        <>
          <span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4" />
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
