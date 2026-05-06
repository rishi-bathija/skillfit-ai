import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/ai';
import { Language } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const language = (formData.get('language') || 'en') as Language;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const transcript = await transcribeAudio(buffer, language, file.type);

    return NextResponse.json({ transcript });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
}
