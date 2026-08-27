import React, { useState } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const G = {
  bg:      '#0e0e0e',
  card:    '#141414',
  border:  '#1f1f1f',
  border2: '#2a2a2a',
  text:    '#f0ece4',
  muted:   '#555',
  gold:    '#c9a84c',
  goldL:   '#e8c97a',
  green:   '#5dd6a8',
  red:     '#ff6b6b',
  blue:    '#60a5fa',
};

const statusColors = {
  active:    G.green,
  expired:   G.red,
  cancelled: G.muted,
  none:      G.muted,
};

const Pill = ({ label, color }) => (
  <span style={{
    fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase',
    padding: '3px 9px', borderRadius: 3, fontWeight: 700,
    background: `${color || G.muted}18`,
    color: color || G.muted,
    border: `1px solid ${color || G.muted}35`,
  }}>{label}</span>
);

const Label = ({ children }) => (
  <div style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: G.muted, marginBottom: 5, fontFamily: "'DM Mono',monospace" }}>
    {children}
  </div>
);

const Field = ({ label, value, mono }) => (
  <div style={{ marginBottom: 14 }}>
    <Label>{label}</Label>
    <div style={{ fontSize: 13, color: value ? G.text : G.muted, fontFamily: mono ? "'DM Mono',monospace" : 'inherit', fontStyle: value ? 'normal' : 'italic' }}>
      {value || '—'}
    </div>
  </div>
);

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 24 }}>
    <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: G.gold, fontFamily: "'DM Mono',monospace", marginBottom: 14, paddingBottom: 8, borderBottom: `1px solid ${G.border}` }}>
      {title}
    </div>
    {children}
  </div>
);

