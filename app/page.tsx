'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Language, SkillCategory } from '@/types';

const DISTRICTS = ['Bengaluru Urban', 'Mysuru', 'Belagavi', 'Mangaluru', 'Hubballi', 'Dharwad', 'Kalaburagi', 'Ballari', 'Shivamogga', 'Tumakuru', 'Other'];
const TRADES = ['Electrician', 'Plumber', 'Carpenter', 'Welder', 'Mason', 'Fitter', 'Driver', 'Security Guard', 'Construction Worker', 'Factory Operator', 'Mechanic', 'Other'];

export default function HomePage() {
  const router = useRouter();
  const [step, setStep] = useState<'lang' | 'form'>('lang');
  const [lang, setLang] = useState<Language>('en');
  const [form, setForm] = useState({ name: '', phone: '', district: '', skillCategory: 'blue_collar' as SkillCategory, tradeOrRole: '' });
  const [loading, setLoading] = useState(false);

  const LABELS = {
    en: { title: 'SkillFit AI', sub: 'Workforce Assessment Platform', welcome: 'Welcome! Choose your language to begin.', start: 'Start Interview', name: 'Full Name', phone: 'Mobile Number', district: 'District', skill: 'Skill Category', trade: 'Trade / Role', next: 'Next', categories: { blue_collar: 'Blue Collar', polytechnic: 'Polytechnic', semi_skilled: 'Semi-Skilled' } },
    hi: { title: 'स्किलफिट AI', sub: 'कार्यबल मूल्यांकन प्लेटफॉर्म', welcome: 'स्वागत है! शुरू करने के लिए अपनी भाषा चुनें।', start: 'साक्षात्कार शुरू करें', name: 'पूरा नाम', phone: 'मोबाइल नंबर', district: 'जिला', skill: 'कौशल श्रेणी', trade: 'व्यापार / भूमिका', next: 'आगे', categories: { blue_collar: 'ब्लू कॉलर', polytechnic: 'पॉलिटेक्निक', semi_skilled: 'अर्ध-कुशल' } },
    kn: { title: 'SkillFit AI', sub: 'ಉದ್ಯೋಗ ಮೌಲ್ಯಮಾಪನ ವೇದಿಕೆ', welcome: 'ಸ್ವಾಗತ! ಪ್ರಾರಂಭಿಸಲು ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ.', start: 'ಸಂದರ್ಶನ ಪ್ರಾರಂಭಿಸಿ', name: 'ಪೂರ್ಣ ಹೆಸರು', phone: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ', district: 'ಜಿಲ್ಲೆ', skill: 'ಕೌಶಲ್ಯ ವರ್ಗ', trade: 'ವ್ಯಾಪಾರ / ಪಾತ್ರ', next: 'ಮುಂದೆ', categories: { blue_collar: 'ಬ್ಲೂ ಕಾಲರ್', polytechnic: 'ಪಾಲಿಟೆಕ್ನಿಕ್', semi_skilled: 'ಅರೆ-ಕುಶಲ' } },
  };

  const L = LABELS[lang];

  const handleStart = async () => {
    if (!form.name || !form.phone || !form.district || !form.tradeOrRole) return;
    setLoading(true);
    const params = new URLSearchParams({ ...form, language: lang });
    router.push(`/interview?${params.toString()}`);
  };

  if (step === 'lang') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0F4C2A 0%, #1A7A42 50%, #0F4C2A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, background: '#F5A623', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 32 }}>🎯</div>
          <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 700, margin: '0 0 8px' }}>SkillFit AI</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 40, fontSize: 15 }}>Government of Karnataka — Workforce Assessment</p>
          <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 24, fontSize: 16 }}>Choose your language / ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ / भाषा चुनें</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[['en', '🇬🇧 English', 'Continue in English'], ['kn', '🇮🇳 ಕನ್ನಡ', 'ಕನ್ನಡದಲ್ಲಿ ಮುಂದುವರಿಯಿರಿ'], ['hi', '🇮🇳 हिंदी', 'हिंदी में जारी रखें']].map(([l, flag, label]) => (
              <button key={l} onClick={() => { setLang(l as Language); setStep('form'); }}
                style={{ background: lang === l ? '#F5A623' : 'rgba(255,255,255,0.1)', color: lang === l ? '#0F4C2A' : '#fff', border: '2px solid rgba(255,255,255,0.2)', borderRadius: 14, padding: '16px 24px', fontSize: 16, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                {flag} &nbsp; {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0F4C2A 0%, #1A7A42 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '32px 24px', maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0F4C2A', margin: 0 }}>{L.title}</h2>
          <p style={{ color: '#6B7280', fontSize: 13, margin: '4px 0 0' }}>{L.sub}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[['name', L.name, 'text'], ['phone', L.phone, 'tel']].map(([key, label, type]) => (
            <div key={key}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{label} *</label>
              <input type={type} value={form[key as keyof typeof form]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #E5EAE0', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{L.district} *</label>
            <select value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #E5EAE0', fontSize: 15, outline: 'none', background: '#fff' }}>
              <option value="">Select district...</option>
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{L.skill} *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['blue_collar', 'polytechnic', 'semi_skilled'] as SkillCategory[]).map(cat => (
                <button key={cat} onClick={() => setForm(f => ({ ...f, skillCategory: cat }))}
                  style={{ flex: 1, padding: '10px 4px', borderRadius: 10, border: `2px solid ${form.skillCategory === cat ? '#0F4C2A' : '#E5EAE0'}`, background: form.skillCategory === cat ? '#0F4C2A' : '#fff', color: form.skillCategory === cat ? '#fff' : '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  {L.categories[cat]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{L.trade} *</label>
            <select value={form.tradeOrRole} onChange={e => setForm(f => ({ ...f, tradeOrRole: e.target.value }))}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #E5EAE0', fontSize: 15, outline: 'none', background: '#fff' }}>
              <option value="">Select trade...</option>
              {TRADES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button onClick={handleStart} disabled={loading || !form.name || !form.phone || !form.district || !form.tradeOrRole}
            style={{ width: '100%', padding: '15px', borderRadius: 12, background: '#0F4C2A', color: '#fff', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: 8, opacity: loading ? 0.7 : 1 }}>
            {loading ? '⏳ Loading...' : `🎙️ ${L.start}`}
          </button>
          <button onClick={() => setStep('lang')} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: 13, cursor: 'pointer', textAlign: 'center' }}>← Change language</button>
        </div>
      </div>
    </div>
  );
}
