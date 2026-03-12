import { useEffect, useState } from 'react';
import {
  listAutomations, createAutomation, toggleAutomation,
  deleteAutomation, runAutomation, Automation, AutomationPayload
} from '../services/automationService';

const TRIGGERS = [
  'signal_critical', 'signal_warning', 'outcome_at_risk',
  'outcome_completed', 'activity_overdue', 'manual'
];
const ACTIONS = [
  'send_notification', 'update_status', 'create_activity',
  'escalate', 'log_event', 'send_email'
];
const TRIGGER_ICON: Record<string, string> = {
  signal_critical: '🔴', signal_warning: '🟡', outcome_at_risk: '⚠️',
  outcome_completed: '✅', activity_overdue: '⏰', manual: '▶️',
};
const ACTION_ICON: Record<string, string> = {
  send_notification: '🔔', update_status: '🔄', create_activity: '➕',
  escalate: '📢', log_event: '📋', send_email: '📧',
};

function SkeletonBlock({ height = 80 }: { height?: number }) {
  return <div className="skeleton" style={{ height, borderRadius: 12, marginBottom: 16 }} />;
}

type AutomationCardProps = {
  auto: Automation;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onRun: (id: number) => void;
};
function AutomationCard({ auto, onToggle, onDelete, onRun }: AutomationCardProps) {
  const [running, setRunning] = useState(false);

  const handleRun = async () => {
    setRunning(true);
    await onRun(auto.id);
    setRunning(false);
  };

  return (
    <div className="neu-card" style={{ padding: '20px 24px', opacity: auto.is_enabled ? 1 : 0.6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 18 }}>{TRIGGER_ICON[auto.trigger] || '⚡'}</span>
            <h3 style={{ color: 'var(--neu-text-dark)', fontSize: 15, fontWeight: 700, margin: 0 }}>
              {auto.name}
            </h3>
          </div>
          {auto.description && (
            <p style={{ color: 'var(--neu-text-mid)', fontSize: 12, margin: 0 }}>{auto.description}</p>
          )}
        </div>
        {/* Toggle switch */}
        <div
          onClick={() => onToggle(auto.id)}
          style={{
            width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
            background: auto.is_enabled ? '#4caf82' : 'var(--neu-bg)',
            border: '2px solid ' + (auto.is_enabled ? '#4caf82' : 'var(--neu-divider)'),
            position: 'relative', transition: 'all 0.2s', flexShrink: 0, marginLeft: 12
          }}
        >
          <div style={{
            position: 'absolute', top: 2,
            left: auto.is_enabled ? 20 : 2,
            width: 16, height: 16, borderRadius: '50%',
            background: '#fff', transition: 'left 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
          }} />
        </div>
      </div>

      {/* Trigger → Action flow */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <span style={{
          background: '#5aa9c422', color: '#5aa9c4', borderRadius: 8,
          padding: '4px 10px', fontSize: 11, fontWeight: 600
        }}>
          WHEN: {auto.trigger.replace(/_/g, ' ')}
        </span>
        <span style={{ color: 'var(--neu-text-light)', fontSize: 14 }}>→</span>
        <span style={{
          background: '#4caf8222', color: '#4caf82', borderRadius: 8,
          padding: '4px 10px', fontSize: 11, fontWeight: 600
        }}>
          {ACTION_ICON[auto.action]} {auto.action.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 14 }}>
        <span style={{ color: 'var(--neu-text-light)', fontSize: 11 }}>
          ▶ {auto.run_count} runs
        </span>
        {auto.last_run_at && (
          <span style={{ color: 'var(--neu-text-light)', fontSize: 11 }}>
            Last: {new Date(auto.last_run_at).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleRun}
          disabled={running || !auto.is_enabled}
          style={{
            background: '#5aa9c4', border: 'none', borderRadius: 8,
            color: '#fff', padding: '6px 14px', cursor: running ? 'wait' : 'pointer',
            fontSize: 12, fontWeight: 600, opacity: running ? 0.7 : 1
          }}
        >
          {running ? 'Running…' : '▶ Run Now'}
        </button>
        <button
          onClick={() => onDelete(auto.id)}
          style={{
            background: '#e05c5c22', border: 'none', borderRadius: 8,
            color: '#e05c5c', padding: '6px 14px', cursor: 'pointer', fontSize: 12
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

const EMPTY_FORM: AutomationPayload = {
  name: '', description: '', trigger: 'signal_critical',
  action: 'send_notification', is_enabled: true
};

export default function Automations() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AutomationPayload>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    listAutomations()
      .then(setAutomations)
      .catch(() => setError('Failed to load automations.'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const a = await createAutomation(form);
      setAutomations(prev => [a, ...prev]);
      setShowForm(false);
      setForm(EMPTY_FORM);
    } catch { setError('Failed to create automation.'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (id: number) => {
    try {
      const res = await toggleAutomation(id);
      setAutomations(prev => prev.map(a => a.id === id ? { ...a, is_enabled: res.is_enabled } : a));
    } catch { setError('Failed to toggle.'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this automation?')) return;
    try {
      await deleteAutomation(id);
      setAutomations(prev => prev.filter(a => a.id !== id));
    } catch { setError('Failed to delete.'); }
  };

  const handleRun = async (id: number) => {
    try {
      await runAutomation(id);
      setAutomations(prev => prev.map(a =>
        a.id === id ? { ...a, run_count: a.run_count + 1, last_run_at: new Date().toISOString() } : a
      ));
    } catch { setError('Run failed.'); }
  };

  const inputStyle = {
    background: 'var(--neu-bg)', border: '1px solid var(--neu-divider)',
    borderRadius: 8, padding: '8px 12px', color: 'var(--neu-text-dark)',
    fontSize: 13, outline: 'none', width: '100%'
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--neu-text-dark)', margin: 0 }}>
            Automations
          </h1>
          <p style={{ color: 'var(--neu-text-mid)', marginTop: 6, fontSize: 14 }}>
            {automations.length} rule{automations.length !== 1 ? 's' : ''} · {automations.filter(a => a.is_enabled).length} active
          </p>
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          style={{
            background: '#5aa9c4', border: 'none', borderRadius: 10,
            color: '#fff', padding: '10px 20px', cursor: 'pointer',
            fontSize: 14, fontWeight: 600
          }}
        >
          + New Rule
        </button>
      </div>

      {error && (
        <div style={{ background: '#e05c5c22', border: '1px solid #e05c5c', borderRadius: 8, padding: '10px 16px', color: '#e05c5c', marginBottom: 20, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="neu-card" style={{ padding: '24px', marginBottom: 28 }}>
          <h3 style={{ color: 'var(--neu-text-dark)', marginBottom: 20, fontSize: 15, fontWeight: 700 }}>
            New Automation Rule
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ color: 'var(--neu-text-mid)', fontSize: 12, display: 'block', marginBottom: 6 }}>Rule Name *</label>
              <input style={inputStyle} placeholder="e.g. Alert on critical signal"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label style={{ color: 'var(--neu-text-mid)', fontSize: 12, display: 'block', marginBottom: 6 }}>Description</label>
              <input style={inputStyle} placeholder="Optional description"
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <label style={{ color: 'var(--neu-text-mid)', fontSize: 12, display: 'block', marginBottom: 6 }}>Trigger (WHEN)</label>
              <select style={inputStyle} value={form.trigger}
                onChange={e => setForm(f => ({ ...f, trigger: e.target.value }))}>
                {TRIGGERS.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: 'var(--neu-text-mid)', fontSize: 12, display: 'block', marginBottom: 6 }}>Action (THEN)</label>
              <select style={inputStyle} value={form.action}
                onChange={e => setForm(f => ({ ...f, action: e.target.value }))}>
                {ACTIONS.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleCreate} disabled={saving} style={{
              background: '#4caf82', border: 'none', borderRadius: 8, color: '#fff',
              padding: '8px 20px', cursor: 'pointer', fontSize: 13, fontWeight: 600
            }}>
              {saving ? 'Creating…' : 'Create Rule'}
            </button>
            <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }} style={{
              background: 'var(--neu-bg)', border: '1px solid var(--neu-divider)',
              borderRadius: 8, color: 'var(--neu-text-mid)', padding: '8px 16px', cursor: 'pointer', fontSize: 13
            }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {[...Array(4)].map((_, i) => <SkeletonBlock key={i} height={180} />)}
        </div>
      ) : automations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--neu-text-light)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
          <p style={{ fontSize: 16 }}>No automation rules yet. Create your first rule above.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {automations.map(a => (
            <AutomationCard key={a.id} auto={a} onToggle={handleToggle} onDelete={handleDelete} onRun={handleRun} />
          ))}
        </div>
      )}
    </div>
  );
}