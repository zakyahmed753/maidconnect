import React, { useEffect, useState } from 'react';
import { supportAPI } from '../services/api';
import toast from 'react-hot-toast';

const GOLD = '#e8c97a'; const GREEN = '#5dd6a8'; const RED = '#ff6b6b'; const BLUE = '#6b9fff';
const CARD = { background:'#161616', border:'1px solid #222', borderRadius:8, padding:20 };

const STATUS_COLOR  = { open: GOLD, in_progress: BLUE, resolved: GREEN, closed: '#555' };
const PRIORITY_COLOR = { low: GREEN, medium: GOLD, high: RED };

export default function SupportTickets() {
  const [tickets, setTickets]     = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRole, setFilterRole]     = useState('');
  const [adminNotes, setAdminNotes]     = useState('');
  const [saving, setSaving]             = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterRole)   params.role   = filterRole;
      const r = await supportAPI.getAll(params);
      setTickets(r.data.tickets || []);
      setTotal(r.data.total || 0);
    } catch { toast.error('Failed to load tickets'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterStatus, filterRole]);

  const openTicket = (t) => { setSelected(t); setAdminNotes(t.adminNotes || ''); };

  const handleUpdate = async (status) => {
    if (!selected) return;
    setSaving(true);
    try {
      const r = await supportAPI.update(selected._id, { status, adminNotes });
      setTickets(prev => prev.map(t => t._id === selected._id ? r.data.ticket : t));
      setSelected(r.data.ticket);
      toast.success('Ticket updated');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const openCount  = tickets.filter(t => t.status === 'open').length;
  const highCount  = tickets.filter(t => t.priority === 'high').length;

  return (
    <div style={{ display:'flex', gap:20, height:'calc(100vh - 110px)' }}>
      {/* Left panel */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', gap:16, minWidth:0 }}>
        {/* Stats row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
          {[['🎫', 'Total Tickets', total, GOLD], ['🔓', 'Open', openCount, RED], ['🔴', 'High Priority', highCount, RED]].map(([icon, label, val, color]) => (
            <div key={label} style={{ ...CARD, display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:22 }}>{icon}</span>
              <div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:700, color, lineHeight:1 }}>{val}</div>
                <div style={{ fontSize:10, color:'#666', textTransform:'uppercase', letterSpacing:'0.07em', marginTop:2 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:10 }}>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ background:'#1e1e1e', border:'1px solid #333', borderRadius:5, color:'#ccc', padding:'8px 12px', fontSize:12 }}>
            <option value="">All Statuses</option>
            {['open','in_progress','resolved','closed'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
          </select>
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
            style={{ background:'#1e1e1e', border:'1px solid #333', borderRadius:5, color:'#ccc', padding:'8px 12px', fontSize:12 }}>
            <option value="">All Roles</option>
            <option value="maid">Maids</option>
            <option value="housewife">Customers</option>
          </select>
          <button onClick={load} style={{ background:'#252525', border:'1px solid #333', borderRadius:5, color:'#aaa', padding:'8px 14px', cursor:'pointer', fontSize:12 }}>↻ Refresh</button>
        </div>

        {/* Ticket list */}
        <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:8 }}>
          {loading ? (
            <div style={{ textAlign:'center', color:'#555', paddingTop:40 }}>Loading…</div>
          ) : tickets.length === 0 ? (
            <div style={{ textAlign:'center', color:'#555', paddingTop:40 }}>No tickets found</div>
          ) : tickets.map(ticket => (
            <div key={ticket._id} onClick={() => openTicket(ticket)}
              style={{ ...CARD, cursor:'pointer', borderLeft:`3px solid ${STATUS_COLOR[ticket.status] || GOLD}`,
                background: selected?._id === ticket._id ? '#1e1a14' : '#161616',
                transition:'background 0.15s' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                <div style={{ fontWeight:600, color:'#f0ece4', fontSize:14, flex:1, marginRight:8 }}>{ticket.subject}</div>
                <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                  <span style={{ fontSize:10, padding:'2px 8px', borderRadius:10, background:`${PRIORITY_COLOR[ticket.priority]}20`, color:PRIORITY_COLOR[ticket.priority], textTransform:'uppercase', letterSpacing:'0.05em' }}>{ticket.priority}</span>
                  <span style={{ fontSize:10, padding:'2px 8px', borderRadius:10, background:`${STATUS_COLOR[ticket.status]}20`, color:STATUS_COLOR[ticket.status], textTransform:'uppercase', letterSpacing:'0.05em' }}>{ticket.status.replace('_',' ')}</span>
                </div>
              </div>
              <div style={{ fontSize:12, color:'#888', marginBottom:4 }} >{ticket.message.slice(0, 90)}{ticket.message.length > 90 ? '…' : ''}</div>
              <div style={{ display:'flex', gap:12, fontSize:10, color:'#555' }}>
                <span>{ticket.name}</span>
                <span style={{ color: ticket.role === 'maid' ? GOLD : GREEN }}>● {ticket.role}</span>
                <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right detail panel */}
      <div style={{ width:360, flexShrink:0 }}>
        {selected ? (
          <div style={{ ...CARD, height:'100%', overflowY:'auto', display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <div style={{ fontSize:11, color:'#555', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:4 }}>
                #{selected._id.slice(-8).toUpperCase()}
              </div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:'#f0ece4', fontWeight:700, lineHeight:1.3 }}>{selected.subject}</div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[['From', selected.name], ['Email', selected.email], ['Role', selected.role], ['Priority', selected.priority], ['Created', new Date(selected.createdAt).toLocaleDateString()]].map(([k,v]) => (
                <div key={k} style={{ background:'#1a1a1a', borderRadius:5, padding:'8px 10px' }}>
                  <div style={{ fontSize:9, color:'#555', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:2 }}>{k}</div>
                  <div style={{ fontSize:12, color: k==='Role' ? (v==='maid'?GOLD:GREEN) : '#ccc' }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ background:'#1a1a1a', borderRadius:5, padding:12 }}>
              <div style={{ fontSize:9, color:'#555', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>Message</div>
              <div style={{ fontSize:13, color:'#ccc', lineHeight:1.6 }}>{selected.message}</div>
            </div>
            <div>
              <div style={{ fontSize:9, color:'#555', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>Admin Notes</div>
              <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={4}
                style={{ width:'100%', background:'#1a1a1a', border:'1px solid #333', borderRadius:5, color:'#ccc', padding:'10px 12px', fontSize:12, resize:'vertical', boxSizing:'border-box' }}
                placeholder="Add a response or internal note…"/>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[['in_progress','Mark In Progress', BLUE], ['resolved','Mark Resolved', GREEN], ['closed','Close Ticket', '#555']].map(([status, label, color]) => (
                <button key={status} onClick={() => handleUpdate(status)} disabled={saving || selected.status === status}
                  style={{ background: selected.status===status ? '#252525' : `${color}18`, border:`1px solid ${selected.status===status ? '#333' : color}`,
                    borderRadius:5, color: selected.status===status ? '#555' : color, padding:'10px 14px', cursor: selected.status===status ? 'default' : 'pointer', fontSize:12, fontWeight:600, transition:'all 0.15s' }}>
                  {saving ? 'Saving…' : label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ ...CARD, height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#444', flexDirection:'column', gap:8 }}>
            <span style={{ fontSize:36 }}>🎫</span>
            <span style={{ fontSize:13 }}>Select a ticket to view details</span>
          </div>
        )}
      </div>
    </div>
  );
}
