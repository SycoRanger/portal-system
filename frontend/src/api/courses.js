import client from './client';

export const coursesApi = {
  list: () => client.get('/courses/'),
  create: (payload) => client.post('/courses/', payload),
  update: (id, payload) => client.patch(`/courses/${id}/`, payload),
  remove: (id) => client.delete(`/courses/${id}/`),
  enroll: (courseId, studentId) => client.post(`/courses/${courseId}/enroll/`, { student_id: studentId }),
};
