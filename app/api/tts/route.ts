import { NextRequest, NextResponse } from 'next/server';
import { textToSpeech } from '@/lib/ai';
import { Language } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { text, language } = await req.json();
    const audioBase64 = await textToSpeech(text, language as Language);
    return NextResponse.json({ audio: audioBase64 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'TTS failed' }, { status: 500 });
  }
}
