import mongoose, { Schema } from 'mongoose';
import { Candidate } from '@/types';

const QuestionResponseSchema = new Schema({
  question: String,
  answer: String,
  audioUrl: String,
  scores: {
    relevance: Number,
    clarity: Number,
    confidence: Number,
  },
  feedback: String,
});

const CandidateSchema = new Schema<Candidate>({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  district: { type: String, required: true },
  language: { type: String, enum: ['en', 'hi', 'kn'], required: true },
  skillCategory: { type: String, enum: ['blue_collar', 'polytechnic', 'semi_skilled'], required: true },
  tradeOrRole: { type: String, required: true },
  responses: [QuestionResponseSchema],
  overallScore: { type: Number, default: 0 },
  fitmentCategory: {
    type: String,
    enum: ['job_ready', 'needs_training', 'manual_verification', 'low_quality', 'suspected_duplicate'],
    default: 'manual_verification',
  },
  faceDetected: { type: Boolean, default: false },
  audioQuality: { type: String, enum: ['good', 'poor', 'not_checked'], default: 'not_checked' },
  interviewDuration: { type: Number, default: 0 },
  flagged: { type: Boolean, default: false },
  flagReason: String,
  createdAt: { type: Date, default: Date.now },
});

export const CandidateModel =
  mongoose.models.Candidate || mongoose.model<Candidate>('Candidate', CandidateSchema);
