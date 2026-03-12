import { useEffect, useState } from 'react';
import {
  listWebhooks, createWebhook, deleteWebhook, toggleWebhook, testWebhook, Webhook
} from '../services/webhookService';

function SkeletonBlock({ height = 100 }: { height?: number }) {
  return <div className="skeleton" style={{ height, borderRadius: 12, marginBottom: 16 }} />;
}

type WebhookRowProps = {
  wh: Webhook;
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
  onTest: (id: number) => void;
};
function WebhookRow({ wh, onDelete, onToggle }: WebhookRowProps) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string>('');

  const handleTest = async () => {
    setTesting(true);
    const r = await onTestAsync(wh.id);
    setTestResult(r.success ? '✓ Success' : `✗ ${r.error || 'Failed'}`);
    setTimeout(() => setTestResult(''), 4000);
    setTesting(false);
  };

  const onTestAsync = async (id: number) => {
    try { return await testWebhook(id); }
    catch { return { success: false, status_code: null, error: 'Request failed' }; }
  };

  return (
    <div className="neu-card" style={{ padding: '18px 22px', marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: wh.is_active ? '#4caf82' : '#888' }} />
            <span style={{ color: 'var(--neu-text-dark)', fontWeight: 700, fontSize: 14 }}>{wh.name}</span>
          </div>
          <div style={{ color: 'var(--neu-text-mid)', fontSize: 12, marginBottom: 8, wordBreak: 'break-all' }}>
            {wh.url}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            {(wh.events || []).map(e => (
              <span key={e} style={{ background: '#5aa9c422', color: '#5aa9c4', borderRadius: 8, padding: '2px 8px', fontSize: 10, fontWeight: 600 }}>
                {e}
              </span>
            ))}
          </div>
          {wh.secret && (
            <div style={{ color: 'var(--neu-text-light)', fontSize: 10 }}>
              Secret: <code style={{ background: 'var(--neu-bg)', padding: '1px 6px', borderRadius: 4 }}>{wh.secret}</code>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 16, flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onToggle(wh.id)} style={{
              background: wh.is_active ? '#f5a62322' : '#4caf8222',
              border: 'none', borderRadius: 8,
              color: wh.is_active ? '#f5a623' : '#4caf82',
              padding: '5px 12px', cursor: 'pointer', fontSize: 11, fontWeight: 600
            }}>{wh.is_active ? 'Disable' : 'Enable'}</button>
            <button onClick={handleTest} disabled={testing || !wh.is_active} style={{
              background: '#5aa9c422', border: 'none', borderRadius: 8,
              color: '#5aa9c4', padding: '5px 12px', cursor: 'pointer', fontSize: 11, fontWeight: 600
            }}>{testing ? '…' : 'Test'}</button>
            <button onClick={() => onDelete(wh.id)} style={{
              background: '#e05c5c22', border: 'none', borderRadius: 8,
              color: '#e05c5c', padding: '5px 12px', cursor: 'pointer', fontSize: 11
            }}>Delete</button>
          </div>
          {testResult && (
            <span style={{ fontSize: 11, color: testResult.startsWith('✓') ? '#4caf82' : '#e05c5c' }}>
              {testResult}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Webhooks() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [availableEvents, setAvailableEvents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', url: '', events: [] as string[] });
  const [error, setError] = useState('');

  useEffect(() => {
    listWebhooks()
      .then(r => { setWebhooks(r.webhooks); setAvailableEvents(r.available_events); })
      .catch(() => setError('Failed to load webhooks.'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.name || !form.url) return;
    try {
      const w = await createWebhook(form);
      setWebhooks(prev => [w, ...prev]);
      setShowForm(false);
      setForm({ name: '', url: '', events: [] });
    } catch { setError('Failed to create webhook.'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete webhook?')) return;
    await deleteWebhook(id);
    setWebhooks(prev => prev.filter(w => w.id !== id));
  };

  const handleToggle = async (id: number) => {
    const r = await toggleWebhook(id);
    setWebhooks(prev => prev.map(w => w.id === id ? { ...w, is_active: r.is_active } : w));
  };

  const toggleEvent = (e: string) => {
    setForm(f => ({
      ...f,
      events: f.events.includes(e) ? f.events.filter(x => x !== e) : [...f.events, e]
    }));
  };

  const inputStyle = {
    background: 'var(--neu-bg)', border: '1px solid var(--neu-divider)',
    borderRadius: 8, padding: '8px 12px', color: 'var(--neu-text-dark)',
    fontSize: 13, outline: 'none', width: '100%'
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--neu-text-dark)', margin: 0 }}>Webhooks</h1>
          <p style={{ color: 'var(--neu-text-mid)', marginTop: 6, fontSize: 14 }}>
            Send real-time event notifications to external services
          </p>
        </div>
        <button onClick={() => setShowForm(s => !s)} style={{
          background: '#5aa9c4', border: 'none', borderRadius: 10,
          color: '#fff', padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 600
        }}>+ Add Webhook</button>
      </div>

      {error && <div style={{ background: '#e05c5c22', border: '1px solid #e05c5c', borderRadius: 8, padding: '10px 16px', color: '#e05c5c', marginBottom: 20, fontSize: 13 }}>{error}</div>}

      {showForm && (
        <div className="neu-card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: 'var(--neu-text-dark)', marginBottom: 16, fontSize: 15, fontWeight: 700 }}>New Webhook</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ color: 'var(--neu-text-mid)', fontSize: 12, display: 'block', marginBottom: 6 }}>Name *</label>
              <input style={inputStyle} placeholder="My Slack webhook" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label style={{ color: 'var(--neu-text-mid)', fontSize: 12, display: 'block', marginBottom: 6 }}>URL *</label>
              <input style={inputStyle} placeholder="https://hooks.slack.com/..." value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: 'var(--neu-text-mid)', fontSize: 12, display: 'block', marginBottom: 8 }}>Events to Subscribe</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {availableEvents.map(e => (
                <button key={e} onClick={() => toggleEvent(e)} style={{
                  background: form.events.includes(e) ? '#5aa9c4' : 'var(--neu-bg)',
                  border: `1px solid ${form.events.includes(e) ? '#5aa9c4' : 'var(--neu-divider)'}`,
                  borderRadius: 8, color: form.events.includes(e) ? '#fff' : 'var(--neu-text-mid)',
                  padding: '5px 12px', cursor: 'pointer', fontSize: 11, fontWeight: 600
                }}>{e}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleCreate} style={{ background: '#4caf82', border: 'none', borderRadius: 8, color: '#fff', padding: '8px 20px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Create</button>
            <button onClick={() => setShowForm(false)} style={{ background: 'var(--neu-bg)', border: '1px solid var(--neu-divider)', borderRadius: 8, color: 'var(--neu-text-mid)', padding: '8px 14px', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? [...Array(3)].map((_, i) => <SkeletonBlock key={i} />) : (
        webhooks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--neu-text-light)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔗</div>
            <p>No webhooks configured yet.</p>
          </div>
        ) : (
          webhooks.map(w => (
            <WebhookRow key={w.id} wh={w} onDelete={handleDelete} onToggle={handleToggle} onTest={testWebhook} />
          ))
        )
      )}
    </div>
  );
}