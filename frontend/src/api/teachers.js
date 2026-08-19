import client from './client';

export const teachersApi = {
  list: () => client.get('/teachers/'),
  get: (id) => client.get(`/teachers/${id}/`),
  create: (payload) => client.post('/teachers/', payload),
  update: (id, payload) => client.patch(`/teachers/${id}/`, payload),
  remove: (id) => client.delete(`/teachers/${id}/`),
};
