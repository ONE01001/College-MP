import React from "react";
import { FileText, ListChecks, Layers, CalendarRange, Sparkles, BookOpenText } from "lucide-react";

const BenefitCard = ({ icon: Icon, title, desc }) => (
  <div
    className="relative w-full p-8 rounded-3xl border border-white/6 
    bg-gradient-to-br from-[#071617]/70 to-[#051012]/50 backdrop-blur-md shadow-xl"
  >
    {/* floating blobs */}
    <div className="pointer-events-none absolute -top-8 -right-8 w-24 h-24 bg-emerald-500/20 blur-2xl rounded-full" />
    <div className="pointer-events-none absolute -bottom-8 -left-8 w-28 h-28 bg-teal-400/10 blur-3xl rounded-full" />

    <div className="flex items-start gap-5">
      <div
        className="flex-none w-14 h-14 rounded-lg flex items-center justify-center 
        bg-gradient-to-tr from-emerald-400/20 to-green-300/10 border border-green-400/10"
      >
        <Icon className="w-7 h-7 text-emerald-300 drop-shadow" />
      </div>

      <div className="flex-1">
        <h3 className="text-xl md:text-2xl font-bold text-white">{title}</h3>
        <p className="mt-3 text-sm md:text-base text-teal-100/80 leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  </div>
);

export default function WebsiteBenefits({ benefits }) {
  const defaultBenefits = benefits || [
    {
      key: "notes-generator",
      title: "AI Notes Generator",
      desc: "Turn a chapter, unit, or even a full syllabus into detailed, well-structured study notes that are easier to understand, faster to revise, and ready to export whenever you need them.",
      icon: FileText,
    },
    {
      key: "quiz-generator",
      title: "Smart Quiz Generator",
      desc: "Create MCQ-based quizzes for any topic and test your understanding instantly through clear, interactive practice sessions that help you revise concepts and spot weak areas quickly.",
      icon: ListChecks,
    },
    {
      key: "notes-summarizer",
      title: "PDF Notes Summarizer",
      desc: "Upload study PDFs and get concise, structured summaries that highlight the most important concepts, definitions, and takeaways, so large material becomes much easier to review.",
      icon: BookOpenText,
    },
    {
      key: "smart-flashcards",
      title: "Interactive Flashcards",
      desc: "Convert topics into revision-friendly flashcards so you can learn actively, review important ideas faster, and strengthen long-term memory retention through repeated practice.",
      icon: Layers,
    },
    {
      key: "study-planner",
      title: "AI Study Planner",
      desc: "Build day-wise study schedules based on your exam date, syllabus, and available study hours so your preparation stays realistic, balanced, and focused from start to finish.",
      icon: CalendarRange,
    },
    {
      key: "question-generator",
      title: "Exam Question Generator",
      desc: "Generate 2-mark, 3-mark, and 5-mark questions with optional answers from your notes or PDFs, making targeted exam preparation more structured, practical, and effective.",
      icon: Sparkles,
    },
  ];

  const cards = benefits || defaultBenefits;

  return (
    <section
    id="tools-overview"
      className="w-full py-24 bg-gradient-to-b from-[#041017] via-[#03110f] to-[#00110f] 
      text-white relative overflow-hidden border-t border-b border-white/10"
    >
      {/* decorative green strip */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-1 bg-gradient-to-r from-transparent via-green-400/40 to-transparent opacity-60 blur-md rounded-b-full" />

      {/* background ambient glows */}
      <div className="absolute -left-20 top-12 w-80 h-80 bg-emerald-600/20 blur-[120px] rounded-full" />
      <div className="absolute right-12 bottom-10 w-96 h-96 bg-teal-500/14 blur-[140px] rounded-full" />

      <div className="max-w-7xl mx-auto px-6 md:px-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why Choose This Website?
          </h2>
          <p className="text-teal-200/80 max-w-3xl mx-auto text-lg md:text-xl leading-relaxed">
            Our platform provides interactive learning tools designed to
            maximize retention, save time, and make studying more efficient and
            enjoyable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
          {cards.map((b) => (
            <BenefitCard
              key={b.key}
              icon={b.icon}
              title={b.title}
              desc={b.desc}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
