import React, { useEffect, useState } from "react";
import { FaCalendar, FaBrain, FaClock, FaDownload, FaListAlt } from "react-icons/fa";

const StudyPlannerPage = () => {
  const [formData, setFormData] = useState({
    subjectName: '',
    topics: '',
    examDate: '',
    studyHoursPerDay: 2,
    currentKnowledge: 'beginner',
    examType: 'university'
  });

  const [studyPlan, setStudyPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

    if (!formData.subjectName || !formData.examDate) {
      showToast("⚠️ Please fill all required fields!", "warning");
      return;
    }

    const examDate = new Date(formData.examDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntilExam = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExam <= 0) {
      showToast("⚠️ Exam date must be in the future!", "warning");
      return;
    }
    if (daysUntilExam > 365) {
      showToast("⚠️ Exam date should be within 1 year!", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/tools/generate-study-plan`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          subjectName: formData.subjectName,
          topics: formData.topics,
          examDate: formData.examDate,
          studyHoursPerDay: formData.studyHoursPerDay,
          currentKnowledge: formData.currentKnowledge,
          examType: formData.examType,
          daysUntilExam
        }),
      });

      const data = await res.json().catch(() => null);
      if (!data || !data.success) {
        showToast(data?.message || "❌ Failed to generate study plan", "error");
        return;
      }

      setStudyPlan({
        ...data.plan,
        examDate: examDate.toLocaleDateString('en-IN', {
          day: '2-digit', month: 'long', year: 'numeric'
        }),
        totalDays: daysUntilExam,
        totalHours: daysUntilExam * formData.studyHoursPerDay,
        dailyHours: formData.studyHoursPerDay
      });

      showToast("📅 Study plan generated successfully", "success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      showToast("❌ Error connecting to server", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBackFromPreview = () => {
    setStudyPlan(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildPrintableHTML = () => {
    const borderColor = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e' };
    const bgColor     = { critical: '#fef2f2', high: '#fff7ed', medium: '#fefce8', low: '#f0fdf4' };
    const badgeBg     = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e' };

    const statsHtml = `
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;">
        <div style="background:#fefce8;padding:12px;border-radius:10px;border:1px solid #fde68a;">
          <p style="font-size:11px;color:#a16207;font-weight:600;margin:0 0 4px;">Exam Date</p>
          <p style="font-size:13px;font-weight:700;color:#713f12;margin:0;">${studyPlan.examDate}</p>
        </div>
        <div style="background:#fffbeb;padding:12px;border-radius:10px;border:1px solid #fcd34d;">
          <p style="font-size:11px;color:#b45309;font-weight:600;margin:0 0 4px;">Total Days</p>
          <p style="font-size:13px;font-weight:700;color:#78350f;margin:0;">${studyPlan.totalDays} days</p>
        </div>
        <div style="background:#f0fdf4;padding:12px;border-radius:10px;border:1px solid #bbf7d0;">
          <p style="font-size:11px;color:#15803d;font-weight:600;margin:0 0 4px;">Daily Hours</p>
          <p style="font-size:13px;font-weight:700;color:#14532d;margin:0;">${studyPlan.dailyHours} hrs</p>
        </div>
        <div style="background:#fff7ed;padding:12px;border-radius:10px;border:1px solid #fed7aa;">
          <p style="font-size:11px;color:#c2410c;font-weight:600;margin:0 0 4px;">Total Hours</p>
          <p style="font-size:13px;font-weight:700;color:#7c2d12;margin:0;">${studyPlan.totalHours} hrs</p>
        </div>
      </div>`;

    const tipsHtml = studyPlan.studyTips && studyPlan.studyTips.length > 0 ? `
      <div style="margin-bottom:20px;background:#fefce8;border:2px solid #fde68a;border-radius:10px;padding:14px;">
        <p style="font-weight:700;color:#92400e;margin:0 0 8px;">💡 AI Study Tips</p>
        <ul style="margin:0;padding-left:18px;">
          ${studyPlan.studyTips.map(tip =>
            `<li style="font-size:13px;color:#78350f;margin-bottom:5px;">${tip}</li>`
          ).join('')}
        </ul>
      </div>` : '';

    const scheduleHtml = studyPlan.schedule.map(day => `
      <div style="border:2px solid ${borderColor[day.priority] || '#eab308'};background:${bgColor[day.priority] || '#fefce8'};border-radius:10px;padding:14px;margin-bottom:14px;page-break-inside:avoid;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
          <div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px;">
              <span style="font-weight:700;font-size:15px;">Day ${day.day}</span>
              <span style="font-size:11px;color:#6b7280;">• ${day.date || ''}</span>
              <span style="background:${badgeBg[day.priority] || '#eab308'};color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;">${(day.priority || '').toUpperCase()}</span>
            </div>
            <p style="font-size:11px;font-weight:600;color:#6b7280;margin:0 0 2px;">${day.phase || ''}</p>
            <p style="font-weight:700;font-size:14px;color:#111827;margin:0;">${day.title || ''}</p>
          </div>
          <div style="background:#fff;padding:4px 10px;border-radius:8px;border:1px solid #e5e7eb;font-size:12px;font-weight:700;white-space:nowrap;flex-shrink:0;">⏱ ${day.hours}h</div>
        </div>
        <div style="margin-bottom:10px;">
          ${(day.tasks || []).map(task => `
            <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:5px;">
              <span style="color:#d97706;font-size:10px;margin-top:4px;flex-shrink:0;">●</span>
              <span style="font-size:13px;color:#374151;line-height:1.5;">${task}</span>
            </div>`).join('')}
        </div>
        ${day.tips ? `
          <div style="background:rgba(255,255,255,0.75);border:1px solid #e5e7eb;border-radius:8px;padding:10px;">
            <p style="font-size:11px;font-weight:700;color:#6b7280;margin:0 0 4px;">💡 STUDY TIP</p>
            <p style="font-size:12px;color:#374151;margin:0;line-height:1.5;">${day.tips}</p>
          </div>` : ''}
      </div>`).join('');

    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Study Plan — ${formData.subjectName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif; color: #111827; background: #fff; padding: 12mm 14mm; }
    @media print { body { padding: 6mm 8mm; } @page { margin: 6mm; size: A4; } }
  </style>
</head>
<body>
  <h1 style="font-size:22px;font-weight:700;color:#92400e;margin-bottom:6px;">📅 Study Plan: ${formData.subjectName}</h1>
  <p style="font-size:13px;color:#6b7280;margin-bottom:20px;">AI-Generated Study Plan</p>
  ${statsHtml}
  ${tipsHtml}
  <h2 style="font-size:16px;font-weight:700;color:#111827;margin:20px 0 12px;">📆 Day-wise Schedule</h2>
  ${scheduleHtml}
</body>
</html>`;
  };

  const handlePrint = () => {
    const html = buildPrintableHTML();
    const win = window.open('', '_blank');
    if (!win) { showToast("❌ Pop-up blocked — please allow pop-ups.", "error"); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  const downloadPlan = async () => {
    if (!studyPlan) return;
    setDownloading(true);
    const filename = `StudyPlan_${(formData.subjectName || 'plan').replace(/\s+/g, '_')}.pdf`;
    const contentHtml = buildPrintableHTML();

    try {
      let iframe = null;
      const onMessage = (ev) => {
        try {
          const msg = ev.data || {};
          if (msg.type === 'html2pdf-done') showToast('✅ PDF exported', 'success');
          else if (msg.type === 'html2pdf-error') showToast('❌ PDF export failed', 'error');
        } finally {
          window.removeEventListener('message', onMessage);
          try { iframe.remove(); } catch (e) {}
          setDownloading(false);
        }
      };
      window.addEventListener('message', onMessage);

      iframe = document.createElement('iframe');
      iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:800px;height:1122px;';
      iframe.setAttribute('aria-hidden', 'true');
      document.body.appendChild(iframe);

      const idoc = iframe.contentDocument || iframe.contentWindow.document;
      idoc.open(); idoc.write(contentHtml); idoc.close();
      idoc.body.setAttribute('data-filename', filename);

      const script = idoc.createElement('script');
      script.type = 'text/javascript';
      script.textContent = `(function(){
  function load(src){return new Promise(function(res,rej){var s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
  load('https://unpkg.com/html2pdf.js/dist/html2pdf.bundle.min.js').then(function(){
    try{
      try{
        var dummy=document.createElement('div');document.body.appendChild(dummy);
        Array.from(document.querySelectorAll('*')).forEach(function(el){
          try{
            var cs=window.getComputedStyle(el);
            ['color','backgroundColor','borderTopColor','borderRightColor','borderBottomColor','borderLeftColor'].forEach(function(p){
              var v=cs[p];if(!v)return;if(/oklch|lab|lch|color\\(|gradient/i.test(v)){dummy.style.color=v;var norm=getComputedStyle(dummy).color;if(norm)el.style.setProperty(p.replace(/([A-Z])/g,'-$1').toLowerCase(),norm,'important');}
            });
            var bgImg=cs.backgroundImage;if(bgImg&&bgImg!=='none'&&/oklch|lab|lch|color\\(|gradient/i.test(bgImg)){el.style.setProperty('background-image','none','important');var bg=cs.backgroundColor;if(bg){dummy.style.color=bg;var n=getComputedStyle(dummy).color;if(n)el.style.setProperty('background-color',n,'important');}}
          }catch(e){}
        });dummy.remove();
      }catch(e){}
      var opt={filename:document.body.getAttribute('data-filename')||'${filename}',margin:[10,12,10,12],jsPDF:{unit:'mm',format:'a4',orientation:'portrait'},html2canvas:{scale:2,useCORS:true,logging:false,scrollY:0},pagebreak:{mode:['avoid-all','css','legacy']}};
      window.html2pdf().from(document.body).set(opt).save()
        .then(function(){parent.postMessage({type:'html2pdf-done'},'*');})
        .catch(function(err){parent.postMessage({type:'html2pdf-error',error:err&&err.message?err.message:String(err)},'*');});
    }catch(e){parent.postMessage({type:'html2pdf-error',error:e&&e.message?e.message:String(e)},'*');}
  }).catch(function(err){parent.postMessage({type:'html2pdf-error',error:err&&err.message?err.message:String(err)},'*');});
})();`;
      idoc.body.appendChild(script);
    } catch (err) {
      console.error('PDF export failed:', err);
      showToast('❌ PDF export failed', 'error');
      setDownloading(false);
    }
  };

  const getPriorityColor = (p) => ({
    critical: 'border-red-500 bg-red-50',
    high: 'border-orange-500 bg-orange-50',
    medium: 'border-yellow-400 bg-yellow-50',
    low: 'border-green-500 bg-green-50'
  }[p] || 'border-yellow-400 bg-yellow-50');

  const getPriorityBadge = (p) => ({
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  }[p] || 'bg-yellow-500');

  // ── Preview Mode ──────────────────────────────────────────────────────────
  if (studyPlan) {
    return (
      <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-yellow-950 to-black text-white px-6 md:px-16 pt-24 relative overflow-auto">
        <div className="absolute top-0 left-1/4 w-[900px] h-[900px] bg-yellow-500/30 blur-[180px] rounded-full -translate-y-1/2 -z-10" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-yellow-700/20 blur-[180px] rounded-full -z-10" />
        <div id="toast-container" className="absolute bottom-10 right-10 toast toast-bottom toast-end z-50 space-y-2" />

        <button onClick={handleBackFromPreview} className="md:mt-10 px-4 py-2 rounded-full border-2 border-yellow-400 text-yellow-400 bg-black/60 hover:bg-yellow-400 hover:text-black transition flex items-center gap-2 z-40 shadow-md">
          ← Back
        </button>

        <h1 className="w-full h-fit mt-4 text-3xl md:text-5xl font-extrabold text-center mb-8 leading-snug bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 animate-shimmer">
          Study Plan: {formData.subjectName}
        </h1>

        <div className="w-full max-w-4xl px-6 py-8 md:p-12 bg-white text-black rounded-2xl shadow-2xl z-30 relative" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
            <div className="text-sm text-gray-600">AI-Generated Study Plan</div>
            <button onClick={downloadPlan} disabled={downloading} className="px-4 py-2 rounded-md border border-yellow-300 text-sm bg-yellow-50 hover:bg-yellow-100 flex items-center gap-2">
              {downloading ? (
                <><svg className="animate-spin h-4 w-4 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Exporting...</>
              ) : (
                <><FaDownload className="text-yellow-600" />Download</>
              )}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
              <p className="text-xs text-yellow-700 font-semibold mb-1">Exam Date</p>
              <p className="text-sm font-bold text-yellow-900">{studyPlan.examDate}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200">
              <p className="text-xs text-amber-700 font-semibold mb-1">Total Days</p>
              <p className="text-sm font-bold text-amber-900">{studyPlan.totalDays} days</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
              <p className="text-xs text-green-700 font-semibold mb-1">Daily Hours</p>
              <p className="text-sm font-bold text-green-900">{studyPlan.dailyHours} hrs</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
              <p className="text-xs text-orange-700 font-semibold mb-1">Total Hours</p>
              <p className="text-sm font-bold text-orange-900">{studyPlan.totalHours} hrs</p>
            </div>
          </div>

          {/* Study Tips */}
          {studyPlan.studyTips && studyPlan.studyTips.length > 0 && (
            <div className="mb-6 bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
              <h3 className="font-bold text-yellow-900 mb-2">💡 AI Study Tips</h3>
              <ul className="space-y-1">
                {studyPlan.studyTips.map((tip, i) => (
                  <li key={i} className="text-sm text-yellow-800 flex items-start gap-2"><span>•</span><span>{tip}</span></li>
                ))}
              </ul>
            </div>
          )}

          {/* Schedule */}
          <div className="overflow-auto max-h-[500px] space-y-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 sticky top-0 bg-white py-2 z-10">
              <FaCalendar className="text-yellow-500" />
              Day-wise Schedule
            </h3>
            {studyPlan.schedule.map((day, index) => (
              <div key={index} className={`border-2 rounded-xl p-4 ${getPriorityColor(day.priority)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-lg">Day {day.day}</span>
                      <span className="text-xs text-gray-600">• {day.date}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${getPriorityBadge(day.priority)}`}>{day.priority.toUpperCase()}</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-500 mb-0.5">{day.phase}</p>
                    <h4 className="font-bold text-base text-gray-900">{day.title}</h4>
                  </div>
                  <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-lg shadow-sm flex-shrink-0">
                    <FaClock className="text-xs text-yellow-500" />
                    <span className="text-xs font-bold">{day.hours}h</span>
                  </div>
                </div>
                <div className="space-y-1.5 mb-3">
                  {day.tasks.map((task, ti) => (
                    <div key={ti} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{task}</span>
                    </div>
                  ))}
                </div>
                {day.tips && (
                  <div className="bg-white bg-opacity-60 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs font-bold text-gray-600 mb-1">💡 STUDY TIP</p>
                    <p className="text-xs text-gray-700">{day.tips}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="mt-6 grid md:grid-cols-2 gap-3">
            <button onClick={handlePrint} className="bg-yellow-500 text-black py-3 rounded-xl font-semibold hover:bg-yellow-400 transition-all">
              🖨️ Print Plan
            </button>
            <button onClick={handleBackFromPreview} className="bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all">
              ✏️ Create New Plan
            </button>
          </div>
        </div>

        <p className="my-8 text-sm text-gray-300">Tip: use Download to export as PDF, or Print to send to your printer.</p>

        <style>{`
          @keyframes shimmer { 0% { background-position: -100% 0; } 100% { background-position: 100% 0; } }
          .animate-shimmer { animation: shimmer 6s linear infinite; background-size: 300% 100%; }
        `}</style>
      </section>
    );
  }

  // ── Form Mode ─────────────────────────────────────────────────────────────
  return (
    <section className="min-h-screen bg-gradient-to-br from-black via-yellow-950 to-black text-white flex flex-col items-center justify-center px-6 md:px-16 pt-24 relative overflow-hidden">
      <div id="toast-container" className="absolute bottom-10 right-10 toast toast-bottom toast-end z-50 space-y-2" />

      {/* Yellow glow matching StudyPlanner component */}
      <div className="absolute top-1/2 left-1/4 w-[900px] h-[900px] bg-yellow-500/30 blur-[180px] rounded-full -translate-y-1/2 -z-10" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.8)_100%)] -z-10" />

      <h1 className="w-full mt-6 md:mt-0 text-4xl sm:text-6xl font-extrabold text-center mb-4 leading-snug bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 animate-shimmer bg-[length:300%_100%]">
        AI Study Planner
      </h1>
      <p className="text-gray-400 text-sm sm:text-lg text-center mb-12 max-w-2xl">
        Generate a smart day-wise exam preparation schedule powered by AI
      </p>

      <form
        onSubmit={handleSubmit}
        className="relative bg-gradient-to-br from-gray-900/70 to-gray-800/50 p-10 rounded-3xl border border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.1)] flex flex-col gap-6 w-full max-w-3xl backdrop-blur-lg transition-all duration-500 hover:shadow-[0_0_60px_rgba(234,179,8,0.3)] z-30"
      >
        {/* Subject Name */}
        <div>
          <label className="block text-sm font-bold text-gray-300 mb-2">Subject Name *</label>
          <input
            type="text"
            placeholder="e.g., Science, Mathematics, History"
            value={formData.subjectName}
            onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 transition-all outline-none"
            required
          />
        </div>

        {/* Topics / Syllabus */}
        <div>
          <label className="block text-sm font-bold text-gray-300 mb-1 flex items-center gap-2">
            <FaListAlt className="text-yellow-400" />
            Syllabus / Units / Topics
            <span className="text-gray-500 font-normal text-xs">(optional but recommended)</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Paste your full syllabus, unit names, or topic list. The AI will cover <span className="text-yellow-400 font-semibold">every unit and subtopic</span> you provide, distributed across your available days.
          </p>
          <textarea
            rows={8}
            placeholder={`e.g.\nUnit 1: Chemical Reactions — combination, decomposition, oxidation\nUnit 2: Life Processes — nutrition, respiration, transport\nUnit 3: Light — reflection, refraction, lenses\n...\n\nOr paste your entire syllabus — the AI will handle it all.`}
            value={formData.topics}
            onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 transition-all outline-none resize-y text-sm leading-relaxed"
          />
        </div>

        {/* Exam Date */}
        <div>
          <label className="block text-sm font-bold text-gray-300 mb-2">Exam Date *</label>
          <input
            type="date"
            value={formData.examDate}
            onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-xl text-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 transition-all outline-none"
            required
          />
        </div>

        {/* Study Hours */}
        <div>
          <label className="block text-sm font-bold text-gray-300 mb-2">Study Hours per Day</label>
          <div className="relative">
            <input
              type="number"
              min="1"
              max="12"
              value={formData.studyHoursPerDay}
              onChange={(e) => setFormData({ ...formData, studyHoursPerDay: parseInt(e.target.value) || 2 })}
              className="w-full px-4 py-3 pr-12 bg-gray-800/50 border-2 border-gray-700 rounded-xl text-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 transition-all outline-none"
            />
            <FaClock className="absolute right-4 top-4 text-gray-500" />
          </div>
        </div>

        {/* Knowledge Level */}
        <div>
          <label className="block text-sm font-bold text-gray-300 mb-2">Current Knowledge Level</label>
          <select
            value={formData.currentKnowledge}
            onChange={(e) => setFormData({ ...formData, currentKnowledge: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-xl text-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 transition-all outline-none"
          >
            <option value="beginner">Beginner (Starting fresh)</option>
            <option value="intermediate">Intermediate (Some knowledge)</option>
            <option value="advanced">Advanced (Need revision only)</option>
          </select>
        </div>

        {/* Exam Type */}
        <div>
          <label className="block text-sm font-bold text-gray-300 mb-2">Exam Type</label>
          <select
            value={formData.examType}
            onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-xl text-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 transition-all outline-none"
          >
            <option value="university">University Exam</option>
            <option value="competitive">Competitive Exam</option>
            <option value="certification">Certification</option>
            <option value="school">School Exam (CBSE / ICSE / State)</option>
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`flex items-center justify-center gap-3 border-2 px-6 py-4 rounded-full text-lg font-semibold transition duration-300 ${
            loading
              ? "border-gray-600 text-gray-400 cursor-not-allowed"
              : "border-white text-white hover:bg-white hover:text-black"
          }`}
        >
          {loading ? <span>Generating AI Study Plan...</span> : <><FaBrain className="text-xl text-yellow-400" />Generate Study Plan</>}
        </button>

        {loading && (
          <p className="text-gray-300 text-sm text-center italic">
            Please wait — AI is reading your full syllabus and crafting a personalised schedule...
          </p>
        )}
      </form>

      <p className="my-12 md:mt-16 text-sm text-gray-500 text-center tracking-wide">
        ✨ Plan smarter, study better with AI-powered scheduling
      </p>

      <style>{`
        @keyframes shimmer { 0% { background-position: -100% 0; } 100% { background-position: 100% 0; } }
        .animate-shimmer { animation: shimmer 6s linear infinite; }
      `}</style>
    </section>
  );
};

export default StudyPlannerPage;