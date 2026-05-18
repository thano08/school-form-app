import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const OFFICER_KEYS = ['thalaivar', 'porulaalar', 'seyalaalar'];
const OFFICER_LABELS = { thalaivar: 'தலைவர் (President)', porulaalar: 'பொருளாளர் (Treasurer)', seyalaalar: 'செயலாளர் (Secretary)' };

function useSigPad() {
  const ref = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSig, setHasSig] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = ref.current.getContext('2d');
    ctx.strokeStyle = '#1d2d6b';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
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

export default function Home() {
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const memberSig = useSigPad();

  const [form, setForm] = useState({
    fullName: '', address: '', nicNumber: '', phone: '', whatsapp: '',
    studyYearFrom: '', studyYearTo: '', studyPeriodFrom: '', studyPeriodTo: '',
    occupation: '', familyStatus: '', membershipNumber: 'T/SRJ/KLMV/OSA/', receiptNumber: ''
  });

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      setRole(d.loggedIn ? d.role : null);
    });
  }, []);

  function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  function showToast(msg, type) {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    setRole(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.fullName.trim()) return showToast('முழுப்பெயர் தேவை (Full name required)', 'error');
    setLoading(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, signature: memberSig.toDataURL() })
      });
      const data = await res.json();
      if (data.success) {
        showToast('விண்ணப்பம் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது! (Submitted successfully!) ✓', 'success');
        setForm({ fullName: '', address: '', nicNumber: '', phone: '', whatsapp: '',
          studyYearFrom: '', studyYearTo: '', studyPeriodFrom: '', studyPeriodTo: '',
          occupation: '', familyStatus: '', membershipNumber: 'T/SRJ/KLMV/OSA/', receiptNumber: '' });
        memberSig.clear();
      } else {
        showToast('பிழை (Error): ' + data.error, 'error');
      }
    } catch {
      showToast('சேவையகப் பிழை. மீண்டும் முயற்சிக்கவும். (Server error. Please try again.)', 'error');
    }
    setLoading(false);
  }

  const roleLabel = role ? OFFICER_LABELS[role] : '';

  return (
    <>
      <div className="form-wrapper">
        <div className="inner-border">

          {/* Topbar */}
          <div className="topbar no-print">
            {role ? (
              <div className="topbar-officer">
                <span className="officer-badge">{roleLabel} உள்நுழைந்துள்ளார் (Logged in)</span>
                <button className="logout-btn" onClick={() => router.push('/dashboard')}>டாஷ்போர்டு (Dashboard)</button>
                <button className="logout-btn" onClick={handleLogout}>வெளியேறு (Logout)</button>
              </div>
            ) : (
              <button className="logout-btn" onClick={() => router.push('/login')}>
                அலுவலர் உள்நுழைவு (Officer Login)
              </button>
            )}
          </div>

          {/* Logo */}
          <div className="logo-wrap">
            <img src="/images/logo.jpg" alt="School Logo" className="logo" />
          </div>

          <h2 className="main-title">தி/ஸ்ரீகோணலிங்க மகா வித்தியாலயம்</h2>
          <p className="sub-title">பழைய மாணவர் சங்க அங்கத்துவ விண்ணப்பப் படிவம் (Old Students' Association Membership Form)</p>

          <form onSubmit={handleSubmit}>

            <Field label="01. முழுப்பெயர் (Full Name)" name="fullName" value={form.fullName} onChange={handleChange} required />
            <Field label="02. நிர.முகவரி (Address)" name="address" value={form.address} onChange={handleChange} />
            <Field label="03. அடையாள அட்டை இலக்கம் (NIC Number)" name="nicNumber" value={form.nicNumber} onChange={handleChange} />
            <Field label="04. தொ.இலக்கம் (Phone)" name="phone" value={form.phone} onChange={handleChange} type="tel" />
            <Field label="05. வாட்ஸ்அப் இலக்கம் (WhatsApp)" name="whatsapp" value={form.whatsapp} onChange={handleChange} type="tel" />

            <div className="field-row">
              <span className="field-label">06. கல்வி கற்ற காலம் (Study Period)</span>
              <div className="range-row">
                <input className="field-input" name="studyYearFrom" value={form.studyYearFrom}
                  onChange={handleChange} placeholder="தொடக்கம் (From)" />
                <span className="range-sep">வரை (To)</span>
                <input className="field-input" name="studyYearTo" value={form.studyYearTo} onChange={handleChange} />
              </div>
            </div>

            <div className="field-row">
              <span className="field-label">07. கல்வி கற்ற காலப்பகுதி (Study Duration)</span>
              <div className="range-row">
                <input className="field-input" name="studyPeriodFrom" value={form.studyPeriodFrom}
                  onChange={handleChange} placeholder="தொடக்கம் (From)" />
                <span className="range-sep">வரை (To)</span>
                <input className="field-input" name="studyPeriodTo" value={form.studyPeriodTo} onChange={handleChange} />
              </div>
            </div>

            <Field label="08. தொழில் (Occupation)" name="occupation" value={form.occupation} onChange={handleChange} />
            <Field label="09. குடும்ப நிலை (Family Status)" name="familyStatus" value={form.familyStatus} onChange={handleChange} />

            {/* Member Signature */}
            <div className="sig-section">
              <p className="sig-label">கையாப்பம் (Signature)</p>
              <div className="sig-canvas-wrap">
                <canvas
                  ref={memberSig.ref}
                  width={280} height={110}
                  onMouseDown={memberSig.start}
                  onMouseMove={memberSig.move}
                  onMouseUp={memberSig.stop}
                  onMouseLeave={memberSig.stop}
                  onTouchStart={memberSig.start}
                  onTouchMove={memberSig.move}
                  onTouchEnd={memberSig.stop}
                />
                {!memberSig.hasSig && <span className="sig-hint">இங்கே கையொப்பமிடவும் (Sign here)</span>}
              </div>
              <button type="button" className="sig-clear-btn no-print" onClick={memberSig.clear}>அழி (Clear)</button>
            </div>

            {/* Office Section */}
            <div className="office-section">
              <h4 className="office-title">அலுவலக பாவனைக்கு மட்டும் (Office Use Only)</h4>

              <Field label="அங்கத்துவ இலக்கம் (Membership No.)" name="membershipNumber"
                value={form.membershipNumber} onChange={handleChange} />
              <Field label="அங்கத்துவ பணம் பற்றுச்சீட்டு இலக்கம் (Receipt No.)"
                name="receiptNumber" value={form.receiptNumber} onChange={handleChange} />

              <p className="account-info">கணக்கிலக்கம் (Account No.) - 71197640 (BOC)</p>

              <div className="footer-sigs">
                {OFFICER_KEYS.map(key => (
                  <div key={key} className="footer-sig-item">
                    <p className="sig-label" style={{ textAlign: 'center' }}>{OFFICER_LABELS[key]}</p>
                    <div className="sig-print-line" />
                  </div>
                ))}
              </div>
            </div>

            <div className="submit-wrap no-print">
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'சமர்ப்பிக்கிறது... (Submitting...)' : 'சமர்ப்பி (Submit)'}
              </button>
            </div>

          </form>
        </div>
      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </>
  );
}

function Field({ label, name, value, onChange, type = 'text', required }) {
  return (
    <div className="field-row">
      <span className="field-label">{label}</span>
      <input
        className="field-input"
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );
}
