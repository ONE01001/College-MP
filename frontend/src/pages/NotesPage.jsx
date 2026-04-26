import React, { useEffect,useRef, useState } from "react";
import { FaFilePdf, FaUpload, FaBrain, FaDownload } from "react-icons/fa";
import {extractTextFromPDF} from "../lib/extractPDF"
import { useSearchParams } from "react-router-dom";
import { fetchToolHistoryRecord } from "../lib/toolHistory";

const NotesPage = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
const contentRef=useRef();
  const [downloading, setDownloading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
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

      if (!data.success || data.data.toolType !== "notes-summary") {
        setError(data.message || "Failed to load saved summary.");
        setHistoryLoading(false);
        return;
      }

      setPreviewHtml(data.data.outputData?.previewHtml || "");
      setPreviewTitle(data.data.outputData?.previewTitle || "");
      setError(null);
      setHistoryLoading(false);
    };

    loadHistory();

    return () => {
      ignore = true;
    };
  }, [historyId]);

  
  const showToast = (message, type = "info") => {
    const container = document.getElementById("toast-container");
    if (!container) return;
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
    setError(null);

    if (!file) {
      showToast("⚠️ Please upload a PDF file!", "warning");
      return;
    }

    setLoading(true);

    try {
      
      
const extractedText=await extractTextFromPDF(file)

      const res = await fetch(`/api/tools/summarize-text`, {
        method: "POST",
headers:{
  "content-type":"application/json"
},
  body: JSON.stringify({contents: extractedText }),
      });

      
      const data = await res.json().catch(() => null);
if(!data.success){
  showToast(data.message || "❌ Failed to generate summary", "error");
  return
}
      
      
        setPreviewHtml(data.summary);
        
        const tmp = document.createElement("div");
        tmp.innerHTML = data.summary;
        const h1 = tmp.querySelector("h1");
        setPreviewTitle(h1? h1.textContent:"")
        showToast("📘 Summary generated successfully", "success");
    } catch (err) {
      console.error(err);
      showToast("❌ Error connecting to server", "error");
    } finally {
      setLoading(false);
      
      setFile(null);
      
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
      <section className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-blue-950 text-white flex items-center justify-center px-6 pt-24">
        <p className="text-lg text-gray-300">Loading saved summary...</p>
      </section>
    );
  }

  
  if (previewHtml) {
    return (
      <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-purple-950 to-blue-950 text-white px-6 md:px-16 pt-24 relative overflow-auto">
        
        {/* background glows (match page theme) */}
        <div className="absolute top-0 left-0 w-[700px] h-[700px] bg-purple-700/25 blur-[180px] rounded-full -z-10" />
        <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-blue-700/25 blur-[180px] rounded-full -z-10" />

        {/* toast container */}
        <div id="toast-container" className="absolute bottom-10 right-10 toast toast-bottom toast-end z-50 space-y-2" />

        {/* Back button (fixed) */}
        <button
          onClick={handleBackFromPreview}
          className="md:mt-10 px-4 py-2  rounded-full border-2 border-purple-400 text-purple-400 bg-[#161021]/60 hover:bg-purple-400 hover:text-black transition flex items-center gap-2 z-40 shadow-md"
        >
          ← Back
        </button>

        {/* Page header (purple theme) */}
        <h1 className="w-full h-fit mt-4 text-3xl md:text-5xl font-extrabold text-center mb-8 leading-snug bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-blue-300 to-pink-300 animate-shimmer">
          Notes: {previewTitle || "Summary"}
        </h1>

        {/* PDF-like container */}
        <div
          className="w-full max-w-4xl px-2 py-6 md:p-12 bg-white text-black rounded-2xl shadow-2xl z-30 overflow-hidden relative"
          style={{ minHeight: "65vh", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
        >
          {/* toolbar area */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-gray-600">Generated notes — preview mode</div>
            <div className="flex items-center gap-3">
              {/* PDF Download button (iframe + html2canvas inside iframe; returns PDF via postMessage) */}
              <button
                onClick={async () => {
                  if (!previewHtml) {
                    showToast("❌ Nothing to export", "error");
                    return;
                  }
  setDownloading(true);
                  try {
   let iframe = null; 

                    const filename = `${(previewTitle || 'notes').replace(/\s+/g, '_')}.pdf`;

                    // listener to cleanup iframe after work
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

                    // create hidden iframe with isolated document
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
                    idoc.write(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:12mm;background:#fff;color:#111827;font-family:system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial} img{max-width:100%;height:auto}</style></head><body></body></html>`);
                    idoc.close();

                    // inject content and filename
                    idoc.body.innerHTML = previewHtml;
                    idoc.body.setAttribute('data-filename', filename);

                    // inject script that loads html2pdf bundle and runs it
                    const script = idoc.createElement('script');
                    script.type = 'text/javascript';
                    script.textContent = `(function(){
  function load(src){return new Promise(function(res,rej){var s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
  // use the html2pdf bundle which includes html2canvas and jsPDF
  load('https://unpkg.com/html2pdf.js/dist/html2pdf.bundle.min.js').then(function(){
    try{
      // normalize computed colors inside iframe to rgb to be safe
      try{
        var dummy=document.createElement('div');document.body.appendChild(dummy);
        Array.from(document.querySelectorAll('*')).forEach(function(el){
          try{
            var cs=window.getComputedStyle(el);
            ['color','backgroundColor','borderTopColor','borderRightColor','borderBottomColor','borderLeftColor'].forEach(function(p){
              var v=cs[p]; if(!v) return; if(/oklch|lab|lch|color\\(|gradient/i.test(v)){ dummy.style.color=v; var norm=getComputedStyle(dummy).color; if(norm) el.style.setProperty(p.replace(/([A-Z])/g,'-$1').toLowerCase(), norm, 'important'); }
            });
            var bgImg=cs.backgroundImage; if(bgImg && bgImg!=='none' && /oklch|lab|lch|color\\(|gradient/i.test(bgImg)){ el.style.setProperty('background-image','none','important'); var bg=cs.backgroundColor; if(bg){ dummy.style.color=bg; var n=getComputedStyle(dummy).color; if(n) el.style.setProperty('background-color', n, 'important'); }}
          }catch(e){}
        }); dummy.remove();
      }catch(e){}

      // run html2pdf on body
      var opt = { filename: document.body.getAttribute('data-filename') || '${filename}', margin:16, jsPDF:{unit:'mm',format:'a4',orientation:'portrait'}, html2canvas:{scale:2, useCORS:true, logging:false} };
      // html2pdf returns a promise-like chain; use callback
      window.html2pdf().from(document.body).set(opt).save().then(function(){
        parent.postMessage({type:'html2pdf-done'}, '*');
      }).catch(function(err){ parent.postMessage({type:'html2pdf-error', error: err && err.message ? err.message : String(err)}, '*'); });
    }catch(e){ parent.postMessage({type:'html2pdf-error', error: e && e.message ? e.message : String(e)}, '*'); }
  }).catch(function(err){ parent.postMessage({type:'html2pdf-error', error: err && err.message ? err.message : String(err)}, '*'); });
})();`;
                    idoc.body.appendChild(script);

                  } catch (err) {
                    console.error('PDF export failed setup:', err);
                    showToast('❌ PDF export failed', 'error');
                    setDownloading(false);
                  }
                }}
                className="px-3 py-1 rounded-md border border-gray-200 text-sm bg-gray-100 hover:bg-gray-200"
                aria-label="Download PDF"
                title="Download PDF (isolated html2pdf in iframe)"
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
<div className="relative w-full max-w-3xl">

  {/* Left gradient stripe — fixed, does NOT move on scroll */}
  <div
  className="
    absolute left-1.5 top-0 h-full w-1.5
    bg-gradient-to-b from-purple-900 via-purple-500 to-blue-900
    opacity-60 rounded-l-xl z-20 pointer-events-none
  "
/>


  {/* --- Scrollable content box --- */}
  <div
    className="
      relative overflow-auto 
      max-w-none
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
      // ensure inner content doesn't escape rounded corners
      overflow: 'auto',
      boxSizing: 'border-box'
    }}
  >

    {/* HTML injected */}
    <div
    ref={contentRef}
      dangerouslySetInnerHTML={{ __html: previewHtml }}
      className="relative z-10 break-words"
      style={{ wordBreak: 'break-word' }}
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

 

  .prose {
    color: #111827;
  }

 .prose h6 , .prose h1, .prose h2, .prose h3,.prose h4 ,.prose h5  {
    font-weight: 700;
    letter-spacing: -0.5px;
    color:black;
  }
 .prose strong {
    color: black !important;
  }
  .prose h1 {
    color: purple;
    border-bottom: 2px solid #fca5a5;
    padding-bottom: 4px;
    margin-top: 1rem;
    margin-bottom: 1.5rem;
    font-size: 1.50rem;
  }
 

 
  .prose p, .prose li {
    color: #1f2937;
    line-height: 1.7;
    font-size: 0.80rem;
  }

  .prose ul {
    padding-left: 1.25rem;
  }

  .prose ul li::marker {
    color: #c084fc;
  }

 
  .prose blockquote {
    border-left: 4px solid #c084fc;
    padding-left: 1rem;
    color: #4b5563;
    background: #f5f3ff;
    border-radius: 0.5rem;
    font-style: italic;
  }

 
  .prose pre {
    background: #0f172a;
    color: #f1f5f9;
    border-radius: 0.5rem;
    padding: 1rem;
    overflow-x: auto;
    border: 1px solid rgba(168, 85, 247, 0.25);
  }

 
  .prose table {
    border-collapse: collapse;
    width: 100%;
    margin-top: 1rem;
  }

  .prose th {
    background: #ede9fe;
    color: #7c3aed;
    font-weight: 600;
    padding: 8px;
    border: 1px solid #ddd6fe;
  }

  .prose td {
    border: 1px solid #e5e7eb;
    padding: 8px;
  }
`}
</style> */}

        </div>

        {/* small footer / note */}
        <p className="my-8 text-sm text-gray-300">
          Tip: use your browser Print → Save as PDF to export, or hit Back to analyze another file.
        </p>
      </section>
    );
  }

  
  return (
    <section className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-blue-950 text-white flex flex-col items-center justify-center px-6 md:px-16 pt-24 relative overflow-hidden">
      {/* 🧃 Toast Container */}
      <div id="toast-container" className="absolute bottom-10 right-10 toast toast-bottom toast-end z-50 space-y-2"></div>

      {/* ✨ Background Glows */}
      <div className="absolute top-0 left-0 w-[700px] h-[700px] bg-purple-700/25 blur-[180px] rounded-full -z-10"></div>
      <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-blue-700/25 blur-[180px] rounded-full -z-10"></div>

      {/* 💫 Header */}
      <h1 className="w-full mt-6 md:mt-0 text-4xl sm:text-6xl font-extrabold text-center mb-4 leading-snug bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 animate-shimmer bg-[length:300%_100%]">
        Upload and Analyze Notes
      </h1>

      <p className="text-gray-400 text-sm sm:text-lg text-center mb-12 max-w-2xl">
        Submit your PDF notes and let AI summarize, organize, and extract key insights.
      </p>

      {/* 📎 Upload Form (UNCHANGED UI except z-index to ensure preview overlay if needed) */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-gradient-to-br from-gray-900/70 to-gray-800/50 p-10 rounded-3xl border border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.1)] flex flex-col items-center gap-8 w-full max-w-3xl backdrop-blur-lg transition-all duration-500 hover:shadow-[0_0_60px_rgba(168,85,247,0.3)] z-30"
      >
        {/* 📂 File Upload Area (FULL CLICKABLE) */}
        <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-2xl py-10 px-5 cursor-pointer hover:border-purple-500 hover:bg-purple-900/10 transition-all duration-300 text-center">
          <FaUpload className=" text-3xl md:text-5xl text-purple-400 mb-3" />
          {file ? (
            <span className="text-blue-400 font-medium">{file.name}</span>
          ) : (
            <span className="text-gray-400 hover:text-white text-sm md:text-lg font-medium">
              Click anywhere to upload your PDF notes
            </span>
          )}
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
          />
        </label>

        {/* 🌟 Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`flex items-center justify-center gap-3 border-2  md:px-10 px-3  py-3 rounded-full text-sm md:text-lg font-semibold transition duration-300 ${
            loading
              ? "border-gray-600 text-gray-400 cursor-not-allowed"
              : "border-white text-white hover:bg-white hover:text-black"
          }`}
        >
          {loading ? (
            <span>summarizing...</span>
          ) : (
            <>
              <FaBrain className="text-xl text-purple-400" />
              summarize PDF
            </>
          )}
        </button>
        {loading&& <p className="text-gray-300 text-sm text-center italic">
          please wait for around a minutes your notes are being generated
      </p>}

      </form>

      {/* 🌌 Footer */}
      <p className="my-12 md:mt-16 text-sm text-gray-500 text-center tracking-wide">
        ✨ Upload your study material and let AI do the thinking. ggs
      </p>

      {/* 🌈 Animations */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -100% 0; }
          100% { background-position: 100% 0; }
        }
        .animate-shimmer { animation: shimmer 6s linear infinite; }
      `}</style>
    </section>
  );
};

export default NotesPage;
