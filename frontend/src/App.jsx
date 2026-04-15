import { useState, useRef } from "react";
import axios from "axios";
import { Sparkles, Mic, MicOff } from "lucide-react";

function App() {
  const [text, setText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Generating Audio...");

  // Voice state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  // --- Voice Input Logic ---
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support native voice input. Please try using Google Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);

    // Keep track of what was already in the textbox
    let finalTranscript = text ? text + " " : "";

    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
          setText(finalTranscript);
        } else {
          interimTranscript += event.results[i][0].transcript;
          setText(finalTranscript + interimTranscript);
        }
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
    recognitionRef.current = recognition;
  };

  // --- Backend Queue Logic ---
  const handleSubmit = async () => {
    // If they submit while listening, stop the mic
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setIsProcessing(true);
    setAudioUrl(null);
    setProgress(15);
    setStatusText("Adding to queue...");

    try {
      const response = await axios.post("/requests", { english_text: text });
      const taskId = response.data.data.id;
      pollStatus(taskId);
      console.log("Success! Backend queued task #", taskId);
    } catch (error) {
      console.error("API Error:", error);
      setIsProcessing(false);
    }
  };

  const pollStatus = async (taskId) => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get("/requests");
        const allTasks = res.data;
        const myTask = allTasks.find((t) => t.id === taskId);

        if (myTask) {
          if (myTask.status === "pending") {
            const pendingTasks = allTasks.filter(t => t.status === "pending" || t.status === "processing").sort((a, b) => a.id - b.id);
            const myIndex = pendingTasks.findIndex(t => t.id === taskId);

            if (myIndex > 0) {
              setStatusText(`Another request is being processed. You are queued (Position: ${myIndex}). Please wait...`);
            } else {
              setStatusText("You are next in queue...");
            }
          } else if (myTask.status === "processing") {
            setProgress(65);
            setStatusText("Processing text and generating audio...");
          } else if (myTask.status === "completed") {
            setProgress(100);
            setStatusText("Audio Complete!");
            setAudioUrl(myTask.audio_url);
            setIsProcessing(false);
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 2000);
  };

  return (
    <div>
      <div className="flex flex-col items-center bg-[#FAFAFE] min-h-screen pb-16 relative overflow-hidden">
        {/* AMBIENT BACKGROUND GLOWS */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-50"></div>
        <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-pink-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-50"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[800px] h-[600px] bg-indigo-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-40"></div>

        {/* Z-INDEX WRAPPER */}
        <div className="relative z-10 w-full flex flex-col items-center">
          {/* NAVIGATION BAR */}
          <nav className="w-full flex justify-between items-center px-8 md:px-16 py-6 w-full max-w-7xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#8B5CF6] rounded-lg shadow-sm flex items-center justify-center text-white text-lg font-bold">文A</div>
              <span className="font-bold text-xl text-[#1E293B]">AI Speech Converter</span>
            </div>
            <div className="flex gap-6 text-[#64748B] font-medium">
              <a href="#" className="hover:text-[#8B5CF6] transition-colors">Home</a>
              <a href="#" className="hover:text-[#8B5CF6] transition-colors">About</a>
            </div>
          </nav>

          {/* AI PILL */}
          <div className="mt-8 mb-6 flex items-center gap-1.5 bg-[#E9E4FC] text-[#8B5CF6] px-4 py-1.5 rounded-full text-[13px] font-semibold border border-white/50 shadow-sm">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>Powered by AI</span>
          </div>

          <h1 className="text-5xl font-extrabold text-slate-800 text-center">
            Convert English Text into <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
              Hindi Speech
            </span>
          </h1>

          <p className="mt-6 text-slate-500 text-center max-w-lg text-lg">
            Type or speak your English text below and let our AI translate it to Hindi and generate natural-sounding speech
          </p>

          {/* MAIN TEXTBOX CARD */}
          <div className="relative mt-12 w-[600px]">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] rounded-[2rem] blur opacity-20"></div>

            <div className="relative bg-white/50 backdrop-blur-3xl shadow-2xl rounded-3xl p-8 border border-white/80">
              <div className="bg-white/60 backdrop-blur-md rounded-xl p-4 border border-white shadow-inner relative">

                {/* Voice Input Button */}
                <button
                  onClick={toggleListening}
                  className={`absolute bottom-4 right-4 p-2.5 rounded-full transition-all shadow-md flex items-center gap-2 border ${isListening
                      ? 'bg-red-500 text-white border-red-400 animate-pulse'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-[#F3E8FF] hover:text-[#8B5CF6] hover:border-[#8B5CF6]/30'
                    }`}
                  title="Voice Input"
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  {isListening && <span className="text-xs font-bold mr-1">Listening...</span>}
                </button>

                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type your English text here or click the microphone to speak..."
                  className="w-full bg-transparent text-lg resize-none outline-none text-slate-700 min-h-[120px] pb-10"
                />

                {/* Word Counter */}
                <div className="flex justify-start mt-2">
                  <span className={`text-sm font-semibold ${wordCount > 100 ? 'text-red-500' : 'text-[#8B5CF6]/60'}`}>
                    {wordCount} / 100 words
                  </span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!text.trim() || wordCount > 100 || isProcessing}
                className="w-full mt-6 bg-[#8B5CF6] hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-full transition-all flex items-center justify-center gap-2">
                {isProcessing ? "Adding to Queue..." : "Convert to Hindi Speech"}
              </button>
            </div>
          </div>

          {/* QUEUE STATUS & AUDIO BOX */}
          {(isProcessing || audioUrl) && (
            <div className="relative mt-8 w-[600px] animate-[slide-up_0.5s_ease-out]">
              <div className="relative bg-white/50 backdrop-blur-xl shadow-xl rounded-3xl p-6 border border-white/60">
                <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                  {audioUrl ? "✨ " : "🔄 "} {statusText}
                </h3>
                {!audioUrl && (
                  <div className="w-full bg-white/60 rounded-full h-3 mb-2 overflow-hidden shadow-inner border border-white/40">
                    <div className="bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] h-3 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                  </div>
                )}
                {audioUrl && (
                  <div className="mt-2 bg-[#FAFAFE]/90 rounded-xl p-2 border border-slate-200 shadow-inner">
                    <audio controls src={audioUrl} className="w-full">
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;
