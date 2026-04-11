export const exportToPDF = async ({
  html,
  filename = "notes.pdf",
  onSuccess,
  onError,
  setLoading
}) => {
  if (!html) {
    onError?.("❌ Nothing to export");
    return;
  }

  setLoading?.(true);

  let iframe = null;

  try {
    const onMessage = (ev) => {
      try {
        const msg = ev.data || {};
        if (msg.type === "html2pdf-done") {
          onSuccess?.("✅ PDF exported");
        } else if (msg.type === "html2pdf-error") {
          console.error(msg.error);
          onError?.("❌ PDF failed");
        }
      } finally {
        window.removeEventListener("message", onMessage);
        iframe?.remove();
        setLoading?.(false);
      }
    };

    window.addEventListener("message", onMessage);

    iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.left = "-9999px";
    iframe.style.width = "800px";
    iframe.style.height = "1122px";
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument;
    doc.open();

    doc.write(`
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>

<!-- ✅ Tailwind for styling -->
<script src="https://cdn.tailwindcss.com"></script>

<style>
body {
  margin: 0;
  padding: 20mm;
  font-family: system-ui;
  background: white;
}
.prose h1 { font-size: 24px; color: #b91c1c; }
.prose p { font-size: 14px; line-height: 1.6; }
</style>

</head>
<body data-filename="${filename}">
${html}
</body>
</html>
`);

    doc.close();

    const script = doc.createElement("script");
    script.src = "https://unpkg.com/html2pdf.js/dist/html2pdf.bundle.min.js";

    script.onload = () => {
      doc.defaultView.html2pdf()
        .from(doc.body)
        .set({
          filename,
          margin: 10,
          jsPDF: { unit: "mm", format: "a4" },
          html2canvas: { scale: 3, useCORS: true }
        })
        .save()
        .then(() => {
          window.postMessage({ type: "html2pdf-done" }, "*");
        })
        .catch((err) => {
          window.postMessage({ type: "html2pdf-error", error: err }, "*");
        });
    };

    doc.body.appendChild(script);

  } catch (err) {
    console.error(err);
    onError?.("❌ Export failed");
    iframe?.remove();
    setLoading?.(false);
  }
};