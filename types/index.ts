export type Language = 'en' | 'hi' | 'kn';

export type FitmentCategory =
  | 'job_ready'
  | 'needs_training'
  | 'manual_verification'
  | 'low_quality'
  | 'suspected_duplicate';

export type SkillCategory =
  | 'blue_collar'
  | 'polytechnic'
  | 'semi_skilled';

export interface QuestionResponse {
  question: string;
  answer: string;
  audioUrl?: string;
  scores: {
    relevance: number;       // 1-5
    clarity: number;         // 1-5
    confidence: number;      // 1-5
  };
  feedback: string;
}

export interface Candidate {
  _id?: string;
  name: string;
  phone: string;
  district: string;
  language: Language;
  skillCategory: SkillCategory;
  tradeOrRole: string;
  responses: QuestionResponse[];
  overallScore: number;        // 0-100
  fitmentCategory: FitmentCategory;
  faceDetected: boolean;
  audioQuality: 'good' | 'poor' | 'not_checked';
  interviewDuration: number;   // seconds
  createdAt: Date;
  flagged: boolean;
  flagReason?: string;
}

export interface InterviewSession {
  candidateId: string;
  language: Language;
  currentQuestionIndex: number;
  questions: string[];
  responses: QuestionResponse[];
  startTime: number;
}
