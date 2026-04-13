import {gemini} from "../index.js"

export const generateMCQs = async (req, res) => {
const {topic ,count=10 ,difficulty="medium"} = req.body;

if (!topic || !count || !difficulty) {
    return res.status(400).json({ error: "Topic, count, and difficulty All these fields are required." });
    }
   try{
    const systemInstruction=`
You are an AI quiz generator specialized in academic assessments. 
Your job is to generate high-quality MCQs based on the user's input topic or syllabus.
Maintain educational accuracy and avoid hallucination.
note:- in hard mode also try to keep the questions length medium it can be hard but not too lengthy normal medium length is fine ex around 30-40 words
STRICTLY FOLLOW:-
-firstly analyse the prompt properly if its some kind of study topic  or any kind of thing from which mcqs  can be generated and help in study only then generate mcq otherwise if its look like some chatting type thing not related to the studies or mcq making material then return 0
-if prompt is a "direct question" or nonsense stuff then also return 0

1. You must analyze the topic input:
   - If it is a single topic: generate MCQs directly.
   - If it contains multiple chapters/units/syllabus-level content: 
     identify subtopics and allocate questions evenly.
2. The JSON structure must always follow this exact schema:
{
  "topic": "string",
  "difficulty": "easy | medium | hard",
  "questions": [
    {
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",

    }
  ]
}


example: {
  "topic": "Operating System - Memory Management",
  "difficulty": "medium",
  "questions": [
    {
      "question": "Which memory allocation technique divides memory into fixed size blocks?",
      "options": ["Paging", "Segmentation", "Swapping", "Fragmentation"],
      "correctAnswer": "Paging",
    }
  ]
}

Do not include any text outside JSON. No markdown, no comments.
3. Each question must:
   - Have exactly 4 options
   - Be clear and unambiguous
   - Have only one correct answer
   - Avoid repetitive wording
4. Do NOT number questions or add labels like "1.", "a)" etc.
5. Ensure options are unique and not repeated.
6. If the topic is vague or unclear, make reasonable assumptions based on commonly known academic structure.
7. The response must ALWAYS be valid JSON. No markdown formatting.
`
const contents=`Generate ${count} multiple-choice questions on the topic of ${topic} at a ${difficulty} difficulty level.`

const response = await gemini.models.generateContent({
    model: "gemini-2.5-flash",
    contents,
   config:{
    systemInstruction
   }
   })
   console.log("token used:",response.usageMetadata.totalTokenCount);
   if(response.text==="0"){
res.status(200).json({success:false,message: "MCQs cannot be generated from the given input."});
   }else{
     res.status(200).json({success:true,mcqs: JSON.parse(response.text),message: "MCQs generated successfully."});

  }
  
}
   catch (error) {
    console.error("Error generating MCQs:", error);
    res.status(500).json({success:false, message: "Failed to generate MCQs." });
    }
}

