import api from './index';

export const intercourseRecordsApi = {
  list: (params) => api.get('/api/intercourse-records', params),
  create: (data) => api.post('/api/intercourse-records', data),
  delete: (id) => api.delete(`/api/intercourse-records/${id}`)
};