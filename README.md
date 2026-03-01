# StudyAI - AI-Powered Study Assistant 🤖📚

[![MERN](https://img.shields.io/badge/Stack-MERN-16a34a?style=for-the-badge)](https://www.mongodb.com/mern-stack)
[![React](https://img.shields.io/badge/Frontend-React_19-0ea5e9?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Express](https://img.shields.io/badge/Backend-Express_4-111827?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB_Atlas-15803d?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Gemini](https://img.shields.io/badge/AI-Google_Gemini-f97316?style=for-the-badge)](https://ai.google.dev/)

## 🏷️ Title
StudyAI - AI-Powered Study Assistant 

## 📖 Overview
StudyAI is a collaborative full-stack web platform that helps students generate study material quickly using AI. It combines authentication, PDF text extraction, and Gemini-powered content generation to produce:
- 📝 Quiz questions (MCQs)
- 🧠 Flashcards
- 📚 Topic-wise notes
- 📄 PDF summary outputs with export support

The frontend is built with React + Vite + Tailwind, while the backend uses Express, MongoDB, JWT cookie auth, and Google Gemini.

## ✨ Features
- User signup/login/logout with JWT cookie-based authentication
- Login rate limiting to reduce brute-force attempts
- AI MCQ generation by topic
- AI flashcard generation from topic/content
- AI note generation from topic/unit/syllabus input
- PDF upload and AI summary generation from extracted text
- Export generated notes/summaries to downloadable PDF
- Route protection for core tools (`/notes`, `/quiz`, `/pdf`, `/flashcard`, `/contact`)
- Single deployment mode: Express serves built frontend (`frontend/dist`)

## 🛠️ Tech Stack
- Frontend: React 19, React Router, Vite, Tailwind CSS, DaisyUI, Framer Motion
- Backend: Node.js, Express, Mongoose, JWT, bcryptjs, cookie-parser, express-rate-limit
- Database: MongoDB Atlas
- AI: Google Gemini via `@google/genai`
- PDF/Text: `pdfjs-dist`, `html2pdf.js`, `jspdf`, `html2canvas`

## ⚙️ Setup
### 1) Clone and install dependencies
```bash
git clone <your-repo-url>
cd College_MP
npm install
npm install --prefix frontend
```

### 2) Configure environment variables
Create a `.env` file in the project root:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

### 3) Run in development
Terminal 1 (backend):
```bash
npm run dev
```

Terminal 2 (frontend):
```bash
npm run dev --prefix frontend
```

- Frontend default: `http://localhost:5173`
- Backend default: `http://localhost:3000`
- Vite proxy is configured for `/api -> http://localhost:3000`

### 4) Production build + run
```bash
npm run build
npm start
```
This builds the frontend and serves it from Express.

## 🌐 Live Link
- 🚀 Live App: `https://studyai-dc2u.onrender.com`

## 🔌 API Snapshot
### 🔐 Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/me`

### 🧠 AI Tools
- `POST /api/tools/generate-mcqs`
- `POST /api/tools/generate-flashcards`
- `POST /api/tools/generate-notes`
- `POST /api/tools/summarize-text`

## 🗂️ Project Structure
```text
College_MP/
  backend/
    controllers/
    middlewares/
    models/
    routes/
    services/
    index.js
  frontend/
    src/
      components/
      pages/
      lib/
    vite.config.js
  package.json
```

## 🛡️ Security Notes
- Uses `httpOnly` auth cookies and password hashing (`bcryptjs`)
- Includes login rate limiting
- Do not commit real secrets in `.env`
- If any keys were exposed previously, rotate them immediately

## 🚀 Project Highlights
- Solves a real student productivity problem with practical AI workflows
- Demonstrates full-stack ownership: UI, API, auth, data, and deployment flow
- Includes production-oriented concerns: route protection, rate limiting, environment config, static asset serving
- Uses modern React ecosystem and LLM integration in a usable product format

## 👨‍💻 Author
- Name: Krish Dua
- Project: StudyAI (Collaborative Project)