export default function CustomerProfile({ hw: initialHw, onClose, onUpdate }) {
  const [hw,           setHw]           = useState(initialHw);
  const [activeTab,    setActiveTab]    = useState('profile');
  const [offlineAmt,   setOfflineAmt]   = useState('');
  const [offlineNote,  setOfflineNote]  = useState('');
  const [paying,       setPaying]       = useState(false);
  const [hardDeleting, setHardDeleting] = useState(false);

  if (!hw) return null;

  const subStatus = hw.subscription?.status || 'none';
  const subColor  = statusColors[subStatus] || G.muted;
  const phone     = hw.user?.phone || hw.phone;

  const handleSuspend = async () => {
    try {
      await adminAPI.suspendUser(hw.user?._id, { isSuspended: !hw.user?.isSuspended });
      toast.success(hw.user?.isSuspended ? 'Account unsuspended' : 'Account suspended');
      const updated = { ...hw, user: { ...hw.user, isSuspended: !hw.user?.isSuspended } };
      setHw(updated);
      onUpdate(hw._id, { user: updated.user });
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    const isDeleted = !!hw.user?.deletedAt;
    if (!window.confirm(isDeleted ? 'Restore this account?' : 'Soft-delete this account? Only admin can restore it.')) return;
    try {
      if (isDeleted) {
        await adminAPI.restoreUser(hw.user._id);
        toast.success('Account restored');
        const updated = { ...hw, user: { ...hw.user, deletedAt: null } };
        setHw(updated);
        onUpdate(hw._id, { user: updated.user });
      } else {
        await adminAPI.deleteUser(hw.user._id, { reason: 'Admin removed account' });
        toast.success('Account deactivated');
        const updated = { ...hw, user: { ...hw.user, deletedAt: new Date().toISOString() } };
        setHw(updated);
        onUpdate(hw._id, { user: updated.user });
      }
    } catch { toast.error('Failed'); }
  };

  const handleHardDelete = async () => {
    if (!window.confirm(`⚠️ PERMANENTLY DELETE "${hw.fullName}"?\n\nThis will delete:\n• Their account and profile\n• All their chats and messages\n• All their payments\n• All their notifications\n\nThis CANNOT be undone.`)) return;
    setHardDeleting(true);
    try {
      await adminAPI.hardDeleteHouseWife(hw._id);
      toast.success(`${hw.fullName} permanently deleted`);
      onClose();
      onUpdate(hw._id, null);
    } catch { toast.error('Failed to delete'); }
    finally { setHardDeleting(false); }
  };

  const handleOfflineSub = async () => {
    if (!window.confirm(`Record EGP ${offlineAmt || 1000} cash payment and activate subscription for ${hw.fullName}?`)) return;
    setPaying(true);
    try {
      await adminAPI.customerOfflineSubscription(hw._id, {
        amount: offlineAmt ? Number(offlineAmt) : 1000,
        note: offlineNote || undefined,
      });
      toast.success('Subscription activated');
      const now = new Date();
      const endDate = new Date(now); endDate.setMonth(endDate.getMonth() + 1);
      const updated = { ...hw, subscription: { status: 'active', startDate: now, endDate } };
      setHw(updated);
      onUpdate(hw._id, { subscription: updated.subscription });
      setOfflineAmt(''); setOfflineNote('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setPaying(false); }
  };

  const TABS = ['profile', 'actions'];

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 999, backdropFilter: 'blur(3px)' }} />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '92vw', maxWidth: 720, maxHeight: '90vh',
        background: G.bg, border: `1px solid ${G.border2}`, borderRadius: 10,
        zIndex: 1000, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        fontFamily: "'Jost',sans-serif",
      }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Jost:wght@400;500;600&family=DM+Mono:wght@400&display=swap');`}</style>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderBottom: `1px solid ${G.border}`, flexShrink: 0 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a84c,#e8c97a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
            👤
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, color: G.text }}>{hw.fullName}</span>
              <Pill label={`sub: ${subStatus}`} color={subColor} />
              {hw.user?.isSuspended && <Pill label="suspended" color={G.red} />}
              {hw.user?.deletedAt && <Pill label="deleted" color={G.muted} />}
            </div>
            <div style={{ fontSize: 11, color: G.muted, marginTop: 3 }}>
              {hw.user?.email}
              {phone ? <> · <span style={{ color: G.goldL, fontFamily: "'DM Mono',monospace" }}>📞 {phone}</span></> : ''}
              {hw.city ? ` · ${hw.city}` : ''}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: G.muted, fontSize: 22, cursor: 'pointer', padding: '4px 8px', lineHeight: 1 }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${G.border}`, flexShrink: 0 }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: '10px 18px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === tab ? G.gold : 'transparent'}`, color: activeTab === tab ? G.goldL : G.muted, fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', fontFamily: "'Jost',sans-serif", letterSpacing: '0.04em' }}>
              {tab === 'profile' ? '👤 Profile' : '⚡ Actions'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: 24 }}>

          {/* ── PROFILE TAB ── */}
          {activeTab === 'profile' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <Section title="Account">
                  <Field label="Full Name" value={hw.fullName} />
                  <Field label="Email"     value={hw.user?.email} mono />
                  <Field label="Phone"     value={phone} mono />
                  <Field label="City"      value={hw.city || 'Egypt'} />
                  <Field label="User ID"   value={hw.user?._id} mono />
                  <Field label="Profile ID" value={hw._id} mono />
                  <div style={{ marginBottom: 14 }}>
                    <Label>Account Status</Label>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {hw.user?.deletedAt
                        ? <Pill label="⚫ Deleted" color={G.muted} />
                        : hw.user?.isSuspended
                          ? <Pill label="🔴 Suspended" color={G.red} />
                          : <Pill label="🟢 Active" color={G.green} />}
                    </div>
                  </div>
                  {hw.createdAt && (
                    <Field label="Joined" value={new Date(hw.createdAt).toLocaleDateString()} />
                  )}
                </Section>
              </div>

              <div>
                <Section title="Subscription">
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                    <Pill label={subStatus} color={subColor} />
                  </div>
                  <Field label="Start Date" value={hw.subscription?.startDate ? new Date(hw.subscription.startDate).toLocaleDateString() : null} />
                  <Field label="End Date"
                    value={(() => {
                      if (!hw.subscription?.endDate) return null;
                      const d = new Date(hw.subscription.endDate);
                      if (d.getFullYear() >= 2099) return null;
                      return d.toLocaleDateString();
                    })()} />
                </Section>

                <Section title="Activity">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                    {[
                      ['❤️', hw.savedMaids?.length || 0, 'Saved'],
                      ['💼', hw.hiredMaids?.length || 0, 'Hired'],
                    ].map(([icon, val, lbl]) => (
                      <div key={lbl} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 6, padding: '10px 8px', textAlign: 'center' }}>
                        <div style={{ fontSize: 18 }}>{icon}</div>
                        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: G.goldL, fontWeight: 700 }}>{val}</div>
                        <div style={{ fontSize: 9, color: G.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{lbl}</div>
                      </div>
                    ))}
                  </div>
                </Section>
              </div>
            </div>
          )}

          {/* ── ACTIONS TAB ── */}
          {activeTab === 'actions' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

              {/* Offline Cash Payment */}
              <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, padding: 18, gridColumn: '1 / -1' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: G.text, marginBottom: 2 }}>💵 Offline Cash Payment</div>
                <div style={{ fontSize: 11, color: G.muted, marginBottom: 12 }}>Records a cash payment and activates a 1-month subscription.</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input type="number" placeholder="Amount EGP (default 1000)" value={offlineAmt} onChange={e => setOfflineAmt(e.target.value)}
                    style={{ flex: 1, padding: '8px 10px', background: '#1a1a1a', border: `1px solid ${G.border2}`, borderRadius: 4, color: G.text, fontSize: 12, outline: 'none', fontFamily: "'Jost',sans-serif" }} />
                  <input placeholder="Admin note (optional)" value={offlineNote} onChange={e => setOfflineNote(e.target.value)}
                    style={{ flex: 2, padding: '8px 10px', background: '#1a1a1a', border: `1px solid ${G.border2}`, borderRadius: 4, color: G.text, fontSize: 12, outline: 'none', fontFamily: "'Jost',sans-serif" }} />
                </div>
                <button onClick={handleOfflineSub} disabled={paying}
                  style={{ width: '100%', padding: '10px', background: 'rgba(93,214,168,0.13)', border: '1px solid rgba(93,214,168,0.4)', borderRadius: 5, color: G.green, fontSize: 12, fontWeight: 700, cursor: paying ? 'not-allowed' : 'pointer', fontFamily: "'Jost',sans-serif", opacity: paying ? 0.6 : 1 }}>
                  {paying ? '⏳ Activating…' : '✅ Confirm Cash Payment & Activate Subscription'}
                </button>
              </div>

              {/* Account Status */}
              <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, padding: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: G.text, marginBottom: 4 }}>Account Status</div>
                <div style={{ fontSize: 11, color: G.muted, marginBottom: 12 }}>
                  {hw.user?.deletedAt ? '⚫ Account is deactivated (soft-deleted)' : hw.user?.isSuspended ? '🔴 Account is currently suspended' : '🟢 Account is active'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button onClick={handleSuspend}
                    style={{ padding: '9px', background: hw.user?.isSuspended ? `${G.green}12` : `${G.red}10`, border: `1px solid ${hw.user?.isSuspended ? G.green : G.red}35`, borderRadius: 5, color: hw.user?.isSuspended ? G.green : G.red, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>
                    {hw.user?.isSuspended ? '✅ Unsuspend Account' : '🔴 Suspend Account'}
                  </button>
                  <button onClick={handleDelete}
                    style={{ padding: '9px', background: hw.user?.deletedAt ? `${G.green}10` : 'rgba(60,60,60,0.3)', border: `1px solid ${hw.user?.deletedAt ? G.green + '40' : '#444'}`, borderRadius: 5, color: hw.user?.deletedAt ? G.green : '#888', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>
                    {hw.user?.deletedAt ? '↩ Restore Account' : '🗑 Delete Account (Soft)'}
                  </button>
                </div>
              </div>

              {/* Quick Info */}
              <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, padding: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: G.text, marginBottom: 12 }}>Quick Summary</div>
                {[
                  ['Subscription', subStatus.toUpperCase()],
                  ['Saved Maids',  hw.savedMaids?.length || 0],
                  ['Hired Maids',  hw.hiredMaids?.length || 0],
                  ['Phone',        phone || 'Not provided'],
                  ['City',         hw.city || 'Not set'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${G.border}`, padding: '6px 0', fontSize: 12 }}>
                    <span style={{ color: G.muted }}>{k}</span>
                    <span style={{ color: G.text, fontFamily: k === 'Phone' ? "'DM Mono',monospace" : 'inherit' }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Hard Delete — danger zone */}
              <div style={{ background: '#140a0a', border: '1.5px solid rgba(255,107,107,0.35)', borderRadius: 8, padding: 18, gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 16 }}>☠️</span>
                  <div style={{ fontSize: 13, fontWeight: 700, color: G.red }}>Permanent Delete</div>
                  <span style={{ fontSize: 9, background: 'rgba(255,107,107,0.12)', color: G.red, border: '1px solid rgba(255,107,107,0.35)', borderRadius: 3, padding: '2px 7px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>DANGER ZONE</span>
                </div>
                <div style={{ fontSize: 11, color: '#cc5555', marginBottom: 14, lineHeight: 1.6 }}>
                  Permanently erases the customer profile, user account, all chats, messages, payments, and notifications. Cannot be undone.
                </div>
                <button onClick={handleHardDelete} disabled={hardDeleting}
                  style={{ width: '100%', padding: '11px', background: 'rgba(255,107,107,0.12)', border: '1.5px solid rgba(255,107,107,0.45)', borderRadius: 5, color: G.red, fontSize: 13, fontWeight: 700, cursor: hardDeleting ? 'not-allowed' : 'pointer', fontFamily: "'Jost',sans-serif", opacity: hardDeleting ? 0.6 : 1 }}>
                  {hardDeleting ? '⏳ Deleting…' : '☠️ Permanently Delete Customer'}
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
}
