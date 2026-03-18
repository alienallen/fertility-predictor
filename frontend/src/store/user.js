import { defineStore } from 'pinia';
import {
  getStoredUser,
  getStoredToken,
  isLoggedIn as checkLoggedIn,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  updateUser as apiUpdateUser,
} from '@/api/auth';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: getStoredUser() || null,
    token: getStoredToken() || null,
    isLoggedIn: checkLoggedIn(),
  }),

  getters: {
    // 获取用户昵称
    nickname: (state) => state.user?.nickname || '接好孕用户',
    // 获取用户手机号
    phone: (state) => state.user?.phone || '',
    // 获取用户 ID
    userId: (state) => state.user?.id || '',
  },

  actions: {
    /**
     * 登录
     */
    async login(phone, password) {
      const result = await apiLogin(phone, password);
      if (result.success) {
        this.user = result.user;
        this.token = getStoredToken();
        this.isLoggedIn = true;
      }
      return result;
    },

    /**
     * 注册
     */
    async register(phone, password, nickname) {
      const result = await apiRegister(phone, password, nickname);
      if (result.success) {
        this.user = result.user;
        this.token = getStoredToken();
        this.isLoggedIn = true;
      }
      return result;
    },

    /**
     * 登出
     */
    logout() {
      apiLogout();
      this.user = null;
      this.token = null;
      this.isLoggedIn = false;
    },

    /**
     * 更新用户信息
     */
    async updateUser(userData) {
      const result = await apiUpdateUser(userData);
      if (result.success) {
        this.user = result.user;
      }
      return result;
    },

    /**
     * 检查登录状态
     */
    checkLogin() {
      this.isLoggedIn = checkLoggedIn();
      this.user = getStoredUser();
      this.token = getStoredToken();
      return this.isLoggedIn;
    },
  },
});
