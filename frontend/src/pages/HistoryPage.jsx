import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHistory, FaArrowRight, FaRegClock } from "react-icons/fa";
import { TOOL_HISTORY_LABELS, formatHistoryDate } from "../lib/toolHistory";

const HistoryPage = () => {
  const navigate = useNavigate();
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadHistory = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/tools/history", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json().catch(() => null);

        if (ignore) return;

        if (!response.ok || !data?.success) {
          setError(data?.message || "Failed to load your history.");
          setHistoryItems([]);
          return;
        }

        setHistoryItems(data.data || []);
      } catch (err) {
        if (!ignore) {
          setError("Failed to load your history.");
          setHistoryItems([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-[#071827] text-white px-6 md:px-16 pt-28 pb-16">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-semibold tracking-widest uppercase mb-4">
            <FaHistory className="text-[10px]" />
            Saved Tool Runs
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-300 to-emerald-300">
            Your Study History
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-lg">
            Open any saved result and jump straight back into the tool preview you already generated.
          </p>
        </div>

        {loading && (
          <div className="max-w-2xl mx-auto rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl px-6 py-12 text-center text-gray-300">
            Loading your history...
          </div>
        )}

        {!loading && error && (
          <div className="max-w-2xl mx-auto rounded-3xl border border-red-500/30 bg-red-500/10 px-6 py-8 text-center text-red-200">
            {error}
          </div>
        )}

        {!loading && !error && historyItems.length === 0 && (
          <div className="max-w-2xl mx-auto rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl px-6 py-12 text-center">
            <p className="text-xl font-semibold text-white mb-2">No history yet</p>
            <p className="text-gray-400">Generate notes, quizzes, flashcards, or plans and they will show up here.</p>
          </div>
        )}

        {!loading && !error && historyItems.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2">
            {historyItems.map((item) => (
              <button
                key={item._id}
                onClick={() => navigate(`${item.routePath}?history=${item._id}`)}
                className="text-left rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/40 backdrop-blur-xl p-6 hover:border-cyan-400/40 hover:shadow-[0_0_40px_rgba(34,211,238,0.12)] transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80 mb-2">
                      {TOOL_HISTORY_LABELS[item.toolType] || item.toolType}
                    </p>
                    <h2 className="text-xl font-bold text-white leading-snug">
                      {item.title}
                    </h2>
                  </div>
                  <span className="inline-flex items-center gap-2 text-xs text-gray-400 flex-shrink-0">
                    <FaRegClock />
                    {formatHistoryDate(item.createdAt)}
                  </span>
                </div>

                <p className="text-sm text-gray-400 leading-relaxed min-h-12">
                  {item.inputPreview || "Open this saved result"}
                </p>

                <div className="mt-5 inline-flex items-center gap-2 text-cyan-300 font-semibold text-sm">
                  Open in tool
                  <FaArrowRight className="text-xs" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HistoryPage;
