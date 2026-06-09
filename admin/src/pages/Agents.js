import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const G = {
  bg: '#0e0e0e', card: '#141414', border: '#1f1f1f', border2: '#2a2a2a',
  text: '#f0ece4', muted: '#555', gold: '#c9a84c', goldL: '#e8c97a',
  green: '#5dd6a8', red: '#ff6b6b', blue: '#6aabcc',
};

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [deleting, setDeleting] = useState(null);

  const load = () => {
    setLoading(true);
    adminAPI.listAgents()
      .then(r => setAgents(r.data.agents || []))
      .catch(() => toast.error('Failed to load agents'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      return toast.error('All fields are required');
    }
    if (form.password.length < 8) {
      return toast.error('Password must be at least 8 characters');
    }
    setCreating(true);
    try {
      await adminAPI.createAgent(form);
      toast.success(`Agent account created for ${form.email}`);
      setForm({ name: '', email: '', password: '' });
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create agent');
    } finally { setCreating(false); }
  };

  return (
    <div style={{ fontFamily: "'Jost',sans-serif", maxWidth: 700 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Jost:wght@400;500;600&family=DM+Mono:wght@400&display=swap');`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 700, color: G.text }}>
            🕵️ Agent Accounts
          </div>
          <div style={{ fontSize: 12, color: G.muted, marginTop: 4 }}>
            Agents can view maids, approve/reject profiles, and manage support tickets.
          </div>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{ padding: '9px 18px', background: `${G.gold}18`, border: `1px solid ${G.gold}50`, borderRadius: 6, color: G.goldL, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>
          {showForm ? '✕ Cancel' : '+ New Agent'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} style={{ background: G.card, border: `1px solid ${G.border2}`, borderRadius: 8, padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: G.text, marginBottom: 16 }}>Create Agent Account</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: G.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>Full Name</div>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Sarah Ahmed"
                style={{ width: '100%', padding: '9px 12px', background: '#1a1a1a', border: `1px solid ${G.border2}`, borderRadius: 5, color: G.text, fontSize: 13, outline: 'none', fontFamily: "'Jost',sans-serif", boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <div style={{ fontSize: 10, color: G.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>Email</div>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="agent@servix.world"
                style={{ width: '100%', padding: '9px 12px', background: '#1a1a1a', border: `1px solid ${G.border2}`, borderRadius: 5, color: G.text, fontSize: 13, outline: 'none', fontFamily: "'DM Mono',monospace", boxSizing: 'border-box' }}
              />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: G.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>Password (min 8 chars)</div>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
              style={{ width: '100%', padding: '9px 12px', background: '#1a1a1a', border: `1px solid ${G.border2}`, borderRadius: 5, color: G.text, fontSize: 13, outline: 'none', fontFamily: "'DM Mono',monospace", boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ background: `${G.blue}10`, border: `1px solid ${G.blue}30`, borderRadius: 6, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: G.blue, lineHeight: 1.6 }}>
            ℹ️ Agent can access: Maids list, maid profile (approve/reject/verify identity), support tickets.<br/>
            Agent cannot access: Dashboard, customers, payments, subscriptions, coupons, areas, notifications.
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowForm(false)}
              style={{ padding: '9px 18px', background: 'transparent', border: `1px solid ${G.border2}`, borderRadius: 5, color: G.muted, fontSize: 13, cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>
              Cancel
            </button>
            <button type="submit" disabled={creating}
              style={{ padding: '9px 22px', background: `${G.green}18`, border: `1px solid ${G.green}40`, borderRadius: 5, color: G.green, fontSize: 13, fontWeight: 700, cursor: creating ? 'not-allowed' : 'pointer', fontFamily: "'Jost',sans-serif", opacity: creating ? 0.6 : 1 }}>
              {creating ? 'Creating…' : '✅ Create Agent'}
            </button>
          </div>
        </form>
      )}

      {/* Agents list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: G.muted }}>Loading…</div>
      ) : agents.length === 0 ? (
        <div style={{ background: G.card, border: `1px dashed ${G.border2}`, borderRadius: 8, padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🕵️</div>
          <div style={{ fontSize: 15, color: G.text, marginBottom: 6 }}>No agents yet</div>
          <div style={{ fontSize: 12, color: G.muted }}>Create an agent account using the button above.</div>
        </div>
      ) : (
        <div>
          {agents.map(agent => (
            <div key={agent._id} style={{ background: G.card, border: `1px solid ${G.border2}`, borderRadius: 8, padding: '14px 18px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${G.blue}20`, border: `1px solid ${G.blue}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                {agent.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: G.text }}>{agent.name}</span>
                  <span style={{ fontSize: 9, background: `${G.blue}15`, color: G.blue, border: `1px solid ${G.blue}30`, borderRadius: 3, padding: '2px 7px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>AGENT</span>
                </div>
                <div style={{ fontSize: 11, color: G.muted, fontFamily: "'DM Mono',monospace", marginTop: 2 }}>{agent.email}</div>
              </div>
              <div style={{ fontSize: 10, color: G.muted, fontFamily: "'DM Mono',monospace", textAlign: 'right' }}>
                <div>Joined</div>
                <div>{new Date(agent.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
