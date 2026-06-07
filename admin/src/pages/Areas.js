import React, { useEffect, useState } from 'react';
import { configAPI } from '../services/api';
import toast from 'react-hot-toast';

const ALL_AREAS = [
  'Maadi', 'Zamalek', 'New Cairo', 'Heliopolis',
  'Nasr City', 'Dokki', 'Mohandessin', 'Sheikh Zayed',
  '6th of October', 'Garden City', 'Rehab City', 'Madinaty',
  'Shorouk', 'Gesr El Suez', 'Other',
];

const S = {
  card:    { background:'#161616', border:'1px solid #222', borderRadius:8, padding:'16px 18px', marginBottom:10 },
  label:   { fontSize:10, color:'#555', letterSpacing:'0.1em', textTransform:'uppercase', fontFamily:"'DM Mono',monospace", marginBottom:16, display:'block' },
  areaRow: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid #1e1e1e' },
  areaName:{ fontSize:14, fontWeight:500, color:'#f0ece4' },
  badge:   (active) => ({ fontSize:9, letterSpacing:'0.07em', textTransform:'uppercase', padding:'3px 8px', borderRadius:3, fontWeight:700, background:active?'rgba(93,214,168,0.12)':'rgba(255,107,107,0.12)', color:active?'#5dd6a8':'#ff6b6b', border:`1px solid ${active?'#5dd6a835':'#ff6b6b35'}` }),
  toggle:  (active) => ({ padding:'7px 16px', borderRadius:5, border:`1px solid ${active?'#ff6b6b30':'#5dd6a830'}`, background:'#1e1e1e', color:active?'#ff6b6b':'#5dd6a8', cursor:'pointer', fontSize:12, fontFamily:"'Jost',sans-serif", fontWeight:600 }),
  saveBtn: { padding:'10px 24px', borderRadius:5, border:'none', background:'#c9a84c', color:'#1a1108', cursor:'pointer', fontFamily:"'Jost',sans-serif", fontWeight:700, fontSize:13 },
};

export default function Areas() {
  const [activeAreas, setActiveAreas] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [termsUrl,    setTermsUrl]    = useState('');
  const [savingTerms, setSavingTerms] = useState(false);

  useEffect(() => {
    configAPI.getAreas()
      .then(r => setActiveAreas(r.data.activeAreas || []))
      .catch(() => toast.error('Failed to load areas'))
      .finally(() => setLoading(false));
    configAPI.getTerms()
      .then(r => setTermsUrl(r.data.termsUrl || ''))
      .catch(() => {});
  }, []);

  const handleSaveTerms = async () => {
    if (!termsUrl.trim()) return toast.error('Please enter a PDF URL');
    setSavingTerms(true);
    try {
      await configAPI.updateTerms(termsUrl.trim());
      toast.success('Terms & Conditions URL updated');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSavingTerms(false);
    }
  };

  const toggle = (area) => {
    setActiveAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await configAPI.updateAreas(activeAreas);
      toast.success('Active areas updated');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ color:'#555', textAlign:'center', padding:40 }}>Loading…</div>;

  return (
    <div style={{ fontFamily:"'Jost',sans-serif", maxWidth:600 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Jost:wght@400;500;600&family=DM+Mono:wght@400&display=swap');`}</style>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:'#f0ece4', fontWeight:700 }}>Service Area Management</div>
          <div style={{ fontSize:11, color:'#555', marginTop:3 }}>
            {activeAreas.length} of {ALL_AREAS.length} areas active · Customers in inactive areas join the waitlist
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} style={{ ...S.saveBtn, opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <div style={S.card}>
        <span style={S.label}>Cairo Areas</span>
        {ALL_AREAS.map(area => {
          const isActive = activeAreas.includes(area);
          return (
            <div key={area} style={S.areaRow}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={S.badge(isActive)}>{isActive ? 'active' : 'coming soon'}</span>
                <span style={S.areaName}>{area}</span>
              </div>
              <button onClick={() => toggle(area)} style={S.toggle(isActive)}>
                {isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ fontSize:12, color:'#555', lineHeight:'18px', padding:'12px 0' }}>
        💡 Changes take effect immediately — customers re-check area status on next app open.
      </div>

      {/* Terms & Conditions */}
      <div style={{ ...S.card, marginTop:24 }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:'#f0ece4', fontWeight:700, marginBottom:6 }}>
          Terms & Conditions PDF
        </div>
        <div style={{ fontSize:12, color:'#555', marginBottom:14 }}>
          Paste the URL of your hosted T&C PDF. This link is shown to customers before every hire request and updates in real-time on the app.
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <input
            style={{ flex:1, padding:'9px 13px', background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:5, color:'#f0ece4', fontSize:13, outline:'none', fontFamily:"'Jost',sans-serif" }}
            placeholder="https://your-domain.com/terms.pdf"
            value={termsUrl}
            onChange={e => setTermsUrl(e.target.value)}
          />
          <button onClick={handleSaveTerms} disabled={savingTerms}
            style={{ ...S.saveBtn, opacity: savingTerms ? 0.6 : 1 }}>
            {savingTerms ? 'Saving…' : 'Save URL'}
          </button>
        </div>
        {termsUrl && (
          <div style={{ marginTop:10, fontSize:12, color:'#c9a84c' }}>
            Current: <a href={termsUrl} target="_blank" rel="noreferrer" style={{ color:'#c9a84c' }}>{termsUrl}</a>
          </div>
        )}
      </div>
    </div>
  );
}