export const generateFlashcards = async (req, res) => {
const {contents} = req.body;
    try {
    const systemInstruction=`
    You are an AI assistant that generates concise, useful flashcards from user-provided content (such as textbook chapters, lecture notes, or PDF text). Your goal is to simplify the material into short, easy-to-remember flashcards optimized for quick revision.
    focus on the important concept and major heading that are relevant or helpful in last minute revision.
Flashcard Content Rules:
-firstly analyse the prompt properly if its some kind of study material  or any kind of thing from which flashcard can be generated only then generate cards otherwise if its look like some chatting type thing not related to the studies or flashcard making material then return 0
-The prompt should only contain the material through which flashcards can be generated otherwise if its some 
direct prompt return 0
-if prompt is a direct question or asking for some non study related thing then also return 0
- Identify only meaningful key points: major concepts, definitions, formulas, facts, and important explanations.
- Avoid duplication, irrelevant text, page numbers, figure references, or formatting descriptions.
- Do NOT repeat long sentences directly unless required for a definition or formula.

Flashcard Structure:
Each flashcard MUST contain exactly:
1) "title" → A short phrase summarizing the concept (3 to 12 words).
2) "description" → A clear explanation of the concept (20 to 60 words).

Output Formatting:
Return the flashcards in clean JSON format as an array of objects:
[
  {
    "title": "Example Concept Title",
    "description": "A short, clear explanation within 20to60 words that captures the essential understanding of the concept."
  }
]
  example output:
  [
  {
    "title": "OSI Model Overview",
    "description": "A conceptual networking framework that divides communication into seven layers. It helps standardize network interactions between systems, enabling interoperability and structured troubleshooting."
  }
]

 note :- Do not include any text outside JSON. No markdown, no comments.and do not put any ''' or '''json around the output just direct json output.

Flashcard Count Logic:
The number of flashcards should depend on the size and density of the input:
- if somehow only topic is given not the conttent them genrerate around 5 to 7 cards according to the topic selfly
- Small input (< 500 words): 4to8 flashcards
- Medium input (500to1500 words): 8to18 flashcards
- Large input (1500to3000 words): 18to35 flashcards
- Extra large input (> 3000 words): first summarize the content, then produce 30to45 flashcards

Maximum Output Rule:
- Do NOT generate more than 45 flashcards under any circumstances.

Tone & Style Guidelines:
- Use simple language and clarity over complexity.
- Avoid long paragraphs, filler sentences, or unnecessary examples.
- Use bullet points only if needed and keep them brief.

If the content is too unclear to form meaningful flashcards, return an empty JSON array.
    `  
const response = await gemini.models.generateContent({
    model: "gemini-2.5-flash",
    contents,
   config:{
    systemInstruction
   }
   })
   console.log("token used:",response.usageMetadata.totalTokenCount);
   if(response.text==="0"){
res.status(200).json({success:false, message: "flashcards cannot be generated from the given input."});
   }else{

     res.status(200).json({success:true, flashcards: JSON.parse(response.text),message: "fc's generated successfully."});
  }

    } catch(error) {
      console.error("Error generating flashcards:", error);
      res.status(500).json({success:false,  message: "Failed to generate flashcards." });
    }
  
  }

export const summarizeText = async (req, res) => {
 let contents=req.body.contents

    try {
    const systemInstruction=`
   You are an AI assistant that summarizes long content such as PDF text, textbook paragraphs, articles, or lecture notes into a clear, structured study summary.


-firstly analyse the prompt or the content properly if its somehting that is related to any kind of study material only then that can relate to studies or a prompt which summary can be generated  onlt then generate summary otherwise if its look like some chatting type thingnor somw question answer type shii then return 0

Your output MUST follow these rules:

1. Output ONLY valid HTML inside a single <div> element. Do NOT include <html>, <head>, or <body> tags.
2. Use clean semantic structure such as: <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, or <em>.
3. The format of the content should feel like structured notes—not a casual paragraph.
4. You may use simple inline CSS in the **style="" attribute** on any allowed HTML tag whenever needed for clean formatting and readability.
5. Allowed inline CSS includes: margin, padding, font-size, font-weight, line-height, color, background-color, border, border-radius, text-align, and list-style-position.
6. Strictly use inline CSS wherever needed to improve readability and visual structure of the summary.
7. Headings must have clear hierarchy using stronger font-weight, larger font-size, and proper top/bottom spacing.
8. Important terms, keywords, labels, definitions, and formulas must be clearly emphasized using <strong> and/or inline font-weight styling.
9. Paragraphs, lists, and sections must have comfortable spacing and readable line-height so the summary is easy to scan.
10. Use a clean readable font style consistently through inline CSS, but keep it simple and PDF-safe.
11. Do NOT use complex styling, animations, flex, grids, scrolling behavior, overflow rules, absolute positioning, fixed sizing that can break wrapping, or layouts that may break PDF formatting.
manage the spacing using <br> tags if needed

 HTML Formatting Rules:
   -ONly and only Allowed tags: <h1>, <h2>, <h3>, <h4>, <p>, <ul>, <ol>, <li>, <strong>, <em>,<br>, <span>, <div>, and <code>.
   -dont use any <a> tag or any kind of link tag
   -use br tags for managing spacing for making content more readable
   -For giving the examples such as writing <h1> or <p> use &lt;h1&gt; or &lt;p&gt; but this is only for giving HTML examples do not use it for the actual content that has to be rendered 
   -use of <pre> tag for anything is also prohibited use only and only allowed tags given above
   - All text must wrap naturally its the most important thing to convert it to the pdf no overflow-auto can be given of any kind. No element should be wide enough to require horizontal scrolling.

Content Guidelines:
- First, create a short introduction summary (2 to 5 sentences).
- Then provide a structured breakdown using section headers and bullet points.
- Highlight key concepts, formulas, definitions, or important facts using <strong>.
- Keep wording concise and student-friendly.
- Avoid overly technical phrasing unless necessary.
- Do NOT repeat exact long text from the input. Rewrite in your own words.
- If the input is unclear or incomplete, infer logically but avoid fabricating detailed facts.

Length Logic:
you have to decide the length and the sections of the summary autonomously divide the content into meaningful sections and key points try to all all the important topics and give their summary accordingly 
note:- try not to make summary very short always try to cover all the topics in brief
IMPORTANT NOTE:- one more very important thing dont be afraid to generate long summary if the content is provided is long because summary is all about covering all the important points in brief if the content is long then summary will also be long thats ok but try to keep it concise as much as possible sp you just have to cover all the things but in brief

Output Format Example:

<div>
  <h1>topic title </h1>
  <p>Short paragraph summarizing the content.</p>

  <h3>Key Concepts</h3>
  <ul>
    <li><strong>Term:</strong> Short explanation.</li>
    <li>Another key idea in short form.</li>
  </ul>

  <h3>Important Points</h3>
  <ul>
    <li>Bullet with meaningful information.</li>
    <li>Another important detail.</li>
  </ul>
</div>

Final Rules:
- Return ONLY the HTML. No markdown, no comments, no explanations.
- Do not include phrases like "Here is the summary:".
- there should not be a single word rahter than the html in the output
    `  
const response = await gemini.models.generateContent({
    model: "gemini-2.5-flash",
    contents,
   config:{
    systemInstruction
   }
   })
   console.log("token used:",response.usageMetadata.totalTokenCount);
   if(response.text==="0"){
res.status(200).json({success:false, message: "summary cannot be generated from the given input."});
   }else{
     res.status(200).json({success:true, summary:response.text,message: "summary generated successfully."});

  }

    } catch(error) {
      console.error("Error generating summary:", error);
      res.status(500).json({success:false,  message: "Failed to generate summary." });
    }
  
}


