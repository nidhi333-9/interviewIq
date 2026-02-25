import React from "react";

const Navbar = () => {
  return (
    <>
      <nav className="px-8 py-5 flex justify-between items-center backdrop-blur-md bg-white/5 border-b border-white/10">
        <div className="text-2xl font-semibold tracking-wide">InterviewIQ</div>

        <button className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition">
          Login
        </button>
      </nav>
    </>
  );
};

export default Navbar;
