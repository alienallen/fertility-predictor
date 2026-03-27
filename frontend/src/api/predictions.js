import api from './index';

export const predictionsApi = {
  getProbabilityCurve: (params) => api.get('/api/predictions/probability-curve', params),
  getStats: () => api.get('/api/predictions/stats')
};