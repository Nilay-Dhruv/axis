import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { globalSearch, SearchResult } from '../../services/searchService';

const TYPE_ICON: Record<string, string> = {
  department: '🏢', outcome: '🎯', signal: '📡', activity: '⚡',
};
const TYPE_COLOR: Record<string, string> = {
  department: '#9b8fd9', outcome: '#4caf82', signal: '#f5a623', activity: '#5aa9c4',
};

type ResultItemProps = { result: SearchResult; onSelect: () => void };
function ResultItem({ result, onSelect }: ResultItemProps) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => { navigate(result.url); onSelect(); }}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
        cursor: 'pointer', borderBottom: '1px solid var(--neu-divider)',
        transition: 'background 0.15s'
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--neu-bg)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <span style={{ fontSize: 18 }}>{TYPE_ICON[result.type]}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: 'var(--neu-text-dark)', fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {result.title}
        </div>
        <div style={{ color: 'var(--neu-text-light)', fontSize: 12 }}>{result.subtitle}</div>
      </div>
      <span style={{
        background: TYPE_COLOR[result.type] + '22',
        color: TYPE_COLOR[result.type],
        fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 600, textTransform: 'uppercase'
      }}>
        {result.type}
      </span>
    </div>
  );
}

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const timer = setTimeout(() => {
      setLoading(true);
      globalSearch(query)
        .then(r => setResults(r.results))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClose = () => { setOpen(false); setQuery(''); setResults([]); };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--neu-bg)', border: '1px solid var(--neu-divider)',
          borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
          color: 'var(--neu-text-light)', fontSize: 18
        }}
      >
        🔍 Search…
        <span style={{
          background: 'var(--neu-card)', border: '1px solid var(--neu-divider)',
          borderRadius: 4, padding: '1px 5px', fontSize: 10, color: 'var(--neu-text-light)'
        }}>
          Ctrl+K
        </span>
      </button>

      {/* Overlay */}
      {open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          zIndex: 1000, display: 'flex', alignItems: 'flex-start',
          justifyContent: 'center', paddingTop: '10vh'
        }}>
          <div
            ref={containerRef}
            style={{
              background: 'var(--neu-card)', borderRadius: 16, width: '100%', maxWidth: 540,
              boxShadow: '0 24px 60px rgba(0,0,0,0.3)', overflow: 'hidden',
              maxHeight: '70vh', display: 'flex', flexDirection: 'column'
            }}
          >
            {/* Input */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', gap: 12, borderBottom: '1px solid var(--neu-divider)' }}>
              <span style={{ fontSize: 18 }}>🔍</span>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search departments, outcomes, signals…"
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  color: 'var(--neu-text-dark)', fontSize: 16
                }}
              />
              {loading && <span style={{ color: 'var(--neu-text-light)', fontSize: 12 }}>…</span>}
              <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neu-text-light)', fontSize: 18 }}>×</button>
            </div>

            {/* Results */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {results.length === 0 && query.length >= 2 && !loading && (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--neu-text-light)', fontSize: 14 }}>
                  No results for "{query}"
                </div>
              )}
              {query.length < 2 && (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--neu-text-light)', fontSize: 13 }}>
                  Type at least 2 characters to search
                </div>
              )}
              {results.map((r, i) => (
                <ResultItem key={`${r.type}-${r.id}-${i}`} result={r} onSelect={handleClose} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}