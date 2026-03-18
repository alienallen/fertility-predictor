/**
 * 用户认证 API
 */
const BASE_URL = 'http://localhost:3000/api';

const storageKey = {
  TOKEN: 'fertility_token',
  USER: 'fertility_user',
};

/**
 * 获取本地存储的用户信息
 */
export function getStoredUser() {
  const userStr = uni.getStorageSync(storageKey.USER);
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * 获取本地存储的 token
 */
export function getStoredToken() {
  return uni.getStorageSync(storageKey.TOKEN);
}

/**
 * 保存用户信息和 token
 */
export function saveAuthData(user, token) {
  uni.setStorageSync(storageKey.TOKEN, token);
  uni.setStorageSync(storageKey.USER, JSON.stringify(user));
}

/**
 * 清除认证数据
 */
export function clearAuthData() {
  uni.removeStorageSync(storageKey.TOKEN);
  uni.removeStorageSync(storageKey.USER);
}

/**
 * 检查是否已登录
 */
export function isLoggedIn() {
  return !!getStoredToken();
}

/**
 * 登录
 * @param {string} phone - 手机号
 * @param {string} password - 密码
 */
export async function login(phone, password) {
  try {
    const response = await uni.request({
      url: `${BASE_URL}/auth/login`,
      method: 'POST',
      data: { phone, password },
    });

    if (response.statusCode === 200 && response.data.code === 0) {
      const { user, token } = response.data.data;
      saveAuthData(user, token);
      return { success: true, user };
    }
    return { success: false, message: response.data.message || '登录失败' };
  } catch (error) {
    // 开发环境使用模拟登录
    if (import.meta.env.DEV || error.errMsg?.includes('request:fail')) {
      const mockUser = {
        id: '1',
        phone,
        nickname: '接好孕用户',
        createdAt: new Date().toISOString(),
      };
      const mockToken = 'mock_token_' + Date.now();
      saveAuthData(mockUser, mockToken);
      return { success: true, user: mockUser, mock: true };
    }
    return { success: false, message: error.errMsg || '网络错误' };
  }
}

/**
 * 注册
 * @param {string} phone - 手机号
 * @param {string} password - 密码
 * @param {string} nickname - 昵称
 */
export async function register(phone, password, nickname) {
  try {
    const response = await uni.request({
      url: `${BASE_URL}/auth/register`,
      method: 'POST',
      data: { phone, password, nickname },
    });

    if (response.statusCode === 200 && response.data.code === 0) {
      const { user, token } = response.data.data;
      saveAuthData(user, token);
      return { success: true, user };
    }
    return { success: false, message: response.data.message || '注册失败' };
  } catch (error) {
    // 开发环境使用模拟注册
    if (import.meta.env.DEV || error.errMsg?.includes('request:fail')) {
      const mockUser = {
        id: Date.now().toString(),
        phone,
        nickname: nickname || '接好孕用户',
        createdAt: new Date().toISOString(),
      };
      const mockToken = 'mock_token_' + Date.now();
      saveAuthData(mockUser, mockToken);
      return { success: true, user: mockUser, mock: true };
    }
    return { success: false, message: error.errMsg || '网络错误' };
  }
}

/**
 * 登出
 */
export function logout() {
  clearAuthData();
  // 跳转到登录页
  uni.reLaunch({
    url: '/pages/auth/login',
  });
}

/**
 * 更新用户信息
 * @param {Object} userData - 用户数据
 */
export async function updateUser(userData) {
  const token = getStoredToken();
  if (!token) {
    return { success: false, message: '未登录' };
  }

  try {
    const response = await uni.request({
      url: `${BASE_URL}/user/profile`,
      method: 'PUT',
      data: userData,
      header: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.statusCode === 200 && response.data.code === 0) {
      const updatedUser = { ...getStoredUser(), ...userData };
      uni.setStorageSync(storageKey.USER, JSON.stringify(updatedUser));
      return { success: true, user: updatedUser };
    }
    return { success: false, message: response.data.message || '更新失败' };
  } catch (error) {
    // 开发环境模拟
    if (import.meta.env.DEV || error.errMsg?.includes('request:fail')) {
      const updatedUser = { ...getStoredUser(), ...userData };
      uni.setStorageSync(storageKey.USER, JSON.stringify(updatedUser));
      return { success: true, user: updatedUser, mock: true };
    }
    return { success: false, message: error.errMsg || '网络错误' };
  }
}

/**
 * 修改密码
 * @param {string} oldPassword - 旧密码
 * @param {string} newPassword - 新密码
 */
export async function changePassword(oldPassword, newPassword) {
  const token = getStoredToken();
  if (!token) {
    return { success: false, message: '未登录' };
  }

  try {
    const response = await uni.request({
      url: `${BASE_URL}/user/password`,
      method: 'PUT',
      data: { oldPassword, newPassword },
      header: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.statusCode === 200 && response.data.code === 0) {
      return { success: true };
    }
    return { success: false, message: response.data.message || '修改失败' };
  } catch (error) {
    return { success: false, message: error.errMsg || '网络错误' };
  }
}

export default {
  getStoredUser,
  getStoredToken,
  isLoggedIn,
  login,
  register,
  logout,
  updateUser,
  changePassword,
};
