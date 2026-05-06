# SkillFit AI
AI-Powered Multilingual Video Assessment for Karnataka Workforce — AI for Bharat Hackathon Theme 5

## Setup
1. Clone repo and run `npm install`
2. Create `.env.local`:
```
ANTHROPIC_API_KEY=your_key
OPENAI_API_KEY=your_key
MONGODB_URI=your_mongodb_uri
```
3. Run `npm run dev` — open http://localhost:3000
4. Admin dashboard at http://localhost:3000/admin

## Tech Stack
Next.js 14, TypeScript, Claude API, OpenAI Whisper, MongoDB, Vercel

## Modules
- Candidate PWA (mobile-first, no app install)
- AI Interview Agent (Kannada/Hindi/English)
- Response Assessment Engine (Claude API scoring)
- Fitment Classification (5 categories)
- Admin Dashboard (filters, transcripts, scores)

Built by Rishi Bathija | rishi-works.vercel.app
