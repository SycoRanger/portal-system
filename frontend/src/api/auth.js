import client from './client';

export const authApi = {
  login: (username, password) => client.post('/auth/login/', { username, password }),
  me: () => client.get('/accounts/me/'),
  register: (payload) => client.post('/accounts/register/', payload),
  changePassword: (payload) => client.post('/accounts/change-password/', payload),
  resetPassword: (userId, newPassword) =>
    client.post(`/accounts/reset-password/${userId}/`, { new_password: newPassword }),
};
