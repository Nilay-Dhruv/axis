import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer} from 'recharts';
import {
  listSimulations, createSimulation, runSimulation, deleteSimulation,
  Simulation, SimulationSnapshot, SimulationParams
} from '../services/simulationService';

function SkeletonBlock({ height = 100 }: { height?: number }) {
  return <div className="skeleton" style={{ height, borderRadius: 12, marginBottom: 16 }} />;
}

type ResultCardProps = { snap: SimulationSnapshot };
function ResultCard({ snap }: ResultCardProps) {
  if (!snap.result) return null;
  const r = snap.result;
  return (
    <div style={{ background: 'var(--neu-bg)', borderRadius: 10, padding: '16px 20px', marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ color: 'var(--neu-text-dark)', fontWeight: 600, fontSize: 14 }}>
          {snap.label || 'Snapshot'}
        </span>
        <span style={{ color: 'var(--neu-text-light)', fontSize: 11 }}>
          {snap.created_at ? new Date(snap.created_at).toLocaleString() : ''}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 14 }}>
        {[
          { label: 'Projected Outcomes', value: r.projected_outcomes, color: '#4caf82' },
          { label: 'Est. Cost', value: `$${r.estimated_cost.toLocaleString()}`, color: '#5aa9c4' },
          { label: 'Completion %', value: `${r.completion_probability}%`, color: '#9b8fd9' },
          { label: 'Risk Score', value: `${r.risk_score}/10`, color: r.risk_score > 6 ? '#e05c5c' : '#f5a623' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ color, fontWeight: 700, fontSize: 20 }}>{value}</div>
            <div style={{ color: 'var(--neu-text-light)', fontSize: 10, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>
      {r.weekly_breakdown && r.weekly_breakdown.length > 0 && (
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={r.weekly_breakdown}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--neu-divider)" />
            <XAxis dataKey="week" tick={{ fill: 'var(--neu-text-light)', fontSize: 10 }} tickLine={false} label={{ value: 'Week', position: 'insideBottom', fill: 'var(--neu-text-light)', fontSize: 10 }} />
            <YAxis domain={[0, 100]} tick={{ fill: 'var(--neu-text-light)', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip contentStyle={{ background: 'var(--neu-card)', border: 'none', borderRadius: 8, color: 'var(--neu-text-dark)', fontSize: 11 }} />
            <Line type="monotone" dataKey="progress" stroke="#5aa9c4" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

type SimCardProps = {
  sim: Simulation;
  onDelete: (id: number) => void;
  onSelect: (sim: Simulation) => void;
  isActive: boolean;
};
function SimCard({ sim, onDelete, onSelect, isActive }: SimCardProps) {
  const statusColor: Record<string, string> = { draft: '#f5a623', running: '#5aa9c4', complete: '#4caf82' };
  const color = statusColor[sim.status] || '#888';
  return (
    <div className="neu-card" onClick={() => onSelect(sim)} style={{
      padding: '16px 20px', cursor: 'pointer',
      borderLeft: isActive ? `3px solid #5aa9c4` : '3px solid transparent'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ color: 'var(--neu-text-dark)', fontWeight: 600, fontSize: 14 }}>{sim.name}</span>
        <span style={{ background: color + '22', color, borderRadius: 10, padding: '2px 8px', fontSize: 10, fontWeight: 600 }}>
          {sim.status}
        </span>
      </div>
      {sim.description && <p style={{ color: 'var(--neu-text-mid)', fontSize: 12, margin: '0 0 8px' }}>{sim.description}</p>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--neu-text-light)', fontSize: 11 }}>{sim.snapshot_count} run{sim.snapshot_count !== 1 ? 's' : ''}</span>
        <button onClick={e => { e.stopPropagation(); onDelete(sim.id); }} style={{
          background: 'none', border: 'none', color: '#e05c5c', cursor: 'pointer', fontSize: 11
        }}>Delete</button>
      </div>
    </div>
  );
}

export default function Simulations() {
  const [sims, setSims] = useState<Simulation[]>([]);
  const [selected, setSelected] = useState<Simulation | null>(null);
  const [snapshots, setSnapshots] = useState<SimulationSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [params, setParams] = useState<SimulationParams>({ headcount: 10, budget: 100000, duration_weeks: 12 });
  const [error, setError] = useState('');

  useEffect(() => {
    listSimulations()
      .then(setSims)
      .catch(() => setError('Failed to load simulations.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (sim: Simulation) => {
    setSelected(sim);
    try {
      const data = await getSimulation(sim.id);
      setSnapshots(data.snapshots);
      setParams(sim.parameters || { headcount: 10, budget: 100000, duration_weeks: 12 });
    } catch { setError('Failed to load simulation details.'); }
  };

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    try {
      const s = await createSimulation({ name: form.name, description: form.description });
      setSims(prev => [s, ...prev]);
      setShowForm(false);
      setForm({ name: '', description: '' });
    } catch { setError('Failed to create simulation.'); }
  };

  const handleRun = async () => {
    if (!selected) return;
    setRunning(true);
    try {
      const snap = await runSimulation(selected.id, params, `Run ${snapshots.length + 1}`);
      setSnapshots(prev => [snap, ...prev]);
      setSims(prev => prev.map(s => s.id === selected.id ? { ...s, status: 'complete', snapshot_count: s.snapshot_count + 1 } : s));
    } catch { setError('Run failed.'); }
    finally { setRunning(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete?')) return;
    await deleteSimulation(id);
    setSims(prev => prev.filter(s => s.id !== id));
    if (selected?.id === id) { setSelected(null); setSnapshots([]); }
  };

  const inputStyle = {
    background: 'var(--neu-bg)', border: '1px solid var(--neu-divider)',
    borderRadius: 8, padding: '7px 12px', color: 'var(--neu-text-dark)',
    fontSize: 13, outline: 'none', width: '100%'
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--neu-text-dark)', margin: 0 }}>Simulations</h1>
          <p style={{ color: 'var(--neu-text-mid)', marginTop: 6, fontSize: 14 }}>Model scenarios and compare projected outcomes</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} style={{
          background: '#5aa9c4', border: 'none', borderRadius: 10,
          color: '#fff', padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 600
        }}>+ New Simulation</button>
      </div>

      {error && <div style={{ background: '#e05c5c22', border: '1px solid #e05c5c', borderRadius: 8, padding: '10px 16px', color: '#e05c5c', marginBottom: 20, fontSize: 13 }}>{error}</div>}

      {showForm && (
        <div className="neu-card" style={{ padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ color: 'var(--neu-text-mid)', fontSize: 12, display: 'block', marginBottom: 6 }}>Name *</label>
              <input style={inputStyle} placeholder="Simulation name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label style={{ color: 'var(--neu-text-mid)', fontSize: 12, display: 'block', marginBottom: 6 }}>Description</label>
              <input style={inputStyle} placeholder="Optional" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleCreate} style={{ background: '#4caf82', border: 'none', borderRadius: 8, color: '#fff', padding: '8px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Create</button>
            <button onClick={() => setShowForm(false)} style={{ background: 'var(--neu-bg)', border: '1px solid var(--neu-divider)', borderRadius: 8, color: 'var(--neu-text-mid)', padding: '8px 14px', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
        {/* Left: sim list */}
        <div>
          <h3 style={{ color: 'var(--neu-text-light)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Scenarios ({sims.length})
          </h3>
          {loading ? [...Array(3)].map((_, i) => <SkeletonBlock key={i} height={80} />) : (
            sims.map(s => (
              <SimCard key={s.id} sim={s} onDelete={handleDelete} onSelect={handleSelect} isActive={selected?.id === s.id} />
            ))
          )}
          {!loading && sims.length === 0 && (
            <p style={{ color: 'var(--neu-text-light)', fontSize: 13, textAlign: 'center', marginTop: 24 }}>No simulations yet</p>
          )}
        </div>

        {/* Right: runner + results */}
        <div>
          {!selected ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--neu-text-light)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔬</div>
              <p>Select a simulation to configure and run it</p>
            </div>
          ) : (
            <>
              <div className="neu-card" style={{ padding: '20px 24px', marginBottom: 20 }}>
                <h3 style={{ color: 'var(--neu-text-dark)', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
                  Parameters — {selected.name}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
                  {[
                    { label: 'Headcount (FTEs)', key: 'headcount', min: 1, max: 100 },
                    { label: 'Budget ($)', key: 'budget', min: 10000, max: 10000000 },
                    { label: 'Duration (weeks)', key: 'duration_weeks', min: 1, max: 52 },
                  ].map(({ label, key, min, max }) => (
                    <div key={key}>
                      <label style={{ color: 'var(--neu-text-mid)', fontSize: 12, display: 'block', marginBottom: 6 }}>
                        {label}: <strong style={{ color: 'var(--neu-text-dark)' }}>{(params[key] as number)?.toLocaleString()}</strong>
                      </label>
                      <input type="range" min={min} max={max}
                        value={(params[key] as number) || min}
                        onChange={e => setParams(p => ({ ...p, [key]: Number(e.target.value) }))}
                        style={{ width: '100%', accentColor: '#5aa9c4' }}
                      />
                    </div>
                  ))}
                </div>
                <button onClick={handleRun} disabled={running} style={{
                  background: '#5aa9c4', border: 'none', borderRadius: 10,
                  color: '#fff', padding: '10px 24px', cursor: running ? 'wait' : 'pointer',
                  fontSize: 14, fontWeight: 600, opacity: running ? 0.7 : 1
                }}>
                  {running ? '⏳ Running…' : '▶ Run Simulation'}
                </button>
              </div>

              {snapshots.length > 0 && (
                <div>
                  <h3 style={{ color: 'var(--neu-text-light)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                    Results ({snapshots.length} runs)
                  </h3>
                  {snapshots.map(sn => <ResultCard key={sn.id} snap={sn} />)}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Need this import at top for getSimulation
async function getSimulation(id: number) {
  const { getSimulation: _get } = await import('../services/simulationService');
  return _get(id);
}