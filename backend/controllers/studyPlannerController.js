import { gemini } from "../index.js";
import { saveToolHistory } from "../services/toolHistory.js";

export const generateStudyPlan = async (req, res) => {
  const {
    subjectName,
    topics = "",          
    daysUntilExam,
    studyHoursPerDay,
    currentKnowledge = "beginner",
    examType = "university"
  } = req.body;

  if (!subjectName || !daysUntilExam || !studyHoursPerDay) {
    return res.status(400).json({
      success: false,
      message: "Subject name, days until exam, and study hours are required."
    });
  }

  const topicsBlock = topics && topics.trim().length > 0
    ? `
THE STUDENT HAS PROVIDED THE FOLLOWING EXACT SYLLABUS/TOPICS TO COVER:
---
${topics.trim()}
---
CRITICAL INSTRUCTIONS FOR TOPICS:
- You MUST cover EVERY unit, chapter, and subtopic listed above. Do NOT skip any.
- Distribute the ${daysUntilExam} days proportionally based on each unit's complexity and marks weightage (if mentioned).
- Each unit should have its own dedicated phase. Do NOT merge unrelated units into one phase.
- Each day's tasks must reference specific subtopics from the list above — be explicit (e.g., "Study Ohm's Law and series/parallel resistance combinations" not just "Study electricity").
- If the student listed 5 units, create at least 5 phases — one per unit — plus a revision phase at the end.
`
    : `
No specific syllabus was provided. Generate a comprehensive, well-structured study plan for ${subjectName} based on standard ${examType} curriculum for a ${currentKnowledge} level student.
`;

  try {
    const systemInstruction = `
You are an expert AI study planner. You generate detailed, day-by-day exam preparation schedules that MUST cover every topic the student provides.

STRICT RULES:
1. If the input is a valid academic subject/syllabus, generate a complete study plan.
2. If the input is nonsense or completely unrelated to academics, return exactly: 0

OUTPUT FORMAT — return ONLY raw JSON, no markdown, no backticks, no explanation:
{
  "subject": "string",
  "phases": [
    {
      "name": "Phase name (e.g., Unit 1: Chemical Substances)",
      "description": "Brief description of what this phase covers",
      "days": [
        {
          "day": 1,
          "title": "Specific day title referencing actual topic (max 60 chars)",
          "phase": "Same as parent phase name",
          "tasks": [
            "Detailed task referencing exact subtopic from syllabus",
            "Another specific task",
            "Practice/review task"
          ],
          "priority": "critical | high | medium | low",
          "tips": "A concrete, actionable study tip specific to today's topics"
        }
      ]
    }
  ],
  "studyTips": [
    "General tip 1 specific to this subject",
    "General tip 2",
    "General tip 3"
  ]
}

QUALITY RULES:
- Tasks must be SPECIFIC — mention actual topic names, formulas, concepts from the syllabus.
- Never write vague tasks like "study chapter 1" — always name the exact concept.
- The total number of days across ALL phases must equal exactly ${daysUntilExam}.
- Last phase should always be "Revision & Mock Tests" covering the full syllabus.
- Priority should reflect marks weightage or difficulty: high-weightage units = critical/high.
- If invalid input → return exactly: 0
`;

    const contents = `
Generate a ${daysUntilExam}-day study plan.

Subject: ${subjectName}
Student knowledge level: ${currentKnowledge}
Exam type: ${examType}
Daily study hours available: ${studyHoursPerDay} hours
Total days until exam: ${daysUntilExam}

${topicsBlock}

IMPORTANT: The total days in your plan must add up to exactly ${daysUntilExam}. Distribute them wisely across all units/topics. Include a final revision phase of at least 2-3 days.
`.trim();

    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: { systemInstruction }
    });

    console.log("AI raw response:", response.text);

    console.log("Tokens used:", response.usageMetadata?.totalTokenCount);

    // 🔒 Handle invalid/empty AI response
    if (!response.text || response.text.trim() === "0") {
      return res.status(200).json({
        success: false,
        message: "Study plan cannot be generated from the given input."
      });
    }

    let aiPlan;
    try {
      const cleanedText = response.text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      aiPlan = JSON.parse(cleanedText);
    } catch (err) {
      console.error("❌ Failed to parse AI response:", response.text);
      return res.status(500).json({
        success: false,
        message: "Invalid AI response format. Please try again."
      });
    }

    if (!aiPlan || typeof aiPlan !== "object" || !Array.isArray(aiPlan.phases)) {
      return res.status(500).json({
        success: false,
        message: "AI returned an invalid structure. Please try again."
      });
    }

    const schedule = [];
    let dayCounter = 1;

    aiPlan.phases.forEach((phase) => {
      if (!Array.isArray(phase.days)) return;

      phase.days.forEach((dayPlan) => {
        schedule.push({
          day: dayCounter++,
          date: "",
          phase: phase.name || "General",
          title: dayPlan.title || "Study Session",
          tasks: Array.isArray(dayPlan.tasks) ? dayPlan.tasks : [],
          hours: studyHoursPerDay,
          priority: dayPlan.priority || "medium",
          tips: dayPlan.tips || ""
        });
      });
    });

    if (schedule.length === 0) {
      return res.status(500).json({
        success: false,
        message: "AI returned an empty schedule. Please try again."
      });
    }

    if (schedule.length < daysUntilExam) {
      console.warn(`⚠️ AI generated ${schedule.length} days but ${daysUntilExam} were requested.`);
    }

    const payload = {
      success: true,
      plan: {
        subject: aiPlan.subject || subjectName,
        schedule,
        studyTips: Array.isArray(aiPlan.studyTips) ? aiPlan.studyTips : []
      },
      message: "Study plan generated successfully."
    };

    await saveToolHistory({
      userId: req.user.userId,
      toolType: "study-plan",
      routePath: "/study-planner",
      title: subjectName,
      inputPreview: topics.trim().slice(0, 180) || subjectName,
      inputData: {
        subjectName,
        topics,
        examDate: req.body.examDate,
        studyHoursPerDay,
        currentKnowledge,
        examType,
        daysUntilExam,
      },
      outputData: payload.plan,
    });

    return res.status(200).json(payload);

  } catch (error) {
    console.error("🔥 SERVER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate study plan."
    });
  }
};
