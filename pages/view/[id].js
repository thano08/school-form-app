import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const OFFICER_LABELS = { thalaivar: 'தலைவர்', porulaalar: 'பொருளாளர்', seyalaalar: 'செயலாளர்' };

export default function ViewApplication() {
  const router = useRouter();
  const { id } = router.query;
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/application/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Unauthorized or not found');
        return r.json();
      })
      .then(data => { setApp(data); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [id]);

  if (loading) return <div className="auth-loading">ஏற்றுகிறது...</div>;
  if (error) return <div className="auth-loading" style={{ color: '#dc3545' }}>{error}</div>;
  if (!app) return null;

  return (
    <div className="form-wrapper" style={{ margin: '30px auto' }}>
      <div className="inner-border">

        {/* Actions */}
        <div className="topbar no-print">
          <button className="logout-btn" onClick={() => router.back()}>← திரும்பு</button>
          <button className="sig-save-btn" style={{ padding: '6px 18px' }} onClick={() => window.print()}>
            🖨️ அச்சிடு / Print
          </button>
        </div>

        {/* Logo & Title */}
        <div className="logo-wrap">
          <img src="/images/logo.jpg" alt="School Logo" className="logo" />
        </div>
        <h2 className="main-title">திரு/ஸ்ரீகோணலிங்க மகா வித்தியாலயம்</h2>
        <p className="sub-title">பழைய மாணவர் சங்க அங்கத்துவ விண்ணப்பப் படிவம்</p>

        {/* Fields */}
        <ViewField label="01. முழுப்பெயர்" value={app.fullName} />
        <ViewField label="02. நிர.முகவரி" value={app.address} />
        <ViewField label="03. அடையாள அட்டை இலக்கம்" value={app.nicNumber} />
        <ViewField label="04. தொ.இலக்கம்" value={app.phone} />
        <ViewField label="05. Wtsp. இலக்கம்" value={app.whatsapp} />

        <div className="field-row">
          <span className="field-label">06. கல்வி கற்ற காலம்</span>
          <span className="view-value">{app.studyYearFrom} — {app.studyYearTo}</span>
        </div>
        <div className="field-row">
          <span className="field-label">07. கல்வி கற்ற காலப்பகுதி</span>
          <span className="view-value">{app.studyPeriodFrom} — {app.studyPeriodTo}</span>
        </div>

        <ViewField label="08. தொழில்" value={app.occupation} />
        <ViewField label="09. குடும்ப நிலை" value={app.familyStatus} />

        {/* Member Signature */}
        <div className="sig-section">
          <p className="sig-label">கையாப்பம்</p>
          {app.signature
            ? <img src={app.signature} alt="கையொப்பம்" className="view-sig-img" />
            : <div className="sig-print-line" />}
        </div>

        {/* Office Section */}
        <div className="office-section">
          <h4 className="office-title">அலுவலக பாவனைக்கு மட்டும்</h4>

          <ViewField label="அங்கத்துவ இலக்கம்" value={app.membershipNumber} />
          <ViewField label="அங்கத்துவ பணம் பற்றுச்சீட்டு இலக்கம்" value={app.receiptNumber} />
          <p className="account-info">கணக்கிலக்கம் - 71197640 (BOC)</p>

          {/* Officer Signatures */}
          <div className="footer-sigs">
            {[
              { key: 'sigThalaivar',  role: 'thalaivar' },
              { key: 'sigPorulaalar', role: 'porulaalar' },
              { key: 'sigSeyalaalar', role: 'seyalaalar' },
            ].map(({ key, role }) => (
              <div key={key} className="footer-sig-item">
                <p className="sig-label" style={{ textAlign: 'center' }}>{OFFICER_LABELS[role]}</p>
                {app[key]
                  ? <div className="sig-image-wrap"><img src={app[key]} alt={OFFICER_LABELS[role]} className="sig-image" /></div>
                  : <div className="sig-print-line" />}
              </div>
            ))}
          </div>
        </div>

        {/* Submitted date */}
        <p style={{ textAlign: 'right', color: '#888', fontSize: 12, marginTop: 24 }}>
          பதிவு தேதி: {new Date(app.submittedAt).toLocaleDateString('ta-LK')}
        </p>

      </div>
    </div>
  );
}

function ViewField({ label, value }) {
  return (
    <div className="field-row">
      <span className="field-label">{label}</span>
      <span className="view-value">{value || '—'}</span>
    </div>
  );
}
