import Card from "./components/Card";
import Navbar from "./components/Navbar";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <Navbar />

      <section className="flex flex-col items-center justify-center mt-20 px-6">
        <h1 className="text-4xl md:text-6xl font-bold text-center leading-tight mb-12">
          Practice Smart. Interview Confident. Get Hired.
        </h1>

        <Card />
      </section>
    </div>
  );
}

export default App;
