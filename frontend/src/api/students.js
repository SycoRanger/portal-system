import client from './client';

export const studentsApi = {
  list: () => client.get('/students/'),
  get: (id) => client.get(`/students/${id}/`),
  create: (payload) => client.post('/students/', payload),
  update: (id, payload) => client.patch(`/students/${id}/`, payload),
  remove: (id) => client.delete(`/students/${id}/`),
};
