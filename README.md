# SkillFit AI 🎯

**AI-Powered Multilingual Video Assessment for Karnataka's Workforce**

> AI for Bharat Hackathon — Theme 5 

---

## What It Does

SkillFit AI is a mobile-first PWA that lets candidates from Karnataka's blue-collar and polytechnic workforce take an AI-led video interview in **Kannada, Hindi, or English** — no app download, no typing required.

The AI agent asks role-specific questions, records and transcribes responses using Sarvam AI, scores them using Gemini 2.5 Flash, and classifies each candidate into an actionable fitment category. Government admins get a dashboard to filter, review, and shortlist candidates by district, language, and score.

---

## Live Demo

> Candidate Interview: `https://skillfit-ai-nine.vercel.app`
> Admin Dashboard: `https://skillfit-ai-nine.vercel.app/admin`

---

## Core Modules

| Module | Description | Status |
|--------|-------------|--------|
| Candidate PWA | Mobile-first browser interview, works on low-end Android | ✅ Built |
| AI Interview Agent | Gemini 2.5 Flash questions in Kannada / Hindi / English | ✅ Built |
| Voice Interaction | Sarvam Bulbul v3 speaks questions aloud in candidate's language | ✅ Built |
| STT Transcription | Sarvam Saaras v3 transcribes speech (Kannada-first) | ✅ Built |
| Assessment Engine | LLM scores relevance, clarity, skill confidence (1–5 each) | ✅ Built |
| Face & Audio Validation | face-api.js presence detection + audio quality check | ✅ Built |
| Fitment Classification | 5-category automatic classification | ✅ Built |
| Admin Dashboard | Filter by district, language, fitment — view full transcripts | ✅ Built |
| Duplicate Detection | Cross-candidate fingerprinting | 🔜 v2 |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS (PWA) |
| LLM | Google Gemini 2.5 Flash — questions + assessment |
| Speech-to-Text | Sarvam AI Saaras v3 — Kannada / Hindi / English |
| Text-to-Speech | Sarvam AI Bulbul v3 — AI speaks questions aloud |
| Video Capture | Browser MediaRecorder API — no plugins |
| Face Detection | face-api.js — client-side, no external API |
| Backend | Node.js + Next.js API Routes |
| Database | MongoDB Atlas (free tier) |
| Deployment | Vercel |

**Total API cost: ₹0 — fully free tier stack**

---

## Fitment Categories

| Category | Score | Meaning |
|----------|-------|---------|
| ✅ Job Ready | 75–100 | Strong candidate, ready for placement |
| 📚 Needs Training | 55–74 | Capable but gaps in domain knowledge |
| 🔍 Manual Verification | 35–54 | Mixed signals, needs human review |
| ⚠️ Low Quality | 0–34 | Poor audio or very low scores |
| 🚩 Suspected Duplicate | — | Flagged by integrity checks |

---

## Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/rishi-bathija/skillfit-ai.git
cd skillfit-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key
SARVAM_API_KEY=your_sarvam_api_key
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Getting API keys (all free):**

| Key | Where to get |
|-----|-------------|
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) → Get API Key |
| `SARVAM_API_KEY` | [dashboard.sarvam.ai](https://dashboard.sarvam.ai) → Sign up → API Keys |
| `MONGODB_URI` | [cloud.mongodb.com](https://cloud.mongodb.com) → Free tier cluster → Connect |

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the candidate interview.
Open [http://localhost:3000/admin](http://localhost:3000/admin) for the admin dashboard.

### 5. Deploy to Vercel

```bash
npm run build   # verify build passes
vercel --prod   # deploy
```

Add all `.env.local` variables to your Vercel project settings under **Settings → Environment Variables**.

---

## Candidate Interview Flow

1. Candidate opens the PWA link on their mobile phone (no app install)
2. Selects language — Kannada, Hindi, or English
3. Fills in basic info: name, phone, district, trade/skill
4. Grants camera + microphone permission
5. AI agent **speaks** each question aloud in the candidate's language
6. Candidate records their answer by speaking — no typing
7. Sarvam AI transcribes the audio
8. Gemini AI assesses: relevance, clarity, skill confidence
9. Fitment score generated automatically after all 4 questions
10. Admin sees the candidate on the dashboard instantly

---

## Project Structure

```
skillfit-ai/
├── app/
│   ├── page.tsx                         # Landing page + candidate registration
│   ├── interview/page.tsx               # Video interview flow
│   ├── admin/page.tsx                   # Admin dashboard
│   └── api/
│       ├── interview/questions/route.ts # Generate questions via Gemini
│       ├── assess/route.ts              # Score responses via Gemini
│       ├── transcribe/route.ts          # Transcribe audio via Sarvam
│       ├── tts/route.ts                 # Text-to-speech via Sarvam
│       └── candidates/route.ts          # Save + fetch candidates
├── lib/
│   ├── ai.ts                            # Gemini + Sarvam integration
│   ├── db.ts                            # MongoDB connection
│   └── models.ts                        # Candidate schema
├── types/
│   └── index.ts                         # TypeScript types
├── public/
│   └── manifest.json                    # PWA manifest
└── .env.example                         # Environment variable template
```

---

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/interview/questions` | POST | Generate 4 questions for a trade + language |
| `/api/assess` | POST | Score a candidate response (relevance, clarity, confidence) |
| `/api/transcribe` | POST | Transcribe audio file via Sarvam Saaras v3 |
| `/api/tts` | POST | Convert question text to speech via Sarvam Bulbul v3 |
| `/api/candidates` | POST | Save completed interview + auto-calculate fitment |
| `/api/candidates` | GET | Fetch candidates with optional filters |

---

## Built By

**Rishi Bathija** — Full-Stack Developer

- 🌐 Portfolio: [rishi-works.vercel.app](https://rishi-works.vercel.app)
- 💼 LinkedIn: [linkedin.com/in/rishi-bathija-969982279](https://linkedin.com/in/rishi-bathija-969982279)
- 🐙 GitHub: [github.com/rishi-bathija](https://github.com/rishi-bathija)
