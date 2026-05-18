import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'தவறான நற்சான்றிதழ்கள் (Invalid credentials)');
      }
    } catch {
      setError('சேவையகப் பிழை. மீண்டும் முயற்சிக்கவும். (Server error. Please try again.)');
    }
    setLoading(false);
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <img src="/images/logo.jpg" alt="School Logo" className="login-logo" />
          <h1 className="login-school-name">தி/ஸ்ரீகோணலிங்க மகா வித்தியாலயம்</h1>
          <p className="login-school-sub">பழைய மாணவர் சங்கம் — அலுவலர் உள்நுழைவு (Officer Login)</p>
        </div>

        <div className="login-body">
          <h2 className="login-title">அலுவலர் உள்நுழைவு (Officer Login)</h2>
          <p className="login-subtitle">தலைவர் (President) / பொருளாளர் (Treasurer) / செயலாளர் (Secretary)</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label>பயனர்பெயர் (Username)</label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                placeholder="president / treasurer / secretary"
                required
                autoFocus
              />
            </div>

            <div className="login-field">
              <label>கடவுச்சொல் (Password)</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="கடவுச்சொல்லை உள்ளிடவும் (Enter password)"
                required
              />
            </div>

            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'உள்நுழைகிறது... (Logging in...)' : 'உள்நுழை (Login)'}
            </button>

            <button type="button" className="login-back-btn" onClick={() => router.push('/')}>
              ← படிவத்திற்கு திரும்பு (Back to Form)
            </button>
          </form>
        </div>

        <div className="login-footer">
          <p>© 2026 தி/ஸ்ரீகோணலிங்க மகா வித்தியாலயம் பழைய மாணவர் சங்கம்</p>
        </div>
      </div>
    </div>
  );
}
