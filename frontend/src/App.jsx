import Navbar from "./components/Navbar";
import Card from "./components/Card";
function App() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30">
      {/* Background Glows for more "Aura" project vibes */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <Navbar />

      <main className="flex flex-col items-center justify-center pt-32 pb-20 px-6">
        {/* Only show the heading if we are in the setup stage */}
        <div className="max-w-4xl w-full text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6">
            Practice <span className="text-indigo-500">Smart.</span>
            <br />
            Interview <span className="text-indigo-500">Confident.</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            The AI-powered mock interview platform designed to get you hired.
          </p>
        </div>

        <Card />
      </main>
    </div>
  );
}

export default App;
