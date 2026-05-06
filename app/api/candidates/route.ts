import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { CandidateModel } from '@/lib/models';
import { calculateFitment } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { overallScore, fitmentCategory } = calculateFitment(
      body.responses || [],
      body.faceDetected || false,
      body.audioQuality || 'not_checked'
    );
    const candidate = await CandidateModel.create({
      ...body,
      overallScore,
      fitmentCategory,
      createdAt: new Date(),
    });
    return NextResponse.json({ success: true, candidateId: candidate._id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to save candidate' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const filter: Record<string, string> = {};
    ['district', 'language', 'skillCategory', 'fitmentCategory'].forEach(key => {
      const val = searchParams.get(key);
      if (val && val !== 'all') filter[key] = val;
    });

    const candidates = await CandidateModel.find(filter).sort({ createdAt: -1 }).limit(100);
    return NextResponse.json({ candidates });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
  }
}
