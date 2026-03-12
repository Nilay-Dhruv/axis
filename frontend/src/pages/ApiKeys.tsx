import { useEffect, useState } from 'react';
import { listApiKeys, createApiKey, revokeApiKey, toggleApiKey, ApiKey } from '../services/apiKeyService';

function SkeletonBlock({ height = 60 }: { height?: number }) {
  return <div className="skeleton" style={{ height, borderRadius: 10, marginBottom: 12 }} />;
}

export default function ApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    listApiKeys().then(setKeys).catch(() => setError('Failed to load keys.')).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      const { key, raw_key } = await createApiKey(name);
      setKeys(prev => [key, ...prev]);
      setNewKey(raw_key);
      setName('');
    } catch { setError('Failed to create key.'); }
  };

  const handleRevoke = async (id: number) => {
    if (!confirm('Revoke this API key? This cannot be undone.')) return;
    await revokeApiKey(id);
    setKeys(prev => prev.filter(k => k.id !== id));
  };

  const handleToggle = async (id: number) => {
    const r = await toggleApiKey(id);
    setKeys(prev => prev.map(k => k.id === id ? { ...k, is_active: r.is_active } : k));
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--neu-text-dark)', margin: 0 }}>API Keys</h1>
        <p style={{ color: 'var(--neu-text-mid)', marginTop: 6, fontSize: 14 }}>
          Generate keys to access the AXIS API programmatically
        </p>
      </div>

      {error && <div style={{ background: '#e05c5c22', border: '1px solid #e05c5c', borderRadius: 8, padding: '10px 16px', color: '#e05c5c', marginBottom: 20, fontSize: 13 }}>{error}</div>}

      {/* New key shown once */}
      {newKey && (
        <div style={{ background: '#4caf8222', border: '1px solid #4caf82', borderRadius: 10, padding: '16px 20px', marginBottom: 24 }}>
          <div style={{ color: '#4caf82', fontWeight: 700, marginBottom: 8, fontSize: 14 }}>
            ✓ New API key created — copy it now, it won't be shown again
          </div>
          <code style={{
            display: 'block', background: 'var(--neu-bg)', padding: '10px 14px',
            borderRadius: 8, fontSize: 13, wordBreak: 'break-all', color: 'var(--neu-text-dark)'
          }}>
            {newKey}
          </code>
          <button onClick={() => { navigator.clipboard.writeText(newKey); }} style={{
            marginTop: 10, background: '#5aa9c4', border: 'none', borderRadius: 8,
            color: '#fff', padding: '6px 14px', cursor: 'pointer', fontSize: 12
          }}>Copy to Clipboard</button>
          <button onClick={() => setNewKey(null)} style={{
            marginTop: 10, marginLeft: 10, background: 'none', border: 'none',
            color: 'var(--neu-text-light)', cursor: 'pointer', fontSize: 12
          }}>Dismiss</button>
        </div>
      )}

      {/* Create form */}
      <div className="neu-card" style={{ padding: '20px 24px', marginBottom: 28, display: 'flex', gap: 12, alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label style={{ color: 'var(--neu-text-mid)', fontSize: 12, display: 'block', marginBottom: 6 }}>Key Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            placeholder="e.g. Production App, CI/CD Pipeline"
            style={{
              background: 'var(--neu-bg)', border: '1px solid var(--neu-divider)',
              borderRadius: 8, padding: '8px 12px', color: 'var(--neu-text-dark)',
              fontSize: 13, outline: 'none', width: '100%'
            }}
          />
        </div>
        <button onClick={handleCreate} disabled={!name.trim()} style={{
          background: '#5aa9c4', border: 'none', borderRadius: 8, color: '#fff',
          padding: '8px 20px', cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap'
        }}>Generate Key</button>
      </div>

      {/* Keys list */}
      {loading ? [...Array(3)].map((_, i) => <SkeletonBlock key={i} />) : (
        keys.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--neu-text-light)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔑</div>
            <p>No API keys yet.</p>
          </div>
        ) : (
          keys.map(k => (
            <div key={k.id} className="neu-card" style={{ padding: '16px 20px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: k.is_active ? '#4caf82' : '#888' }} />
                  <span style={{ color: 'var(--neu-text-dark)', fontWeight: 600, fontSize: 14 }}>{k.name}</span>
                </div>
                <code style={{ color: 'var(--neu-text-mid)', fontSize: 12 }}>{k.key_prefix}••••••••</code>
                <span style={{ color: 'var(--neu-text-light)', fontSize: 11, marginLeft: 16 }}>
                  {k.last_used_at ? `Last used ${new Date(k.last_used_at).toLocaleDateString()}` : 'Never used'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleToggle(k.id)} style={{
                  background: k.is_active ? '#f5a62322' : '#4caf8222',
                  border: 'none', borderRadius: 8,
                  color: k.is_active ? '#f5a623' : '#4caf82',
                  padding: '5px 12px', cursor: 'pointer', fontSize: 11, fontWeight: 600
                }}>{k.is_active ? 'Disable' : 'Enable'}</button>
                <button onClick={() => handleRevoke(k.id)} style={{
                  background: '#e05c5c22', border: 'none', borderRadius: 8,
                  color: '#e05c5c', padding: '5px 12px', cursor: 'pointer', fontSize: 11
                }}>Revoke</button>
              </div>
            </div>
          ))
        )
      )}
    </div>
  );
}