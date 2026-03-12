import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDecision, saveScores, DecisionFull, DecisionScore } from '../services/decisionService';

export default function DecisionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<{ decision: DecisionFull; scores: DecisionScore[] } | null>(null);
  const [scoreMap, setScoreMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getDecision(Number(id)).then(d => {
      setData(d);
      const map: Record<string, number> = {};
      d.scores.forEach(s => { map[`${s.option_id}-${s.criteria_id}`] = s.score; });
      setScoreMap(map);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleScoreChange = (optId: number, critId: number, val: number) => {
    setScoreMap(m => ({ ...m, [`${optId}-${critId}`]: val }));
  };

  const handleSave = async () => {
    if (!data || !id) return;
    setSaving(true);
    const scores: DecisionScore[] = Object.entries(scoreMap).map(([key, score]) => {
      const [option_id, criteria_id] = key.split('-').map(Number);
      return { option_id, criteria_id, score };
    });
    await saveScores(Number(id), scores);
    setSaving(false);
  };

  const getWeightedTotal = (optId: number): number => {
    if (!data) return 0;
    return data.decision.criteria.reduce((sum, c) => {
      return sum + (scoreMap[`${optId}-${c.id}`] || 0) * c.weight;
    }, 0);
  };

  if (loading) return <div style={{ padding: 40, color: 'var(--neu-text-mid)' }}>Loading…</div>;
  if (!data) return <div style={{ padding: 40, color: '#e05c5c' }}>Decision not found.</div>;

  const { decision } = data;

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <button onClick={() => navigate('/decisions')} style={{
        background: 'none', border: 'none', color: 'var(--neu-text-mid)',
        cursor: 'pointer', fontSize: 14, marginBottom: 20, padding: 0
      }}>← Back to Decisions</button>

      <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--neu-text-dark)', margin: '0 0 8px' }}>
        {decision.title}
      </h1>
      {decision.description && (
        <p style={{ color: 'var(--neu-text-mid)', fontSize: 14, marginBottom: 24 }}>{decision.description}</p>
      )}

      {/* Decision Matrix */}
      <div className="neu-card" style={{ padding: '20px 24px', marginBottom: 24, overflowX: 'auto' }}>
        <h3 style={{ color: 'var(--neu-text-dark)', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
          Scoring Matrix
        </h3>
        {decision.options.length === 0 || decision.criteria.length === 0 ? (
          <p style={{ color: 'var(--neu-text-light)', fontSize: 13 }}>Add options and criteria to score.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--neu-text-light)', fontSize: 12, fontWeight: 600 }}>Option</th>
                {decision.criteria.map(c => (
                  <th key={c.id} style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--neu-text-light)', fontSize: 12, fontWeight: 600 }}>
                    {c.name}<br />
                    <span style={{ fontWeight: 400, fontSize: 10 }}>×{c.weight}</span>
                  </th>
                ))}
                <th style={{ padding: '8px 12px', textAlign: 'center', color: '#5aa9c4', fontSize: 12, fontWeight: 700 }}>
                  TOTAL
                </th>
              </tr>
            </thead>
            <tbody>
              {decision.options.map(opt => (
                <tr key={opt.id} style={{ borderTop: '1px solid var(--neu-divider)' }}>
                  <td style={{ padding: '10px 12px', color: 'var(--neu-text-dark)', fontSize: 13, fontWeight: 500 }}>
                    {opt.title}
                  </td>
                  {decision.criteria.map(c => (
                    <td key={c.id} style={{ padding: '8px 12px', textAlign: 'center' }}>
                      <input
                        type="number" min="0" max="10" step="0.5"
                        value={scoreMap[`${opt.id}-${c.id}`] || 0}
                        onChange={e => handleScoreChange(opt.id, c.id, Number(e.target.value))}
                        style={{
                          width: 60, textAlign: 'center',
                          background: 'var(--neu-bg)', border: '1px solid var(--neu-divider)',
                          borderRadius: 6, padding: '4px', color: 'var(--neu-text-dark)', fontSize: 13, outline: 'none'
                        }}
                      />
                    </td>
                  ))}
                  <td style={{ padding: '10px 12px', textAlign: 'center', color: '#5aa9c4', fontWeight: 700, fontSize: 15 }}>
                    {getWeightedTotal(opt.id).toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <button onClick={handleSave} disabled={saving} style={{
        background: '#4caf82', border: 'none', borderRadius: 10,
        color: '#fff', padding: '10px 24px', cursor: 'pointer', fontSize: 14, fontWeight: 600
      }}>
        {saving ? 'Saving…' : 'Save Scores'}
      </button>
    </div>
  );
}