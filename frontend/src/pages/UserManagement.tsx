import { useEffect, useState } from 'react';
import { listUsers, updateUserRole, toggleUserActive, AdminUser } from '../services/adminService';

function SkeletonBlock({ height = 40 }: { height?: number }) {
  return <div className="skeleton" style={{ height, borderRadius: 8, marginBottom: 10 }} />;
}

const ROLES = ['admin', 'manager', 'analyst', 'viewer'];
const ROLE_COLOR: Record<string, string> = {
  admin: '#e05c5c', manager: '#9b8fd9', analyst: '#5aa9c4', viewer: '#4caf82',
};

type UserRowProps = {
  user: AdminUser;
  onRoleChange: (id: number, role: string) => void;
  onToggleActive: (id: number) => void;
};
function UserRow({ user, onRoleChange, onToggleActive }: UserRowProps) {
  const [editing, setEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.role);

  const handleRoleSave = () => {
    onRoleChange(user.id, selectedRole);
    setEditing(false);
  };

  return (
    <tr style={{ borderBottom: '1px solid var(--neu-divider)' }}>
      <td style={{ padding: '14px 16px', color: 'var(--neu-text-dark)', fontSize: 14 }}>
        <div>{user.name}</div>
        <div style={{ color: 'var(--neu-text-light)', fontSize: 11 }}>{user.email}</div>
      </td>
      <td style={{ padding: '14px 16px' }}>
        {editing ? (
          <div style={{ display: 'flex', gap: 6 }}>
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              style={{
                background: 'var(--neu-bg)', border: '1px solid var(--neu-divider)',
                borderRadius: 6, color: 'var(--neu-text-dark)', padding: '3px 8px', fontSize: 12
              }}
            >
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <button
              onClick={handleRoleSave}
              style={{ background: '#4caf82', border: 'none', borderRadius: 6, color: '#fff', padding: '3px 10px', cursor: 'pointer', fontSize: 12 }}
            >✓</button>
            <button
              onClick={() => { setEditing(false); setSelectedRole(user.role); }}
              style={{ background: 'var(--neu-bg)', border: '1px solid var(--neu-divider)', borderRadius: 6, color: 'var(--neu-text-mid)', padding: '3px 8px', cursor: 'pointer', fontSize: 12 }}
            >✕</button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              background: (ROLE_COLOR[user.role] || '#888') + '22',
              color: ROLE_COLOR[user.role] || '#888',
              borderRadius: 12, padding: '2px 10px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase'
            }}>
              {user.role}
            </span>
            <button
              onClick={() => setEditing(true)}
              style={{ background: 'none', border: 'none', color: '#5aa9c4', cursor: 'pointer', fontSize: 11 }}
            >Edit</button>
          </div>
        )}
      </td>
      <td style={{ padding: '14px 16px' }}>
        <span style={{
          background: user.is_active ? '#4caf8222' : '#e05c5c22',
          color: user.is_active ? '#4caf82' : '#e05c5c',
          borderRadius: 12, padding: '2px 10px', fontSize: 11, fontWeight: 600
        }}>
          {user.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td style={{ padding: '14px 16px', color: 'var(--neu-text-light)', fontSize: 12 }}>
        {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
      </td>
      <td style={{ padding: '14px 16px' }}>
        <button
          onClick={() => onToggleActive(user.id)}
          style={{
            background: user.is_active ? '#e05c5c22' : '#4caf8222',
            border: 'none', borderRadius: 8, cursor: 'pointer',
            color: user.is_active ? '#e05c5c' : '#4caf82',
            padding: '5px 12px', fontSize: 12, fontWeight: 600
          }}
        >
          {user.is_active ? 'Deactivate' : 'Activate'}
        </button>
      </td>
    </tr>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    listUsers()
      .then(setUsers)
      .catch(() => setError('Failed to load users. Admin access required.'))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (id: number, role: string) => {
    try {
      await updateUserRole(id, role);
      setUsers(u => u.map(x => x.id === id ? { ...x, role } : x));
    } catch { setError('Failed to update role.'); }
  };

  const handleToggle = async (id: number) => {
    try {
      const res = await toggleUserActive(id);
      setUsers(u => u.map(x => x.id === id ? { ...x, is_active: res.is_active } : x));
    } catch { setError('Failed to toggle user status.'); }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--neu-text-dark)', margin: 0 }}>
          User Management
        </h1>
        <p style={{ color: 'var(--neu-text-mid)', marginTop: 6, fontSize: 14 }}>
          Manage user accounts, roles, and access
        </p>
      </div>

      {error && (
        <div style={{ background: '#e05c5c22', border: '1px solid #e05c5c', borderRadius: 8, padding: '10px 16px', color: '#e05c5c', marginBottom: 20, fontSize: 14 }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search users by name or email…"
          style={{
            background: 'var(--neu-bg)', border: '1px solid var(--neu-divider)',
            borderRadius: 8, padding: '8px 14px', color: 'var(--neu-text-dark)',
            fontSize: 14, width: 300, outline: 'none'
          }}
        />
      </div>

      <div className="neu-card" style={{ overflow: 'hidden', padding: 0 }}>
        {loading ? (
          <div style={{ padding: 20 }}>
            {[...Array(5)].map((_, i) => <SkeletonBlock key={i} height={52} />)}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--neu-bg)' }}>
                {['User', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 24, textAlign: 'center', color: 'var(--neu-text-light)', fontSize: 14 }}>
                    {search ? 'No users match your search.' : 'No users found.'}
                  </td>
                </tr>
              ) : (
                filtered.map(u => (
                  <UserRow key={u.id} user={u} onRoleChange={handleRoleChange} onToggleActive={handleToggle} />
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}