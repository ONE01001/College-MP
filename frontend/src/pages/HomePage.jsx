import React from "react";
import Pdfgenerator from "../components/Pdfgenerator";
import Quizz from "../components/Quizz";
import Notes from "../components/Notes";
import FlashCard from "@/components/FlashCard";
import ToolsOverview from "@/components/ToolsOverview";
import HeroSection from "@/components/HeroSection";
import StudyPlanner from "@/components/StudyPlanner";
import SmartQuestionGenerator from "@/components/SmartQuestionGenerator";

const HomePage = () => {
  return (
    <>
      <HeroSection/>
      <ToolsOverview/>
      <Pdfgenerator />
      <Quizz />
      <Notes />
      <FlashCard/>
      <StudyPlanner/>
      <SmartQuestionGenerator/>
    </>
  );
};

export default HomePage;
