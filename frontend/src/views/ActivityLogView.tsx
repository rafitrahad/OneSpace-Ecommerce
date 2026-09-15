'use client';

import { useEffect, useState } from 'react';
import { listActivityLogs } from '@/controllers/activity-log.controller';
import { ActivityLog } from '@/models/types';
import { formatDate } from '@/lib/format';
import { EmptyState } from '@/components/EmptyState';
import { RoleGuard } from '@/components/RoleGuard';

const ACTION_COLORS: Record<string, string> = {
  create: 'text-pine-500',
  update: 'text-copper-500',
  delete: 'text-red-600',
  status_change: 'text-pine-700',
};

function ActivityLogInner() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    listActivityLogs().then(setLogs);
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Activity log</h1>
      <p className="mt-1 text-sm text-pine-700/60">
        An audit trail of admin and manager actions across the shop.
      </p>

      {logs.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No activity recorded yet" />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-md border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-pine-700/60">
              <tr>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Who</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-3 text-pine-700/60">{formatDate(log.createdAt)}</td>
                  <td className="px-4 py-3 text-ink">{log.userName || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`capitalize ${ACTION_COLORS[log.action] || 'text-ink'}`}>
                      {log.action.replace('_', ' ')}
                    </span>{' '}
                    <span className="text-pine-700/50">({log.entityType})</span>
                  </td>
                  <td className="px-4 py-3 text-pine-700/70">{log.description || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function ActivityLogView() {
  return (
    <RoleGuard roles={['admin']}>
      <ActivityLogInner />
    </RoleGuard>
  );
}
