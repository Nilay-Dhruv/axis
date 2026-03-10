import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer
} from 'recharts';
import { getSignalDetail, SignalDetailData } from '../services/signalDetailService';

function SkeletonBlock({ height = 40, width = '100%' }: { height?: number; width?: string }) {
  return <div className="skeleton" style={{ height, width, borderRadius: 8, marginBottom: 12 }} />;
}

const STATUS_COLOR: Record<string, string> = {
  healthy: '#4caf82', warning: '#f5a623', critical: '#e05c5c', normal: '#5aa9c4',
};

export default function SignalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<SignalDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

    useEffect(() => {
    if (!id) {
        setError('Invalid signal ID.');
        setLoading(false);
        return;
    }

    setLoading(true);

    getSignalDetail(id)
        .then(setData)
        .catch(() => setError('Failed to load signal details.'))
        .finally(() => setLoading(false));
    }, [id]);

  if (error) return <div style={{ padding: 40, textAlign: 'center', color: '#e05c5c' }}>{error}</div>;

  const color = data ? (STATUS_COLOR[data.signal.status?.toLowerCase()] || '#888') : '#888';
  const threshold = data?.signal.threshold ? Number(data.signal.threshold) : null;

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1000, margin: '0 auto' }}>
      <button
        onClick={() => navigate('/signals')}
        style={{
          background: 'none', border: 'none', color: 'var(--neu-text-mid)',
          cursor: 'pointer', fontSize: 14, marginBottom: 20, padding: 0
        }}
      >
        ← Back to Signals
      </button>

      {loading ? (
        <>
          <SkeletonBlock height={36} width="40%" />
          <SkeletonBlock height={20} width="20%" />
          <SkeletonBlock height={220} />
          <SkeletonBlock height={120} />
        </>
      ) : data ? (
        <>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: color }} />
              <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--neu-text-dark)', margin: 0 }}>
                {data.signal.name}
              </h1>
              <span style={{
                background: color + '22', color, borderRadius: 20,
                padding: '3px 12px', fontSize: 12, fontWeight: 600
              }}>
                {data.signal.status?.toUpperCase()}
              </span>
            </div>
            <p style={{ color: 'var(--neu-text-mid)', marginTop: 8, fontSize: 14 }}>
              {data.signal.description || 'No description provided.'}
            </p>
          </div>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Current Value', value: data.signal.value ?? '—' },
              { label: 'Threshold', value: data.signal.threshold ?? '—' },
              { label: 'Critical Alerts', value: data.alert_count },
              { label: 'Linked Outcome', value: data.signal.outcome_title ?? 'None' },
            ].map(({ label, value }) => (
              <div key={label} className="neu-card" style={{ padding: '16px 20px' }}>
                <div style={{ color: 'var(--neu-text-light)', fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {label}
                </div>
                <div style={{ color: 'var(--neu-text-dark)', fontWeight: 700, fontSize: 20 }}>
                  {String(value)}
                </div>
              </div>
            ))}
          </div>

          {/* Trend chart */}
          <div className="neu-card" style={{ padding: '20px 24px', marginBottom: 24 }}>
            <h3 style={{ color: 'var(--neu-text-dark)', marginBottom: 16, fontSize: 15, fontWeight: 600 }}>
              Signal Trend (14 days)
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--neu-divider)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--neu-text-light)', fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fill: 'var(--neu-text-light)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--neu-card)', border: 'none',
                    borderRadius: 8, color: 'var(--neu-text-dark)'
                  }}
                />
                {threshold !== null && (
                  <ReferenceLine y={threshold} stroke="#f5a623" strokeDasharray="4 4" label={{
                    value: 'Threshold', fill: '#f5a623', fontSize: 11
                  }} />
                )}
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Linked outcome */}
          {data.signal.outcome_id && (
            <div className="neu-card" style={{ padding: '16px 24px' }}>
              <h3 style={{ color: 'var(--neu-text-dark)', fontSize: 15, fontWeight: 600, marginBottom: 10 }}>
                Linked Outcome
              </h3>
              <div
                onClick={() => navigate(`/outcomes/${data.signal.outcome_id}`)}
                style={{
                  color: '#5aa9c4', cursor: 'pointer', fontSize: 14,
                  textDecoration: 'underline', textUnderlineOffset: 3
                }}
              >
                {data.signal.outcome_title}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}