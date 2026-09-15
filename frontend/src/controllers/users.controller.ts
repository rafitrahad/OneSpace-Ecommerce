import { api } from '@/lib/api';
import { User, Role } from '@/models/types';
import { ProfileInput, StaffInput } from '@/models/schemas';

export async function listUsers() {
  const { data } = await api.get<User[]>('/users');
  return data;
}

export async function myProfile() {
  const { data } = await api.get<User>('/users/me/profile');
  return data;
}

export async function updateMyProfile(input: ProfileInput) {
  const { data } = await api.patch<User>('/users/me/profile', input);
  return data;
}

export async function changeMyPassword(currentPassword: string, newPassword: string) {
  const { data } = await api.patch<{ message: string }>('/users/me/password', {
    currentPassword,
    newPassword,
  });
  return data;
}

export async function updateUserRole(id: string, role: Role) {
  const { data } = await api.patch<User>(`/users/${id}/role`, { role });
  return data;
}

export async function setUserActive(id: string, active: boolean) {
  const { data } = await api.patch<User>(`/users/${id}/${active ? 'activate' : 'deactivate'}`);
  return data;
}

export async function deleteUser(id: string) {
  const { data } = await api.delete(`/users/${id}`);
  return data;
}

export async function createStaff(input: StaffInput) {
  const { data } = await api.post('/auth/staff', input);
  return data;
}
