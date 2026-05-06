import { NextRequest, NextResponse } from 'next/server';
import { generateQuestions } from '@/lib/ai';
import { Language, SkillCategory } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { language, skillCategory, tradeOrRole } = await req.json();
    const questions = await generateQuestions(
      language as Language,
      skillCategory as SkillCategory,
      tradeOrRole
    );
    return NextResponse.json({ questions });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
  }
}
