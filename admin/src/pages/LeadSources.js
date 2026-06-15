import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const CARD  = { background:'#161616', border:'1px solid #222', borderRadius:8, padding:'16px 18px', marginBottom:10 };
const BTN   = { padding:'7px 14px', borderRadius:5, border:'none', cursor:'pointer', fontFamily:"'Jost',sans-serif", fontWeight:600, fontSize:12 };
const INP   = { padding:'9px 12px', background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:5, color:'#f0ece4', fontSize:13, outline:'none', fontFamily:"'Jost',sans-serif" };

const STATIC_SOURCES = [
  { key:'facebook',  icon:'📘', label:'Facebook',  color:'#4267B2', colorAlpha:'rgba(66,103,178,0.15)'  },
  { key:'instagram', icon:'📸', label:'Instagram', color:'#E1306C', colorAlpha:'rgba(225,48,108,0.15)'  },
  { key:'other',     icon:'💬', label:'Other',     color:'#c9a84c', colorAlpha:'rgba(201,168,76,0.12)'  },
  { key:'unknown',   icon:'❓', label:'Not specified', color:'#555', colorAlpha:'rgba(80,80,80,0.1)'    },
];

const statusColors = { pending:'#f0a050', approved:'#5dd6a8', rejected:'#ff6b6b', suspended:'#888' };

function hexToAlpha(hex, a) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

function getSourceKey(m, agentSlugs) {
  if (!m.heardAboutUs) return 'unknown';
  if (m.heardAboutUs === 'agent') {
    if (m.agentName && agentSlugs.includes(m.agentName)) return m.agentName;
    return 'other_agent';
  }
  return m.heardAboutUs;
}

function getSourceLabel(m, agentMap) {
  if (!m.heardAboutUs) return '❓ Not specified';
  if (m.heardAboutUs === 'agent') {
    const agent = agentMap[m.agentName];
    if (agent) return `👤 ${agent.name}`;
    if (m.agentNameOther) return `👤 Agent: ${m.agentNameOther}`;
    return '👤 Agent (other)';
  }
  if (m.heardAboutUs === 'facebook')  return '📘 Facebook';
  if (m.heardAboutUs === 'instagram') return '📸 Instagram';
  return `💬 Other${m.heardAboutUsOther ? ': ' + m.heardAboutUsOther : ''}`;
}

const AGENT_COLORS = ['#5dd6a8','#b47adb','#6aabcc','#f0a050','#e86aa8','#a8e86a','#e8c97a'];

