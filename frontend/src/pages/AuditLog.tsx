import { useEffect, useState } from 'react';
import { getAuditLog, AuditEntry } from '../services/auditService';

function SkeletonBlock({ height = 40 }: { height?: number }) {
  return <div className="skeleton" style={{ height, borderRadius: 8, marginBottom: 10 }} />;
}

const ACTION_COLOR: Record<string, string> = {
  create: '#4caf82', update: '#5aa9c4', delete: '#e05c5c',
  login: '#9b8fd9', logout: '#f5a623',
};

function getActionColor(action?: string): string {
  const lower = (action || '').toLowerCase();

  for (const key of Object.keys(ACTION_COLOR)) {
    if (lower.includes(key)) return ACTION_COLOR[key];
  }

  return '#888';
}
type LogRowProps = { entry: AuditEntry };

function LogRow({ entry }: LogRowProps) {

  const color = getActionColor(entry.status);

  return (
    <tr style={{ borderBottom: '1px solid var(--neu-divider)' }}>

      <td style={{ padding: '12px 16px', color: 'var(--neu-text-light)', fontSize: 11 }}>
        {entry.executed_at ? new Date(entry.executed_at).toLocaleString() : '—'}
      </td>

      <td style={{ padding: '12px 16px', color: 'var(--neu-text-dark)', fontSize: 13 }}>
        {entry.executor_name || 'System'}
      </td>

      <td style={{ padding: '12px 16px' }}>
        <span style={{
          background: color + '22',
          color,
          borderRadius: 10,
          padding: '2px 10px',
          fontSize: 11,
          fontWeight: 600
        }}>
          {entry.status}
        </span>
      </td>

      <td style={{ padding: '12px 16px', color: 'var(--neu-text-mid)', fontSize: 12 }}>
        {entry.activity_name || '—'}
      </td>

      <td style={{ padding: '12px 16px', color: 'var(--neu-text-mid)', fontSize: 12 }}>
        {entry.notes || '—'}
      </td>

      <td style={{ padding: '12px 16px', color: 'var(--neu-text-light)', fontSize: 11 }}>
        {entry.department_name || '—'}
      </td>

    </tr>
  );
}

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionFilter, setActionFilter] = useState('');
  const [applied, setApplied] = useState('');

  const fetchLogs = (p: number, action: string) => {
    setLoading(true);
    getAuditLog(p, action)
      .then(r => { setLogs(r.logs); setPages(r.pages); setTotal(r.total); setPage(p); })
      .catch(() => setError('Failed to load audit log. Admin access required.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLogs(1, ''); }, []);

  const handleFilter = () => { setApplied(actionFilter); fetchLogs(1, actionFilter); };
  const handleClear = () => { setActionFilter(''); setApplied(''); fetchLogs(1, ''); };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--neu-text-dark)', margin: 0 }}>
          Audit Log
        </h1>
        <p style={{ color: 'var(--neu-text-mid)', marginTop: 6, fontSize: 14 }}>
          Complete system event trail · {total} total entries
        </p>
      </div>

      {error && (
        <div style={{ background: '#e05c5c22', border: '1px solid #e05c5c', borderRadius: 8, padding: '10px 16px', color: '#e05c5c', marginBottom: 20, fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          placeholder="Filter by action (e.g. login, create)…"
          onKeyDown={e => e.key === 'Enter' && handleFilter()}
          style={{
            background: 'var(--neu-bg)', border: '1px solid var(--neu-divider)',
            borderRadius: 8, padding: '7px 14px', color: 'var(--neu-text-dark)',
            fontSize: 13, width: 260, outline: 'none'
          }}
        />
        <button
          onClick={handleFilter}
          style={{ background: '#5aa9c4', border: 'none', borderRadius: 8, color: '#fff', padding: '7px 16px', cursor: 'pointer', fontSize: 13 }}
        >
          Apply
        </button>
        {applied && (
          <button
            onClick={handleClear}
            style={{ background: 'var(--neu-bg)', border: '1px solid var(--neu-divider)', borderRadius: 8, color: 'var(--neu-text-mid)', padding: '7px 12px', cursor: 'pointer', fontSize: 13 }}
          >
            Clear
          </button>
        )}
      </div>

      <div className="neu-card" style={{ overflow: 'hidden', padding: 0 }}>
        {loading ? (
          <div style={{ padding: 20 }}>
            {[...Array(8)].map((_, i) => <SkeletonBlock key={i} height={48} />)}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--neu-bg)' }}>
                {['Timestamp', 'User', 'Action', 'Resource', 'Detail', 'IP'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left',
                    color: 'var(--neu-text-light)', fontSize: 11,
                    fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 24, textAlign: 'center', color: 'var(--neu-text-light)', fontSize: 14 }}>
                    No audit log entries found.
                  </td>
                </tr>
              ) : (
                logs.map(l => <LogRow key={l.id} entry={l} />)
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20, alignItems: 'center' }}>
          <button
            onClick={() => fetchLogs(page - 1, applied)}
            disabled={page <= 1}
            style={{
              background: 'var(--neu-bg)', border: '1px solid var(--neu-divider)',
              borderRadius: 8, padding: '6px 14px', cursor: page > 1 ? 'pointer' : 'not-allowed',
              color: page > 1 ? 'var(--neu-text-dark)' : 'var(--neu-text-light)', fontSize: 13
            }}
          >
            ← Prev
          </button>
          <span style={{ color: 'var(--neu-text-mid)', fontSize: 13 }}>
            Page {page} of {pages}
          </span>
          <button
            onClick={() => fetchLogs(page + 1, applied)}
            disabled={page >= pages}
            style={{
              background: 'var(--neu-bg)', border: '1px solid var(--neu-divider)',
              borderRadius: 8, padding: '6px 14px', cursor: page < pages ? 'pointer' : 'not-allowed',
              color: page < pages ? 'var(--neu-text-dark)' : 'var(--neu-text-light)', fontSize: 13
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}