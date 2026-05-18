import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

const OFFICER_LABELS = { thalaivar: 'தலைவர் (President)', porulaalar: 'பொருளாளர் (Treasurer)', seyalaalar: 'செயலாளர் (Secretary)' };
const ROLE_SIG = { thalaivar: 'sigThalaivar', porulaalar: 'sigPorulaalar', seyalaalar: 'sigSeyalaalar' };

function useSigPad() {
  const ref = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSig, setHasSig] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = ref.current.getContext('2d');
    ctx.strokeStyle = '#1d2d6b'; ctx.lineWidth = 2;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  }, []);

  function getPos(e) {
    const rect = ref.current.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  }
  function start(e) {
    e.preventDefault();
    const ctx = ref.current.getContext('2d');
    const pos = getPos(e);
    ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
    setDrawing(true); setHasSig(true);
  }
  function move(e) {
    e.preventDefault();
    if (!drawing) return;
    const ctx = ref.current.getContext('2d');
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y); ctx.stroke();
  }
  function stop(e) { e?.preventDefault(); setDrawing(false); }
  function clear() {
    ref.current.getContext('2d').clearRect(0, 0, ref.current.width, ref.current.height);
    setHasSig(false);
  }
  function toDataURL() { return hasSig ? ref.current.toDataURL('image/png') : ''; }

  return { ref, hasSig, start, move, stop, clear, toDataURL };
}

