import api from './index';

export const authApi = {
  login: (code) => api.post('/api/auth/login', { code }),
  getOpenid: () => {
    return new Promise((resolve, reject) => {
      // #ifdef MP-WEIXIN
      uni.login({
        provider: 'weixin',
        success: (res) => {
          resolve(res.code);
        },
        fail: reject
      });
      // #endif
      // #ifdef H5
      resolve('h5_test_openid_' + Date.now());
      // #endif
    });
  }
};