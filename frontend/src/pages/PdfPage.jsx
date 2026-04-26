import React, { useEffect, useState } from "react";
import { FaBookOpen, FaMagic, FaRegLightbulb } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import { fetchToolHistoryRecord } from "../lib/toolHistory";





const PdfPage = () => {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);

  const [downloading, setDownloading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState(null);
  const [previewTitle, setPreviewTitle] = useState(""); 
  const [error, setError] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const historyId = searchParams.get("history");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!historyId) return;

    let ignore = false;

    const loadHistory = async () => {
      setHistoryLoading(true);
      const data = await fetchToolHistoryRecord(historyId);

      if (ignore) return;

      if (!data.success || data.data.toolType !== "notes-generator") {
        setError(data.message || "Failed to load saved notes.");
        setHistoryLoading(false);
        return;
      }

      setPreviewHtml(data.data.outputData?.previewHtml || "");
      setPreviewTitle(data.data.outputData?.previewTitle || "");
      setTopic(data.data.inputData?.topic || "");
      setError(null);
      setHistoryLoading(false);
    };

    loadHistory();

    return () => {
      ignore = true;
    };
  }, [historyId]);

  
  const showToast = (message, type = "info") => {
    const toastContainer = document.getElementById("toast-container");
    if (!toastContainer) return;
    const toast = document.createElement("div");
    toast.className = `alert alert-${type} shadow-lg max-w-md w-full`;
    toast.innerHTML = `<div><span>${message}</span></div>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("opacity-0", "transition-opacity");
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!topic.trim()) {
      showToast("⚠️ Please enter a topic first!", "warning");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/tools/generate-notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({contents: topic }),
      });

      
      const data = await res.json().catch(() => null);
if(!data.success){
  showToast(message || "❌ Failed to generate summary", "error");
  return
}
      
        setPreviewHtml(data.notes);
        
        const tmp = document.createElement("div");
        tmp.innerHTML = data.notes;
        const h1 = tmp.querySelector("h1");
        setPreviewTitle(h1? h1.textContent:"")
        showToast("📘 Summary generated successfully", "success");
      
    } catch (err) {
      console.error(err);
      showToast("❌ Error connecting to server", "error");
    } finally {
      setLoading(false);
      setTopic("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  
  const handleBackFromPreview = () => {
    setPreviewHtml(null);
    setPreviewTitle("");
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (historyLoading && !previewHtml) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-black via-red-950 to-rose-950 text-white flex items-center justify-center px-6 pt-24">
        <p className="text-lg text-gray-300">Loading saved notes...</p>
      </section>
    );
  }

  
  if (previewHtml) {
    return (
      <section className="min-h-screen overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-black via-red-950 to-rose-950 text-white px-6 md:px-16 pt-28 relative ">
        <FaBookOpen className="absolute top-58 left-24 text-red-700/30 text-7xl animate-float-slow" />
      <FaRegLightbulb className="absolute bottom-28 left-40 text-yellow-500/25 text-6xl animate-float" />
      <FaMagic className="absolute top-46 right-32 text-rose-400/30 text-7xl rotate-12 animate-float-rev" />
        {/* toast container (keep) */}
        <div id="toast-container" className="absolute top-50 toast toast-bottom toast-end z-50 space-y-2"></div>
<div className="w-full flex flex-col items-center mx-4">
        {/* Back button (fixed) */}
        <button
          onClick={handleBackFromPreview}
          className=" md:mt-10 px-4 py-2 rounded-full border-2 border-red-400 text-red-400 bg-[#2b0f0f]/60 hover:bg-red-400 hover:text-black transition flex items-center gap-2 z-40 shadow-md"
        >
          ← Back
        </button>

        {/* Page header */}
        <h1 className="w-full mt-3 text-3xl md:text-5xl font-extrabold text-center mb-8 leading-snug bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 animate-shimmer">
          Notes: {previewTitle || ""}
        </h1>
</div>
        {/* PDF-like container */}
        <div className="w-full max-w-4xl px-2 py-6 md:p-12 bg-white text-black rounded-2xl shadow-2xl z-30"
             style={{ minHeight: "65vh", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
          {/* toolbar area */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-gray-600">Generated notes — preview mode</div>
            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  if (!previewHtml) {
                    showToast('❌ Nothing to export', 'error');
                    return;
                  }
   setDownloading(true);
                  try {
                     let iframe = null; 
                    const filename = `${(previewTitle || 'notes').replace(/\s+/g, '_')}.pdf`;
  
                    const onMessage = (ev) => {
                      try {
                        const msg = ev.data || {};
                        if (msg && msg.type === 'html2pdf-done') {
                          showToast('✅ PDF exported', 'success');
                        } else if (msg && msg.type === 'html2pdf-error') {
                          console.error('iframe html2pdf error', msg.error);
                          showToast('❌ PDF export failed inside iframe', 'error');
                        }
                      } finally {
                        window.removeEventListener('message', onMessage);
                        try { iframe.remove(); } catch (e) {}
                        setDownloading(false); 
                      }
                    };
  
                    window.addEventListener('message', onMessage);
  
                    iframe = document.createElement('iframe');
                    iframe.style.position = 'fixed';
                    iframe.style.left = '-9999px';
                    iframe.style.top = '0';
                    iframe.style.width = '800px';
                    iframe.style.height = '1122px';
                    iframe.setAttribute('aria-hidden', 'true');
                    document.body.appendChild(iframe);
  
                    const idoc = iframe.contentDocument || iframe.contentWindow.document;
                    idoc.open();
                    idoc.write(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:8mm;background:#fff;color:#111827;font-family:system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial} img{max-width:100%;height:auto}</style></head><body></body></html>`);
                    idoc.close();
  
                    idoc.body.innerHTML = previewHtml;
                    idoc.body.setAttribute('data-filename', filename);
  
                    const script = idoc.createElement('script');
                    script.type = 'text/javascript';
                    script.textContent = `(function(){\n  function load(src){return new Promise(function(res,rej){var s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}\n  load('https://unpkg.com/html2pdf.js/dist/html2pdf.bundle.min.js').then(function(){\n    try{\n      try{\n        var dummy=document.createElement('div');document.body.appendChild(dummy);\n        Array.from(document.querySelectorAll('*')).forEach(function(el){\n          try{\n            var cs=window.getComputedStyle(el);\n            ['color','backgroundColor','borderTopColor','borderRightColor','borderBottomColor','borderLeftColor'].forEach(function(p){\n              var v=cs[p]; if(!v) return; if(/oklch|lab|lch|color\\(|gradient/i.test(v)){ dummy.style.color=v; var norm=getComputedStyle(dummy).color; if(norm) el.style.setProperty(p.replace(/([A-Z])/g,'-$1').toLowerCase(), norm, 'important'); }\n            });\n            var bgImg=cs.backgroundImage; if(bgImg && bgImg!=='none' && /oklch|lab|lch|color\\(|gradient/i.test(bgImg)){ el.style.setProperty('background-image','none','important'); var bg=cs.backgroundColor; if(bg){ dummy.style.color=bg; var n=getComputedStyle(dummy).color; if(n) el.style.setProperty('background-color', n, 'important'); }}\n          }catch(e){}\n        }); dummy.remove();\n      }catch(e){}\n\n      var opt = { filename: document.body.getAttribute('data-filename') || '${filename}', margin:16, jsPDF:{unit:'mm',format:'a4',orientation:'portrait'}, html2canvas:{scale:2, useCORS:true, logging:false} };\n      window.html2pdf().from(document.body).set(opt).save().then(function(){ parent.postMessage({type:'html2pdf-done'}, '*'); }).catch(function(err){ parent.postMessage({type:'html2pdf-error', error: err && err.message ? err.message : String(err)}, '*'); });\n    }catch(e){ parent.postMessage({type:'html2pdf-error', error: e && e.message ? e.message : String(e)}, '*'); }\n  }).catch(function(err){ parent.postMessage({type:'html2pdf-error', error: err && err.message ? err.message : String(err)}, '*'); });\n})();`;
                    idoc.body.appendChild(script);
  
                  } catch (err) {
                    console.error('PDF export failed setup:', err);
                    showToast('❌ PDF export failed', 'error');
                    setDownloading(false); 
                  }
                }}
                className="px-3 py-1 rounded-md border border-gray-200 text-sm bg-gray-100 hover:bg-gray-200"
                aria-label="Print"
                 disabled={downloading}
              >
             {downloading ? (
    <>
      <svg className="animate-spin h-4 w-4 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
      </svg>
      Exporting...
    </> 
  ) : (
    <>Download</>
  )}
              </button>
           </div>
          </div>

          {/* content area (scrollable inside PDF box) */}
{/* --- Wrapper (fixed gradient stripe + scrollbox) --- */}
<div className="relative w-full max-w-3xl">

  {/* Left gradient stripe — fixed, does NOT move on scroll */}
  <div className="absolute left-1.25 top-0 h-full w-1.25 bg-gradient-to-b from-red-500 to-yellow-500 opacity-60 rounded-l-xl z-20 pointer-events-none" />

  {/* --- Scrollable content box --- */}
  <div
    className="
      relative overflow-y-auto max-w-none
      px-8 py-6 rounded-xl 
      bg-gradient-to-br from-white to-gray-50
      shadow-[0_8px_30px_rgba(0,0,0,0.12)]
      border border-gray-200/70
      animate-fadeIn
      ml-1  
    "
    style={{
      maxHeight: "calc(65vh - 60px)",
      paddingRight: 16,
    }}
  >
   

    {/* HTML injected */}
    <div
      dangerouslySetInnerHTML={{ __html: previewHtml }}
      className="relative z-10 "
    />
  </div>
