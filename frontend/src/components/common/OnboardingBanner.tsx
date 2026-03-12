import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface OnboardingStep { id: string; label: string; done: boolean; }
interface OnboardingStatus {
  steps: OnboardingStep[]; completed: number; total: number; percent: number;
}

const STEP_LINKS: Record<string, string> = {
  department: '/departments', outcome: '/outcomes', signal: '/signals', profile: '/settings'
};

export default function OnboardingBanner() {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('axis-onboarding-dismissed') === '1');
  const navigate = useNavigate();

  useEffect(() => {
    if (dismissed) return;
    api.get('/auth/onboarding/status')
      .then(r => { if (r.data.percent < 100) setStatus(r.data); })
      .catch(() => {});
  }, [dismissed]);

  if (dismissed || !status || status.percent === 100) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #5aa9c4 0%, #4caf82 100%)',
      padding: '14px 24px', margin: '16px 32px',
      borderRadius: 12, color: '#fff',
      display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap'
    }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
          🚀 Getting Started — {status.percent}% complete
        </div>
        <div style={{ background: 'rgba(255,255,255,0.3)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
          <div style={{ width: `${status.percent}%`, height: '100%', background: '#fff', borderRadius: 4, transition: 'width 0.5s' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {status.steps.filter(s => !s.done).map(s => (
          <button key={s.id} onClick={() => navigate(STEP_LINKS[s.id] || '/')} style={{
            background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.5)',
            borderRadius: 8, color: '#fff', padding: '5px 12px',
            cursor: 'pointer', fontSize: 12, fontWeight: 600
          }}>
            {s.label} →
          </button>
        ))}
      </div>
      <button onClick={() => { setDismissed(true); localStorage.setItem('axis-onboarding-dismissed', '1'); }} style={{
        background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)',
        cursor: 'pointer', fontSize: 20, padding: '0 4px'
      }}>×</button>
    </div>
  );
}