export default function LeadSources() {
  const [maids,       setMaids]       = useState([]);
  const [agents,      setAgents]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState('all');
  const [creating,    setCreating]    = useState(false);
  const [newName,     setNewName]     = useState('');
  const [newColor,    setNewColor]    = useState(AGENT_COLORS[0]);
  const [saving,      setSaving]      = useState(false);
  const [deleting,    setDeleting]    = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      adminAPI.getMaids({ limit: 500 }),
      adminAPI.getLeadSources(),
    ]).then(([mRes, aRes]) => {
      setMaids(mRes.data.maids || []);
      setAgents(aRes.data.sources || []);
    }).catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const agentSlugs = agents.map(a => a.slug);
  const agentMap   = Object.fromEntries(agents.map(a => [a.slug, a]));

  // Build counts per source key
  const counts = maids.reduce((acc, m) => {
    const k = getSourceKey(m, agentSlugs);
    if (!acc[k]) acc[k] = { total:0, approved:0 };
    acc[k].total++;
    if (m.approvalStatus === 'approved') acc[k].approved++;
    return acc;
  }, {});

  // All source configs (static + dynamic agents)
  const allSources = [
    ...STATIC_SOURCES.filter(s => s.key !== 'other' && s.key !== 'unknown'),
    ...agents.map(a => ({
      key:        a.slug,
      icon:       '👤',
      label:      a.name,
      color:      a.color,
      colorAlpha: hexToAlpha(a.color, 0.12),
      agentId:    a._id,
      isAgent:    true,
      link:       `https://servix.world/register.html?agent=${a.slug}`,
    })),
    STATIC_SOURCES.find(s => s.key === 'other'),
    STATIC_SOURCES.find(s => s.key === 'unknown'),
  ];

  const filtered = filter === 'all'
    ? maids.filter(m => getSourceKey(m, agentSlugs) !== 'unknown')
    : maids.filter(m => getSourceKey(m, agentSlugs) === filter);

  const totalKnown    = maids.filter(m => getSourceKey(m, agentSlugs) !== 'unknown').length;
  const totalApproved = maids.filter(m => m.approvalStatus === 'approved').length;

  const handleCreate = async () => {
    if (!newName.trim()) return toast.error('Name required');
    setSaving(true);
    try {
      await adminAPI.createLeadSource({ name: newName.trim(), color: newColor });
      toast.success(`Agent "${newName.trim()}" created`);
      setNewName(''); setCreating(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove agent "${name}"? This won't affect existing maid records.`)) return;
    setDeleting(id);
    try {
      await adminAPI.deleteLeadSource(id);
      toast.success(`"${name}" removed`);
      load();
    } catch { toast.error('Failed to remove'); }
    finally { setDeleting(null); }
  };

  const copyLink = (link) => {
    navigator.clipboard.writeText(link).then(() => toast.success('Link copied!')).catch(() => toast.error('Copy failed'));
  };

  return (
    <div style={{ fontFamily:"'Jost',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Jost:wght@400;500;600&family=DM+Mono:wght@400&display=swap');`}</style>

      {/* Page header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20, gap:12 }}>
        <div>
          <div style={{ fontSize:13, color:'#555', fontFamily:"'DM Mono',monospace", letterSpacing:'0.08em', textTransform:'uppercase' }}>
            {totalKnown} maids tracked · {totalApproved} approved
            {counts['unknown']?.total ? ` · ${counts['unknown'].total} pre-feature` : ''}
          </div>
        </div>
        <button onClick={() => setCreating(v => !v)}
          style={{ ...BTN, background:'linear-gradient(135deg,#c9a84c,#e8c97a)', color:'#1a1108', padding:'8px 16px', fontSize:12 }}>
          {creating ? '✕ Cancel' : '+ Add Agent'}
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <div style={{ ...CARD, border:'1px solid rgba(201,168,76,0.35)', background:'rgba(201,168,76,0.04)', marginBottom:20 }}>
          <div style={{ fontSize:11, color:'#c9a84c', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:14 }}>New Agent / Lead Source</div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'flex-end' }}>
            <div style={{ flex:2, minWidth:180 }}>
              <div style={{ fontSize:10, color:'#666', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>Agent Name</div>
              <input value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Sara, Maria…"
                style={{ ...INP, width:'100%', boxSizing:'border-box' }}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
              />
            </div>
            <div>
              <div style={{ fontSize:10, color:'#666', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>Badge Colour</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {AGENT_COLORS.map(c => (
                  <div key={c} onClick={() => setNewColor(c)}
                    style={{ width:26, height:26, borderRadius:'50%', background:c, cursor:'pointer', border: newColor===c ? `2px solid ${c}` : '2px solid transparent', outline: newColor===c ? `2px solid white` : 'none', boxSizing:'border-box' }}/>
                ))}
              </div>
            </div>
            <button onClick={handleCreate} disabled={saving}
              style={{ ...BTN, background:'#5dd6a8', color:'#0a1a12', padding:'9px 18px', opacity:saving?0.6:1 }}>
              {saving ? 'Saving…' : '✓ Create Agent'}
            </button>
          </div>
          {newName.trim() && (
            <div style={{ marginTop:12, fontSize:11, color:'#666' }}>
              Referral link will be:{' '}
              <span style={{ color:'#c9a84c', fontFamily:"'DM Mono',monospace" }}>
                servix.world/register.html?agent={newName.trim().toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'')}
              </span>
            </div>
          )}
        </div>
      )}

      {loading && <div style={{ color:'#555', textAlign:'center', padding:60 }}>Loading…</div>}

      {!loading && (
        <>
          {/* Agent cards — agents only, with referral link */}
          {agents.length > 0 && (
            <div style={{ marginBottom:22 }}>
              <div style={{ fontSize:10, color:'#555', fontFamily:"'DM Mono',monospace", letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>Agent Lead Sources</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:10 }}>
                {agents.map(agent => {
                  const c = counts[agent.slug] || { total:0, approved:0 };
                  const isActive = filter === agent.slug;
                  const link = `https://servix.world/register.html?agent=${agent.slug}`;
                  return (
                    <div key={agent._id}
                      style={{ background: isActive ? hexToAlpha(agent.color,0.12) : '#161616', border:`1.5px solid ${isActive ? agent.color+'70' : '#222'}`, borderRadius:8, padding:'14px 16px', transition:'all 0.15s' }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }} onClick={() => setFilter(isActive ? 'all' : agent.slug)}>
                          <span style={{ fontSize:18 }}>👤</span>
                          <span style={{ fontSize:13, fontWeight:700, color: isActive ? agent.color : '#f0ece4' }}>{agent.name}</span>
                        </div>
                        <button onClick={() => handleDelete(agent._id, agent.name)} disabled={deleting === agent._id}
                          style={{ ...BTN, background:'transparent', color:'#444', border:'none', padding:'2px 6px', fontSize:14 }} title="Remove agent">
                          {deleting === agent._id ? '…' : '×'}
                        </button>
                      </div>
                      <div style={{ display:'flex', gap:16, marginBottom:12 }}>
                        <div style={{ textAlign:'center' }}>
                          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:700, color: isActive ? agent.color : '#e8c97a', lineHeight:1 }}>{c.total}</div>
                          <div style={{ fontSize:9, color:'#555', textTransform:'uppercase', letterSpacing:'0.06em' }}>Total</div>
                        </div>
                        <div style={{ textAlign:'center' }}>
                          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:700, color:'#5dd6a8', lineHeight:1 }}>{c.approved}</div>
                          <div style={{ fontSize:9, color:'#555', textTransform:'uppercase', letterSpacing:'0.06em' }}>Approved</div>
                        </div>
                        <div style={{ textAlign:'center' }}>
                          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:700, color:'#f0a050', lineHeight:1 }}>{c.total - c.approved}</div>
                          <div style={{ fontSize:9, color:'#555', textTransform:'uppercase', letterSpacing:'0.06em' }}>Pending</div>
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:6 }}>
                        <button onClick={() => copyLink(link)}
                          style={{ ...BTN, background:'rgba(201,168,76,0.12)', color:'#c9a84c', border:'1px solid rgba(201,168,76,0.25)', flex:1, fontSize:10 }}>
                          📋 Copy Link
                        </button>
                        <button onClick={() => setFilter(isActive ? 'all' : agent.slug)}
                          style={{ ...BTN, background: isActive ? hexToAlpha(agent.color,0.2) : '#1e1e1e', color: isActive ? agent.color : '#888', border:`1px solid ${isActive ? agent.color+'50' : '#2a2a2a'}`, flex:1, fontSize:10 }}>
                          {isActive ? '✕ Clear' : '▼ Filter'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {agents.length === 0 && !creating && (
            <div style={{ ...CARD, textAlign:'center', color:'#555', padding:32, marginBottom:20 }}>
              No agents yet. Click <strong style={{ color:'#c9a84c' }}>+ Add Agent</strong> to create your first lead source.
            </div>
          )}

          {/* Channel stat cards (Facebook, Instagram, Other) */}
          <div style={{ fontSize:10, color:'#555', fontFamily:"'DM Mono',monospace", letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>Organic Channels</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:10, marginBottom:22 }}>
            {STATIC_SOURCES.filter(s => s.key !== 'unknown').map(src => {
              const c = counts[src.key] || { total:0, approved:0 };
              const isActive = filter === src.key;
              return (
                <div key={src.key} onClick={() => setFilter(isActive ? 'all' : src.key)}
                  style={{ background: isActive ? src.colorAlpha : '#161616', border:`1.5px solid ${isActive ? src.color+'70' : '#222'}`, borderRadius:8, padding:'14px 16px', cursor:'pointer', transition:'all 0.15s', userSelect:'none' }}>
                  <div style={{ fontSize:22, marginBottom:6 }}>{src.icon}</div>
                  <div style={{ fontSize:12, fontWeight:600, color: isActive ? src.color : '#aaa', marginBottom:6 }}>{src.label}</div>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:700, color: isActive ? src.color : '#e8c97a', lineHeight:1 }}>{c.total}</div>
                  <div style={{ fontSize:10, color:'#5dd6a8', marginTop:4 }}>{c.approved} approved</div>
                </div>
              );
            })}
          </div>

          {/* Filter label + list */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
            <div style={{ fontSize:10, color:'#555', fontFamily:"'DM Mono',monospace", letterSpacing:'0.1em', textTransform:'uppercase' }}>
              {filter === 'all' ? `All tracked maids (${totalKnown})` : `${allSources.find(s=>s.key===filter)?.label || filter} (${filtered.length})`}
            </div>
            {filter !== 'all' && (
              <button onClick={() => setFilter('all')}
                style={{ ...BTN, background:'#1e1e1e', color:'#555', border:'1px solid #2a2a2a', fontSize:10 }}>
                ✕ Clear filter
              </button>
            )}
          </div>

          {filtered.length === 0 && (
            <div style={{ ...CARD, textAlign:'center', color:'#555', padding:40 }}>No maids from this source yet.</div>
          )}

          {filtered.map(m => {
            const key = getSourceKey(m, agentSlugs);
            const src = allSources.find(s => s.key === key) || STATIC_SOURCES[STATIC_SOURCES.length-1];
            return (
              <div key={m._id} style={CARD}>
                <div style={{ display:'flex', alignItems:'center', gap:13 }}>
                  <div style={{ width:42, height:42, borderRadius:'50%', background:'#2a2a2a', flexShrink:0, border:'1px solid #333', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
                    {m.photos?.[0]?.url ? <img src={m.photos[0].url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : '👩'}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#f0ece4' }}>{m.fullName}</div>
                    <div style={{ fontSize:11, color:'#555', marginTop:2 }}>{m.nationality} · {m.age}yrs · {m.user?.email}</div>
                  </div>
                  <span style={{ fontSize:11, fontWeight:700, background: src.colorAlpha, color: src.color, border:`1px solid ${src.color}40`, borderRadius:4, padding:'3px 10px', whiteSpace:'nowrap' }}>
                    {getSourceLabel(m, agentMap)}
                  </span>
                  <span style={{ fontSize:10, fontWeight:700, background:`${statusColors[m.approvalStatus]||'#888'}15`, color:statusColors[m.approvalStatus]||'#888', border:`1px solid ${statusColors[m.approvalStatus]||'#888'}30`, borderRadius:3, padding:'3px 8px', whiteSpace:'nowrap', textTransform:'uppercase', letterSpacing:'0.04em' }}>
                    {m.approvalStatus}
                  </span>
                  <div style={{ fontSize:10, color:'#444', fontFamily:"'DM Mono',monospace", flexShrink:0 }}>
                    {new Date(m.createdAt).toLocaleDateString('en-EG', { day:'numeric', month:'short', year:'numeric' })}
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
