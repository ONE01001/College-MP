import React, { useState } from "react";
import { FaPaperPlane } from "react-icons/fa";

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      showToast("⚠️ Please fill all fields!", "warning");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast("✅ Message sent successfully!", "success");
      setFormData({ name: "", email: "", message: "" });
    }, 1500);
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-purple-950 text-white flex flex-col items-center justify-center px-6 pt-24 relative overflow-hidden">
      {/* Toast */}
      <div
        id="toast-container"
        className="absolute bottom-10 right-10 toast toast-bottom toast-end z-50 space-y-2"
      ></div>

      {/* Subtle background glow */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-700/20 blur-[180px] rounded-full -z-10"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-700/20 blur-[180px] rounded-full -z-10"></div>

      {/* Title */}
      <h1 className="text-5xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400">
        Get in Touch
      </h1>

      <p className="text-gray-400 text-center mb-10 max-w-md">
        We'd love to hear from you. Send us a message and we’ll get back soon.
      </p>

      {/* Contact Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900/60 backdrop-blur-md border border-gray-800 p-8 rounded-2xl w-full max-w-md shadow-[0_0_30px_rgba(168,85,247,0.1)] transition-all duration-300 hover:shadow-[0_0_50px_rgba(168,85,247,0.25)]"
      >
        <input
          type="text"
          placeholder="Your Name"
          className="w-full rounded-xl border border-white/12 bg-gradient-to-r from-white/8 to-white/4 px-4 py-3 text-white placeholder:text-gray-400 mb-4 outline-none transition-all duration-300 focus:border-purple-400/70 focus:bg-white/10 focus:shadow-[0_0_0_4px_rgba(168,85,247,0.12)]"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Your Email"
          className="w-full rounded-xl border border-white/12 bg-gradient-to-r from-white/8 to-white/4 px-4 py-3 text-white placeholder:text-gray-400 mb-4 outline-none transition-all duration-300 focus:border-blue-400/70 focus:bg-white/10 focus:shadow-[0_0_0_4px_rgba(96,165,250,0.12)]"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <textarea
          placeholder="Your Message"
          className="w-full h-28 rounded-xl border border-white/12 bg-gradient-to-br from-white/8 to-white/4 px-4 py-3 text-white placeholder:text-gray-400 mb-6 resize-none outline-none transition-all duration-300 focus:border-pink-400/70 focus:bg-white/10 focus:shadow-[0_0_0_4px_rgba(244,114,182,0.12)]"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        ></textarea>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 border-2 px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
            loading
              ? "border-gray-600 text-gray-400 cursor-not-allowed"
              : "border-purple-400 text-white hover:bg-purple-500 hover:border-purple-500 hover:text-white"
          }`}
        >
          {loading ? "Sending..." : <><FaPaperPlane /> Send Message</>}
        </button>
      </form>

      {/* Footer */}
      <p className="mt-10 text-sm text-gray-500">© 2025 YourApp. All rights reserved.</p>
    </section>
  );
};

export default ContactPage;
