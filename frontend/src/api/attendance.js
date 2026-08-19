import client from './client';

export const attendanceApi = {
  list: (params = {}) => client.get('/attendance/', { params }),
  create: (payload) => client.post('/attendance/', payload),
  remove: (id) => client.delete(`/attendance/${id}/`),
};
