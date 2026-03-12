import { useState, useRef } from 'react';
import api from '../services/api';

type ImportResource = 'outcomes' | 'departments';

const TEMPLATES: Record<ImportResource, { headers: string; filename: string; icon: string }> = {
  outcomes: {
    headers: 'Title,Status,Progress,Department\nQ4 Revenue Goal,active,45,Sales\nReduce Churn,at_risk,20,Customer Success',
    filename: 'outcomes_template.csv',
    icon: '🎯'
  },
  departments: {
    headers: 'Name,Head,Description\nEngineering,Jane Smith,Core product team\nMarketing,John Doe,Brand and growth',
    filename: 'departments_template.csv',
    icon: '🏢'
  }
};

function downloadTemplate(resource: ImportResource) {
  const { headers, filename } = TEMPLATES[resource];
  const blob = new Blob([headers], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  window.URL.revokeObjectURL(url);
}

type ImportResult = { created: number; errors: string[] } | null;

type ImportPanelProps = { resource: ImportResource; label: string; icon: string };
function ImportPanel({ resource, label, icon }: ImportPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post(`/auth/import/${resource}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch { setResult({ created: 0, errors: ['Upload failed. Check file format.'] }); }
    finally { setLoading(false); }
  };

  return (
    <div className="neu-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 28 }}>{icon}</span>
        <h3 style={{ color: 'var(--neu-text-dark)', fontSize: 15, fontWeight: 700, margin: 0 }}>
          Import {label}
        </h3>
      </div>

      <button
        onClick={() => downloadTemplate(resource)}
        style={{
          background: 'var(--neu-bg)', border: '1px solid var(--neu-divider)',
          borderRadius: 8, color: '#5aa9c4', padding: '6px 14px',
          cursor: 'pointer', fontSize: 12, marginBottom: 16, fontWeight: 600
        }}
      >
        ⬇ Download Template CSV
      </button>

      <div style={{
        border: '2px dashed var(--neu-divider)', borderRadius: 10,
        padding: '20px', textAlign: 'center', marginBottom: 14,
        background: file ? '#5aa9c422' : 'transparent', transition: 'background 0.2s'
      }}>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={e => setFile(e.target.files?.[0] || null)}
          style={{ display: 'none' }}
          id={`file-${resource}`}
        />
        <label htmlFor={`file-${resource}`} style={{ cursor: 'pointer' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>{file ? '✅' : '📁'}</div>
          <div style={{ color: 'var(--neu-text-mid)', fontSize: 13 }}>
            {file ? file.name : 'Click to select CSV file'}
          </div>
        </label>
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        style={{
          background: file ? '#4caf82' : 'var(--neu-bg)',
          border: file ? 'none' : '1px solid var(--neu-divider)',
          borderRadius: 8, color: file ? '#fff' : 'var(--neu-text-light)',
          padding: '8px 20px', cursor: file ? 'pointer' : 'not-allowed',
          fontSize: 13, fontWeight: 600, width: '100%'
        }}
      >
        {loading ? 'Importing…' : 'Import Data'}
      </button>

      {result && (
        <div style={{
          marginTop: 14, padding: '12px 16px', borderRadius: 8,
          background: result.errors.length === 0 ? '#4caf8222' : '#f5a62322',
          border: `1px solid ${result.errors.length === 0 ? '#4caf82' : '#f5a623'}`
        }}>
          <div style={{ color: result.errors.length === 0 ? '#4caf82' : '#f5a623', fontWeight: 600, fontSize: 13 }}>
            ✓ {result.created} records imported
          </div>
          {result.errors.map((e, i) => (
            <div key={i} style={{ color: '#e05c5c', fontSize: 11, marginTop: 4 }}>{e}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DataImport() {
  return (
    <div style={{ padding: '24px 32px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--neu-text-dark)', margin: 0 }}>
          Data Import
        </h1>
        <p style={{ color: 'var(--neu-text-mid)', marginTop: 6, fontSize: 14 }}>
          Bulk import records from CSV files. Download the template first.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
        <ImportPanel resource="outcomes" label="Outcomes" icon="🎯" />
        <ImportPanel resource="departments" label="Departments" icon="🏢" />
      </div>
    </div>
  );
}