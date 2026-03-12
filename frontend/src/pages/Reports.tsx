import { useState } from 'react';
import { exportCSV, ExportResource } from '../services/exportService';

type ExportCardProps = { resource: ExportResource; icon: string; label: string; description: string };
function ExportCard({ resource, icon, label, description }: ExportCardProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handle = async () => {
    setLoading(true);
    try {
      await exportCSV(resource);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch { alert('Export failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="neu-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 36 }}>{icon}</div>
      <h3 style={{ color: 'var(--neu-text-dark)', fontSize: 16, fontWeight: 700, margin: 0 }}>{label}</h3>
      <p style={{ color: 'var(--neu-text-mid)', fontSize: 13, margin: 0 }}>{description}</p>
      <button
        onClick={handle}
        disabled={loading}
        style={{
          background: done ? '#4caf82' : '#5aa9c4',
          border: 'none', borderRadius: 10, color: '#fff',
          padding: '10px 20px', cursor: loading ? 'wait' : 'pointer',
          fontSize: 13, fontWeight: 600, marginTop: 'auto',
          transition: 'background 0.3s'
        }}
      >
        {loading ? 'Exporting…' : done ? '✓ Downloaded!' : '⬇ Export CSV'}
      </button>
    </div>
  );
}

const EXPORTS: ExportCardProps[] = [
  { resource: 'outcomes', icon: '🎯', label: 'Outcomes', description: 'Export all outcomes with status, progress, and department.' },
  { resource: 'signals', icon: '📡', label: 'Signals', description: 'Export all signals with values, thresholds, and status.' },
  { resource: 'activities', icon: '⚡', label: 'Activities', description: 'Export all activity logs with status and timestamps.' },
  { resource: 'departments', icon: '🏢', label: 'Departments', description: 'Export all departments with heads and descriptions.' },
];

export default function Reports() {
  return (
    <div style={{ padding: '24px 32px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--neu-text-dark)', margin: 0 }}>
          Export & Reports
        </h1>
        <p style={{ color: 'var(--neu-text-mid)', marginTop: 6, fontSize: 14 }}>
          Download your data as CSV files for external analysis
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
        {EXPORTS.map(e => <ExportCard key={e.resource} {...e} />)}
      </div>
    </div>
  );
}