</div>

{/* <style>
{`
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn { animation: fadeIn 0.4s ease-out; }

  .prose h6 , .prose h1 ,.prose h2, .prose h3,.prose h4 ,.prose h5  {
    font-weight: 700;
    letter-spacing: -0.5px;
    color:black;
  }
 .prose strong {
    color: black !important;
  }
  .prose h1 {
    color: #b91c1c;
    border-bottom: 2px solid #fca5a5;
    padding-bottom: 4px;
    margin-top: 1rem;
    margin-bottom: 1.5rem;
    font-size: 1.50rem;
  }

  

  .prose ul li::marker { color: #ef4444; }
  .prose blockquote {
    border-left: 4px solid #ef4444;
    padding-left: 1rem;
    color: black;
    font-style: italic;
  }

  .prose pre {
    background: #111827;
    color: #f3f4f6;
    border-radius: 0.5rem;
    padding: 1rem;
    overflow-x: auto;
  }

  .prose table {
    border-collapse: collapse;
    width: 100%;
  }
  .prose th, .prose td {
    border: 1px solid #e5e7eb;
    padding: 8px;
  }
`}
</style> */}

        </div>

        {/* small footer / note */}
        <p className="my-8 text-sm text-gray-300">
          Tip: use Print to export as PDF, or hit Back to generate another topic.
        </p>

        {/* minor styling for shimmer */}
        <style>{`
          @keyframes shimmer { 0% { background-position: -100% 0; } 100% { background-position: 100% 0; } }
          .animate-shimmer { animation: shimmer 6s linear infinite; background-size: 300% 100%; }
         
          .prose h2 { font-size: 1.5rem; margin-bottom: 0.5rem; }
          .prose h3 { font-size: 1.125rem; margin-top: 0.75rem; }
          .prose p, .prose li { color: #111827; line-height: 1.6; }
          .prose ul { padding-left: 1.25rem; }
        `}</style>
        <style>
        {`
          @keyframes float {0%{transform:translateY(0);}50%{transform:translateY(-12px);}100%{transform:translateY(0);}}
          @keyframes float-slow {0%{transform:translateY(0);}50%{transform:translateY(-8px);}100%{transform:translateY(0);}}
          @keyframes float-rev {0%{transform:translateY(0);}50%{transform:translateY(10px);}100%{transform:translateY(0);}}
          @keyframes shimmer {0%{background-position:-100% 0;}100%{background-position:100% 0;}}
          .animate-float {animation:float 5s ease-in-out infinite;}
          .animate-float-slow {animation:float-slow 7s ease-in-out infinite;}
          .animate-float-rev {animation:float-rev 6s ease-in-out infinite;}
          .animate-shimmer {animation:shimmer 6s linear infinite;}
        `}
      </style>

      </section>
    );
  }

  
  return (
    <section className="min-h-screen bg-gradient-to-br from-black via-red-950 to-rose-950 text-white flex flex-col items-center justify-center px-6 md:px-16 pt-28 relative overflow-hidden">
      {/* 🧃 Toast Container */}
      <div id="toast-container" className="absolute top-50 toast toast-bottom toast-end z-50 space-y-2"></div>

      {/* ✨ Animated Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#1e1e1e_1px,transparent_0)] bg-[size:22px_22px] opacity-10"></div>
      <div className="absolute top-0 left-0 w-[700px] h-[700px] bg-red-700/25 blur-[180px] rounded-full -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-orange-700/25 blur-[180px] rounded-full -z-10 animate-pulse delay-700"></div>
      <div className="absolute bottom-20 left-1/3 w-[400px] h-[400px] bg-rose-500/15 blur-[160px] rounded-full -z-10"></div>

      {/* Floating Icons */}
      <FaBookOpen className="absolute top-38 left-24 text-red-700/30 text-7xl animate-float-slow" />
      <FaRegLightbulb className="absolute bottom-28 left-40 text-yellow-500/25 text-6xl animate-float" />
      <FaMagic className="absolute top-46 right-32 text-rose-400/30 text-7xl rotate-12 animate-float-rev" />

      {/* Header */}
      <h1 className="w-full mt-18 md:mt-0 text-4xl sm:text-6xl font-extrabold text-center mb-4 leading-snug relative bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 animate-shimmer bg-[length:300%_100%]">
        Generate Stunning PDF Notes
      </h1>

      <p className="text-gray-400 text-lg text-center mb-2 max-w-2xl">
        Type a topic and let AI transform it into structured, concise study notes.
      </p>
      <p className="text-red-400/80 text-sm text-center mb-2 italic">
        Perfect for students, researchers, and quick learners.
      </p>
      <p className="text-gray-300 text-sm text-center mb-12 italic">
      Enter whole unit/chapter topic and subtopics or entire syllabus for better results
      </p>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-gradient-to-br from-gray-900/70 to-gray-800/50 p-10 rounded-3xl border border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.1)] flex flex-col items-center gap-6 w-full max-w-2xl backdrop-blur-xl transition-all duration-500 hover:shadow-[0_0_60px_rgba(239,68,68,0.3)] z-30"
      >
        {/* Input Field */}
        <div className="flex items-center w-full gap-3 bg-gray-900/70 border border-gray-700 rounded-xl px-5 py-4 focus-within:border-red-500 transition-all duration-300 shadow-inner hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]">
          <FaBookOpen className="text-2xl text-red-400" />
          <input
            type="text"
            placeholder="Enter a topic (e.g., Quantum Computing)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="bg-transparent outline-none w-full text-white sm:text-lg placeholder-gray-500"
          />
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className={`relative flex items-center justify-center gap-2 border-2 md:px-10 px-3 py-3 rounded-full  text-sm md:text-lg font-semibold overflow-hidden transition duration-300 ${
            loading
              ? "border-gray-600 text-gray-400 cursor-not-allowed"
              : "border-white text-white hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          }`}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-400 opacity-0 hover:opacity-20 blur-xl transition duration-500"></span>
          {loading ? (
            <span>Generating...</span>
          ) : (
            <>
              <FaMagic className="text-xl text-red-400 animate-pulse" />
              Generate PDF
            </>
          )}
        </button>
       {loading&& <p className="text-gray-300 text-sm text-center italic">
          please wait for around 2 minutes your notes are being generated
      </p>}
      </form>

      {/* Footer */}
      <p className="my-12 sm:mt-16 py-4 text-sm text-gray-500 text-center tracking-wide z-10">
        ✨ Powered by AI — turn any idea into well-structured notes effortlessly.
      </p>

      {/* Animations */}
      <style>
        {`
          @keyframes float {0%{transform:translateY(0);}50%{transform:translateY(-12px);}100%{transform:translateY(0);}}
          @keyframes float-slow {0%{transform:translateY(0);}50%{transform:translateY(-8px);}100%{transform:translateY(0);}}
          @keyframes float-rev {0%{transform:translateY(0);}50%{transform:translateY(10px);}100%{transform:translateY(0);}}
          @keyframes shimmer {0%{background-position:-100% 0;}100%{background-position:100% 0;}}
          .animate-float {animation:float 5s ease-in-out infinite;}
          .animate-float-slow {animation:float-slow 7s ease-in-out infinite;}
          .animate-float-rev {animation:float-rev 6s ease-in-out infinite;}
          .animate-shimmer {animation:shimmer 6s linear infinite;}
        `}
      </style>
    </section>
  );
};

export default PdfPage;
