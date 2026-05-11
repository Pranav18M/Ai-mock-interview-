# 🤖 InterviewAI — AI-Powered Mock Interview Platform

A full-stack web application that simulates real job interviews using AI. Candidates answer voice questions from an animated AI interviewer, receive instant scoring, and get detailed feedback reports.

---

## 📸 Features

- 🎙️ **Live Voice Interview** — Split-screen video call UI with webcam + AI robot avatar
- 🧠 **AI-Generated Questions** — Tailored to your resume, role, and experience level
- 📄 **Resume Analysis** — Upload PDF, AI extracts skills and projects automatically
- 📊 **Real-Time Scoring** — Technical knowledge, communication, and relevance scored per answer
- 📋 **Detailed Reports** — Strengths, improvements, skill suggestions, study topics
- 📈 **Progress Tracking** — Full history of all sessions and scores
- 🔍 **ATS Resume Analyzer** — Role-specific ATS score with formatting, grammar, and keyword checks
- 📝 **Resume Generator** — Build and download a professional ATS-friendly resume
- 🔐 **JWT Authentication** — Secure signup/login system
- 📱 **Fully Responsive** — Mobile, tablet, and desktop

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | **Node.js + NestJS + TypeScript** |
| Database | MongoDB Atlas (Mongoose) |
| AI | Google Gemini API |
| Speech | Web Speech API (browser-native) |
| Auth | JWT + Passport |
| PDF Parsing | pdf-parse |
| Password Hashing | bcryptjs |

> ⚡ Backend migrated from Python FastAPI to NestJS — all API endpoints, business logic, and Gemini prompts are 100% preserved.

---

## 📁 Project Structure

```
ai-mock-interview/
├── README.md
│
├── backend/                          # NestJS Backend
│   ├── nest-cli.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                          # ⚠️ Never commit this
│   ├── .env.example
│   ├── .gitignore
│   └── src/
│       ├── main.ts                   # App entry point, CORS config
│       ├── app.module.ts             # Root module
│       ├── app.controller.ts         # Health + root endpoints
│       ├── config/
│       │   ├── configuration.ts      # Env variable loader
│       │   └── database.config.ts    # MongoDB connection factory
│       ├── auth/                     # JWT auth module
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── auth.module.ts
│       │   ├── jwt.strategy.ts
│       │   ├── dto/auth.dto.ts
│       │   ├── guards/jwt-auth.guard.ts
│       │   └── schemas/user.schema.ts
│       ├── resume/                   # Resume upload + parsing
│       │   ├── resume.controller.ts
│       │   ├── resume.service.ts
│       │   ├── resume.module.ts
│       │   ├── resume-parser.service.ts
│       │   └── schemas/resume.schema.ts
│       ├── interview/                # Interview session management
│       │   ├── interview.controller.ts
│       │   ├── interview.service.ts
│       │   ├── interview.module.ts
│       │   ├── dto/interview.dto.ts
│       │   └── schemas/interview.schema.ts
│       ├── ats/                      # ATS resume analyzer
│       │   ├── ats.controller.ts
│       │   ├── ats.service.ts
│       │   └── ats.module.ts
│       ├── resume-generator/         # HTML resume builder
│       │   ├── resume-generator.controller.ts
│       │   ├── resume-generator.service.ts
│       │   ├── resume-generator.module.ts
│       │   └── dto/resume-generator.dto.ts
│       └── ai/                       # Gemini AI service
│           ├── gemini.service.ts
│           └── ai.module.ts
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── package.json
    ├── .env                          # ⚠️ Never commit this
    ├── .gitignore
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── context/
        │   └── AuthContext.jsx
        ├── services/
        │   └── api.js
        ├── hooks/
        │   ├── useSpeechSynthesis.js
        │   └── useSpeechRecognition.js
        ├── components/
        │   └── AppLayout.jsx
        └── pages/
            ├── Landing.jsx
            ├── Login.jsx
            ├── Signup.jsx
            ├── Explore.jsx
            ├── InterviewHub.jsx
            ├── Scores.jsx
            ├── ResumeUpload.jsx
            ├── LiveInterview.jsx
            └── InterviewReport.jsx
```

---

## ⚡ Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier)
- Google AI Studio account (free Gemini API key)

---

### 1. Clone the repo

```bash
git clone https://github.com/Pranav18M/Ai-mock-interview-.git
cd Ai-mock-interview-
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
MONGODB_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ai_mock_interview?retryWrites=true&w=majority
DATABASE_NAME=ai_mock_interview
JWT_SECRET=your_super_secret_key_change_this
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=
PORT=8000
```

Start the backend:

```bash
npm run start:dev
```

API running at: `http://localhost:8000`

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

Start the frontend:

```bash
npm run dev
```

App running at: `http://localhost:5173`

---

