import { api } from '@/lib/api';
import { ActivityLog } from '@/models/types';

export async function listActivityLogs() {
  const { data } = await api.get<ActivityLog[]>('/activity-logs');
  return data;
}