export default function Dashboard() {
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [sigModal, setSigModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const prevCountRef = useRef(null);
  const sigPad = useSigPad();

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (!d.loggedIn) { router.replace('/login'); return; }
      setRole(d.role);
    });
  }, []);

  async function loadApps(silent = false) {
    if (!silent) setLoading(true);
    const res = await fetch('/api/applications');
    if (res.ok) {
      const data = await res.json();
      if (prevCountRef.current !== null && data.length > prevCountRef.current) {
        const newCount = data.length - prevCountRef.current;
        setNotification(`🔔 ${newCount} புதிய பதிவு வந்துள்ளது! (${newCount} New registration!)`);
        setTimeout(() => setNotification(null), 5000);
      }
      prevCountRef.current = data.length;
      setApps(data);
    }
    if (!silent) setLoading(false);
  }

  useEffect(() => {
    if (!role) return;
    loadApps();
    const interval = setInterval(() => loadApps(true), 15000);
    return () => clearInterval(interval);
  }, [role]);

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    router.replace('/login');
  }

  async function handleDelete(id, name) {
    if (!confirm(`"${name}" இன் பதிவை நீக்க வேண்டுமா? (Delete this record?)`)) return;
    await fetch(`/api/application/${id}`, { method: 'DELETE' });
    loadApps(true);
  }

  function openSigModal(app) {
    setSigModal({ appId: app._id, appName: app.fullName });
  }

  useEffect(() => {
    if (sigModal && sigPad.ref.current) {
      sigPad.clear();
    }
  }, [sigModal]);

  async function handleSaveSign() {
    const signature = sigPad.toDataURL();
    if (!signature) return;
    setSaving(true);
    await fetch('/api/officer-sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signature, applicationId: sigModal.appId }),
    });
    setSaving(false);
    setSigModal(null);
    loadApps(true);
  }

  if (!role || loading) return <div className="auth-loading">ஏற்றுகிறது... (Loading...)</div>;

  const mySigField = ROLE_SIG[role];
  const allSigned = apps.filter(a => a.sigThalaivar && a.sigPorulaalar && a.sigSeyalaalar).length;
  const pending = apps.length - allSigned;

  return (
    <div className="dash-page">
      {notification && <div className="dash-notif">{notification}</div>}

      <div className="dash-container">
        <div className="dash-header">
          <div className="dash-header-left">
            <img src="/images/logo.jpg" alt="logo" className="dash-logo" />
            <div>
              <h1 className="dash-title">தி/ஸ்ரீகோணலிங்க மகா வித்தியாலயம்</h1>
              <p className="dash-subtitle">பழைய மாணவர் சங்கம் — {OFFICER_LABELS[role]} போர்டல் (Portal)</p>
            </div>
          </div>
          <div className="dash-header-right">
            <button className="dash-form-btn" onClick={() => router.push('/')}>படிவம் (Form)</button>
            <button className="logout-btn" onClick={handleLogout}>வெளியேறு (Logout)</button>
          </div>
        </div>

        <div className="dash-stats">
          <div className="stat-card">
            <span className="stat-num">{apps.length}</span>
            <span className="stat-label">மொத்த பதிவுகள் (Total)</span>
          </div>
          <div className="stat-card stat-green">
            <span className="stat-num">{allSigned}</span>
            <span className="stat-label">முழுமையாக கையொப்பமிட்டவை (Fully Signed)</span>
          </div>
          <div className="stat-card stat-orange">
            <span className="stat-num">{pending}</span>
            <span className="stat-label">நிலுவையில் உள்ளவை (Pending)</span>
          </div>
          <div className="stat-card stat-blue">
            <span className="stat-num">{apps.filter(a => !a[mySigField]).length}</span>
            <span className="stat-label">உங்கள் கையொப்பம் தேவை (Your Signature Needed)</span>
          </div>
        </div>

        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>#</th>
                <th>முழுப்பெயர் (Name)</th>
                <th>அங்கத்துவ இலக்கம் (Membership No.)</th>
                <th>பதிவு தேதி (Date)</th>
                <th>தலைவர் (President)</th>
                <th>பொருளாளர் (Treasurer)</th>
                <th>செயலாளர் (Secretary)</th>
                <th>நிலை (Status)</th>
                <th>செயல் (Action)</th>
              </tr>
            </thead>
            <tbody>
              {apps.length === 0 && (
                <tr><td colSpan={9} className="dash-empty">பதிவுகள் இல்லை (No records)</td></tr>
              )}
              {apps.map((app, i) => {
                const fullySign = app.sigThalaivar && app.sigPorulaalar && app.sigSeyalaalar;
                const mySigned = !!app[mySigField];
                return (
                  <tr key={app._id} className={fullySign ? 'row-complete' : ''}>
                    <td>{i + 1}</td>
                    <td className="td-name">{app.fullName}</td>
                    <td>{app.membershipNumber || '—'}</td>
                    <td>{new Date(app.submittedAt).toLocaleDateString('ta-LK')}</td>
                    <td><StatusBadge signed={!!app.sigThalaivar} /></td>
                    <td><StatusBadge signed={!!app.sigPorulaalar} /></td>
                    <td><StatusBadge signed={!!app.sigSeyalaalar} /></td>
                    <td>
                      <span className={`status-pill ${fullySign ? 'pill-done' : 'pill-pending'}`}>
                        {fullySign ? '✓ முடிந்தது (Done)' : '⏳ நிலுவை (Pending)'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                        {!mySigned ? (
                          <button className="sign-btn" onClick={() => openSigModal(app)}>
                            கையொப்பமிடு (Sign)
                          </button>
                        ) : (
                          <span className="signed-text">✓ கையொப்பமிட்டது (Signed)</span>
                        )}
                        <button className="view-btn" onClick={() => router.push(`/view/${app._id}`)}>பார் (View)</button>
                        <button className="delete-btn" onClick={() => handleDelete(app._id, app.fullName)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {sigModal && (
        <div className="modal-overlay" onClick={() => setSigModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">{OFFICER_LABELS[role]} கையொப்பம் (Signature)</h3>
            <p className="modal-name">{sigModal.appName}</p>
            <div className="sig-canvas-wrap" style={{ width: 300 }}>
              <canvas
                ref={sigPad.ref} width={300} height={120}
                onMouseDown={sigPad.start} onMouseMove={sigPad.move}
                onMouseUp={sigPad.stop} onMouseLeave={sigPad.stop}
                onTouchStart={sigPad.start} onTouchMove={sigPad.move} onTouchEnd={sigPad.stop}
              />
              {!sigPad.hasSig && <span className="sig-hint">இங்கே கையொப்பமிடவும் (Sign here)</span>}
            </div>
            <div className="modal-actions">
              <button className="sig-clear-btn" onClick={sigPad.clear}>அழி (Clear)</button>
              <button className="sig-save-btn" onClick={handleSaveSign} disabled={saving || !sigPad.hasSig}>
                {saving ? '...' : 'சேமி (Save)'}
              </button>
              <button className="modal-cancel-btn" onClick={() => setSigModal(null)}>ரத்து (Cancel)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ signed }) {
  return (
    <span className={`sig-badge ${signed ? 'badge-yes' : 'badge-no'}`}>
      {signed ? '✓' : '✗'}
    </span>
  );
}
