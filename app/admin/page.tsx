'use client';
import { useState, useEffect } from 'react';
import { Candidate, FitmentCategory } from '@/types';

const FITMENT_LABELS: Record<FitmentCategory, { label: string; color: string; bg: string }> = {
  job_ready: { label: 'Job Ready', color: '#166534', bg: '#DCFCE7' },
  needs_training: { label: 'Needs Training', color: '#854D0E', bg: '#FEF9C3' },
  manual_verification: { label: 'Manual Review', color: '#9A3412', bg: '#FFEDD5' },
  low_quality: { label: 'Low Quality', color: '#991B1B', bg: '#FEE2E2' },
  suspected_duplicate: { label: 'Suspected Duplicate', color: '#4B5563', bg: '#F3F4F6' },
};

const DISTRICTS = ['all', 'Bengaluru Urban', 'Mysuru', 'Belagavi', 'Mangaluru', 'Hubballi', 'Dharwad', 'Kalaburagi', 'Ballari', 'Shivamogga', 'Tumakuru', 'Other'];
const FITMENTS = ['all', 'job_ready', 'needs_training', 'manual_verification', 'low_quality', 'suspected_duplicate'];
const LANGS = ['all', 'en', 'hi', 'kn'];
const LANG_LABELS: Record<string, string> = { all: 'All Languages', en: 'English', hi: 'Hindi', kn: 'Kannada' };

