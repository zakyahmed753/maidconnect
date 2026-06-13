import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const CARD  = { background:'#161616', border:'1px solid #222', borderRadius:8, padding:'16px 18px', marginBottom:10 };
const BTN   = { padding:'7px 14px', borderRadius:5, border:'none', cursor:'pointer', fontFamily:"'Jost',sans-serif", fontWeight:600, fontSize:12 };

// ── Helpers ──────────────────────────────────────────────────────────────────
function getSourceKey(m) {
  if (!m.heardAboutUs) return 'unknown';
  if (m.heardAboutUs === 'agent') {
    if (m.agentName === 'victoria') return 'victoria';
    if (m.agentName === 'latifa')   return 'latifa';
    if (m.agentName === 'rodiyat')  return 'rodiyat';
    return 'agent_other';
  }
  return m.heardAboutUs;
}

function getSourceLabel(m) {
  const k = getSourceKey(m);
  if (k === 'facebook')    return '📘 Facebook';
  if (k === 'instagram')   return '📸 Instagram';
  if (k === 'victoria')    return '👤 Victoria';
  if (k === 'latifa')      return '👤 Latifa';
  if (k === 'rodiyat')     return '👤 Rodiyat';
  if (k === 'agent_other') return `👤 Agent: ${m.agentNameOther || 'Other'}`;
  if (k === 'other')       return `💬 Other${m.heardAboutUsOther ? ': ' + m.heardAboutUsOther : ''}`;
  return '❓ Not specified';
}

const SOURCE_CONFIG = [
  { key: 'facebook',    icon: '📘', label: 'Facebook',    color: '#4267B2', colorAlpha: 'rgba(66,103,178,0.15)' },
  { key: 'instagram',   icon: '📸', label: 'Instagram',   color: '#E1306C', colorAlpha: 'rgba(225,48,108,0.15)' },
  { key: 'victoria',    icon: '👤', label: 'Victoria',    color: '#5dd6a8', colorAlpha: 'rgba(93,214,168,0.12)' },
  { key: 'latifa',      icon: '👤', label: 'Latifa',      color: '#5dd6a8', colorAlpha: 'rgba(93,214,168,0.12)' },
  { key: 'rodiyat',    icon: '👤', label: 'Rodiyat',    color: '#b47adb', colorAlpha: 'rgba(180,122,219,0.12)' },
  { key: 'agent_other', icon: '👤', label: 'Agent (Other)',color: '#6aabcc', colorAlpha: 'rgba(106,171,204,0.12)' },
  { key: 'other',       icon: '💬', label: 'Other',       color: '#c9a84c', colorAlpha: 'rgba(201,168,76,0.12)'  },
  { key: 'unknown',     icon: '❓', label: 'Not specified',color: '#555',    colorAlpha: 'rgba(80,80,80,0.1)'    },
];

const statusColors = { pending:'#f0a050', approved:'#5dd6a8', rejected:'#ff6b6b', suspended:'#888' };

