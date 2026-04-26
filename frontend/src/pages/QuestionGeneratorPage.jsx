import React, { useEffect, useState } from "react";
import { FaBrain, FaLightbulb, FaCheckCircle, FaChevronDown, FaChevronUp, FaCopy, FaDownload, FaUpload, FaFilePdf, FaTimes } from "react-icons/fa";
import { MdQuiz } from "react-icons/md";
import { useSearchParams } from "react-router-dom";
import { extractTextFromPDF } from "../lib/extractPDF";
import { fetchToolHistoryRecord } from "../lib/toolHistory";

const QUESTION_TYPES = [
  { key: "2_marks", label: "2 Marks", desc: "Short concept-check questions", color: "#22d3ee", glow: "rgba(34,211,238,0.3)" },
  { key: "3_marks", label: "3 Marks", desc: "Explain / define questions", color: "#a78bfa", glow: "rgba(167,139,250,0.3)" },
  { key: "5_marks", label: "5 Marks", desc: "Detailed / analytical answers", color: "#f472b6", glow: "rgba(244,114,182,0.3)" },
];

const TYPE_COLORS = {
  "2_marks": { border: "#22d3ee", bg: "rgba(34,211,238,0.08)", badge: "#22d3ee", badgeBg: "rgba(34,211,238,0.15)" },
  "3_marks": { border: "#a78bfa", bg: "rgba(167,139,250,0.08)", badge: "#a78bfa", badgeBg: "rgba(167,139,250,0.15)" },
  "5_marks": { border: "#f472b6", bg: "rgba(244,114,182,0.08)", badge: "#f472b6", badgeBg: "rgba(244,114,182,0.15)" },
};

const TYPE_LABELS = { "2_marks": "2 Marks", "3_marks": "3 Marks", "5_marks": "5 Marks" };