export const generateNotes = async (req, res) => {
let contents= req.body.contents;
    try {
    const systemInstruction=`You are an AI notes generator that creates extremely detailed and exhaustive study notes based on a provided topic, syllabus, or unit. The output must be structured in clean, semantic HTML suitable for direct rendering and safe conversion into a PDF without any layout breaking.

--------------------
CORE RULES (Follow Strictly):

-firstly analyse the prompt properly if its some syllabus or any kind of topic that can relate to studies only then generate notes otherwise if its look like some chatting type thing or direct ques  then return 0


1. Output ONLY valid HTML wrapped inside one single parent tag:
   <div id="notes"> ... </div>
   - Do NOT include <html>, <head>, <body>, markdown, or external comments.
   - Never include scrollable elements, tables that overflow, or layouts requiring horizontal scrolling.

2. HTML Formatting Rules:
   -ONly and only Allowed tags: <h1>, <h2>, <h3>, <h4>, <p>, <ul>, <ol>, <li>, <strong>, <em>,<br>, <span>, <div>
   -dont use any <a> tag or any kind of link tag and also code tag is also prohibited
   -use of <pre> tag for anything is also prohibited use only and only allowed tags given above
   -For giving the examples such as writing <h1> or <p> use &lt;h1&gt; or &lt;p&gt; but this is only for giving HTML examples do not use it for the actual content that has to be rendered 
   - You may use simple inline CSS in the **style="" attribute** on any allowed HTML tag whenever needed for clean formatting and readability.
   - Allowed inline CSS includes: margin, padding, font-size, font-weight, line-height, color, background-color, border, border-radius, text-align, and list-style-position.
   - Strictly use inline CSS wherever needed to improve readability and visual structure of the notes.
   - Headings must have clear hierarchy using stronger font-weight, larger font-size, and proper top/bottom spacing.
   - Important terms, keywords, labels, definitions, and formulas must be clearly emphasized using <strong> and/or inline font-weight styling.
   - Paragraphs, lists, and sections must have comfortable spacing and readable line-height so the notes are easy to scan.
   - Use a clean readable font style consistently through inline CSS, but keep it simple and PDF-safe.
   - Do NOT use complex styling, animations, flex, grids, scrolling behavior, overflow rules, absolute positioning, fixed sizing that can break wrapping, or layouts that may break PDF formatting.
   - All text must wrap naturally its the most important thing to convert it to the pdf no overflow-auto can be given of any kind. No element should be wide enough to require horizontal scrolling.

3. Content Requirements:
   - Begin with a proper title using <h1>.
   - If the input is a small topic, break it into logical subtopics automatically.
   - If the input is a full syllabus, generate sections and subsections accordingly.
   - For every topic or subtopic, include:
        • Definition or overview  
        • Key concepts and terminology  
        • Important formulas 
        • Examples (optional but preferred)  
        • Common mistakes or misconceptions  
        • Short practice questions (2–4) with brief answers or hints  

4. Language and Depth:
   - Notes must be extremely detailed, thorough, and easy to understand.
   - Use clear educational tone suitable for undergraduate or exam preparation.
   - Do NOT leave major subtopics unexplained.
   - Use token budget wisely: detail is priority, but if the input is very large, summarize less relevant topics briefly while retaining depth for core topics.

5. Output Behavior:
   - No disclaimers, no placeholder text, no model commentary.
   - The output must be final-use ready and not require formatting fixes.
   - Every response should look like a fully formatted document a student can download as a PDF.

--------------------
STRUCTURE REFERENCE (Follow style, not wording):

<div id="notes">
  <h1>Topic Title</h1>   
  <nav>
    <ul>
      <li>1. Subtopic One</li>
      <li>2. Subtopic Two</li>
    </ul>
  </nav>

  <h2>1. Subtopic One</h2>
  <p>Explanation...</p>

  <h3>1.1 Concept</h3>
  <p>Details...</p>
  <pre>Formula or code</pre>

  <p><strong>Example:</strong> Small worked example.</p>
  <p><strong>Practice Questions:</strong></p>
  <ul>
    <li>Q1 ... (hint)</li>
  </ul>
</div>
`

const response = await gemini.models.generateContent({
    model: "gemini-2.5-flash",
    contents,
   config:{
    systemInstruction
   }
   })
   console.log("token used:",response.usageMetadata.totalTokenCount);
if(response.text==="0"){
res.status(200).json({success:false, message: "Notes cannot be generated from the given input."});
   }else{
     res.status(200).json({success:true, notes:response.text,message: "notes generated successfully."});

  }

    } catch(error) {
      console.error("Error generating summary:", error);
      res.status(500).json({ success:false, message: "Failed to generate notes." });
    }
}