export default function LeadSources() {
  const [maids,    setMaids]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');

  useEffect(() => {
    adminAPI.getMaids({ limit: 500 })
      .then(r => setMaids(r.data.maids || []))
      .catch(() => toast.error('Failed to load maids'))
      .finally(() => setLoading(false));
  }, []);

  // Build counts per source key
  const counts = maids.reduce((acc, m) => {
    const k = getSourceKey(m);
    if (!acc[k]) acc[k] = { total: 0, approved: 0 };
    acc[k].total++;
    if (m.approvalStatus === 'approved') acc[k].approved++;
    return acc;
  }, {});

  const filtered = filter === 'all'
    ? maids.filter(m => getSourceKey(m) !== 'unknown')
    : maids.filter(m => getSourceKey(m) === filter);

  const totalKnown     = maids.filter(m => getSourceKey(m) !== 'unknown').length;
  const totalApproved  = maids.filter(m => m.approvalStatus === 'approved').length;

  return (
    <div style={{ fontFamily:"'Jost',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Jost:wght@400;500;600&family=DM+Mono:wght@400&display=swap');`}</style>

      {/* Page header */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:13, color:'#555', fontFamily:"'DM Mono',monospace", letterSpacing:'0.08em', textTransform:'uppercase' }}>
          {totalKnown} maids tracked · {totalApproved} approved
          {counts['unknown']?.total ? ` · ${counts['unknown'].total} pre-feature (no data)` : ''}
        </div>
      </div>

      {loading && <div style={{ color:'#555', textAlign:'center', padding:60 }}>Loading…</div>}

      {!loading && (
        <>
          {/* Source stat cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:10, marginBottom:22 }}>
            {SOURCE_CONFIG.filter(s => s.key !== 'unknown').map(src => {
              const c = counts[src.key] || { total: 0, approved: 0 };
              const isActive = filter === src.key;
              return (
                <div key={src.key} onClick={() => setFilter(isActive ? 'all' : src.key)}
                  style={{ background: isActive ? src.colorAlpha : '#161616', border:`1.5px solid ${isActive ? src.color + '70' : '#222'}`, borderRadius:8, padding:'14px 16px', cursor:'pointer', transition:'all 0.15s', userSelect:'none' }}>
                  <div style={{ fontSize:22, marginBottom:6 }}>{src.icon}</div>
                  <div style={{ fontSize:12, fontWeight:600, color: isActive ? src.color : '#aaa', marginBottom:6 }}>{src.label}</div>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:30, fontWeight:700, color: isActive ? src.color : '#e8c97a', lineHeight:1 }}>{c.total}</div>
                  <div style={{ fontSize:10, color:'#5dd6a8', marginTop:4 }}>
                    {c.approved} approved
                    {c.total > 0 && <span style={{ color:'#555' }}> / {c.total}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filter label */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
            <div style={{ fontSize:10, color:'#555', fontFamily:"'DM Mono',monospace", letterSpacing:'0.1em', textTransform:'uppercase' }}>
              {filter === 'all' ? `All tracked maids (${totalKnown})` : `${SOURCE_CONFIG.find(s => s.key === filter)?.label} (${filtered.length})`}
            </div>
            {filter !== 'all' && (
              <button onClick={() => setFilter('all')}
                style={{ ...BTN, background:'#1e1e1e', color:'#555', border:'1px solid #2a2a2a', fontSize:10 }}>
                ✕ Clear filter
              </button>
            )}
          </div>

          {/* Maid list */}
          {filtered.length === 0 && (
            <div style={{ ...CARD, textAlign:'center', color:'#555', padding:40 }}>
              No maids from this source yet.
            </div>
          )}
          {filtered.map(m => {
            const src = SOURCE_CONFIG.find(s => s.key === getSourceKey(m)) || SOURCE_CONFIG[SOURCE_CONFIG.length - 1];
            return (
              <div key={m._id} style={CARD}>
                <div style={{ display:'flex', alignItems:'center', gap:13 }}>
                  {/* Avatar */}
                  <div style={{ width:42, height:42, borderRadius:'50%', background:'#2a2a2a', flexShrink:0, border:'1px solid #333', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
                    {m.photos?.[0]?.url ? <img src={m.photos[0].url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : '👩'}
                  </div>
                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#f0ece4' }}>{m.fullName}</div>
                    <div style={{ fontSize:11, color:'#555', marginTop:2 }}>
                      {m.nationality} · {m.age}yrs · {m.user?.email}
                    </div>
                  </div>
                  {/* Source badge */}
                  <span style={{ fontSize:11, fontWeight:700, background: src.colorAlpha, color: src.color, border:`1px solid ${src.color}40`, borderRadius:4, padding:'3px 10px', whiteSpace:'nowrap' }}>
                    {getSourceLabel(m)}
                  </span>
                  {/* Approval status */}
                  <span style={{ fontSize:10, fontWeight:700, background:`${statusColors[m.approvalStatus] || '#888'}15`, color: statusColors[m.approvalStatus] || '#888', border:`1px solid ${statusColors[m.approvalStatus] || '#888'}30`, borderRadius:3, padding:'3px 8px', whiteSpace:'nowrap', textTransform:'uppercase', letterSpacing:'0.04em' }}>
                    {m.approvalStatus}
                  </span>
                  {/* Date */}
                  <div style={{ fontSize:10, color:'#444', fontFamily:"'DM Mono',monospace", flexShrink:0 }}>
                    {new Date(m.createdAt).toLocaleDateString('en-EG', { day:'numeric', month:'short', year:'numeric' })}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Commission note */}
          {(counts['victoria']?.total > 0 || counts['latifa']?.total > 0 || counts['agent_other']?.total > 0) && (
            <div style={{ marginTop:24, padding:'14px 18px', background:'#111', border:'1px solid #2a2a2a', borderRadius:8 }}>
              <div style={{ fontSize:11, color:'#c9a84c', fontWeight:700, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:"'DM Mono',monospace" }}>Commission Summary</div>
              <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
                {['victoria','latifa','rodiyat','agent_other'].map(key => {
                  const c = counts[key];
                  if (!c?.total) return null;
                  const cfg = SOURCE_CONFIG.find(s => s.key === key);
                  return (
                    <div key={key}>
                      <div style={{ fontSize:12, color:'#aaa', marginBottom:4 }}>{cfg.label}</div>
                      <div style={{ display:'flex', gap:12 }}>
                        <div style={{ textAlign:'center' }}>
                          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:'#e8c97a', fontWeight:700 }}>{c.total}</div>
                          <div style={{ fontSize:9, color:'#555', textTransform:'uppercase', letterSpacing:'0.06em' }}>Total</div>
                        </div>
                        <div style={{ textAlign:'center' }}>
                          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:'#5dd6a8', fontWeight:700 }}>{c.approved}</div>
                          <div style={{ fontSize:9, color:'#555', textTransform:'uppercase', letterSpacing:'0.06em' }}>Approved</div>
                        </div>
                        <div style={{ textAlign:'center' }}>
                          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:'#f0a050', fontWeight:700 }}>{c.total - c.approved}</div>
                          <div style={{ fontSize:9, color:'#555', textTransform:'uppercase', letterSpacing:'0.06em' }}>Pending</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
