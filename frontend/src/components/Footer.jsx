import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative w-full bg-black text-gray-300 py-12  overflow-hidden border-t border-white/5">
      {/* 🌈 Soft Glowing Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-blue-500/10 to-purple-500/10 blur-3xl opacity-60"></div>

      {/* 💫 Top Subtle Glow Border */}
    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-red-500 via-blue-400 to-purple-500"></div>

      {/* 🧭 Main Container */}
      <div className="relative z-10 w-full px-16 flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* 🔮 Left - Brand Info */}
        <div className="text-left">
          <h2 className="text-3xl font-bold text-white tracking-wide pointer-events-none">
            Study<span className="text-blue-400">AI</span>
          </h2>
          <p className="text-sm text-gray-400 mt-1 pointer-events-none">
            Smarter learning. Powered by AI.
          </p>
        </div>

        {/* 📘 Center - Navigation */}
        <nav className="flex flex-wrap justify-center md:justify-end gap-6 text-sm font-medium">
          <Link to="/pdf" className="hover:text-red-400 transition">
            Notes
          </Link>
          <Link to="/quiz" className="hover:text-blue-400 transition">
            Quiz
          </Link>
          <Link to="/notes" className="hover:text-purple-400 transition">
            Summary
          </Link>
          <Link to="/flashcard" className="hover:text-pink-400 transition">
            Flashcard
          </Link>
          <Link to="/study-planner" className="hover:text-yellow-400 transition">
            Planner
          </Link>
          <Link to="/generate-questions" className="hover:text-cyan-400 transition">
            Questions
          </Link>
        </nav>
      </div>

      {/* 🩵 Bottom Copyright */}
      <div className="relative z-10 text-center text-sm text-gray-500 mt-10 border-t border-white/10 pt-4 pointer-events-none">
        © {new Date().getFullYear()} StudyAI. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
