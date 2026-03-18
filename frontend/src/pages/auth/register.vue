<template>
  <view class="register-container">
    <view class="header">
      <text class="title">注册账号</text>
      <text class="subtitle">开启您的接好孕之旅</text>
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
        <text class="label">昵称</text>
        <input
          v-model="nickname"
          type="text"
          maxlength="20"
          placeholder="请输入昵称"
          class="input"
        />
      </view>

      <view class="input-group">
        <text class="label">密码</text>
        <input
          v-model="password"
          type="password"
          placeholder="请输入密码（至少6位）"
          class="input"
        />
      </view>

      <view class="input-group">
        <text class="label">确认密码</text>
        <input
          v-model="confirmPassword"
          type="password"
          placeholder="请再次输入密码"
          class="input"
        />
      </view>

      <button class="btn-primary" :loading="loading" @click="handleRegister">
        {{ loading ? '注册中...' : '注册' }}
      </button>

      <view class="link-area">
        <text class="link" @click="goToLogin">已有账号？立即登录</text>
      </view>
    </view>
  </view>
</template>

<script>
import { register } from '@/api/auth';

export default {
  data() {
    return {
      phone: '',
      nickname: '',
      password: '',
      confirmPassword: '',
      loading: false,
    };
  },
  methods: {
    async handleRegister() {
      if (!this.phone || this.phone.length !== 11) {
        uni.showToast({ title: '请输入正确的手机号', icon: 'none' });
        return;
      }
      if (!this.nickname) {
        uni.showToast({ title: '请输入昵称', icon: 'none' });
        return;
      }
      if (!this.password || this.password.length < 6) {
        uni.showToast({ title: '密码至少6位', icon: 'none' });
        return;
      }
      if (this.password !== this.confirmPassword) {
        uni.showToast({ title: '两次密码输入不一致', icon: 'none' });
        return;
      }

      this.loading = true;
      const result = await register(this.phone, this.password, this.nickname);
      this.loading = false;

      if (result.success) {
        uni.showToast({ title: '注册成功', icon: 'success' });
        setTimeout(() => {
          uni.switchTab({ url: '/pages/index/index' });
        }, 500);
      } else {
        uni.showToast({ title: result.message, icon: 'none' });
      }
    },
    goToLogin() {
      uni.navigateBack();
    },
  },
};
</script>

<style lang="scss" scoped>
.register-container {
  min-height: 100vh;
  padding: 60rpx 48rpx;
  background: linear-gradient(180deg, #fff5f5 0%, #fff 100%);
}

.header {
  margin-bottom: 60rpx;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.subtitle {
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