export default function AdminPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [filters, setFilters] = useState({ district: 'all', fitmentCategory: 'all', language: 'all' });

  useEffect(() => { fetchCandidates(); }, [filters]);

  async function fetchCandidates() {
    setLoading(true);
    const params = new URLSearchParams(filters);
    const res = await fetch(`/api/candidates?${params}`);
    const data = await res.json();
    setCandidates(data.candidates || []);
    setLoading(false);
  }

  const stats = {
    total: candidates.length,
    jobReady: candidates.filter(c => c.fitmentCategory === 'job_ready').length,
    needsTraining: candidates.filter(c => c.fitmentCategory === 'needs_training').length,
    flagged: candidates.filter(c => c.flagged).length,
    avgScore: candidates.length ? Math.round(candidates.reduce((a, c) => a + c.overallScore, 0) / candidates.length) : 0,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F7F9F5', fontFamily: 'var(--font-sora, sans-serif)' }}>
      {/* Header */}
      <div style={{ background: '#0F4C2A', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#fff', margin: 0, fontSize: 20, fontWeight: 700 }}>SkillFit AI — Admin Dashboard</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: 13 }}>Directorate of EDCS, Government of Karnataka</p>
        </div>
        <div style={{ background: '#F5A623', color: '#0F4C2A', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
          {stats.total} Candidates
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total Candidates', value: stats.total, color: '#0F4C2A', icon: '👥' },
            { label: 'Job Ready', value: stats.jobReady, color: '#166534', icon: '✅' },
            { label: 'Needs Training', value: stats.needsTraining, color: '#854D0E', icon: '📚' },
            { label: 'Avg Score', value: `${stats.avgScore}/100`, color: '#1D4ED8', icon: '📊' },
            { label: 'Flagged', value: stats.flagged, color: '#DC2626', icon: '🚩' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: 16, padding: '16px', border: '1.5px solid #E5EAE0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.icon} {s.label}</p>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '16px 20px', marginBottom: 20, border: '1.5px solid #E5EAE0', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>🔍 Filter:</span>
          {[
            { key: 'district', label: 'District', options: DISTRICTS.map(d => ({ value: d, label: d === 'all' ? 'All Districts' : d })) },
            { key: 'fitmentCategory', label: 'Fitment', options: FITMENTS.map(f => ({ value: f, label: f === 'all' ? 'All Categories' : FITMENT_LABELS[f as FitmentCategory]?.label || f })) },
            { key: 'language', label: 'Language', options: LANGS.map(l => ({ value: l, label: LANG_LABELS[l] })) },
          ].map(filter => (
            <select key={filter.key} value={filters[filter.key as keyof typeof filters]}
              onChange={e => setFilters(f => ({ ...f, [filter.key]: e.target.value }))}
              style={{ padding: '8px 12px', borderRadius: 10, border: '1.5px solid #E5EAE0', fontSize: 13, outline: 'none', background: '#F7F9F5', cursor: 'pointer' }}>
              {filter.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ))}
          <button onClick={fetchCandidates} style={{ padding: '8px 16px', borderRadius: 10, background: '#0F4C2A', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Refresh
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 16 }}>
          {/* Candidate List */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #E5EAE0', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #E5EAE0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, fontWeight: 700, color: '#0F4C2A', fontSize: 15 }}>Candidates</p>
              <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF' }}>{candidates.length} results</p>
            </div>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>Loading candidates...</div>
            ) : candidates.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <p style={{ fontSize: 32, margin: '0 0 8px' }}>📭</p>
                <p style={{ color: '#9CA3AF', fontSize: 14 }}>No candidates yet. Share the interview link to get started.</p>
              </div>
            ) : (
              <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 340px)' }}>
                {candidates.map((c, i) => {
                  const fitment = FITMENT_LABELS[c.fitmentCategory];
                  return (
                    <div key={i} onClick={() => setSelected(selected?._id === c._id ? null : c)}
                      style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', cursor: 'pointer', background: selected?._id === c._id ? '#F0FDF4' : 'transparent', transition: 'background 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, color: '#1A1A1A', fontSize: 14 }}>{c.name}</span>
                          {c.flagged && <span style={{ fontSize: 10, background: '#FEE2E2', color: '#991B1B', padding: '2px 6px', borderRadius: 10, fontWeight: 700 }}>FLAGGED</span>}
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>{c.district} · {c.tradeOrRole} · {LANG_LABELS[c.language]}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: c.overallScore >= 75 ? '#166534' : c.overallScore >= 55 ? '#854D0E' : '#991B1B' }}>{c.overallScore}</p>
                          <p style={{ margin: 0, fontSize: 10, color: '#9CA3AF' }}>score</p>
                        </div>
                        <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: fitment.bg, color: fitment.color, whiteSpace: 'nowrap' }}>{fitment.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          {selected && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #E5EAE0', overflow: 'hidden', height: 'fit-content' }}>
              <div style={{ background: '#0F4C2A', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: 16 }}>{selected.name}</p>
                  <p style={{ color: 'rgba(255,255,255,0.7)', margin: '4px 0 0', fontSize: 13 }}>{selected.phone}</p>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 28, height: 28, borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>×</button>
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  {[
                    ['District', selected.district], ['Trade', selected.tradeOrRole],
                    ['Language', LANG_LABELS[selected.language]], ['Category', selected.skillCategory.replace('_', ' ')],
                    ['Duration', `${Math.round(selected.interviewDuration / 60)}m ${selected.interviewDuration % 60}s`],
                    ['Face Detected', selected.faceDetected ? '✓ Yes' : '✗ No'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ background: '#F7F9F5', borderRadius: 10, padding: '10px 12px' }}>
                      <p style={{ margin: 0, fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase' }}>{k}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 600, color: '#374151' }}>{v}</p>
                    </div>
                  ))}
                </div>

                <div style={{ background: FITMENT_LABELS[selected.fitmentCategory].bg, borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 11, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>Fitment</p>
                    <p style={{ margin: '2px 0 0', fontWeight: 700, color: FITMENT_LABELS[selected.fitmentCategory].color }}>{FITMENT_LABELS[selected.fitmentCategory].label}</p>
                  </div>
                  <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: FITMENT_LABELS[selected.fitmentCategory].color }}>{selected.overallScore}<span style={{ fontSize: 14, fontWeight: 400 }}>/100</span></p>
                </div>

                <p style={{ fontWeight: 700, color: '#0F4C2A', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Interview Responses</p>
                {selected.responses.map((r, i) => (
                  <div key={i} style={{ background: '#F7F9F5', borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
                    <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#0F4C2A' }}>Q{i+1}: {r.question}</p>
                    <p style={{ margin: '0 0 8px', fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{r.answer || '(No transcription)'}</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[['Relevance', r.scores.relevance], ['Clarity', r.scores.clarity], ['Confidence', r.scores.confidence]].map(([l, v]) => (
                        <div key={l as string} style={{ flex: 1, background: '#fff', borderRadius: 8, padding: '6px 8px', textAlign: 'center', border: '1px solid #E5EAE0' }}>
                          <p style={{ margin: 0, fontSize: 10, color: '#9CA3AF' }}>{l as string}</p>
                          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0F4C2A' }}>{v as number}/5</p>
                        </div>
                      ))}
                    </div>
                    {r.feedback && <p style={{ margin: '8px 0 0', fontSize: 12, color: '#6B7280', fontStyle: 'italic' }}>"{r.feedback}"</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
