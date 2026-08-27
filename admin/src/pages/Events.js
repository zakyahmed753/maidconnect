import React, { useEffect, useState, useCallback } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const G = {
  bg:     '#0e0e0e',
  card:   '#141414',
  border: '#1f1f1f',
  b2:     '#2a2a2a',
  text:   '#f0ece4',
  muted:  '#555',
  gold:   '#c9a84c',
  goldL:  '#e8c97a',
  green:  '#5dd6a8',
  red:    '#ff6b6b',
  blue:   '#6aabcc',
};

const EVENT_META = {
  screen_browse:       { icon: '🏠', label: 'Browse Screen',    color: G.green, cat: 'screen' },
  screen_maid_detail:  { icon: '👩', label: 'Maid Profile',     color: G.blue,  cat: 'screen' },
  action_view_maid:    { icon: '👁', label: 'Viewed Maid',      color: G.blue,  cat: 'action' },
  action_save_maid:    { icon: '❤️', label: 'Saved Maid',       color: G.red,   cat: 'action' },
  action_open_chat:    { icon: '💬', label: 'Opened Chat',      color: G.gold,  cat: 'action' },
  action_hire_request: { icon: '📋', label: 'Hire Request',     color: G.green, cat: 'action' },
  action_search:       { icon: '🔍', label: 'Search',           color: G.goldL, cat: 'action' },
};

