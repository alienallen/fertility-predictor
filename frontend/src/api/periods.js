import api from './index';

export const periodsApi = {
  list: (params) => api.get('/api/periods', params),
  create: (data) => api.post('/api/periods', data),
  update: (id, data) => api.put(`/api/periods/${id}`, data),
  delete: (id) => api.delete(`/api/periods/${id}`)
};