import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import NotesPage from "./pages/NotesPage";
import QuizPage from "./pages/QuizPage";
import PdfPage from "./pages/PdfPage";
import Contact from "./pages/Contact";
import FlashcardsPage from "./pages/FlashcardPage";
import AuthPage  from "./pages/Authpage";
import StudyPlannerPage from './pages/StudyPlannerPage';
import QuestionGeneratorPage from "./pages/QuestionGeneratorPage";
import HistoryPage from "./pages/HistoryPage";

const App = () => {
  const [user,setUser]=React.useState(null);

  React.useEffect( () => {
    const fetchUser=async ()=>{
      const response = await fetch(`/api/auth/me`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if(!data.success) {

      }
      else{
        setUser(data.data);

      }
    }
    fetchUser();
  }, [])

  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col">
      <Navbar user={user} setUser={setUser}/>
      <Routes>
        <Route path="/auth" element={user? <HomePage/>:<AuthPage user={user} setUser={setUser}/>}/>
        <Route path="/" element={<HomePage />} />
        <Route path="/notes" element={!user? <AuthPage user={user} setUser={setUser}/>:<NotesPage />} />
        <Route path="/quiz" element={!user? <AuthPage user={user} setUser={setUser}/>:<QuizPage />} />
        <Route path="/pdf" element={!user? <AuthPage user={user} setUser={setUser}/>:<PdfPage />} />
         <Route path="/flashcard" element={!user? <AuthPage user={user} setUser={setUser}/>:<FlashcardsPage />} />
         <Route path="/contact" element={!user? <AuthPage user={user} setUser={setUser}/>:<Contact />} />
         <Route path="/study-planner" element={!user? <AuthPage user={user} setUser={setUser}/>:<StudyPlannerPage />} />
         <Route path="/generate-questions" element={!user? <AuthPage user={user} setUser={setUser}/>:<QuestionGeneratorPage/>} />
         <Route path="/history" element={!user? <AuthPage user={user} setUser={setUser}/>:<HistoryPage />} />
         
      </Routes>
      <Footer />
    </div>
  );
};

export default App;