export const generateQuestions = async (req, res) => {
  const { content, questionTypes, includeAnswers } = req.body;

  try {
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    if (!Array.isArray(questionTypes) || questionTypes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one question type must be selected",
      });
    }

    if (typeof includeAnswers !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "includeAnswers must be boolean",
      });
    }

    
    const systemInstruction = `
You are an AI exam paper generator.

Your job is to generate IMPORTANT and EXAM-RELEVANT questions from the given study content.

Analyze deeply and focus on:
- Important topics
- Frequently asked concepts
- High-weightage areas

---

Rules:

1. Generate ONLY for the selected question types.
2. DO NOT create any extra category.
3. Maintain order:
   - First 3_marks (if selected)
   - Then 5_marks (if selected)
   - Then remaining selected types

4. Decide number of questions automatically based on:
   - Content length
   - Importance of topics

5. Questions must be:
   - Clear
   - Concept-based
   - Exam-oriented
   - Non-repetitive

6. If includeAnswers = true:
   include answers
   else DO NOT include answers

7. For each selected type atleast 1 question should be there 
---

Output STRICT JSON format:

{
  "questions": {
    "<type>": [
      {
        "question": "",
        "answer": ""
      }
    ]
  }
}

IMPORTANT:
- Keys MUST match selected types EXACTLY (e.g. 2_marks, 3_marks, 5_marks)
- Do NOT include any extra keys
- Return ONLY JSON
`;

    
    const prompt = `
Generate exam questions from the content below.

Selected Question Types: ${questionTypes.join(", ")}
Include Answers: ${includeAnswers}

STRICT RULE:
Generate ONLY for selected types.

Content:
${content}
`;

    
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    console.log("tokens used:", response.usageMetadata?.totalTokenCount);

    let text = response.text;

    
    text = text.replace(/```json|```/g, "").trim();

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.error("JSON Parse Error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to parse AI response",
      });
    }

    
    const filteredQuestions = {};
    questionTypes.forEach((type) => {
      if (parsed.questions && parsed.questions[type]) {
        filteredQuestions[type] = parsed.questions[type];
      } else {
        filteredQuestions[type] = [];
      }
    });

    
    return res.status(200).json({
      success: true,
      data: {
        questions: filteredQuestions,
      },
      message: "Questions generated successfully",
    });

  } catch (error) {
    console.error("Error generating questions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate questions",
    });
  }
};



















