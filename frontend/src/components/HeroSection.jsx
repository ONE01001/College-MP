import React from 'react'

const HeroSection = () => {
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full h-[550px] md:min-h-screen relative overflow-hidden">

      {/* BACKGROUND VIDEO (full bleed) */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/Hero.mp4" type="video/mp4" />
      </video>

      {/* subtle background glows */}
      <div className="absolute inset-0 pointer-events-none z-5">
        <div className="absolute top-8 right-8 w-[300px] h-[50px] bg-red-500 blur-[70px] rounded-full opacity-50" />
        <div className="absolute top-20 right-40 w-[250px] h-[50px] bg-green-500 blur-[70px] rounded-full opacity-50" />
        <div className="absolute top-28 right-0 w-[300px] h-[50px] bg-blue-500 blur-[65px] rounded-full opacity-50" />
        <div className="absolute top-10 left-8 w-[300px] h-[50px] bg-purple-900 blur-[90px] rounded-full opacity-50" />
      </div>

      {/* CENTRAL CONTAINER controlling layout of heading+nav and Explore panel */}
      <div className="absolute left-0 right-0 bottom-8 sm:bottom-12 flex items-center justify-center z-10 p-1 sm:p-8 w-full">
        <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-8">

          {/* Heading + Nav buttons (left) */}
          <div className="flex-1 min-w-0 w-full flex flex-col items-start gap-8 sm:gap-6">
            <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl drop-shadow-lg font-extrabold max-w-[95%] sm:max-w-[80%] ">
              AI That Supercharges Your Study Time
            </h1>
             
            <div className="flex flex-wrap items-center gap-1 sm:gap-3 text-white text-xs sm:text-sm font-light mt-2">
              <button onClick={() => scrollToSection('pdf-generator')} className="px-1 py-1">
                NOTES GENERATOR
              </button>
              <span className="text-white/70">\</span>
              <button onClick={() => scrollToSection('quiz')} className="px-1 py-1">
                AI  QUIZ
              </button>
              <span className="text-white/70">\</span>
              <button onClick={() => scrollToSection('notes-summarizer')} className="px-1 py-1">
                NOTES SUMMARIZER
              </button>
              <span className="text-white/70">\</span>
              <button onClick={() => scrollToSection('flashcard')} className="px-1 py-1">
                FLASH CARDS
              </button>
              <span className="text-white/70">\</span>
              <button onClick={() => scrollToSection('study-planner')} className="px-1 py-1">
                STUDY PLANNER
              </button>
              <span className="text-white/70">\</span>
              <button onClick={() => scrollToSection('question-generator')} className="px-1 py-1">
                QUESTION GENERATOR
              </button>
            </div>
          </div>

          {/* Explore / Get Started (right) */}
          <div className="hidden xl:flex flex-col items-center pointer-events-auto justify-center gap-6 w-[35%] ">
            <h6 className="pointer-events-none text-base 2xl:text-lg text-white font-light mb-2 text-center">
              Designing Smarter Study Journeys with the Power of AI
            </h6>
            <div className="flex gap-4">
              <button onClick={() => scrollToSection('tools-overview')} className="border-2 border-white text-white px-6 py-3 rounded-full bg-transparent hover:bg-white hover:text-black transition duration-100">
                Explore
              </button>
              <button onClick={() => scrollToSection('tools-overview')} className="border-2 border-white text-white px-6 py-3 rounded-full bg-transparent hover:bg-white hover:text-black transition duration-100">
                Get Started
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default HeroSection