export default function QuestionGeneratorPage() {
  const [content, setContent] = useState("");
  const [questionTypes, setQuestionTypes] = useState(["2_marks", "3_marks", "5_marks"]);
  const [includeAnswers, setIncludeAnswers] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [copied, setCopied] = useState({});
  const [downloading, setDownloading] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const [pdfFile, setPdfFile] = useState(null);
  const [pdfText, setPdfText] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const historyId = searchParams.get("history");

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (!historyId) return;

    let ignore = false;

    const loadHistory = async () => {
      setHistoryLoading(true);
      const data = await fetchToolHistoryRecord(historyId);

      if (ignore) return;

      if (!data.success || data.data.toolType !== "question-generator") {
        setHistoryLoading(false);
        return showToast(data.message || "Failed to load saved questions", "error");
      }

      const savedResult = data.data.outputData?.result || null;
      setResult(savedResult);
      setIncludeAnswers(Boolean(data.data.outputData?.includeAnswers));
      setQuestionTypes(data.data.inputData?.questionTypes || ["2_marks", "3_marks", "5_marks"]);
      setContent("");
      setPdfFile(null);
      setPdfText("");

      const initExpanded = {};
      Object.keys(savedResult || {}).forEach((key) => {
        if (savedResult[key]?.length) initExpanded[`${key}-0`] = true;
      });
      setExpanded(initExpanded);
      setHistoryLoading(false);
    };

    loadHistory();

    return () => {
      ignore = true;
    };
  }, [historyId]);

  const showToast = (message, type = "info") => {
    const container = document.getElementById("qg-toast");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `alert alert-${type} shadow-lg max-w-md w-full`;
    toast.innerHTML = `<div><span>${message}</span></div>`;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add("opacity-0", "transition-opacity"); setTimeout(() => toast.remove(), 500); }, 3000);
  };

  const handlePdfUpload = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setPdfFile(f);
    setPdfLoading(true);
    try {
      const text = await extractTextFromPDF(f);
      setPdfText(text);
      showToast("📄 PDF loaded successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("❌ Failed to read PDF", "error");
      setPdfFile(null);
      setPdfText("");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleRemovePdf = () => {
    setPdfFile(null);
    setPdfText("");
  };

  const toggleType = (key) => {
    setQuestionTypes(prev =>
      prev.includes(key) ? (prev.length > 1 ? prev.filter(k => k !== key) : prev) : [...prev, key]
    );
  };

  const toggleExpand = (typeKey, idx) => {
    const k = `${typeKey}-${idx}`;
    setExpanded(prev => ({ ...prev, [k]: !prev[k] }));
  };

  const copyQuestion = async (text, key) => {
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

   
    const finalContent = pdfFile ? pdfText : content;

    if (!finalContent.trim()) {
      showToast(pdfFile ? "⚠️ PDF seems empty, try another file!" : "⚠️ Please paste your notes or upload a PDF!", "warning");
      return;
    }
    if (questionTypes.length === 0) { showToast("⚠️ Select at least one question type!", "warning"); return; }
    setLoading(true);
    setResult(null);
    setExpanded({});
    try {
      const res = await fetch("/api/tools/generate-questions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: finalContent, questionTypes, includeAnswers }),
      });
      const data = await res.json().catch(() => null);
      if (!data?.success) { showToast(data?.message || "❌ Failed to generate questions", "error"); return; }
      setResult(data.data.questions);
      const initExpanded = {};
      Object.keys(data.data.questions).forEach(k => { if (data.data.questions[k]?.length) initExpanded[`${k}-0`] = true; });
      setExpanded(initExpanded);
      showToast("✅ Questions generated!", "success");
      setTimeout(() => { document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" }); }, 200);
    } catch (err) {
      console.error(err);
      showToast("❌ Error connecting to server", "error");
    } finally {
      setLoading(false);
    }
  };

  const buildPrintHTML = () => {
    if (!result) return "";
    const sections = Object.entries(result).map(([type, qs]) => {
      const c = TYPE_COLORS[type] || TYPE_COLORS["2_marks"];
      const qHTML = qs.map((q, i) => `
        <div style="border:1.5px solid ${c.border};background:${c.bg};border-radius:10px;padding:14px;margin-bottom:12px;page-break-inside:avoid;">
          <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:${includeAnswers && q.answer ? '10px' : '0'}">
            <span style="background:${c.badgeBg};color:${c.badge};font-size:10px;font-weight:700;padding:3px 8px;border-radius:999px;white-space:nowrap;flex-shrink:0;">Q${i + 1}</span>
            <p style="font-size:14px;color:#111827;font-weight:600;margin:0;line-height:1.5;">${q.question}</p>
          </div>
          ${includeAnswers && q.answer ? `
            <div style="margin-top:10px;padding:10px 12px;background:rgba(255,255,255,0.8);border-radius:8px;border-left:3px solid ${c.border};">
              <p style="font-size:11px;font-weight:700;color:#6b7280;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.05em;">Answer</p>
              <p style="font-size:13px;color:#374151;margin:0;line-height:1.6;white-space:pre-line;">${q.answer}</p>
            </div>` : ""}
        </div>`).join("");
      return `
        <div style="margin-bottom:28px;">
          <h2 style="font-size:16px;font-weight:700;color:${c.border};margin:0 0 12px;padding-bottom:6px;border-bottom:2px solid ${c.border};">${TYPE_LABELS[type] || type} Questions</h2>
          ${qHTML}
        </div>`;
    }).join("");

    return `<!doctype html><html><head><meta charset="utf-8"><title>Question Paper</title>
<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:system-ui,-apple-system,'Segoe UI',Arial,sans-serif;color:#111827;background:#fff;padding:12mm 14mm;}@media print{body{padding:6mm 8mm;}@page{margin:6mm;size:A4;}}</style>
</head><body>
<h1 style="font-size:22px;font-weight:700;color:#1e1b4b;margin-bottom:4px;">📝 AI-Generated Question Paper</h1>
<p style="font-size:12px;color:#6b7280;margin-bottom:20px;">Generated by Smart Question Generator • ${new Date().toLocaleDateString()}</p>
${sections}</body></html>`;
  };

  const handleDownload = async () => {
    if (!result) return;
    setDownloading(true);
    const filename = `Questions_${Date.now()}.pdf`;
    const contentHtml = buildPrintHTML();
    try {
      let iframe = null;
      const onMessage = (ev) => {
        try {
          const msg = ev.data || {};
          if (msg.type === "html2pdf-done") showToast("✅ PDF exported", "success");
          else if (msg.type === "html2pdf-error") showToast("❌ PDF export failed", "error");
        } finally {
          window.removeEventListener("message", onMessage);
          try { iframe.remove(); } catch (e) {}
          setDownloading(false);
        }
      };
      window.addEventListener("message", onMessage);
      iframe = document.createElement("iframe");
      iframe.style.cssText = "position:fixed;left:-9999px;top:0;width:800px;height:1122px;";
      iframe.setAttribute("aria-hidden", "true");
      document.body.appendChild(iframe);
      const idoc = iframe.contentDocument || iframe.contentWindow.document;
      idoc.open(); idoc.write(contentHtml); idoc.close();
      idoc.body.setAttribute("data-filename", filename);
      const script = idoc.createElement("script");
      script.type = "text/javascript";
      script.textContent = `(function(){function load(src){return new Promise(function(res,rej){var s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}load('https://unpkg.com/html2pdf.js/dist/html2pdf.bundle.min.js').then(function(){try{var opt={filename:document.body.getAttribute('data-filename')||'${filename}',margin:[10,12,10,12],jsPDF:{unit:'mm',format:'a4',orientation:'portrait'},html2canvas:{scale:2,useCORS:true,logging:false,scrollY:0},pagebreak:{mode:['avoid-all','css','legacy']}};window.html2pdf().from(document.body).set(opt).save().then(function(){parent.postMessage({type:'html2pdf-done'},'*');}).catch(function(err){parent.postMessage({type:'html2pdf-error',error:err&&err.message?err.message:String(err)},'*');});}catch(e){parent.postMessage({type:'html2pdf-error',error:e&&e.message?e.message:String(e)},'*');}}).catch(function(err){parent.postMessage({type:'html2pdf-error',error:err&&err.message?err.message:String(err)},'*');});})();`;
      idoc.body.appendChild(script);
    } catch (err) {
      console.error(err);
      showToast("❌ PDF export failed", "error");
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    const html = buildPrintHTML();
    const win = window.open("", "_blank");
    if (!win) { showToast("❌ Pop-up blocked", "error"); return; }
    win.document.write(html); win.document.close(); win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  const totalQuestions = result ? Object.values(result).reduce((a, arr) => a + (arr?.length || 0), 0) : 0;

  if (historyLoading && !result) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-cyan-950 text-white flex items-center justify-center px-6 pt-24">
        <p className="text-lg text-gray-300">Loading saved questions...</p>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-cyan-950 text-white flex flex-col items-center px-4 sm:px-6 md:px-16 pt-24 pb-16 relative overflow-x-hidden">
    
      <div id="qg-toast" className="fixed bottom-10 right-4 z-50 flex flex-col gap-2 max-w-sm w-full" />

      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-cyan-500/10 blur-[160px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-600/15 blur-[160px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-fuchsia-600/8 blur-[140px] rounded-full -z-10 pointer-events-none" />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:40px_40px] -z-10 pointer-events-none" />

      <div className="w-full max-w-3xl text-center mb-10 mt-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          AI-Powered Exam Prep
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 animate-shimmer bg-[length:300%_100%]">
            Smart Question
          </span>
          <br />
          <span className="text-white">Generator</span>
        </h1>
        <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
          Paste your notes or upload a PDF → get exam-ready questions instantly. Covers 2-mark, 3-mark, and 5-mark formats.
        </p>
      </div>

      {!result && (
        <form onSubmit={handleSubmit} className="w-full max-w-3xl flex flex-col gap-6">

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/40 via-violet-500/40 to-fuchsia-500/40 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500 -z-10" />
            <div className="bg-gray-900/80 border border-white/10 rounded-2xl p-5 backdrop-blur-xl">

             
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  Your Notes / Study Content *
                </label>
                {!pdfFile && (
                  <span className="text-xs text-gray-500">{charCount} chars</span>
                )}
              </div>

              {pdfFile ? (
               
                <div
                  className="w-full flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-8 px-4 text-center"
                  style={{ borderColor: "rgba(34,211,238,0.4)", background: "rgba(34,211,238,0.05)" }}
                >
                  {pdfLoading ? (
                    <>
                      <svg className="animate-spin h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      <p className="text-sm text-cyan-400 font-medium">Reading PDF...</p>
                    </>
                  ) : (
                    <>
                      <FaFilePdf className="text-4xl text-cyan-400" />
                      <div>
                        <p className="text-sm font-semibold text-cyan-300">{pdfFile.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{pdfText.length.toLocaleString()} characters extracted</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePdf}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors mt-1"
                      >
                        <FaTimes className="text-xs" />
                        Remove PDF — switch to text input
                      </button>
                    </>
                  )}
                </div>
              ) : (
                
                <>
                  
                  <label
                    className="flex items-center gap-2 cursor-pointer w-fit mb-3 px-3 py-1.5 rounded-lg border border-dashed border-white/20 hover:border-cyan-500/60 bg-white/5 hover:bg-cyan-500/10 transition-all text-xs text-gray-400 hover:text-cyan-400"
                  >
                    <FaUpload className="text-xs" />
                    Upload PDF instead
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handlePdfUpload}
                    />
                  </label>

                  <textarea
                    rows={9}
                    placeholder={"Paste your full chapter, unit notes, or any study material here...\n\nThe AI will analyze all key concepts and generate exam-relevant questions across your selected marks categories."}
                    value={content}
                    onChange={(e) => { setContent(e.target.value); setCharCount(e.target.value.length); }}
                    className="w-full bg-transparent text-white placeholder-gray-600 text-sm leading-relaxed resize-y outline-none border-none font-mono"
                    style={{ minHeight: 200 }}
                  />
                </>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-400" />
              Question Types to Generate
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {QUESTION_TYPES.map(({ key, label, desc, color, glow }) => {
                const selected = questionTypes.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleType(key)}
                    className="relative rounded-xl p-4 text-left transition-all duration-200 border-2 outline-none"
                    style={{
                      borderColor: selected ? color : "rgba(255,255,255,0.1)",
                      background: selected ? `rgba(${color === "#22d3ee" ? "34,211,238" : color === "#a78bfa" ? "167,139,250" : "244,114,182"},0.08)` : "rgba(255,255,255,0.03)",
                      boxShadow: selected ? `0 0 20px ${glow}` : "none",
                    }}
                  >
                    {selected && (
                      <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center text-black text-xs font-bold" style={{ background: color }}>✓</span>
                    )}
                    <p className="font-bold text-base mb-0.5" style={{ color: selected ? color : "#9ca3af" }}>{label}</p>
                    <p className="text-xs text-gray-500 leading-snug">{desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between bg-gray-900/60 border border-white/10 rounded-xl px-5 py-4 backdrop-blur-sm">
            <div>
              <p className="font-semibold text-sm text-white">Include Answers</p>
              <p className="text-xs text-gray-500 mt-0.5">Show model answers alongside each question</p>
            </div>
            <button
              type="button"
              onClick={() => setIncludeAnswers(v => !v)}
              className="relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0"
              style={{ background: includeAnswers ? "linear-gradient(90deg,#22d3ee,#a78bfa)" : "rgba(255,255,255,0.1)" }}
            >
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300"
                style={{ left: includeAnswers ? "calc(100% - 1.375rem)" : "0.125rem" }}
              />
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || pdfLoading}
            className="relative w-full py-4 rounded-2xl font-bold text-lg overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
            style={{
              background: (loading || pdfLoading) ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #06b6d4, #7c3aed, #ec4899)",
              boxShadow: (loading || pdfLoading) ? "none" : "0 0 40px rgba(124,58,237,0.4), 0 0 80px rgba(6,182,212,0.2)",
            }}
          >
            <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            {loading ? (
              <span className="flex items-center justify-center gap-3 text-gray-400">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Generating Questions...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <FaBrain className="text-xl" />
                Generate Questions
              </span>
            )}
          </button>

          {loading && (
            <p className="text-center text-xs text-gray-500 italic animate-pulse">
              AI is analyzing your notes and crafting exam-relevant questions...
            </p>
          )}
        </form>
      )}

      {result && (
        <div id="results-section" className="w-full max-w-3xl mt-14">

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                <MdQuiz className="text-cyan-400" />
                Generated Questions
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {totalQuestions} questions across {Object.keys(result).length} categories
                {includeAnswers ? " • answers included" : " • answers hidden"}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handlePrint}
                className="px-4 py-2 text-sm font-semibold rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition-all text-gray-300"
              >
                🖨️ Print
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="px-4 py-2 text-sm font-semibold rounded-xl flex items-center gap-2 transition-all"
                style={{ background: "linear-gradient(135deg,#06b6d4,#7c3aed)", boxShadow: "0 0 20px rgba(124,58,237,0.3)" }}
              >
                {downloading ? (
                  <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Exporting...</>
                ) : (
                  <><FaDownload className="text-xs" />Download PDF</>
                )}
              </button>
            </div>
          </div>

          {Object.entries(result).map(([typeKey, questions]) => {
            const c = TYPE_COLORS[typeKey] || TYPE_COLORS["2_marks"];
            const label = TYPE_LABELS[typeKey] || typeKey;
            if (!questions?.length) return null;
            return (
              <div key={typeKey} className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${c.border}, transparent)` }} />
                  <span className="text-sm font-bold px-4 py-1 rounded-full border" style={{ borderColor: c.border, color: c.badge, background: c.badgeBg }}>
                    {label} Questions
                  </span>
                  <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${c.border})` }} />
                </div>

                <div className="flex flex-col gap-3">
                  {questions.map((q, idx) => {
                    const expandKey = `${typeKey}-${idx}`;
                    const isExpanded = !!expanded[expandKey];
                    const isCopied = !!copied[expandKey];
                    return (
                      <div
                        key={idx}
                        className="rounded-xl border transition-all duration-200 overflow-hidden"
                        style={{ borderColor: isExpanded ? c.border : "rgba(255,255,255,0.08)", background: isExpanded ? c.bg : "rgba(255,255,255,0.02)", boxShadow: isExpanded ? `0 0 20px ${c.glow || "transparent"}` : "none" }}
                      >
                        <div className="flex items-start gap-3 p-4">
                          <span className="flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full mt-0.5" style={{ background: c.badgeBg, color: c.badge }}>
                            Q{idx + 1}
                          </span>
                          <p className="flex-1 text-sm text-gray-200 leading-relaxed font-medium pr-2">{q.question}</p>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => copyQuestion(q.question + (q.answer ? `\n\nAnswer: ${q.answer}` : ""), expandKey)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 transition-colors"
                              title="Copy"
                            >
                              {isCopied ? <FaCheckCircle className="text-green-400 text-xs" /> : <FaCopy className="text-xs" />}
                            </button>
                            {includeAnswers && q.answer && (
                              <button
                                onClick={() => toggleExpand(typeKey, idx)}
                                className="p-1.5 rounded-lg transition-colors"
                                style={{ color: isExpanded ? c.badge : "#6b7280" }}
                                title={isExpanded ? "Hide answer" : "Show answer"}
                              >
                                {isExpanded ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
                              </button>
                            )}
                          </div>
                        </div>

                        {includeAnswers && q.answer && isExpanded && (
                          <div
                            className="mx-4 mb-4 p-4 rounded-lg"
                            style={{ background: "rgba(0,0,0,0.3)", borderLeft: `3px solid ${c.border}` }}
                          >
                            <p className="text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: c.badge }}>Answer</p>
                            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{q.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <button
            onClick={() => {
              setResult(null);
              setContent("");
              setExpanded({});
              setCopied({});
              setPdfFile(null);
              setPdfText("");
            }}
            className="group relative overflow-hidden px-6 py-3 rounded-2xl font-bold text-sm sm:text-base tracking-wide transition-all duration-300 hover:scale-[1.03] active:scale-95"
            style={{
              background: "linear-gradient(135deg,#06b6d4,#7c3aed,#ec4899)",
              boxShadow: "0 0 25px rgba(124,58,237,0.35)",
            }}
          >
            <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center gap-2 text-white">
              Generate New Questions
            </span>
          </button>

          <p className="text-center text-xs text-gray-600 mt-6 pb-2">
            Tip: click the arrow on any question to reveal its answer • use Print or Download for offline study
          </p>
        </div>
      )}

      <style>{`
        @keyframes shimmer { 0% { background-position: -100% 0; } 100% { background-position: 100% 0; } }
        .animate-shimmer { animation: shimmer 6s linear infinite; }
      `}</style>
    </section>
  );
}
