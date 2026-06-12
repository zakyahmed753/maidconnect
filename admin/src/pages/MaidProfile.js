import React, { useState } from 'react';
import { adminAPI } from '../services/api';
import useAuthStore from '../store/authStore';
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
  pending:    '#f0a050',
  approved:   G.green,
  rejected:   G.red,
  suspended:  G.muted,
  verified:   G.green,
  unverified: G.muted,
  active:     G.green,
  expired:    G.red,
  cancelled:  G.muted,
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

const DocImage = ({ label, url, fallback, optional }) => (
  <div style={{ flex: 1 }}>
    <Label>{label}</Label>
    {url ? (
      <a href={url} target="_blank" rel="noreferrer" style={{ display: 'block' }}>
        <img src={url} alt={label} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 6, border: `1px solid ${G.border2}`, cursor: 'zoom-in' }} />
        <div style={{ fontSize: 10, color: G.gold, marginTop: 4 }}>🔍 Click to open full size</div>
      </a>
    ) : (
      <div style={{ width: '100%', height: 180, background: G.card, borderRadius: 6, border: `1px dashed ${G.border2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 28 }}>{fallback || '📄'}</div>
        <div style={{ fontSize: 11, color: G.muted }}>{optional ? 'Not required' : 'Not submitted'}</div>
        {!optional && <div style={{ fontSize: 9, color: '#f0a05080', textAlign: 'center', maxWidth: 120 }}>Maid needs to resubmit verification</div>}
      </div>
    )}
  </div>
);

export default function MaidProfile({ maid: initialMaid, onClose, onUpdate }) {
  const currentAdmin = useAuthStore(s => s.admin);
  const isAgent = currentAdmin?.role === 'agent';
  const [maid,           setMaid]           = useState(initialMaid);
  const [pendingReceipt, setPendingReceipt] = useState(null);
  const [fetching,       setFetching]       = useState(true);
  const [approving,    setApproving]    = useState(false);
  const [verifying,    setVerifying]    = useState(false);
  const [noteText,     setNoteText]     = useState('');
  const [activeTab,    setActiveTab]    = useState('profile');
  const [imgModal,     setImgModal]     = useState(null);
  const [offlinePlan,  setOfflinePlan]  = useState('monthly');
  const [offlineAmt,   setOfflineAmt]   = useState('');
  const [offlineNote,  setOfflineNote]  = useState('');
  const [offlineLoading, setOfflineLoading] = useState(false);
  const [releasing,    setReleasing]    = useState(false);

  const refreshMaid = React.useCallback(() => {
    if (!initialMaid?._id) return;
    setFetching(true);
    adminAPI.getMaid(initialMaid._id)
      .then(r => {
        setMaid(r.data.maid);
        const receipt = r.data.pendingReceipt || null;
        setPendingReceipt(receipt);
        if (receipt) setActiveTab('actions');
      })
      .catch(() => toast.error('Failed to load maid details'))
      .finally(() => setFetching(false));
  }, [initialMaid?._id]);

  // Fetch full maid data on open to get passport/selfie/all fields
  React.useEffect(() => { refreshMaid(); }, [refreshMaid]);

  if (!maid) return null;

  const handleApprove = async (status) => {
    setApproving(true);
    try {
      await adminAPI.updateMaidStatus(maid._id, { status, note: noteText });
      toast.success(`Maid ${status}`);
      onUpdate(maid._id, { approvalStatus: status });
      setNoteText('');
    } catch { toast.error('Failed to update status'); }
    finally { setApproving(false); }
  };

  const handleVerify = async (status) => {
    setVerifying(true);
    try {
      await adminAPI.verifyIdentity(maid._id, { status, note: noteText });
      toast.success(`Identity ${status}`);
      onUpdate(maid._id, { verificationStatus: status });
      setNoteText('');
    } catch { toast.error('Failed to verify identity'); }
    finally { setVerifying(false); }
  };

  const handleSuspend = async () => {
    try {
      await adminAPI.suspendUser(maid.user?._id, { isSuspended: !maid.user?.isSuspended });
      toast.success(maid.user?.isSuspended ? 'Unsuspended' : 'Suspended');
      onUpdate(maid._id, { user: { ...maid.user, isSuspended: !maid.user?.isSuspended } });
    } catch { toast.error('Failed'); }
  };

  const handleActivateSub = async () => {
    try {
      await adminAPI.activateSubscription(maid._id, { plan: 'monthly' });
      toast.success('Subscription activated');
      const updated = { ...maid.subscription, status: 'active', plan: 'monthly' };
      setMaid(prev => ({ ...prev, subscription: updated }));
      onUpdate(maid._id, { subscription: updated });
    } catch { toast.error('Failed to activate subscription'); }
  };

  const handleRejectReceipt = async () => {
    if (!pendingReceipt?._id) return;
    if (!window.confirm('Reject this receipt? The maid will be notified to resubmit.')) return;
    try {
      await adminAPI.rejectOfflinePayment({
        paymentId: pendingReceipt._id,
        reason: 'Receipt rejected by admin. Please transfer again and upload a clear receipt.',
      });
      toast.success('Receipt rejected — maid notified to resubmit');
      setPendingReceipt(null);
    } catch { toast.error('Failed to reject receipt'); }
  };

  const handleOfflinePayment = async (fromReceipt = false) => {
    setOfflineLoading(true);
    try {
      const plan = fromReceipt ? (pendingReceipt?.subscriptionPlan || 'monthly') : offlinePlan;
      const amount = fromReceipt ? pendingReceipt?.amount : (offlineAmt ? Number(offlineAmt) : undefined);
      const note = fromReceipt ? 'Confirmed by admin via receipt' : (offlineNote || undefined);
      await adminAPI.offlinePayment(maid._id, { plan, amount, note });
      toast.success(`✅ Subscription activated — ${plan} plan`);
      const updated = { ...maid.subscription, status: 'active', plan };
      setMaid(prev => ({ ...prev, subscription: updated }));
      onUpdate(maid._id, { subscription: updated });
      setOfflineAmt(''); setOfflineNote('');
      setPendingReceipt(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to activate subscription');
    }
    finally { setOfflineLoading(false); }
  };

  const handleReleaseMaid = async () => {
    if (!window.confirm('Release this maid from her current customer? This mirrors the customer release flow — the customer will get a free-replacement vacancy and the maid becomes available again.')) return;
    setReleasing(true);
    try {
      await adminAPI.releaseMaid(maid._id);
      toast.success('Maid released — profile is now visible to new customers');
      setMaid(prev => ({ ...prev, isHired: false, isAvailable: true }));
      onUpdate(maid._id, { isHired: false, isAvailable: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to release maid');
    } finally { setReleasing(false); }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm(maid.user?.deletedAt ? 'Restore this account?' : 'Soft-delete this account? Only admin can restore it.')) return;
    try {
      if (maid.user?.deletedAt) {
        await adminAPI.restoreUser(maid.user._id);
        toast.success('Account restored');
        onUpdate(maid._id, { user: { ...maid.user, deletedAt: null } });
      } else {
        await adminAPI.deleteUser(maid.user._id, { reason: 'Admin removed account' });
        toast.success('Account deactivated');
        onUpdate(maid._id, { user: { ...maid.user, deletedAt: new Date().toISOString() } });
      }
    } catch { toast.error('Failed'); }
  };

  const TABS = ['profile', 'documents', 'photos', 'actions'];
  const TAB_LABELS = {
    profile: '👤 Profile', documents: '📄 Documents',
    photos: '📸 Photos',
    actions: pendingReceipt ? '⚡ Actions 🔴' : '⚡ Actions',
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 999, backdropFilter: 'blur(3px)' }} />

      {/* Full-image modal */}
      {imgModal && (
        <div onClick={() => setImgModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}>
          <img src={imgModal} alt="full" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 6 }} />
        </div>
      )}

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '92vw', maxWidth: 860, maxHeight: '90vh',
        background: G.bg, border: `1px solid ${G.border2}`, borderRadius: 10,
        zIndex: 1000, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        fontFamily: "'Jost',sans-serif",
      }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Jost:wght@400;500;600&family=DM+Mono:wght@400&display=swap');`}</style>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderBottom: `1px solid ${G.border}`, flexShrink: 0 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${G.gold}40`, flexShrink: 0, background: '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {maid.photos?.[0]?.url
              ? <img src={maid.photos[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 26 }}>👩</span>}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, color: G.text }}>{maid.fullName}</span>
              {fetching && <span style={{ fontSize: 10, color: G.muted, fontFamily: "'DM Mono',monospace" }}>loading…</span>}
              <Pill label={maid.approvalStatus} color={statusColors[maid.approvalStatus]} />
              <Pill label={`id: ${maid.verificationStatus}`} color={statusColors[maid.verificationStatus]} />
              {maid.user?.isSuspended && <Pill label="suspended" color={G.red} />}
            </div>
            <div style={{ fontSize: 11, color: G.muted, marginTop: 3 }}>
              {maid.nationality} · {maid.age} yrs · {maid.user?.email} · Joined {new Date(maid.createdAt).toLocaleDateString()}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: G.muted, fontSize: 22, cursor: 'pointer', padding: '4px 8px', lineHeight: 1 }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${G.border}`, flexShrink: 0 }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); if (tab === 'actions') refreshMaid(); }}
              style={{ padding: '10px 18px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === tab ? G.gold : 'transparent'}`, color: activeTab === tab ? G.goldL : G.muted, fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', fontFamily: "'Jost',sans-serif", letterSpacing: '0.04em' }}>
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: 24 }}>

          {/* ── PROFILE TAB ── */}
          {activeTab === 'profile' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <Section title="Personal Info">
                  <Field label="Full Name"   value={maid.fullName} />
                  <Field label="Age"         value={`${maid.age} years`} />
                  <Field label="Nationality" value={maid.nationality} />
                  <Field label="Origin"      value={maid.origin} />
                  <Field label="Residential Area" value={maid.residentialArea} />
                  <Field label="Languages"   value={(maid.languages || []).join(', ')} />
                  <div style={{ marginBottom: 14 }}>
                    <Label>Bio</Label>
                    <div style={{ fontSize: 13, color: maid.bio ? G.text : G.muted, lineHeight: 1.6, fontStyle: maid.bio ? 'normal' : 'italic' }}>
                      {maid.bio || 'No bio provided'}
                    </div>
                  </div>
                </Section>

                <Section title="Account">
                  <Field label="Email"  value={maid.user?.email} mono />
                  <Field label="Phone"  value={maid.user?.phone} mono />
                  <Field label="User ID" value={maid.user?._id} mono />
                </Section>
              </div>

              <div>
                <Section title="Professional Info">
                  <Field label="Experience"       value={`${maid.experienceYears} years`} />
                  <Field label="Expected Salary"  value={`EGP ${(maid.expectedSalary || 0).toLocaleString()} / month`} />
                  <div style={{ marginBottom: 14 }}>
                    <Label>Skills</Label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {(maid.skills || []).length > 0
                        ? (maid.skills || []).map(s => <span key={s} style={{ fontSize: 11, background: `${G.gold}14`, color: G.gold, border: `1px solid ${G.gold}30`, borderRadius: 3, padding: '3px 8px' }}>{s}</span>)
                        : <span style={{ fontSize: 12, color: G.muted }}>—</span>}
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <Label>Previous Countries</Label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {(maid.previousCountries || []).length > 0
                        ? (maid.previousCountries || []).map(c => <span key={c} style={{ fontSize: 11, background: '#1e1e1e', color: G.text, border: `1px solid ${G.border2}`, borderRadius: 3, padding: '3px 8px' }}>{c}</span>)
                        : <span style={{ fontSize: 12, color: G.muted }}>—</span>}
                    </div>
                  </div>
                </Section>

                <Section title="Subscription">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <Pill label={maid.subscription?.status || 'none'} color={statusColors[maid.subscription?.status] || G.muted} />
                    <Pill label={maid.subscription?.plan || 'no plan'} color={G.gold} />
                  </div>
                  <Field label="Start Date" value={maid.subscription?.startDate ? new Date(maid.subscription.startDate).toLocaleDateString() : null} />
                  <Field label="End Date"   value={maid.subscription?.endDate   ? new Date(maid.subscription.endDate).toLocaleDateString()   : null} />
                </Section>

                <Section title="Stats">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                    {[['👁', maid.stats?.views || 0, 'Views'], ['❤️', maid.stats?.likes || 0, 'Likes'], ['💬', maid.stats?.chats || 0, 'Chats'], ['🏠', maid.stats?.hireCount || 0, 'Hires']].map(([icon, val, lbl]) => (
                      <div key={lbl} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 6, padding: '10px 8px', textAlign: 'center' }}>
                        <div style={{ fontSize: 16 }}>{icon}</div>
                        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: G.goldL, fontWeight: 700 }}>{val}</div>
                        <div style={{ fontSize: 9, color: G.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{lbl}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <Pill label={maid.isAvailable ? '● Available' : '○ Unavailable'} color={maid.isAvailable ? G.green : G.muted} />
                    {maid.isHired && <Pill label="Hired" color={G.gold} />}
                    <Pill label={`⭐ ${maid.rating?.toFixed(1) || '0.0'} (${maid.reviewCount || 0} reviews)`} color={G.goldL} />
                  </div>
                </Section>
              </div>
            </div>
          )}

          {/* ── DOCUMENTS TAB ── */}
          {activeTab === 'documents' && (
            <div>
              {/* Show warning if docs are missing */}
              {!maid.selfie?.photo?.url && !maid.passport?.photo?.url && (
                <div style={{ background: '#f0a05015', border: '1px solid #f0a05040', borderRadius: 6, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#f0a050' }}>
                  ⚠️ No documents on file — maid submitted before image upload was configured, or upload failed. Ask them to resubmit verification from the app.
                </div>
              )}
              <Section title="Identity Verification">
                <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                  <DocImage label={maid.nationalId ? 'National ID (Egyptian)' : 'Passport Photo'} url={maid.passport?.photo?.url} fallback="🛂" optional={!!maid.nationalId} />
                  <DocImage label="Selfie" url={maid.selfie?.photo?.url} fallback="🤳" />
                  <DocImage label="Residence Permit" url={maid.residencePermit?.url} fallback="📋" optional />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                  <Field label="Passport Number" value={maid.passport?.number || (maid.nationalId ? 'N/A (Egyptian ID)' : null)} mono />
                  <Field label="National ID (Egyptian)" value={maid.nationalId} mono />
                  <Field label="Passport Submitted"   value={maid.passport?.submittedAt   ? new Date(maid.passport.submittedAt).toLocaleString()   : null} />
                  <Field label="Selfie Submitted"     value={maid.selfie?.submittedAt     ? new Date(maid.selfie.submittedAt).toLocaleString()     : null} />
                  <Field label="Permit Submitted"     value={maid.residencePermit?.submittedAt ? new Date(maid.residencePermit.submittedAt).toLocaleString() : null} />
                  <Field label="Verification Note"    value={maid.verificationNote} />
                </div>

                {/* Verify Actions */}
                <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 11, color: G.muted, marginBottom: 10 }}>Admin Note (optional)</div>
                  <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={2} placeholder="Add a note for the maid…"
                    style={{ width: '100%', padding: '9px 12px', background: '#1a1a1a', border: `1px solid ${G.border2}`, borderRadius: 5, color: G.text, fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: "'Jost',sans-serif", boxSizing: 'border-box', marginBottom: 10 }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleVerify('verified')} disabled={verifying}
                      style={{ flex: 1, padding: '9px 0', background: `${G.green}18`, border: `1px solid ${G.green}40`, borderRadius: 5, color: G.green, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>
                      ✅ Verify Identity
                    </button>
                    <button onClick={() => handleVerify('rejected')} disabled={verifying}
                      style={{ flex: 1, padding: '9px 0', background: `${G.red}12`, border: `1px solid ${G.red}35`, borderRadius: 5, color: G.red, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>
                      ❌ Reject Documents
                    </button>
                  </div>
                </div>
              </Section>
            </div>
          )}

          {/* ── PHOTOS TAB ── */}
          {activeTab === 'photos' && (
            <Section title={`Profile Photos (${(maid.photos || []).length})`}>
              {(maid.photos || []).length === 0
                ? <div style={{ textAlign: 'center', padding: 60, color: G.muted }}>No photos uploaded yet</div>
                : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 }}>
                    {(maid.photos || []).map((photo, i) => (
                      <div key={i} style={{ position: 'relative', cursor: 'zoom-in' }} onClick={() => setImgModal(photo.url)}>
                        <img src={photo.url} alt={`Photo ${i + 1}`}
                          style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 7, border: `1px solid ${photo.isPrimary ? G.gold : G.border}`, display: 'block' }} />
                        <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 5 }}>
                          {photo.isPrimary && <span style={{ fontSize: 9, background: G.gold, color: '#1a1108', padding: '2px 6px', borderRadius: 2, fontWeight: 700 }}>PRIMARY</span>}
                          <span style={{ fontSize: 9, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '2px 6px', borderRadius: 2 }}>#{i + 1}</span>
                        </div>
                        {photo.uploadedAt && (
                          <div style={{ fontSize: 9, color: G.muted, marginTop: 4, textAlign: 'center', fontFamily: "'DM Mono',monospace" }}>
                            {new Date(photo.uploadedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
            </Section>
          )}

          {/* ── ACTIONS TAB ── */}
          {activeTab === 'actions' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

              {/* Refresh banner */}
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginBottom: -8 }}>
                <button
                  onClick={refreshMaid}
                  disabled={fetching}
                  style={{ padding: '5px 12px', background: 'transparent', border: `1px solid ${G.border2}`, borderRadius: 4, color: G.muted, fontSize: 11, cursor: fetching ? 'not-allowed' : 'pointer', fontFamily: "'Jost',sans-serif", opacity: fetching ? 0.5 : 1 }}>
                  {fetching ? '⏳ Loading…' : '🔄 Refresh'}
                </button>
              </div>

              {/* ── PENDING RECEIPT — admin-only ── */}
              {!isAgent && pendingReceipt && (
                <div style={{ background: '#0e1a14', border: '1.5px solid rgba(93,214,168,0.5)', borderRadius: 8, padding: 20, gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 20 }}>📎</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: G.green }}>Payment Receipt Submitted</div>
                        <div style={{ fontSize: 11, color: G.muted, marginTop: 2 }}>
                          EGP {pendingReceipt.amount?.toLocaleString()} · {pendingReceipt.subscriptionPlan || 'monthly'} plan · {new Date(pendingReceipt.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: 9, background: 'rgba(240,160,80,0.15)', color: '#f0a050', border: '1px solid rgba(240,160,80,0.4)', borderRadius: 3, padding: '3px 9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      ⏳ Awaiting Confirmation
                    </span>
                  </div>

                  {pendingReceipt.receiptUrl ? (
                    <a href={pendingReceipt.receiptUrl} target="_blank" rel="noreferrer" style={{ display: 'block', marginBottom: 14 }}>
                      <img
                        src={pendingReceipt.receiptUrl}
                        alt="Payment receipt"
                        style={{ width: '100%', maxHeight: 320, objectFit: 'contain', borderRadius: 7, border: '1px solid rgba(93,214,168,0.25)', background: '#060e08', cursor: 'zoom-in', display: 'block' }}
                      />
                      <div style={{ fontSize: 10, color: G.green, marginTop: 6, textAlign: 'center' }}>🔍 Click to view full size</div>
                    </a>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: G.muted, fontSize: 12, marginBottom: 14 }}>No receipt image attached</div>
                  )}

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => handleOfflinePayment(true)}
                      disabled={offlineLoading}
                      style={{ flex: 2, padding: '12px', background: 'rgba(93,214,168,0.15)', border: '1.5px solid rgba(93,214,168,0.5)', borderRadius: 6, color: G.green, fontSize: 13, fontWeight: 700, cursor: offlineLoading ? 'not-allowed' : 'pointer', fontFamily: "'Jost',sans-serif", opacity: offlineLoading ? 0.6 : 1 }}>
                      {offlineLoading ? '⏳ Activating…' : '✅ Confirm Receipt & Activate Subscription'}
                    </button>
                    <button
                      onClick={handleRejectReceipt}
                      disabled={offlineLoading}
                      style={{ flex: 1, padding: '12px', background: 'rgba(255,107,107,0.1)', border: '1.5px solid rgba(255,107,107,0.35)', borderRadius: 6, color: G.red, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>
                      ❌ Reject
                    </button>
                  </div>
                </div>
              )}

              {/* Profile Approval */}
              <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, padding: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: G.text, marginBottom: 4 }}>Profile Approval</div>
                <div style={{ fontSize: 11, color: G.muted, marginBottom: 14 }}>
                  Current: <Pill label={maid.approvalStatus} color={statusColors[maid.approvalStatus]} />
                </div>
                <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={2} placeholder="Note for maid (optional)…"
                  style={{ width: '100%', padding: '9px 12px', background: '#1a1a1a', border: `1px solid ${G.border2}`, borderRadius: 5, color: G.text, fontSize: 12, outline: 'none', resize: 'none', fontFamily: "'Jost',sans-serif", boxSizing: 'border-box', marginBottom: 10 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <button onClick={() => handleApprove('approved')} disabled={approving}
                    style={{ padding: '9px', background: `${G.green}18`, border: `1px solid ${G.green}40`, borderRadius: 5, color: G.green, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>
                    ✅ Approve Profile
                  </button>
                  <button onClick={() => handleApprove('rejected')} disabled={approving}
                    style={{ padding: '9px', background: `${G.red}12`, border: `1px solid ${G.red}35`, borderRadius: 5, color: G.red, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>
                    ❌ Reject Profile
                  </button>
                  <button onClick={() => handleApprove('suspended')} disabled={approving}
                    style={{ padding: '9px', background: '#1e1e1e', border: `1px solid ${G.border2}`, borderRadius: 5, color: G.muted, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>
                    ⚠️ Suspend Profile
                  </button>
                </div>
              </div>

              {/* Subscription — read-only for agents */}
              <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, padding: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: G.text, marginBottom: 4 }}>Subscription</div>
                <div style={{ fontSize: 11, color: G.muted, marginBottom: 6 }}>
                  Status: <Pill label={maid.subscription?.status || 'none'} color={statusColors[maid.subscription?.status] || G.muted} />
                </div>
                {maid.subscription?.endDate && (
                  <div style={{ fontSize: 11, color: G.muted, marginBottom: 14 }}>
                    Expires: {new Date(maid.subscription.endDate).toLocaleDateString()}
                  </div>
                )}
                {!isAgent && maid.subscription?.status !== 'active' && (
                  <button onClick={handleActivateSub}
                    style={{ width: '100%', padding: '9px', background: `${G.gold}18`, border: `1px solid ${G.gold}40`, borderRadius: 5, color: G.gold, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Jost',sans-serif", marginBottom: 6 }}>
                    👑 Activate Monthly (no payment record)
                  </button>
                )}
                {maid.subscription?.status === 'active' && (
                  <div style={{ fontSize: 11, color: G.green, padding: '8px 0' }}>
                    ✅ Subscription is active
                  </div>
                )}
              </div>

              {/* Offline Cash Payment — admin-only */}
              {!isAgent && (
                <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, padding: 18 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: G.text, marginBottom: 2 }}>💵 Offline Cash Payment</div>
                  <div style={{ fontSize: 11, color: G.muted, marginBottom: 12 }}>Records a cash transfer payment & activates subscription. Appears in analytics.</div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                    {['monthly','annual'].map(p => (
                      <button key={p} onClick={() => setOfflinePlan(p)}
                        style={{ flex: 1, padding: '7px', background: offlinePlan === p ? `${G.gold}22` : '#1a1a1a', border: `1px solid ${offlinePlan === p ? G.gold : G.border2}`, borderRadius: 4, color: offlinePlan === p ? G.goldL : G.muted, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'Jost',sans-serif", textTransform: 'capitalize' }}>
                        {p}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    placeholder="Amount (EGP) — leave blank for auto"
                    value={offlineAmt}
                    onChange={e => setOfflineAmt(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: '#1a1a1a', border: `1px solid ${G.border2}`, borderRadius: 4, color: G.text, fontSize: 12, outline: 'none', fontFamily: "'Jost',sans-serif", boxSizing: 'border-box', marginBottom: 6 }}
                  />
                  <input
                    placeholder="Admin note (optional)"
                    value={offlineNote}
                    onChange={e => setOfflineNote(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: '#1a1a1a', border: `1px solid ${G.border2}`, borderRadius: 4, color: G.text, fontSize: 12, outline: 'none', fontFamily: "'Jost',sans-serif", boxSizing: 'border-box', marginBottom: 8 }}
                  />
                  <button onClick={handleOfflinePayment} disabled={offlineLoading}
                    style={{ width: '100%', padding: '9px', background: 'rgba(93,214,168,0.12)', border: '1px solid rgba(93,214,168,0.35)', borderRadius: 5, color: G.green, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Jost',sans-serif", opacity: offlineLoading ? 0.6 : 1 }}>
                    {offlineLoading ? 'Recording…' : '💵 Record Cash Payment & Activate'}
                  </button>
                </div>
              )}

              {/* Release Maid — admin-only, always visible */}
              {!isAgent && (
                <div style={{ background: maid.isHired ? '#0e1a0e' : G.card, border: `1.5px solid ${maid.isHired ? 'rgba(93,214,168,0.4)' : G.border}`, borderRadius: 8, padding: 18, gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: maid.isHired ? G.green : G.muted }}>↩ Release Maid</div>
                    {maid.isHired
                      ? <span style={{ fontSize: 9, background: 'rgba(93,214,168,0.15)', color: G.green, border: '1px solid rgba(93,214,168,0.4)', borderRadius: 3, padding: '2px 7px', fontWeight: 700, textTransform: 'uppercase' }}>Currently Hired</span>
                      : <span style={{ fontSize: 9, background: '#1e1e1e', color: G.muted, border: `1px solid ${G.border2}`, borderRadius: 3, padding: '2px 7px', fontWeight: 700, textTransform: 'uppercase' }}>Not Hired</span>
                    }
                  </div>
                  <div style={{ fontSize: 11, color: G.muted, marginBottom: 14 }}>
                    {maid.isHired
                      ? 'Releases the maid from her current customer — same flow as customer releasing her from the app. The customer gets a 3-day free-replacement vacancy; the maid\'s profile becomes visible again.'
                      : 'This maid is not currently marked as hired. Nothing to release.'}
                  </div>
                  <button onClick={handleReleaseMaid} disabled={releasing || !maid.isHired}
                    style={{ width: '100%', padding: '11px', background: maid.isHired ? 'rgba(93,214,168,0.14)' : '#1a1a1a', border: `1.5px solid ${maid.isHired ? 'rgba(93,214,168,0.45)' : G.border2}`, borderRadius: 5, color: maid.isHired ? G.green : G.muted, fontSize: 13, fontWeight: 700, cursor: (releasing || !maid.isHired) ? 'not-allowed' : 'pointer', fontFamily: "'Jost',sans-serif", opacity: releasing ? 0.6 : 1 }}>
                    {releasing ? '⏳ Releasing…' : maid.isHired ? '↩ Release from Current Job' : 'Maid is not hired — nothing to release'}
                  </button>
                </div>
              )}

              {/* Account Status — admin-only */}
              {!isAgent && (
                <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, padding: 18 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: G.text, marginBottom: 4 }}>Account Status</div>
                  <div style={{ fontSize: 11, color: G.muted, marginBottom: 10 }}>
                    {maid.user?.deletedAt ? '⚫ Account is deactivated (soft-deleted)' : maid.user?.isSuspended ? '🔴 Account is currently suspended' : '🟢 Account is active'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <button onClick={handleSuspend}
                      style={{ padding: '9px', background: maid.user?.isSuspended ? `${G.green}12` : `${G.red}10`, border: `1px solid ${maid.user?.isSuspended ? G.green : G.red}35`, borderRadius: 5, color: maid.user?.isSuspended ? G.green : G.red, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>
                      {maid.user?.isSuspended ? '✅ Unsuspend Account' : '🔴 Suspend Account'}
                    </button>
                    <button onClick={handleDeleteAccount}
                      style={{ padding: '9px', background: maid.user?.deletedAt ? `${G.green}10` : 'rgba(60,60,60,0.3)', border: `1px solid ${maid.user?.deletedAt ? G.green+'40' : '#444'}`, borderRadius: 5, color: maid.user?.deletedAt ? G.green : '#888', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>
                      {maid.user?.deletedAt ? '↩ Restore Account' : '🗑 Delete Account (Soft)'}
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Info */}
              <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, padding: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: G.text, marginBottom: 12 }}>Quick Summary</div>
                {[
                  ['Passport', maid.passport?.photo?.url ? '✅ Submitted' : '❌ Missing'],
                  ['Selfie',   maid.selfie?.photo?.url   ? '✅ Submitted' : '❌ Missing'],
                  ['Permit',   maid.residencePermit?.url ? '✅ Submitted' : '❌ Missing'],
                  ['Photos',   `${(maid.photos || []).length} uploaded`],
                  ['Rating',   `⭐ ${maid.rating?.toFixed(1) || '0.0'} (${maid.reviewCount || 0})`],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', paddingVertical: 4, borderBottom: `1px solid ${G.border}`, padding: '6px 0', fontSize: 12 }}>
                    <span style={{ color: G.muted }}>{k}</span>
                    <span style={{ color: v.includes('❌') ? G.red : G.text }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
