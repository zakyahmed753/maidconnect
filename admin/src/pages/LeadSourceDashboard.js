import React, { useEffect, useState, useCallback } from 'react';
import { adminAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const G = {
  bg: '#0e0e0e', card: '#141414', border: '#1f1f1f', b2: '#2a2a2a',
  text: '#f0ece4', muted: '#555', gold: '#c9a84c', goldL: '#e8c97a',
  green: '#5dd6a8', red: '#ff6b6b', blue: '#6aabcc',
};

const STATUS_CONFIG = {
  approved:  { label: 'Approved',  color: G.green },
  pending:   { label: 'Pending',   color: '#f0a050' },
  rejected:  { label: 'Rejected',  color: G.red },
  suspended: { label: 'Suspended', color: G.muted },
};

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return 'just now';
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30)  return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-EG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function LeadSourceDashboard() {
  const { admin } = useAuthStore();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getLeadsourceDashboard();
      setData(res.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const maids = data?.maids || [];
  const total = data?.total || 0;

  const approved  = maids.filter(m => m.approvalStatus === 'approved').length;
  const hired     = maids.filter(m => m.isHired).length;
  const available = maids.filter(m => m.isAvailable && !m.isHired).length;

  const filtered = maids.filter(m => {
    if (!search) return true;
    const s = search.toLowerCase();
    return m.fullName?.toLowerCase().includes(s) || m.nationality?.toLowerCase().includes(s);
  });

  return (
    <div style={{ fontFamily: "'Jost',sans-serif", maxWidth: 900, margin: '0 auto' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Jost:wght@400;500;600&family=DM+Mono:wght@400&display=swap');
        .ls-row:hover { background: rgba(201,168,76,0.04) !important; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 700, color: G.goldL }}>
          My Referral Dashboard
        </div>
        <div style={{ fontSize: 12, color: G.muted, fontFamily: "'DM Mono',monospace", marginTop: 4 }}>
          {admin?.name} · {data?.slug || '—'}
        </div>
      </div>

      {/* Stat tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Referred',  value: total,     color: G.goldL },
          { label: 'Approved',        value: approved,  color: G.green },
          { label: 'Currently Hired', value: hired,     color: G.blue  },
          { label: 'Available',       value: available, color: G.gold  },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, padding: '16px 18px' }}>
            <div style={{ fontSize: 26, fontWeight: 700, color, fontFamily: "'DM Mono',monospace" }}>{loading ? '…' : value}</div>
            <div style={{ fontSize: 11, color: G.muted, marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 14 }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or nationality…"
          style={{ width: '100%', padding: '9px 14px', background: G.card, border: `1px solid ${G.b2}`, borderRadius: 6, color: G.text, fontSize: 13, outline: 'none', fontFamily: "'Jost',sans-serif", boxSizing: 'border-box' }}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', color: G.muted, padding: 60 }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: G.muted, padding: 60 }}>No helpers found</div>
      ) : (
        <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', padding: '10px 16px', borderBottom: `1px solid ${G.b2}`, fontSize: 10, color: G.muted, fontFamily: "'DM Mono',monospace", letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            <span>Helper</span><span>Status</span><span>Available</span><span>Hired Times</span><span>Last Seen</span><span>Joined</span>
          </div>
          {filtered.map((m, i) => {
            const st = STATUS_CONFIG[m.approvalStatus] || STATUS_CONFIG.pending;
            return (
              <div key={m._id} className="ls-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', padding: '12px 16px', borderBottom: i < filtered.length - 1 ? `1px solid ${G.border}` : 'none', alignItems: 'center', transition: 'background 0.15s' }}>
                {/* Helper */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {m.photo
                    ? <img src={m.photo} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    : <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>👩</div>
                  }
                  <div>
                    <div style={{ fontSize: 13, color: G.text, fontWeight: 500 }}>{m.fullName}</div>
                    <div style={{ fontSize: 11, color: G.muted }}>{m.nationality}</div>
                  </div>
                </div>
                {/* Status */}
                <div>
                  <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 3, background: `${st.color}18`, color: st.color, fontFamily: "'DM Mono',monospace", letterSpacing: '0.06em' }}>
                    {st.label}
                  </span>
                </div>
                {/* Available */}
                <div style={{ fontSize: 12, color: m.isHired ? G.blue : m.isAvailable ? G.green : G.muted }}>
                  {m.isHired ? '🔒 Hired' : m.isAvailable ? '✅ Yes' : '⏸ No'}
                </div>
                {/* Hired count */}
                <div style={{ fontSize: 13, color: m.hiredCount > 0 ? G.goldL : G.muted, fontFamily: "'DM Mono',monospace" }}>
                  {m.hiredCount}×
                </div>
                {/* Last seen */}
                <div style={{ fontSize: 12, color: G.muted }}>{timeAgo(m.lastSeen)}</div>
                {/* Joined */}
                <div style={{ fontSize: 11, color: G.muted }}>{formatDate(m.joinedAt)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
