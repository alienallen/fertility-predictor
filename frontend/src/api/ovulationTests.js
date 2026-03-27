import api from './index';

export const ovulationTestsApi = {
  list: (params) => api.get('/api/ovulation-tests', params),
  create: (data) => api.post('/api/ovulation-tests', data),
  update: (id, data) => api.put(`/api/ovulation-tests/${id}`, data),
  delete: (id) => api.delete(`/api/ovulation-tests/${id}`)
};