# AI Mock Interview Platform — Backend

A production-ready REST API built with **NestJS + MongoDB + Gemini AI**, migrated from Python FastAPI.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS (Node.js + TypeScript) |
| Database | MongoDB Atlas (Mongoose) |
| Authentication | JWT + Passport |
| AI | Google Gemini API |
| PDF Parsing | pdf-parse |
| Password Hashing | bcryptjs |

---

## Project Structure

```
src/
├── main.ts                          # App entry point, CORS config
├── app.module.ts                    # Root module
├── app.controller.ts                # Health + root endpoints
├── config/
│   ├── configuration.ts             # Env variable loader
│   └── database.config.ts           # MongoDB connection factory
├── auth/                            # JWT auth module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── jwt.strategy.ts
│   ├── dto/auth.dto.ts
│   ├── guards/jwt-auth.guard.ts
│   └── schemas/user.schema.ts
├── resume/                          # Resume upload + parsing
│   ├── resume.controller.ts
│   ├── resume.service.ts
│   ├── resume.module.ts
│   ├── resume-parser.service.ts
│   └── schemas/resume.schema.ts
├── interview/                       # Interview session management
│   ├── interview.controller.ts
│   ├── interview.service.ts
│   ├── interview.module.ts
│   ├── dto/interview.dto.ts
│   └── schemas/interview.schema.ts
├── ats/                             # ATS resume analyzer
│   ├── ats.controller.ts
│   ├── ats.service.ts
│   └── ats.module.ts
├── resume-generator/                # HTML resume builder
│   ├── resume-generator.controller.ts
│   ├── resume-generator.service.ts
│   ├── resume-generator.module.ts
│   └── dto/resume-generator.dto.ts
└── ai/                              # Gemini AI service
    ├── gemini.service.ts
    └── ai.module.ts
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/signup` | Register new user |
| POST | `/auth/login` | Login and get JWT token |

### Resume
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/resume/upload` | ✓ | Upload and parse PDF resume |
| GET | `/resume` | ✓ | Get parsed resume data |

### Interview
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/interview/generate-questions` | ✓ | Generate AI interview questions |
| POST | `/interview/submit-answer` | ✓ | Submit and evaluate an answer |
| POST | `/interview/complete/:id` | ✓ | Complete interview and get feedback |
| GET | `/interview/history` | ✓ | Get all past interviews |
| GET | `/interview/report/:id` | ✓ | Get detailed interview report |
| POST | `/interview/greeting` | ✓ | Generate AI interviewer greeting |
| POST | `/interview/intro-response` | ✓ | Generate response to user intro |

### ATS Analyzer
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/ats/analyze` | ✓ | Analyze resume ATS score for a role |

### Resume Generator
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/resume-gen/preview` | ✓ | Generate resume HTML preview |
| POST | `/resume-gen/download` | ✓ | Download resume as PDF |

### Health
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | API info |
| GET | `/health` | Health check |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Google Gemini API key

### Installation

```bash
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
MONGODB_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
DATABASE_NAME=ai_mock_interview
JWT_SECRET=your_jwt_secret_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=
PORT=8000
```

### Running

```bash
# Development (watch mode)
npm run start:dev

# Production build
npm run build
npm run start:prod
```

---

## Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are returned from `/auth/signup` and `/auth/login`.

---

## MongoDB Collections

| Collection | Description |
|---|---|
| `users` | User accounts |
| `resumes` | Parsed resume data per user |
| `interviews` | Interview sessions, answers, scores, feedback |

---

## AI Features

Powered by **Google Gemini API** with automatic model fallback:

1. `gemini-1.5-flash` — primary (1500 req/day free)
2. `gemini-1.5-flash-8b` — fallback 1
3. `gemini-1.0-pro` — fallback 2

Features:
- Personalized interview question generation based on resume
- Real-time answer evaluation with scores
- Final interview feedback with strengths and improvement areas
- ATS resume scoring with role-specific analysis
- AI interviewer greeting and intro response

---

## CORS

Allowed origins:
- `https://mockinterview-ai.vercel.app`
- `http://localhost:5173`
- `http://localhost:3000`
- `https://*.vercel.app` (regex)

---

## Migration Note

This backend is a 1:1 migration from **Python FastAPI** to **NestJS**, preserving all API endpoints, business logic, Gemini prompts, database schema, and JWT behavior. The frontend requires zero changes.
