import { GoogleGenerativeAI } from '@google/generative-ai';
import { Language, SkillCategory, QuestionResponse, FitmentCategory } from '@/types';

console.log('api key gemini', process.env.GEMINI_API_KEY);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  hi: 'Hindi',
  kn: 'Kannada',
};

const SARVAM_LANG_CODES: Record<Language, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  kn: 'kn-IN',
};

// TTS voice per language (Sarvam Bulbul v3)
const SARVAM_VOICES: Record<Language, string> = {
  en: 'anushka',
  hi: 'anushka',
  kn: 'anushka',
};

export async function generateQuestions(
  language: Language,
  skillCategory: SkillCategory,
  tradeOrRole: string
): Promise<string[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const langName = LANGUAGE_NAMES[language];

  const prompt = `You are an AI interviewer for a government workforce assessment platform in Karnataka, India.
Generate exactly 4 interview questions for a candidate applying for: "${tradeOrRole}" (category: ${skillCategory}).
The questions MUST be written in ${langName} language only.
Questions should assess:
1. Basic background and experience
2. Domain/practical skills knowledge
3. A simple problem-solving scenario
4. Availability and motivation

Rules:
- Keep questions simple and conversational — suitable for blue-collar/semi-skilled workers
- No technical jargon
- Each question on a new line, numbered 1-4
- Return ONLY the 4 questions, nothing else`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const lines = text.split('\n').filter(l => l.trim().match(/^\d+[\.\)]/));
  return lines.map(l => l.replace(/^\d+[\.\)]\s*/, '').trim()).filter(Boolean).slice(0, 4);
}

export async function assessResponse(
  question: string,
  answer: string,
  language: Language,
  tradeOrRole: string
): Promise<{ scores: QuestionResponse['scores']; feedback: string }> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  });

  const prompt = `You are an AI assessor for a Karnataka government workforce assessment platform.
Evaluate this candidate response for a "${tradeOrRole}" role.

Question: ${question}
Answer: ${answer}

Score on 3 dimensions (1-5 each):
- relevance: How relevant and complete is the answer?
- clarity: How clearly is it communicated?
- confidence: How much domain knowledge/skill confidence is shown?

Give a brief one-sentence feedback in ${LANGUAGE_NAMES[language]}.

Respond ONLY with this JSON:
{"scores":{"relevance":<1-5>,"clarity":<1-5>,"confidence":<1-5>},"feedback":"<one sentence>"}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    return {
      scores: { relevance: 3, clarity: 3, confidence: 3 },
      feedback: 'Response recorded.',
    };
  }
}

export async function transcribeAudio(
  audioBlob: Buffer,
  language: Language,
  mimeType: string = 'audio/webm'
): Promise<string> {
  try {
    const formData = new FormData();
    const blob = new Blob([audioBlob.buffer as ArrayBuffer], { type: mimeType });
    formData.append('file', blob, `audio.webm`);
    formData.append('model', 'saaras:v3');
    formData.append('language_code', SARVAM_LANG_CODES[language]);
    formData.append('mode', 'transcribe');

    const res = await fetch('https://api.sarvam.ai/speech-to-text', {
      method: 'POST',
      headers: { 'api-subscription-key': process.env.SARVAM_API_KEY! },
      body: formData,
    });

    const data = await res.json();
    return data.transcript || data.text || '';
  } catch (err) {
    console.error('Sarvam STT error:', err);
    return '';
  }
}

export async function textToSpeech(
  text: string,
  language: Language
): Promise<string | null> {
  try {
    const res = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'api-subscription-key': process.env.SARVAM_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: [text],
        target_language_code: SARVAM_LANG_CODES[language],
        speaker: SARVAM_VOICES[language],
        model: 'bulbul:v3',
        enable_preprocessing: true,
      }),
    });

    const data = await res.json();
    // Returns base64 audio
    return data.audios?.[0] || null;
  } catch (err) {
    console.error('Sarvam TTS error:', err);
    return null;
  }
}

export function calculateFitment(
  responses: QuestionResponse[],
  faceDetected: boolean,
  audioQuality: string
): { overallScore: number; fitmentCategory: FitmentCategory } {
  if (responses.length === 0) {
    return { overallScore: 0, fitmentCategory: 'low_quality' };
  }

  const avgScore =
    responses.reduce((acc, r) => {
      return acc + (r.scores.relevance + r.scores.clarity + r.scores.confidence) / 3;
    }, 0) / responses.length;

  let overallScore = Math.round((avgScore / 5) * 100);
  if (!faceDetected) overallScore = Math.max(0, overallScore - 10);
  if (audioQuality === 'poor') overallScore = Math.max(0, overallScore - 10);

  let fitmentCategory: FitmentCategory;
  if (overallScore >= 75) fitmentCategory = 'job_ready';
  else if (overallScore >= 55) fitmentCategory = 'needs_training';
  else if (overallScore >= 35) fitmentCategory = 'manual_verification';
  else fitmentCategory = 'low_quality';

  return { overallScore, fitmentCategory };
}
