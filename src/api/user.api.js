import api from './axios';

export const getAllUsersApi = () => api.get('/users');
export const updateProfileApi = (data) => api.put('/users/profile', data);
export const updateUserRoleApi = (id, role) => api.put(`/users/${id}/role`, { role });
export const toggleUserStatusApi = (id) => api.put(`/users/${id}/status`);