## 🔑 Getting API Keys

### MongoDB Atlas
1. Visit [mongodb.com/atlas](https://www.mongodb.com/atlas) → create free cluster
2. Database Access → add a user with password
3. Network Access → add IP `0.0.0.0/0` for development
4. Connect → Drivers → copy connection string into `.env`

### Gemini API Key
1. Visit [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Click **Create API Key** → copy into `.env`

> ⚠️ **Warning:** If your Gemini key is pushed to a public GitHub repo, Google auto-revokes it. Always use `.env` and keep it in `.gitignore`.

---

## 🌐 API Reference

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:----:|
| POST | `/auth/signup` | Register new user | ❌ |
| POST | `/auth/login` | Login, receive JWT | ❌ |

### Resume
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:----:|
| POST | `/resume/upload` | Upload + parse PDF resume | ✅ |
| GET | `/resume` | Get current resume data | ✅ |

### Interview
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:----:|
| POST | `/interview/generate-questions` | AI generates 5 questions | ✅ |
| POST | `/interview/submit-answer` | Submit + score one answer | ✅ |
| POST | `/interview/complete/:id` | Finalize + generate report | ✅ |
| GET | `/interview/history` | All past sessions | ✅ |
| GET | `/interview/report/:id` | Full report for session | ✅ |
| POST | `/interview/greeting` | AI interviewer greeting | ✅ |
| POST | `/interview/intro-response` | AI response to user intro | ✅ |

### ATS Analyzer
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:----:|
| POST | `/ats/analyze` | Analyze resume ATS score | ✅ |

### Resume Generator
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:----:|
| POST | `/resume-gen/preview` | Generate resume HTML preview | ✅ |
| POST | `/resume-gen/download` | Download resume as PDF | ✅ |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| GET | `/health` | Health check |

---

## 🎯 How It Works

```
User signs up / logs in
        ↓
Uploads PDF resume → AI extracts skills, projects, experience
        ↓
Selects job role + difficulty (beginner / intermediate / advanced)
        ↓
Backend calls Gemini API → generates 5 tailored interview questions
        ↓
Live interview screen:
  ┌──────────────────┬──────────────────┐
  │  AI Robot Image  │  User Webcam     │
  │  (video call)    │  (live feed)     │
  └──────────────────┴──────────────────┘
  AI reads question aloud → User speaks answer → Transcript captured
        ↓
Each answer scored by Gemini (1–10):
  • Technical knowledge
  • Communication clarity
  • Relevance to question
        ↓
After 5 questions → Full report generated:
  • Overall score ring
  • Per-question breakdown
  • Strengths / Areas to improve
  • Skill suggestions + study topics
```

---

## 🤖 AI Features

Powered by **Google Gemini API** with automatic model fallback:

| Priority | Model | Free Limit |
|----------|-------|-----------|
| 1st | `gemini-1.5-flash` | 1500 req/day |
| 2nd | `gemini-1.5-flash-8b` | 1500 req/day |
| 3rd | `gemini-1.0-pro` | 60 req/min |

---

## 🗄️ MongoDB Collections

| Collection | Description |
|------------|-------------|
| `users` | User accounts |
| `resumes` | Parsed resume data per user |
| `interviews` | Sessions, answers, scores, feedback |

---

## 📱 Responsive Design

| Breakpoint | Layout |
|------------|--------|
| Mobile `< 768px` | Hamburger nav, stacked video panels, single column |
| Tablet `768–900px` | Horizontal nav, 2-col grids |
| Desktop `> 900px` | Full split layout, sticky image panel, 4-col grids |

---

## 🚀 Production Deployment

### Backend — Render / Railway / Fly.io

```bash
# Start command
npm run start:prod

# Set all .env variables in your platform dashboard
# Update CORS origins in main.ts to allow only your frontend domain
```

### Frontend — Vercel / Netlify

```bash
npm run build
# Deploy the dist/ folder
# Set environment variable: VITE_API_URL=https://your-backend-url.com
```

---

## 🛠️ Development Notes

| Note | Detail |
|------|--------|
| Speech Recognition | Requires Chrome or Edge — Firefox not supported |
| Webcam | Browser permission prompt on first interview load |
| CORS | Configured for localhost + Vercel — restrict for production |
| LiveInterview routing | Requires `location.state` from setup page |
| PDF Upload | Max 5MB, PDF only |

---

## 📦 Backend Dependencies

```
@nestjs/common, @nestjs/core, @nestjs/config
@nestjs/mongoose, mongoose
@nestjs/passport, @nestjs/jwt, passport-jwt
bcryptjs
pdf-parse
class-validator, class-transformer
axios
multer
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 👤 Author

**Pranav** — Full Stack Developer

---

*Built with React, NestJS, MongoDB Atlas, and Google Gemini AI*
