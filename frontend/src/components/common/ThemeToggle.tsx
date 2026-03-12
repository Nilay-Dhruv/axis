import { useTheme } from '../../hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      style={{
        background: 'var(--neu-bg)',
        border: '1px solid var(--neu-divider)',
        borderRadius: 20, cursor: 'pointer',
        padding: '5px 12px', fontSize: 16,
        display: 'flex', alignItems: 'center', gap: 6,
        color: 'var(--neu-text-mid)', transition: 'all 0.2s'
      }}
    >
      {theme === 'light' ? '🌙' : '☀️'}
      <span style={{ fontSize: 12 }}>{theme === 'light' ? 'Dark' : 'Light'}</span>
    </button>
  );
}