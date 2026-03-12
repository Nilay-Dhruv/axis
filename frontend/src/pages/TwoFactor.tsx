import { useState } from 'react';
import api from '../services/api';

type Step = 'idle' | 'setup' | 'verify' | 'done';

export default function TwoFactor() {
  const [step, setStep] = useState<Step>('idle');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [backupCodes] = useState<string[]>([
    'AXIS-A1B2-C3D4', 'AXIS-E5F6-G7H8', 'AXIS-I9J0-K1L2',
    'AXIS-M3N4-O5P6', 'AXIS-Q7R8-S9T0', 'AXIS-U1V2-W3X4'
  ]);

  const startSetup = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get('/auth/2fa/setup');
      setQrCode(res.data.qr_code);
      setSecret(res.data.secret);
      setStep('setup');
    } catch { setError('Failed to initialize 2FA setup.'); }
    finally { setLoading(false); }
  };

  const verifyCode = async () => {
    if (code.length !== 6) return;
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/2fa/verify', { secret, code });
      if (res.data.valid) setStep('done');
      else setError('Invalid code. Please try again.');
    } catch { setError('Verification failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--neu-text-dark)', margin: '0 0 8px' }}>
        Two-Factor Authentication
      </h1>
      <p style={{ color: 'var(--neu-text-mid)', fontSize: 14, marginBottom: 32 }}>
        Add an extra layer of security to your account using an authenticator app.
      </p>

      {error && <div style={{ background: '#e05c5c22', border: '1px solid #e05c5c', borderRadius: 8, padding: '10px 16px', color: '#e05c5c', marginBottom: 20, fontSize: 13 }}>{error}</div>}

      {step === 'idle' && (
        <div className="neu-card" style={{ padding: '28px', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔐</div>
          <h3 style={{ color: 'var(--neu-text-dark)', marginBottom: 12 }}>2FA Not Enabled</h3>
          <p style={{ color: 'var(--neu-text-mid)', fontSize: 13, marginBottom: 24 }}>
            Use Google Authenticator, Authy, or any TOTP app.
          </p>
          <button onClick={startSetup} disabled={loading} style={{
            background: '#5aa9c4', border: 'none', borderRadius: 10,
            color: '#fff', padding: '12px 28px', cursor: 'pointer', fontSize: 14, fontWeight: 600
          }}>
            {loading ? 'Setting up…' : 'Enable 2FA'}
          </button>
        </div>
      )}

      {step === 'setup' && (
        <div className="neu-card" style={{ padding: '28px' }}>
          <h3 style={{ color: 'var(--neu-text-dark)', marginBottom: 8, fontSize: 15, fontWeight: 700 }}>
            Step 1 — Scan QR Code
          </h3>
          <p style={{ color: 'var(--neu-text-mid)', fontSize: 13, marginBottom: 20 }}>
            Open your authenticator app and scan this QR code.
          </p>
          {qrCode && (
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <img src={`data:image/png;base64,${qrCode}`} alt="QR Code" style={{ border: '4px solid var(--neu-bg)', borderRadius: 8, maxWidth: 200 }} />
            </div>
          )}
          <div style={{ background: 'var(--neu-bg)', borderRadius: 8, padding: '10px 14px', marginBottom: 20 }}>
            <div style={{ color: 'var(--neu-text-light)', fontSize: 11, marginBottom: 4 }}>Manual entry key:</div>
            <code style={{ color: 'var(--neu-text-dark)', fontSize: 13, wordBreak: 'break-all' }}>{secret}</code>
          </div>
          <button onClick={() => setStep('verify')} style={{
            background: '#4caf82', border: 'none', borderRadius: 10,
            color: '#fff', padding: '10px 24px', cursor: 'pointer', fontSize: 13, fontWeight: 600
          }}>
            Next — Enter Code →
          </button>
        </div>
      )}

      {step === 'verify' && (
        <div className="neu-card" style={{ padding: '28px' }}>
          <h3 style={{ color: 'var(--neu-text-dark)', marginBottom: 8, fontSize: 15, fontWeight: 700 }}>
            Step 2 — Verify Code
          </h3>
          <p style={{ color: 'var(--neu-text-mid)', fontSize: 13, marginBottom: 20 }}>
            Enter the 6-digit code from your authenticator app.
          </p>
          <input
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            onKeyDown={e => e.key === 'Enter' && verifyCode()}
            style={{
              background: 'var(--neu-bg)', border: '1px solid var(--neu-divider)',
              borderRadius: 10, padding: '12px 16px', fontSize: 24,
              letterSpacing: 8, textAlign: 'center', color: 'var(--neu-text-dark)',
              outline: 'none', width: '100%', marginBottom: 16
            }}
          />
          <button onClick={verifyCode} disabled={loading || code.length !== 6} style={{
            background: code.length === 6 ? '#4caf82' : 'var(--neu-bg)',
            border: 'none', borderRadius: 10,
            color: code.length === 6 ? '#fff' : 'var(--neu-text-light)',
            padding: '10px 24px', cursor: 'pointer', fontSize: 13, fontWeight: 600, width: '100%'
          }}>
            {loading ? 'Verifying…' : 'Verify & Enable 2FA'}
          </button>
        </div>
      )}

      {step === 'done' && (
        <div className="neu-card" style={{ padding: '28px' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
            <h3 style={{ color: '#4caf82', fontSize: 18, fontWeight: 700 }}>2FA Enabled!</h3>
            <p style={{ color: 'var(--neu-text-mid)', fontSize: 13 }}>Your account is now protected.</p>
          </div>
          <h4 style={{ color: 'var(--neu-text-dark)', marginBottom: 12, fontSize: 14 }}>
            Backup Codes — Save these now
          </h4>
          <p style={{ color: 'var(--neu-text-mid)', fontSize: 12, marginBottom: 12 }}>
            If you lose your authenticator, use these one-time codes to log in.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {backupCodes.map(c => (
              <code key={c} style={{ background: 'var(--neu-bg)', padding: '6px 10px', borderRadius: 6, fontSize: 12, color: 'var(--neu-text-dark)', textAlign: 'center' }}>{c}</code>
            ))}
          </div>
          <button onClick={() => navigator.clipboard.writeText(backupCodes.join('\n'))} style={{
            background: '#5aa9c4', border: 'none', borderRadius: 8,
            color: '#fff', padding: '8px 18px', cursor: 'pointer', fontSize: 12
          }}>Copy All Codes</button>
        </div>
      )}
    </div>
  );
}