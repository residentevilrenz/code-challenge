import { SwapForm } from "./components/SwapForm";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-400/80 via-rose-300/80 to-red-100/70 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="mb-4 text-center text-3xl font-bold text-rose-900">
          Crypto Exchange
        </h1>
        <SwapForm />
      </div>
    </div>
  );
}

export default App;
