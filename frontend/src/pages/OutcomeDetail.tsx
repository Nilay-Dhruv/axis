import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { getOutcomeDetail, OutcomeDetailData } from '../services/outcomeDetailService';

type SignalRowProps = {
  id: number;
  name: string;
  status: string;
  value: string | number | null;
  created_at: string | null;
};

function SignalRow({ name, status, value, created_at }: SignalRowProps) {
  const statusColor: Record<string, string> = {
    healthy: '#4caf82',
    warning: '#f5a623',
    critical: '#e05c5c',
    normal: '#5aa9c4',
  };
  const color = statusColor[status?.toLowerCase()] || '#888';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 0', borderBottom: '1px solid var(--neu-divider)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
        <span style={{ color: 'var(--neu-text-dark)', fontSize: 14 }}>{name}</span>
      </div>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <span style={{ color, fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>{status}</span>
        {value !== null && <span style={{ color: 'var(--neu-text-mid)', fontSize: 13 }}>{value}</span>}
        {created_at && (
          <span style={{ color: 'var(--neu-text-light)', fontSize: 11 }}>
            {new Date(created_at).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}

function SkeletonBlock({ height = 40, width = '100%' }: { height?: number; width?: string }) {
  return (
    <div className="skeleton" style={{ height, width, borderRadius: 8, marginBottom: 12 }} />
  );
}

export default function OutcomeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<OutcomeDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

    useEffect(() => {
    if (!id) { setError('Invalid outcome ID.'); setLoading(false); return; }
    setLoading(true);
    getOutcomeDetail(id)   // ← no Number() conversion
        .then(setData)
        .catch(() => setError('Failed to load outcome details.'))
        .finally(() => setLoading(false));
    }, [id]);

  const statusColor: Record<string, string> = {
    active: '#4caf82',
    completed: '#5aa9c4',
    at_risk: '#e05c5c',
    on_hold: '#f5a623',
  };

  if (error) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#e05c5c' }}>{error}</div>
  );

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Back */}
      <button
        onClick={() => navigate('/outcomes')}
        style={{
          background: 'none', border: 'none', color: 'var(--neu-text-mid)',
          cursor: 'pointer', fontSize: 14, marginBottom: 20, padding: 0,
          display: 'flex', alignItems: 'center', gap: 6
        }}
      >
        ← Back to Outcomes
      </button>

      {loading ? (
        <>
          <SkeletonBlock height={36} width="40%" />
          <SkeletonBlock height={20} width="25%" />
          <SkeletonBlock height={200} />
          <SkeletonBlock height={160} />
        </>
      ) : data ? (
        <>
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--neu-text-dark)', margin: 0 }}>
                {data.outcome.name}
              </h1>
              <span style={{
                background: statusColor[data.outcome.status] + '22',
                color: statusColor[data.outcome.status] || '#888',
                borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600
              }}>
                {data.outcome.status?.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <p style={{ color: 'var(--neu-text-mid)', marginTop: 8, fontSize: 14 }}>
              {data.outcome.description || 'No description provided.'}
            </p>
            <div style={{ display: 'flex', gap: 24, marginTop: 12, flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--neu-text-light)', fontSize: 13 }}>
                🏢 {data.outcome.department}
              </span>
              {data.outcome.created_at && (
                <span style={{ color: 'var(--neu-text-light)', fontSize: 13 }}>
                  📅 Created {new Date(data.outcome.created_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="neu-card" style={{ marginBottom: 24, padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--neu-text-dark)', fontWeight: 600 }}>Overall Progress</span>
              <span style={{ color: '#5aa9c4', fontWeight: 700, fontSize: 18 }}>
                {data.outcome.progress}%
              </span>
            </div>
            <div style={{ background: 'var(--neu-bg)', borderRadius: 8, height: 10, overflow: 'hidden' }}>
              <div style={{
                width: `${data.outcome.progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #5aa9c4, #4caf82)',
                borderRadius: 8,
                transition: 'width 0.6s ease'
              }} />
            </div>
          </div>

          {/* Progress history chart */}
          <div className="neu-card" style={{ marginBottom: 24, padding: '20px 24px' }}>
            <h3 style={{ color: 'var(--neu-text-dark)', marginBottom: 16, fontSize: 15, fontWeight: 600 }}>
              Progress History (30 days)
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.progress_history}>
                <defs>
                  <linearGradient id="progGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5aa9c4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#5aa9c4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--neu-divider)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'var(--neu-text-light)', fontSize: 11 }}
                  tickLine={false}
                  interval={6}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: 'var(--neu-text-light)', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--neu-card)', border: 'none',
                    borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    color: 'var(--neu-text-dark)'
                  }}
                //   formatter={(v: number) => [`${v}%`, 'Progress']}
                />
                <Area
                  type="monotone"
                  dataKey="progress"
                  stroke="#5aa9c4"
                  strokeWidth={2}
                  fill="url(#progGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Linked signals */}
          <div className="neu-card" style={{ padding: '20px 24px' }}>
            <h3 style={{ color: 'var(--neu-text-dark)', marginBottom: 4, fontSize: 15, fontWeight: 600 }}>
              Linked Signals
            </h3>
            <p style={{ color: 'var(--neu-text-light)', fontSize: 12, marginBottom: 16 }}>
              {data.linked_signals.length} signal{data.linked_signals.length !== 1 ? 's' : ''} connected
            </p>
            {data.linked_signals.length === 0 ? (
              <p style={{ color: 'var(--neu-text-light)', fontSize: 14 }}>No signals linked to this outcome.</p>
            ) : (
              data.linked_signals.map(s => (
                <SignalRow key={s.id} {...s} />
              ))
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}