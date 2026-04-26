import React, { useEffect, useState } from "react";
import { FaQuestionCircle, FaBolt, FaBrain } from "react-icons/fa";
import { motion as Motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { fetchToolHistoryRecord } from "../lib/toolHistory";


const QuizPage = () => {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const historyId = searchParams.get("history");

  useEffect(() => window.scrollTo(0, 0), []);

  useEffect(() => {
    if (!historyId) return;

    let ignore = false;

    const loadHistory = async () => {
      setHistoryLoading(true);
      const data = await fetchToolHistoryRecord(historyId);

      if (ignore) return;

      if (!data.success || data.data.toolType !== "quiz") {
        setHistoryLoading(false);
        return showToast(data.message || "Failed to load saved quiz", "error");
      }

      setTopic(data.data.inputData?.topic || "");
      setQuizData(data.data.outputData || null);
      setSubmitted(false);
      setAnswers({});
      setHistoryLoading(false);
    };

    loadHistory();

    return () => {
      ignore = true;
    };
  }, [historyId]);

  const showToast = (message, type = "info") => {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `alert alert-${type} shadow-lg max-w-md w-full`;
    toast.innerHTML = `<div><span>${message}</span></div>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("opacity-0", "transition-opacity");
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return showToast("⚠️ Please enter a topic first!", "warning");

    try {
      setLoading(true);
      const res = await fetch(`/api/tools/generate-mcqs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (!data.success) {
        showToast(message || "❌ Failed to generate quiz", "error");
        return;
      }
      setLoading(false);
      setQuizData(data);
      showToast("🧠 Quiz generated successfully!","success");
    } catch {
      setLoading(false);
      showToast("❌ Error connecting to server", "error");
    }
  };

  const handleSelect = (qIndex, option) => {
    if (submitted) return;
    setAnswers({ ...answers, [qIndex]: option });
  };

  const score = quizData?.mcqs?.questions?.filter(
    (q, i) => answers[i] === q.correctAnswer
  ).length;

  if (historyLoading && !quizData) {
    return (
      <section className="min-h-screen bg-gradient-to-b from-black via-[#020617] to-[#0f172a] text-white flex items-center justify-center px-6 pt-20">
        <p className="text-lg text-gray-300">Loading saved quiz...</p>
      </section>
    );
  }

  // Quiz Display
  if (quizData) {
    const questions = quizData.mcqs.questions
    const topicName = quizData.mcqs.topic;

    return (
      <div className="w-full min-h-screen bg-[#020d1a] text-white py-20 px-6">
        <button
          onClick={() => {
            setQuizData(null);
            setSubmitted(false);
            setAnswers({});
            setTopic("");
          }}
          className="md:mt-15 px-4 py-2 mt-10 rounded-lg bg-[#0a1a33] border border-blue-900/20 hover:bg-blue-900/20 transition text-sm"
        >
          ← Back
        </button>
        <FaQuestionCircle className="absolute top-56 left-50 text-blue-700/40 text-7xl animate-float-slow" />
<FaBrain className="absolute bottom-28 left-40 text-cyan-400/30 text-9xl animate-float" />
<FaBolt className="absolute top-39 right-32 text-blue-400/30 text-8xl animate-float-rev" />

        <div className="max-w-3xl mx-auto mt-[80px]">
          <h2 className="text-3xl font-bold text-center mb-10 text-blue-300">{topicName}</h2>
          <div className="space-y-10">
            {questions.map((q, index) => (
              <Motion.div
                key={index}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="p-6 rounded-xl bg-[#0a1a33]/60 border border-blue-900/20 backdrop-blur-md shadow-lg"
              >
                <h3 className="text-lg font-semibold text-blue-200">{index + 1}. {q.question}</h3>
                <div className="grid mt-4 gap-3">
                  {q.options.map((opt, i) => {
                    const selected = answers[index] === opt;
                    const correct = q.correctAnswer === opt;
                    return (
                      <button
                        key={i}
                        onClick={() => handleSelect(index, opt)}
                        className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                          submitted
                            ? correct
                              ? "border-green-500 bg-green-500/20"
                              : selected
                              ? "border-red-500 bg-red-500/20"
                              : "border-blue-900/20"
                            : selected
                            ? "border-blue-400 bg-blue-400/10"
                            : "border-blue-900/20 hover:bg-blue-900/10"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </Motion.div>
            ))}
          </div>

          {!submitted && (
            <div className="text-center mt-10">
              <button
                onClick={() => setSubmitted(true)}
                className="px-10 py-3 rounded-full border-2 border-blue-400 text-blue-300 hover:bg-blue-400 hover:text-black transition font-semibold"
              >
                Submit Quiz
              </button>
            </div>
          )}

          {submitted && (
            <div className="text-center mt-10">
              <p className="text-xl font-bold text-green-300">
                Score: {score} / {questions.length}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Input Form
  return (
    <section className="min-h-screen bg-gradient-to-b from-black via-[#020617] to-[#0f172a] text-white flex flex-col items-center justify-center px-6 md:px-16 mt-20 relative overflow-hidden">
      <div id="toast-container" className="absolute bottom-10 right-10 z-50 space-y-2"></div>

      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-800/10 via-cyan-700/15 to-transparent blur-[200px] rounded-full -z-10"></div>
      <FaQuestionCircle className="absolute top-28 left-24 text-blue-700/40 text-7xl animate-float-slow" />
<FaBrain className="absolute bottom-28 left-40 text-cyan-400/30 text-9xl animate-float" />
<FaBolt className="absolute top-32 right-32 text-blue-400/30 text-8xl animate-float-rev" />

      <h1 className="w-full mt-6 md:mt-0 text-4xl sm:text-6xl font-extrabold text-center mb-4 leading-snug relative bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-cyan-200 to-sky-300 animate-shimmer bg-[length:300%_100%]">
        Generate Smart Quizzes
      </h1>

      <p className="text-gray-400 text-sm sm:text-lg text-center mb-2 max-w-2xl">
        Type a topic and let AI craft interactive quizzes to test your understanding.
      </p>
      <p className="text-cyan-400/60 text-xs sm:text-sm text-center mb-12 italic">
        Perfect for revision, learning, or quick knowledge checks.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 p-10 rounded-3xl border border-white/10 flex flex-col items-center gap-6 w-full max-w-2xl backdrop-blur-xl"
      >
        <div className="flex items-center w-full gap-3 bg-gray-900/70 border border-gray-700 rounded-xl px-5 py-4">
          <FaQuestionCircle className="text-2xl text-blue-400/80" />
          <input
            type="text"
            placeholder="Enter a topic (e.g., Machine Learning)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="bg-transparent outline-none w-full text-white sm:text-lg placeholder-gray-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`flex items-center justify-center gap-2 border-2  md:px-10 px-3 py-3 rounded-full text-sm md:text-lg  font-semibold ${
            loading ? "border-gray-600 text-gray-400 cursor-not-allowed" : "border-white text-white hover:bg-white hover:text-black"
          }`}
        >
          <FaBolt className="text-xl text-blue-400 animate-pulse" />
          {loading ? "Generating..." : "Generate Quiz"}
        </button>
      </form>

      <p className="mt-16 text-sm text-gray-500 text-center tracking-wide">
        ⚡ Challenge your mind — test what you’ve learned instantly.
      </p>

      <style>{`
        @keyframes float {0%{transform:translateY(0);}50%{transform:translateY(-10px);}100%{transform:translateY(0);}}
        @keyframes float-slow {0%{transform:translateY(0);}50%{transform:translateY(-6px);}100%{transform:translateY(0);}}
        @keyframes float-rev {0%{transform:translateY(0);}50%{transform:translateY(8px);}100%{transform:translateY(0);}}
        @keyframes shimmer {0%{background-position:-100% 0;}100%{background-position:100% 0;}}
        .animate-float {animation:float 5s ease-in-out infinite;}
        .animate-float-slow {animation:float-slow 7s ease-in-out infinite;}
        .animate-float-rev {animation:float-rev 6s ease-in-out infinite;}
        .animate-shimmer {animation:shimmer 6s linear infinite;}
      `}</style>
    </section>
  );
};

export default QuizPage;
