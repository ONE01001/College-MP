import exprss from "express";
import {generateMCQs,generateFlashcards,generateNotes,summarizeText,generateQuestions} from "../controllers/tools.controller.js";
import { generateStudyPlan } from "../controllers/studyPlannerController.js";
const router = exprss.Router();


router.post("/generate-study-plan", generateStudyPlan);
router.post("/generate-mcqs", generateMCQs);
router.post("/generate-flashcards",generateFlashcards)
router.post("/generate-notes", generateNotes);
router.post("/summarize-text", summarizeText);
router.post("/generate-questions", generateQuestions);


export default router;