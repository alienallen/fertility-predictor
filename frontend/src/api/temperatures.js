import api from './index';

export const temperaturesApi = {
  list: (params) => api.get('/api/temperatures', params),
  create: (data) => api.post('/api/temperatures', data),
  update: (id, data) => api.put(`/api/temperatures/${id}`, data),
  delete: (id) => api.delete(`/api/temperatures/${id}`)
};