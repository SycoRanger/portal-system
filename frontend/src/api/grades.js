import client from './client';

export const gradesApi = {
  list: () => client.get('/grades/'),
  create: (payload) => client.post('/grades/', payload),
  update: (id, payload) => client.patch(`/grades/${id}/`, payload),
  remove: (id) => client.delete(`/grades/${id}/`),
};