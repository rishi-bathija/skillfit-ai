import { NextRequest, NextResponse } from 'next/server';
import { assessResponse, calculateFitment } from '@/lib/ai';
import { connectDB } from '@/lib/db';
import { CandidateModel } from '@/lib/models';
import { Language } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { question, answer, language, tradeOrRole } = await req.json();
    const result = await assessResponse(question, answer, language as Language, tradeOrRole);
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Assessment failed' }, { status: 500 });
  }
}
