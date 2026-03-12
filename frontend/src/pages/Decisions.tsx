import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  listDecisions, createDecision, deleteDecision, updateDecision, Decision
} from '../services/decisionService';

const STATUS_COLOR: Record<string, string> = {
  open: '#5aa9c4', decided: '#4caf82', deferred: '#f5a623',
};

function SkeletonBlock({ height = 100 }: { height?: number }) {
  return <div className="skeleton" style={{ height, borderRadius: 12, marginBottom: 16 }} />;
}

type DecisionCardProps = {
  dec: Decision;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: string) => void;
};
function DecisionCard({ dec, onDelete, onStatusChange }: DecisionCardProps) {
  const navigate = useNavigate();
  const color = STATUS_COLOR[dec.status] || '#888';
  return (
    <div className="neu-card" style={{ padding: '20px 24px', cursor: 'pointer' }}
      onClick={() => navigate(`/decisions/${dec.id}`)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <h3 style={{ color: 'var(--neu-text-dark)', fontSize: 15, fontWeight: 700, margin: 0, flex: 1 }}>
          {dec.title}
        </h3>
        <span style={{
          background: color + '22', color, borderRadius: 12,
          padding: '2px 10px', fontSize: 11, fontWeight: 600, marginLeft: 10
        }}>
          {dec.status.toUpperCase()}
        </span>
      </div>
      {dec.description && (
        <p style={{ color: 'var(--neu-text-mid)', fontSize: 12, margin: '0 0 12px' }}>{dec.description}</p>
      )}
      <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
        <span style={{ color: 'var(--neu-text-light)', fontSize: 12 }}>📋 {dec.option_count} options</span>
        <span style={{ color: 'var(--neu-text-light)', fontSize: 12 }}>⚖️ {dec.criteria_count} criteria</span>
        {dec.decided_at && (
          <span style={{ color: 'var(--neu-text-light)', fontSize: 12 }}>
            ✅ {new Date(dec.decided_at).toLocaleDateString()}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
        {dec.status === 'open' && (
          <button onClick={() => onStatusChange(dec.id, 'decided')} style={{
            background: '#4caf8222', border: 'none', borderRadius: 8,
            color: '#4caf82', padding: '5px 12px', cursor: 'pointer', fontSize: 12
          }}>Mark Decided</button>
        )}
        <button onClick={() => onDelete(dec.id)} style={{
          background: '#e05c5c22', border: 'none', borderRadius: 8,
          color: '#e05c5c', padding: '5px 12px', cursor: 'pointer', fontSize: 12
        }}>Delete</button>
      </div>
    </div>
  );
}

export default function Decisions() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', options: '', criteria: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    listDecisions()
      .then(setDecisions)
      .catch(() => setError('Failed to load decisions.'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const options = form.options.split(',').map(s => ({ title: s.trim() })).filter(o => o.title);
      const criteria = form.criteria.split(',').map(s => ({ name: s.trim(), weight: 1.0 })).filter(c => c.name);
      const d = await createDecision({ title: form.title, description: form.description, options, criteria });
      setDecisions(prev => [d, ...prev]);
      setShowForm(false);
      setForm({ title: '', description: '', options: '', criteria: '' });
    } catch { setError('Failed to create decision.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this decision?')) return;
    try {
      await deleteDecision(id);
      setDecisions(prev => prev.filter(d => d.id !== id));
    } catch { setError('Failed to delete.'); }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const updated = await updateDecision(id, { status });
      setDecisions(prev => prev.map(d => d.id === id ? { ...d, ...updated } : d));
    } catch { setError('Failed to update status.'); }
  };

  const inputStyle = {
    background: 'var(--neu-bg)', border: '1px solid var(--neu-divider)',
    borderRadius: 8, padding: '8px 12px', color: 'var(--neu-text-dark)',
    fontSize: 13, outline: 'none', width: '100%'
  };

  const statusGroups = {
    open: decisions.filter(d => d.status === 'open'),
    decided: decisions.filter(d => d.status === 'decided'),
    deferred: decisions.filter(d => d.status === 'deferred'),
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--neu-text-dark)', margin: 0 }}>Decisions</h1>
          <p style={{ color: 'var(--neu-text-mid)', marginTop: 6, fontSize: 14 }}>
            {decisions.length} total · {statusGroups.open.length} open
          </p>
        </div>
        <button onClick={() => setShowForm(s => !s)} style={{
          background: '#5aa9c4', border: 'none', borderRadius: 10,
          color: '#fff', padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 600
        }}>+ New Decision</button>
      </div>

      {error && (
        <div style={{ background: '#e05c5c22', border: '1px solid #e05c5c', borderRadius: 8, padding: '10px 16px', color: '#e05c5c', marginBottom: 20, fontSize: 13 }}>
          {error}
        </div>
      )}

      {showForm && (
        <div className="neu-card" style={{ padding: 24, marginBottom: 28 }}>
          <h3 style={{ color: 'var(--neu-text-dark)', marginBottom: 20, fontSize: 15, fontWeight: 700 }}>New Decision</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ color: 'var(--neu-text-mid)', fontSize: 12, display: 'block', marginBottom: 6 }}>Title *</label>
              <input style={inputStyle} placeholder="Decision title"
                value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label style={{ color: 'var(--neu-text-mid)', fontSize: 12, display: 'block', marginBottom: 6 }}>Description</label>
              <input style={inputStyle} placeholder="What needs to be decided?"
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <label style={{ color: 'var(--neu-text-mid)', fontSize: 12, display: 'block', marginBottom: 6 }}>
                Options <span style={{ color: 'var(--neu-text-light)' }}>(comma-separated)</span>
              </label>
              <input style={inputStyle} placeholder="Option A, Option B, Option C"
                value={form.options} onChange={e => setForm(f => ({ ...f, options: e.target.value }))} />
            </div>
            <div>
              <label style={{ color: 'var(--neu-text-mid)', fontSize: 12, display: 'block', marginBottom: 6 }}>
                Criteria <span style={{ color: 'var(--neu-text-light)' }}>(comma-separated)</span>
              </label>
              <input style={inputStyle} placeholder="Cost, Speed, Risk"
                value={form.criteria} onChange={e => setForm(f => ({ ...f, criteria: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleCreate} disabled={saving} style={{
              background: '#4caf82', border: 'none', borderRadius: 8, color: '#fff',
              padding: '8px 20px', cursor: 'pointer', fontSize: 13, fontWeight: 600
            }}>{saving ? 'Creating…' : 'Create'}</button>
            <button onClick={() => setShowForm(false)} style={{
              background: 'var(--neu-bg)', border: '1px solid var(--neu-divider)',
              borderRadius: 8, color: 'var(--neu-text-mid)', padding: '8px 16px', cursor: 'pointer', fontSize: 13
            }}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px,1fr))', gap: 16 }}>
          {[...Array(4)].map((_, i) => <SkeletonBlock key={i} />)}
        </div>
      ) : decisions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--neu-text-light)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚖️</div>
          <p>No decisions yet. Create your first decision above.</p>
        </div>
      ) : (
        Object.entries(statusGroups).map(([status, items]) => items.length > 0 && (
          <div key={status} style={{ marginBottom: 32 }}>
            <h2 style={{ color: STATUS_COLOR[status], fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
              {status} ({items.length})
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px,1fr))', gap: 16 }}>
              {items.map(d => (
                <DecisionCard key={d.id} dec={d} onDelete={handleDelete} onStatusChange={handleStatusChange} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}