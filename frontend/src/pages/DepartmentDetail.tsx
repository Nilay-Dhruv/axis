import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getDepartmentDetail, DeptDetailData } from '../services/departmentDetailService';

const COLORS = ['#4caf82', '#5aa9c4', '#e05c5c', '#f5a623', '#9b8fd9'];

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="neu-card" style={{ padding: '16px 20px', textAlign: 'center' }}>
      <div style={{ color: 'var(--neu-text-light)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ color: 'var(--neu-text-dark)', fontWeight: 700, fontSize: 24 }}>{value}</div>
    </div>
  );
}

type OutcomeCardProps = { id: number; title: string; status: string; progress: number };
function OutcomeCard({ id, title, status, progress }: OutcomeCardProps) {
  const navigate = useNavigate();
  const statusColor: Record<string, string> = {
    active: '#4caf82', completed: '#5aa9c4', at_risk: '#e05c5c', on_hold: '#f5a623',
  };
  const color = statusColor[status] || '#888';
  return (
    <div
      className="neu-card"
      onClick={() => navigate(`/outcomes/${id}`)}
      style={{ padding: '14px 18px', cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ color: 'var(--neu-text-dark)', fontSize: 13, fontWeight: 600 }}>{title}</span>
        <span style={{ color, fontSize: 11, fontWeight: 600 }}>{status?.replace('_', ' ').toUpperCase()}</span>
      </div>
      <div style={{ background: 'var(--neu-bg)', borderRadius: 4, height: 6 }}>
        <div style={{ width: `${progress}%`, height: '100%', background: color, borderRadius: 4 }} />
      </div>
      <span style={{ color: 'var(--neu-text-light)', fontSize: 11, marginTop: 4, display: 'block' }}>
        {progress}% complete
      </span>
    </div>
  );
}

function SkeletonBlock({ height = 40, width = '100%' }: { height?: number; width?: string }) {
  return <div className="skeleton" style={{ height, width, borderRadius: 8, marginBottom: 12 }} />;
}

export default function DepartmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<DeptDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('Invalid department ID.');
      setLoading(false);
      return;
    }

    setLoading(true);

    getDepartmentDetail(id)
      .then(setData)
      .catch(() => setError('Failed to load department details.'))
      .finally(() => setLoading(false));

  }, [id]);

  if (error) return <div style={{ padding: 40, textAlign: 'center', color: '#e05c5c' }}>{error}</div>;

  const pieData = data
    ? Object.entries(data.stats.outcome_status_breakdown).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <button
        onClick={() => navigate('/departments')}
        style={{
          background: 'none', border: 'none', color: 'var(--neu-text-mid)',
          cursor: 'pointer', fontSize: 14, marginBottom: 20, padding: 0
        }}
      >
        ← Back to Departments
      </button>

      {loading ? (
        <>
          <SkeletonBlock height={36} width="35%" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[...Array(4)].map((_, i) => <SkeletonBlock key={i} height={80} />)}
          </div>
          <SkeletonBlock height={200} />
        </>
      ) : data ? (
        <>
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--neu-text-dark)', margin: 0 }}>
              {data.department.name}
            </h1>
            {data.department.head && (
              <p style={{ color: 'var(--neu-text-mid)', marginTop: 6 }}>
                👤 Head: {data.department.head}
              </p>
            )}
            {data.department.description && (
              <p style={{ color: 'var(--neu-text-light)', fontSize: 14, marginTop: 4 }}>
                {data.department.description}
              </p>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
            <StatCard label="Outcomes" value={data.stats.outcome_count} />
            <StatCard label="Signals" value={data.stats.signal_count} />
            <StatCard label="Activities" value={data.stats.activity_count} />
            <StatCard label="Avg Progress" value={`${data.stats.avg_progress}%`} />
          </div>

          {/* Chart + recent activity grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
            {/* Outcome status breakdown */}
            <div className="neu-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ color: 'var(--neu-text-dark)', fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
                Outcome Status Breakdown
              </h3>
              {pieData.length === 0 ? (
                <p style={{ color: 'var(--neu-text-light)', fontSize: 13 }}>No outcomes yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                      {pieData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--neu-card)', border: 'none', borderRadius: 8, color: 'var(--neu-text-dark)' }} />
                    <Legend wrapperStyle={{ fontSize: 12, color: 'var(--neu-text-mid)' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Recent activities */}
            <div className="neu-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ color: 'var(--neu-text-dark)', fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
                Recent Activities
              </h3>
              {data.recent_activities.length === 0 ? (
                <p style={{ color: 'var(--neu-text-light)', fontSize: 13 }}>No recent activities.</p>
              ) : (
                data.recent_activities.slice(0, 6).map(a => (
                  <div key={a.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 0', borderBottom: '1px solid var(--neu-divider)'
                  }}>
                    <span style={{ color: 'var(--neu-text-dark)', fontSize: 13 }}>{a.title}</span>
                    <span style={{ color: 'var(--neu-text-light)', fontSize: 11 }}>
                      {a.created_at ? new Date(a.created_at).toLocaleDateString() : '—'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Outcomes grid */}
          <div>
            <h3 style={{ color: 'var(--neu-text-dark)', fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
              Outcomes ({data.outcomes.length})
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {data.outcomes.map(o => (
                <OutcomeCard key={o.id} {...o} />
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}