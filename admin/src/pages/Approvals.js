import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const CARD = { background:'#161616', border:'1px solid #222', borderRadius:8, overflow:'hidden', marginBottom:12 };
const statusColors = { pending:'#f0a050', approved:'#5dd6a8', rejected:'#ff6b6b', suspended:'#888' };
const statusBg    = { pending:'rgba(240,160,80,0.12)', approved:'rgba(93,214,168,0.12)', rejected:'rgba(255,107,107,0.12)', suspended:'rgba(136,136,136,0.12)' };

const Pill = ({ status }) => (
  <span style={{ fontSize:9, letterSpacing:'0.08em', textTransform:'uppercase', padding:'3px 9px', borderRadius:3, fontWeight:700, background:statusBg[status]||'#222', color:statusColors[status]||'#888', border:`1px solid ${statusColors[status]||'#444'}40` }}>
    {status}
  </span>
);

const Modal = ({ maid, onClose, onAction }) => {
  const [note, setNote] = useState('');
  if (!maid) return null;
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:12, width:'100%', maxWidth:540, maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ padding:'18px 20px', borderBottom:'1px solid #222', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:700, color:'#f0ece4' }}>Maid Review</div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#555', fontSize:20, cursor:'pointer' }}>✕</button>
        </div>
        <div style={{ padding:20 }}>
          {/* Photos */}
          <div style={{ display:'flex', gap:8, marginBottom:16 }}>
            {(maid.photos||[]).slice(0,3).map((p,i) => (
              <div key={i} style={{ width:90, height:90, borderRadius:6, background:'#2a2a2a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, border:'1px solid #333', overflow:'hidden' }}>
                {p.url ? <img src={p.url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : '👩'}
              </div>
            ))}
            {(maid.photos||[]).length === 0 && <div style={{ color:'#ff6b6b', fontSize:12 }}>⚠️ No photos uploaded</div>}
          </div>

          {/* Info grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
            {[
              ['Name',        maid.fullName],
              ['Age',         `${maid.age} years`],
              ['Nationality', maid.nationality],
              ['Origin',      maid.origin],
              ['Experience',  `${maid.experienceYears} years`],
              ['Salary',      `EGP ${(maid.expectedSalary||0).toLocaleString()}/mo`],
              ['Photos',      `${maid.photos?.length||0} uploaded`],
              ['Status',      maid.approvalStatus],
            ].map(([l, v]) => (
              <div key={l} style={{ background:'#222', borderRadius:6, padding:'10px 12px' }}>
                <div style={{ fontSize:9, color:'#555', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:3 }}>{l}</div>
                <div style={{ fontSize:13, color:'#f0ece4', fontWeight:500 }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:9, color:'#666', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>Skills</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
              {(maid.skills||[]).map(s => <span key={s} style={{ background:'#2a2a2a', color:'#aaa', fontSize:11, padding:'4px 10px', borderRadius:12, border:'1px solid #333' }}>{s}</span>)}
            </div>
          </div>

          {/* Bio */}
          {maid.bio && <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:9, color:'#666', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>Bio</div>
            <div style={{ fontSize:13, color:'#aaa', lineHeight:1.6, background:'#222', padding:12, borderRadius:6 }}>{maid.bio}</div>
          </div>}

          {/* Note */}
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:10, color:'#666', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>Admin Note (optional)</label>
            <textarea value={note} onChange={e=>setNote(e.target.value)} rows={3}
              style={{ width:'100%', background:'#222', border:'1px solid #333', borderRadius:5, color:'#f0ece4', fontSize:13, padding:'10px 12px', resize:'vertical', outline:'none', fontFamily:"'Jost',sans-serif", boxSizing:'border-box' }}
              placeholder="Reason for rejection or notes…"/>
          </div>

          {/* Action buttons */}
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => onAction(maid._id, 'approved', note)}
              style={{ flex:1, padding:12, background:'rgba(93,214,168,0.15)', border:'1px solid rgba(93,214,168,0.3)', borderRadius:5, color:'#5dd6a8', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Jost',sans-serif" }}>
              ✅ Approve Profile
            </button>
            <button onClick={() => onAction(maid._id, 'rejected', note)}
              style={{ flex:1, padding:12, background:'rgba(255,107,107,0.1)', border:'1px solid rgba(255,107,107,0.25)', borderRadius:5, color:'#ff6b6b', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Jost',sans-serif" }}>
              ❌ Reject Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Approvals() {
  const [maids, setMaids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchMaids = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getMaids({ status: filter, page, limit: 15 });
      setMaids(res.data.maids);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load maids'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMaids(); }, [filter, page]);

  const handleAction = async (id, status, note) => {
    try {
      await adminAPI.updateMaidStatus(id, { status, note });
      toast.success(`Maid ${status} successfully`);
      setSelected(null);
      fetchMaids();
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
  };

  const FILTERS = ['pending','approved','rejected','suspended'];

  return (
    <div style={{ fontFamily:"'Jost',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Jost:wght@400;500;600&family=DM+Mono:wght@400&display=swap');`}</style>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:20, background:'#111', padding:4, borderRadius:7, width:'fit-content' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => { setFilter(f); setPage(1); }}
            style={{ padding:'8px 18px', borderRadius:5, border:'none', background:filter===f?'rgba(201,168,76,0.18)':'transparent', color:filter===f?'#e8c97a':'#555', fontSize:12, fontWeight:600, cursor:'pointer', textTransform:'capitalize', letterSpacing:'0.04em', transition:'all 0.2s', fontFamily:"'Jost',sans-serif" }}>
            {f}
          </button>
        ))}
      </div>

      {loading && <div style={{ color:'#555', textAlign:'center', padding:40 }}>Loading…</div>}

      {!loading && maids.length === 0 && (
        <div style={{ ...CARD, padding:40, textAlign:'center', color:'#444' }}>
          No maids with status "{filter}"
        </div>
      )}

      {maids.map(maid => (
        <div key={maid._id} style={CARD}>
          <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px' }}>
            {/* Avatar */}
            <div style={{ width:44, height:44, borderRadius:'50%', background:'#2a2a2a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0, overflow:'hidden', border:'1px solid #333' }}>
              {maid.photos?.[0]?.url ? <img src={maid.photos[0].url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : '👩'}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:600, color:'#f0ece4', marginBottom:2 }}>{maid.fullName}</div>
              <div style={{ fontSize:11, color:'#555' }}>
                {maid.nationality} · {maid.age} yrs · {maid.experienceYears}yr exp · EGP {(maid.expectedSalary||0).toLocaleString()}/mo
              </div>
              <div style={{ fontSize:10, color:'#444', marginTop:2, fontFamily:"'DM Mono',monospace" }}>
                {maid.photos?.length || 0} photos · Joined {new Date(maid.createdAt).toLocaleDateString()}
              </div>
            </div>
            <Pill status={maid.approvalStatus} />
            <button onClick={() => setSelected(maid)}
              style={{ padding:'8px 14px', background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.25)', borderRadius:5, color:'#e8c97a', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:"'Jost',sans-serif", marginLeft:8 }}>
              Review
            </button>
          </div>
          {/* Skills row */}
          <div style={{ padding:'0 16px 12px', display:'flex', gap:5, flexWrap:'wrap' }}>
            {(maid.skills||[]).map(s => <span key={s} style={{ fontSize:9, color:'#666', background:'#1e1e1e', padding:'2px 7px', borderRadius:2, letterSpacing:'0.05em' }}>{s}</span>)}
            {filter === 'pending' && (
              <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
                <button onClick={() => handleAction(maid._id, 'approved', '')}
                  style={{ padding:'5px 12px', background:'rgba(93,214,168,0.12)', border:'1px solid rgba(93,214,168,0.25)', borderRadius:4, color:'#5dd6a8', fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:"'Jost',sans-serif" }}>
                  ✓ Quick Approve
                </button>
                <button onClick={() => handleAction(maid._id, 'rejected', '')}
                  style={{ padding:'5px 12px', background:'rgba(255,107,107,0.08)', border:'1px solid rgba(255,107,107,0.2)', borderRadius:4, color:'#ff6b6b', fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:"'Jost',sans-serif" }}>
                  ✗ Reject
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display:'flex', gap:8, justifyContent:'center', marginTop:20 }}>
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              style={{ width:36, height:36, borderRadius:5, border:`1px solid ${page===p?'#c9a84c':'#2a2a2a'}`, background:page===p?'rgba(201,168,76,0.15)':'#1a1a1a', color:page===p?'#e8c97a':'#555', fontSize:13, cursor:'pointer' }}>
              {p}
            </button>
          ))}
        </div>
      )}

      <Modal maid={selected} onClose={() => setSelected(null)} onAction={handleAction}/>
    </div>
  );
}
