const BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-api-domain.com'
  : 'http://localhost:3000';

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('openid');

    uni.request({
      url: BASE_URL + url,
      ...options,
      header: {
        'Content-Type': 'application/json',
        'x-openid': token || '',
        ...options.header
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(new Error(res.data?.error || 'Request failed'));
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || 'Network error'));
      }
    });
  });
}

export default {
  get: (url, params) => request(url, { method: 'GET', data: params }),
  post: (url, data) => request(url, { method: 'POST', data }),
  put: (url, data) => request(url, { method: 'PUT', data }),
  delete: (url) => request(url, { method: 'DELETE' })
};