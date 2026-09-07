'use client';

import { useEffect, useState } from 'react';
import {
  listUsers,
  updateUserRole,
  setUserActive,
  deleteUser,
} from '@/controllers/users.controller';
import { User, Role } from '@/models/types';
import { formatDate } from '@/lib/format';
import { apiErrorMessage } from '@/lib/api';
import { EmptyState } from '@/components/EmptyState';
import { RoleGuard } from '@/components/RoleGuard';

function UsersInner() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');

  function load() {
    listUsers().then(setUsers);
  }

  useEffect(load, []);

  async function handleRoleChange(id: string, role: Role) {
    setError('');
    try {
      await updateUserRole(id, role);
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  async function handleToggleActive(user: User) {
    await setUserActive(user.id, !user.isActive);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this account? This cannot be undone.')) return;
    await deleteUser(id);
    load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Customers &amp; staff</h1>
      <p className="mt-1 text-sm text-pine-700/60">Manage every account and its role.</p>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {users.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No users yet" />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-md border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-pine-700/60">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 text-ink">{u.name}</td>
                  <td className="px-4 py-3 text-pine-700/70">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                      className="rounded border border-line px-2 py-1 text-sm"
                    >
                      <option value="customer">Customer</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-pine-700/60">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(u)}
                      className={u.isActive ? 'text-pine-500' : 'text-pine-700/40'}
                    >
                      {u.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function UsersManagementView() {
  return (
    <RoleGuard roles={['admin']}>
      <UsersInner />
    </RoleGuard>
  );
}