const FUNNEL = [
  { key: 'screen_browse',       label: 'Browse' },
  { key: 'action_view_maid',    label: 'View Maid' },
  { key: 'action_open_chat',    label: 'Open Chat' },
  { key: 'action_hire_request', label: 'Hire Request' },
];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Events() {
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [days,       setDays]       = useState(7);
  const [filterName, setFilterName] = useState('');
  const [search,     setSearch]     = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getEvents({ days, name: filterName || undefined });
      setData(res.data);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Network error';
      toast.error(`Events: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [days, filterName]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  const stats     = data?.stats     || [];
  const events    = data?.events    || [];
  const dauData   = data?.dauData   || [];

  const countOf = (name) => stats.find(s => s._id === name)?.count || 0;

  const totalToday = events.filter(e => {
    const d = new Date(e.createdAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  const dauToday = (() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return dauData.find(d => d._id === todayStr)?.users || 0;
  })();

  const funnelMax = countOf('screen_browse') || 1;

  const filteredFeed = events.filter(e => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      e.name?.toLowerCase().includes(s) ||
      e.userId?.name?.toLowerCase().includes(s) ||
      e.userId?.email?.toLowerCase().includes(s) ||
      e.meta?.maidName?.toLowerCase().includes(s) ||
      e.meta?.query?.toLowerCase().includes(s)
    );
  });

  const topAction = stats.filter(s => s._id?.startsWith('action_'))
    .sort((a, b) => b.count - a.count)[0];

  return (
    <div style={{ fontFamily: "'Jost',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Jost:wght@400;500;600&family=DM+Mono:wght@400&display=swap');
        .ev-row:hover { background: rgba(201,168,76,0.05) !important; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #0e0e0e; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
      `}</style>

      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        {[1, 7, 30].map(d => (
          <button key={d} onClick={() => setDays(d)}
            style={{ padding: '6px 14px', borderRadius: 4, border: `1px solid ${days === d ? G.gold : G.b2}`, background: days === d ? `${G.gold}15` : G.card, color: days === d ? G.goldL : G.muted, fontSize: 11, cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>
            {d === 1 ? 'Today' : `${d}d`}
          </button>
        ))}
        <div style={{ width: 1, height: 20, background: G.b2, margin: '0 4px' }} />
        {['', ...Object.keys(EVENT_META)].map(n => (
          <button key={n} onClick={() => setFilterName(n)}
            style={{ padding: '5px 11px', borderRadius: 4, border: `1px solid ${filterName === n ? G.blue : G.b2}`, background: filterName === n ? `${G.blue}15` : G.card, color: filterName === n ? G.blue : G.muted, fontSize: 10, cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>
            {n ? (EVENT_META[n]?.icon + ' ' + EVENT_META[n]?.label) : 'All'}
          </button>
        ))}
        <button onClick={load} style={{ marginLeft: 'auto', padding: '6px 12px', borderRadius: 4, border: `1px solid ${G.b2}`, background: G.card, color: G.muted, fontSize: 11, cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>
          🔄 Refresh
        </button>
      </div>

      {/* ── Stat tiles ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { icon: '📅', value: totalToday,          label: 'Events Today',    color: G.goldL },
          { icon: '👤', value: dauToday,             label: 'Active Users Today', color: G.green },
          { icon: '📊', value: events.length,        label: `Total (${days}d)`, color: G.blue },
          { icon: '🏆', value: topAction ? `${EVENT_META[topAction._id]?.icon || ''} ${EVENT_META[topAction._id]?.label || topAction._id}` : '—', label: 'Top Action', color: G.gold, small: true },
        ].map(({ icon, value, label, color, small }) => (
          <div key={label} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, padding: '16px 18px' }}>
            <div style={{ fontSize: 18, marginBottom: 6 }}>{icon}</div>
            <div style={{ fontFamily: small ? "'Jost',sans-serif" : "'Cormorant Garamond',serif", fontSize: small ? 13 : 28, fontWeight: 700, color, lineHeight: 1.1 }}>{value}</div>
            <div style={{ fontSize: 10, color: G.muted, marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

        {/* ── Funnel ── */}
        <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, padding: '18px 20px' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: G.gold, fontFamily: "'DM Mono',monospace", marginBottom: 16, paddingBottom: 8, borderBottom: `1px solid ${G.border}` }}>
            Customer Funnel
          </div>
          {FUNNEL.map((step, i) => {
            const count = countOf(step.key);
            const pct = Math.round((count / funnelMax) * 100);
            const prev = i > 0 ? countOf(FUNNEL[i - 1].key) : count;
            const dropPct = prev > 0 && i > 0 ? Math.round(((prev - count) / prev) * 100) : null;
            return (
              <div key={step.key} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: G.text }}>{EVENT_META[step.key]?.icon} {step.label}</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {dropPct !== null && (
                      <span style={{ fontSize: 9, color: dropPct > 50 ? G.red : G.muted, fontFamily: "'DM Mono',monospace" }}>
                        ↓{dropPct}% drop
                      </span>
                    )}
                    <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: G.goldL, fontWeight: 700 }}>{count.toLocaleString()}</span>
                  </div>
                </div>
                <div style={{ height: 6, background: G.b2, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${G.green}, ${G.goldL})`, borderRadius: 3, transition: 'width 0.4s' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Event breakdown ── */}
        <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, padding: '18px 20px' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: G.gold, fontFamily: "'DM Mono',monospace", marginBottom: 16, paddingBottom: 8, borderBottom: `1px solid ${G.border}` }}>
            Event Breakdown
          </div>
          {Object.entries(EVENT_META).map(([key, meta]) => {
            const count = countOf(key);
            const maxCount = Math.max(...Object.keys(EVENT_META).map(k => countOf(k)), 1);
            const pct = Math.round((count / maxCount) * 100);
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 14, width: 20, textAlign: 'center', flexShrink: 0 }}>{meta.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 11, color: G.text }}>{meta.label}</span>
                    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: meta.color }}>{count.toLocaleString()}</span>
                  </div>
                  <div style={{ height: 4, background: G.b2, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: meta.color, borderRadius: 2, opacity: 0.8 }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── DAU sparkline ── */}
      {dauData.length > 1 && (
        <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, padding: '18px 20px', marginBottom: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: G.gold, fontFamily: "'DM Mono',monospace", marginBottom: 14, paddingBottom: 8, borderBottom: `1px solid ${G.border}` }}>
            Daily Active Users
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 60 }}>
            {dauData.map(d => {
              const maxUsers = Math.max(...dauData.map(x => x.users), 1);
              const h = Math.max(Math.round((d.users / maxUsers) * 56), 3);
              const label = d._id?.slice(5); // MM-DD
              return (
                <div key={d._id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontSize: 9, color: G.muted, fontFamily: "'DM Mono',monospace" }}>{d.users}</div>
                  <div style={{ width: '100%', height: h, background: `linear-gradient(180deg, ${G.green}, ${G.green}88)`, borderRadius: '3px 3px 0 0', minHeight: 3 }} title={`${label}: ${d.users} users`} />
                  <div style={{ fontSize: 8, color: G.muted, fontFamily: "'DM Mono',monospace" }}>{label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Live feed ── */}
      <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: `1px solid ${G.border}` }}>
          <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: G.gold, fontFamily: "'DM Mono',monospace", flex: 1 }}>
            Live Event Feed — {filteredFeed.length} events
          </div>
          {loading && <span style={{ fontSize: 10, color: G.muted }}>loading…</span>}
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter by user, screen, maid…"
            style={{ padding: '6px 12px', background: '#1a1a1a', border: `1px solid ${G.b2}`, borderRadius: 4, color: G.text, fontSize: 12, outline: 'none', width: 240, fontFamily: "'Jost',sans-serif" }}
          />
        </div>

        <div style={{ maxHeight: 480, overflowY: 'auto' }}>
          {filteredFeed.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: 40, color: G.muted, fontSize: 13 }}>
              No events yet — open the app on a device to start tracking
            </div>
          )}
          {filteredFeed.map((e, i) => {
            const meta = EVENT_META[e.name] || { icon: '📌', label: e.name, color: G.muted };
            const userName = e.userId?.name || (e.role === 'guest' ? 'Guest' : 'Unknown');
            const userEmail = e.userId?.email || '';
            const detail = e.meta?.maidName || e.meta?.query || '';
            return (
              <div key={e._id || i} className="ev-row"
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderBottom: `1px solid ${G.border}`, transition: 'background 0.12s' }}>
                {/* Icon */}
                <div style={{ width: 32, height: 32, borderRadius: 6, background: `${meta.color}15`, border: `1px solid ${meta.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                  {meta.icon}
                </div>
                {/* Event name */}
                <div style={{ width: 140, flexShrink: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: meta.color }}>{meta.label}</div>
                  {detail && <div style={{ fontSize: 10, color: G.muted, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{detail}</div>}
                </div>
                {/* User */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: G.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
                  <div style={{ fontSize: 10, color: G.muted, fontFamily: "'DM Mono',monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</div>
                </div>
                {/* Platform + version */}
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: G.muted }}>
                    {e.platform === 'ios' ? '🍏' : e.platform === 'android' ? '🤖' : '—'} {e.platform || ''}
                  </div>
                  <div style={{ fontSize: 9, color: '#333', fontFamily: "'DM Mono',monospace" }}>v{e.appVersion || '?'}</div>
                </div>
                {/* Time */}
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: G.muted, flexShrink: 0, width: 68, textAlign: 'right' }}>
                  {timeAgo(e.createdAt)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
