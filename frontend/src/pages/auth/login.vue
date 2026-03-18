<template>
  <view class="login-container">
    <view class="logo-area">
      <text class="app-title">接好孕</text>
      <text class="app-subtitle">科学预测，好孕连连</text>
    </view>

    <view class="form-area">
      <view class="input-group">
        <text class="label">手机号</text>
        <input
          v-model="phone"
          type="number"
          maxlength="11"
          placeholder="请输入手机号"
          class="input"
        />
      </view>

      <view class="input-group">
        <text class="label">密码</text>
        <input
          v-model="password"
          type="password"
          placeholder="请输入密码"
          class="input"
        />
      </view>

      <button class="btn-primary" :loading="loading" @click="handleLogin">
        {{ loading ? '登录中...' : '登录' }}
      </button>

      <view class="link-area">
        <text class="link" @click="goToRegister">还没有账号？立即注册</text>
      </view>
    </view>
  </view>
</template>

<script>
import { login } from '@/api/auth';

export default {
  data() {
    return {
      phone: '',
      password: '',
      loading: false,
    };
  },
  methods: {
    async handleLogin() {
      if (!this.phone || this.phone.length !== 11) {
        uni.showToast({ title: '请输入正确的手机号', icon: 'none' });
        return;
      }
      if (!this.password || this.password.length < 6) {
        uni.showToast({ title: '密码至少6位', icon: 'none' });
        return;
      }

      this.loading = true;
      const result = await login(this.phone, this.password);
      this.loading = false;

      if (result.success) {
        uni.showToast({ title: '登录成功', icon: 'success' });
        setTimeout(() => {
          uni.switchTab({ url: '/pages/index/index' });
        }, 500);
      } else {
        uni.showToast({ title: result.message, icon: 'none' });
      }
    },
    goToRegister() {
      uni.navigateTo({ url: '/pages/auth/register' });
    },
  },
};
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  padding: 60rpx 48rpx;
  background: linear-gradient(180deg, #fff5f5 0%, #fff 100%);
}

.logo-area {
  text-align: center;
  margin-bottom: 80rpx;
}

.app-title {
  display: block;
  font-size: 56rpx;
  font-weight: bold;
  color: #e85a5a;
  margin-bottom: 16rpx;
}

.app-subtitle {
  font-size: 28rpx;
  color: #999;
}

.form-area {
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(232, 90, 90, 0.1);
}

.input-group {
  margin-bottom: 32rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 12rpx;
}

.input {
  height: 88rpx;
  padding: 0 24rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.btn-primary {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: #e85a5a;
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 500;
  margin-top: 16rpx;

  &:active {
    opacity: 0.9;
  }
}

.link-area {
  text-align: center;
  margin-top: 32rpx;
}

.link {
  font-size: 26rpx;
  color: #e85a5a;
}
</style>
