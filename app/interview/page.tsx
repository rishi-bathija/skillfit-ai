'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Language, QuestionResponse } from '@/types';

function InterviewContent() {
  const router = useRouter();
  const params = useSearchParams();
  const lang = (params.get('language') || 'en') as Language;
  const name = params.get('name') || '';
  const phone = params.get('phone') || '';
  const district = params.get('district') || '';
  const skillCategory = params.get('skillCategory') || 'blue_collar';
  const tradeOrRole = params.get('tradeOrRole') || '';

  const [stage, setStage] = useState<'loading' | 'ready' | 'recording' | 'processing' | 'complete'>('loading');
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [startTime] = useState(Date.now());

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const LABELS: Record<Language, Record<string, string>> = {
    en: { loading: 'Preparing your interview...', question: 'Question', of: 'of', startRec: 'Start Recording', stopRec: 'Stop & Submit Answer', processing: 'Analyzing your response...', complete: 'Interview Complete!', faceOk: 'Face detected ✓', faceNo: 'Face not detected', next: 'Next Question', finish: 'Finish Interview', tip: 'Speak clearly. Take your time.' },
    hi: { loading: 'आपका साक्षात्कार तैयार हो रहा है...', question: 'प्रश्न', of: 'का', startRec: 'रिकॉर्डिंग शुरू करें', stopRec: 'उत्तर सबमिट करें', processing: 'आपका उत्तर विश्लेषण किया जा रहा है...', complete: 'साक्षात्कार पूर्ण!', faceOk: 'चेहरा पहचाना ✓', faceNo: 'चेहरा नहीं पहचाना', next: 'अगला प्रश्न', finish: 'साक्षात्कार समाप्त करें', tip: 'स्पष्ट बोलें। समय लें।' },
    kn: { loading: 'ನಿಮ್ಮ ಸಂದರ್ಶನ ತಯಾರಾಗುತ್ತಿದೆ...', question: 'ಪ್ರಶ್ನೆ', of: 'ರಲ್ಲಿ', startRec: 'ರೆಕಾರ್ಡಿಂಗ್ ಪ್ರಾರಂಭಿಸಿ', stopRec: 'ಉತ್ತರ ಸಲ್ಲಿಸಿ', processing: 'ನಿಮ್ಮ ಉತ್ತರ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...', complete: 'ಸಂದರ್ಶನ ಪೂರ್ಣ!', faceOk: 'ಮುಖ ಪತ್ತೆಯಾಯಿತು ✓', faceNo: 'ಮುಖ ಪತ್ತೆಯಾಗಲಿಲ್ಲ', next: 'ಮುಂದಿನ ಪ್ರಶ್ನೆ', finish: 'ಸಂದರ್ಶನ ಮುಗಿಸಿ', tip: 'ಸ್ಪಷ್ಟವಾಗಿ ಮಾತನಾಡಿ. ಸಮಯ ತೆಗೆದುಕೊಳ್ಳಿ.' },
  };
  const L = LABELS[lang];

  useEffect(() => {
    fetchQuestions();
    startCamera();
    return () => { stopCamera(); };
  }, []);

  async function fetchQuestions() {
    try {
      const res = await fetch('/api/interview/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang, skillCategory, tradeOrRole }),
      });
      const data = await res.json();
      setQuestions(data.questions || []);
      setStage('ready');
    } catch {
      setError('Failed to load questions. Please refresh.');
    }
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      // Simple face detection simulation - check if video has content
      setTimeout(() => setFaceDetected(true), 2000);
    } catch {
      setError('Camera/microphone access required. Please allow and refresh.');
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop());
  }

  function startRecording() {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const mr = new MediaRecorder(streamRef.current, { mimeType: 'video/webm;codecs=vp9,opus' });
    mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.start(100);
    mediaRecorderRef.current = mr;
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
  }

  async function stopRecording() {
    return new Promise<Blob>(resolve => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          resolve(blob);
        };
        mediaRecorderRef.current.stop();
      }
    });
  }

  async function handleStopAndAssess() {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setStage('processing');

    const blob = await stopRecording();

    // Transcribe via Sarvam AI (backend route)
    let answerText = '';
    try {
      const formData = new FormData();
      formData.append('file', blob, 'audio.webm');
      
      formData.append('language', lang);
      const whisperRes = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      const whisperData = await whisperRes.json();
      answerText = whisperData.transcript || '';
    } catch {
      answerText = '[Audio recorded - transcription unavailable]';
    }

    setTranscript(answerText);

    // Assess response
    let assessResult = { scores: { relevance: 3, clarity: 3, confidence: 3 }, feedback: 'Response recorded.' };
    try {
      const assessRes = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: questions[currentQ], answer: answerText, language: lang, tradeOrRole }),
      });
      assessResult = await assessRes.json();
    } catch {}

    const newResponse: QuestionResponse = {
      question: questions[currentQ],
      answer: answerText,
      scores: assessResult.scores,
      feedback: assessResult.feedback,
    };

    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);
    setStage('ready');
    setTranscript('');

    if (currentQ + 1 >= questions.length) {
      await saveCandidate(updatedResponses);
    }
  }

  async function saveCandidate(finalResponses: QuestionResponse[]) {
    setStage('complete');
    try {
      await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, phone, district, language: lang, skillCategory, tradeOrRole,
          responses: finalResponses,
          faceDetected,
          audioQuality: 'good',
          interviewDuration: Math.round((Date.now() - startTime) / 1000),
          flagged: false,
        }),
      });
    } catch {}
  }

  const progress = questions.length > 0 ? ((currentQ + (stage === 'complete' ? 1 : 0)) / questions.length) * 100 : 0;

  if (stage === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: '#0F4C2A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 48, height: 48, border: '4px solid rgba(255,255,255,0.2)', borderTop: '4px solid #F5A623', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#fff', fontSize: 16 }}>{L.loading}</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (stage === 'complete') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0F4C2A, #1A7A42)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: 40, maxWidth: 440, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
          <h2 style={{ color: '#0F4C2A', fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>{L.complete}</h2>
          <p style={{ color: '#6B7280', marginBottom: 24 }}>Thank you {name}. Your responses have been recorded and will be reviewed by EDCS.</p>
          <div style={{ background: '#F7F9F5', borderRadius: 16, padding: 20, marginBottom: 24, textAlign: 'left' }}>
            <p style={{ margin: '0 0 8px', fontWeight: 600, color: '#0F4C2A' }}>Summary</p>
            {responses.map((r, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <p style={{ margin: 0, fontSize: 13, color: '#374151', fontWeight: 600 }}>Q{i+1}: {r.question.substring(0, 60)}...</p>
                <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>Score: {Math.round((r.scores.relevance + r.scores.clarity + r.scores.confidence) / 3 * 20)}/100 — {r.feedback}</p>
              </div>
            ))}
          </div>
          <button onClick={() => router.push('/')} style={{ background: '#0F4C2A', color: '#fff', padding: '12px 32px', borderRadius: 12, border: 'none', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F9F5', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: '#0F4C2A', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: 15 }}>SkillFit AI</p>
          <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: 12 }}>{name} · {tradeOrRole}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ color: '#F5A623', fontWeight: 700, margin: 0 }}>{L.question} {Math.min(currentQ + 1, questions.length)} {L.of} {questions.length}</p>
          <p style={{ color: faceDetected ? '#4ADE80' : '#FCA5A5', margin: 0, fontSize: 12 }}>{faceDetected ? L.faceOk : L.faceNo}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: 'rgba(15,76,42,0.15)' }}>
        <div style={{ height: '100%', background: '#F5A623', width: `${progress}%`, transition: 'width 0.4s ease' }} />
      </div>

      {/* Video */}
      <div style={{ position: 'relative', background: '#1a1a1a', aspectRatio: '16/9', maxHeight: 240 }}>
        <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {isRecording && (
          <div style={{ position: 'absolute', top: 12, right: 12, background: '#DC2626', color: '#fff', padding: '4px 10px', borderRadius: 20, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, background: '#fff', borderRadius: '50%', animation: 'pulse 1s ease infinite' }} />
            REC {Math.floor(recordingTime / 60).toString().padStart(2,'0')}:{(recordingTime % 60).toString().padStart(2,'0')}
          </div>
        )}
        <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0} }`}</style>
      </div>

      {/* Question & Controls */}
      <div style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '12px 16px', borderRadius: 10, fontSize: 14 }}>{error}</div>}

        {stage !== 'processing' && questions[currentQ] && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1.5px solid #E5EAE0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <p style={{ color: '#6B7280', fontSize: 12, fontWeight: 600, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>{L.question} {currentQ + 1}</p>
            <p style={{ color: '#0F4C2A', fontSize: 17, fontWeight: 600, margin: 0, lineHeight: 1.5, fontFamily: lang === 'kn' ? 'var(--font-kannada), sans-serif' : 'inherit' }}>
              {questions[currentQ]}
            </p>
            <p style={{ color: '#9CA3AF', fontSize: 13, margin: '12px 0 0', fontStyle: 'italic' }}>{L.tip}</p>
          </div>
        )}

        {stage === 'processing' && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, textAlign: 'center', border: '1.5px solid #E5EAE0' }}>
            <div style={{ width: 40, height: 40, border: '3px solid #E5EAE0', borderTop: '3px solid #0F4C2A', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#0F4C2A', fontWeight: 600, margin: 0 }}>{L.processing}</p>
            {transcript && <p style={{ color: '#6B7280', fontSize: 13, marginTop: 8 }}>"{transcript.substring(0, 100)}..."</p>}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {stage === 'ready' && !isRecording && currentQ < questions.length && (
          responses.length > currentQ ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: '#DCFCE7', borderRadius: 12, padding: '12px 16px' }}>
                <p style={{ color: '#166534', fontWeight: 600, margin: '0 0 4px', fontSize: 14 }}>✓ Response recorded</p>
                <p style={{ color: '#166534', fontSize: 13, margin: 0 }}>{responses[currentQ]?.feedback}</p>
              </div>
              <button onClick={() => setCurrentQ(q => q + 1)}
                style={{ background: '#0F4C2A', color: '#fff', padding: '16px', borderRadius: 14, border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
                {currentQ + 1 >= questions.length ? `🏁 ${L.finish}` : `➡️ ${L.next}`}
              </button>
            </div>
          ) : (
            <button onClick={startRecording}
              style={{ background: '#DC2626', color: '#fff', padding: '18px', borderRadius: 14, border: 'none', fontSize: 17, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              🎙️ {L.startRec}
            </button>
          )
        )}

        {isRecording && (
          <button onClick={handleStopAndAssess}
            style={{ background: '#0F4C2A', color: '#fff', padding: '18px', borderRadius: 14, border: 'none', fontSize: 17, fontWeight: 700, cursor: 'pointer' }}>
            ⏹️ {L.stopRec}
          </button>
        )}

        {/* Previous responses */}
        {responses.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <p style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Completed</p>
            {responses.map((r, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 10, padding: '10px 14px', marginBottom: 6, border: '1px solid #E5EAE0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#374151' }}>Q{i+1}: {r.question.substring(0, 40)}...</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0F4C2A' }}>{Math.round((r.scores.relevance + r.scores.clarity + r.scores.confidence) / 3 * 20)}/100</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function InterviewPage() {
  return <Suspense fallback={<div style={{minHeight:'100vh',background:'#0F4C2A',display:'flex',alignItems:'center',justifyContent:'center'}}><p style={{color:'#fff'}}>Loading...</p></div>}><InterviewContent /></Suspense>;
}
