<template>
  <view class="page">
    <!-- 用户信息 -->
    <view class="user-card" v-if="userStore.isLoggedIn">
      <view class="avatar">
        <text class="avatar-text">{{ userStore.nickname.charAt(0) }}</text>
      </view>
      <view class="user-info">
        <text class="nickname">{{ userStore.nickname }}</text>
        <text class="phone">{{ userStore.phone }}</text>
      </view>
    </view>

    <view class="user-card" v-else @click="goToLogin">
      <view class="avatar login-avatar">
        <text class="avatar-text">?</text>
      </view>
      <view class="user-info">
        <text class="nickname">点击登录</text>
        <text class="phone">登录后享受更多功能</text>
      </view>
    </view>

    <!-- 设置列表 -->
    <view class="settings-group">
      <view class="group-title">提醒设置</view>
      <view class="setting-item" @click="openNotificationSettings">
        <text class="item-icon">🔔</text>
        <text class="item-label">推送提醒</text>
        <text class="item-arrow">&gt;</text>
      </view>
      <view class="setting-item">
        <text class="item-icon">⏰</text>
        <text class="item-label">提醒时间</text>
        <picker mode="time" :value="remindTime" @change="onRemindTimeChange">
          <view class="picker-value">{{ remindTime }}</view>
        </picker>
      </view>
    </view>

    <view class="settings-group">
      <view class="group-title">数据管理</view>
      <view class="setting-item" @click="exportData">
        <text class="item-icon">📤</text>
        <text class="item-label">导出数据</text>
        <text class="item-arrow">&gt;</text>
      </view>
      <view class="setting-item" @click="importData">
        <text class="item-icon">📥</text>
        <text class="item-label">导入数据</text>
        <text class="item-arrow">&gt;</text>
      </view>
      <view class="setting-item danger" @click="clearData">
        <text class="item-icon">🗑️</text>
        <text class="item-label">清除数据</text>
        <text class="item-arrow">&gt;</text>
      </view>
    </view>

    <view class="settings-group">
      <view class="group-title">其他</view>
      <view class="setting-item" @click="openAbout">
        <text class="item-icon">ℹ️</text>
        <text class="item-label">关于我们</text>
        <text class="item-arrow">&gt;</text>
      </view>
      <view class="setting-item">
        <text class="item-icon">📱</text>
        <text class="item-label">版本号</text>
        <text class="item-value">v1.0.0</text>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-btn" v-if="userStore.isLoggedIn" @click="handleLogout">
      退出登录
    </view>
  </view>
</template>

<script>
import { useUserStore } from '@/store/user';
import { useRecordStore } from '@/store/record';

export default {
  data() {
    return {
      remindTime: '09:00',
    };
  },
  computed: {
    userStore() {
      return useUserStore();
    },
  },
  onShow() {
    // 加载保存的提醒时间
    const savedTime = uni.getStorageSync('remind_time');
    if (savedTime) {
      this.remindTime = savedTime;
    }
  },
  methods: {
    goToLogin() {
      uni.navigateTo({ url: '/pages/auth/login' });
    },
    openNotificationSettings() {
      uni.showToast({ title: '跳转至系统设置', icon: 'none' });
    },
    onRemindTimeChange(e) {
      this.remindTime = e.detail.value;
      uni.setStorageSync('remind_time', this.remindTime);
      uni.showToast({ title: '提醒时间已设置', icon: 'success' });
    },
    exportData() {
      const data = useRecordStore().export();
      // 保存到文件
      const fileName = `接好孕数据_${new Date().toISOString().slice(0, 10)}.json`;
      uni.setStorageSync('export_data', data);
      uni.showToast({ title: `数据已导出 (${fileName})`, icon: 'success' });
    },
    importData() {
      uni.showModal({
        title: '导入数据',
        content: '请在输入框粘贴 JSON 数据',
        editable: true,
        success: (res) => {
          if (res.confirm && res.content) {
            const result = useRecordStore().import(res.content);
            if (result.success) {
              uni.showToast({ title: `成功导入 ${result.count} 条记录`, icon: 'success' });
            } else {
              uni.showToast({ title: result.message || '导入失败', icon: 'none' });
            }
          }
        },
      });
    },
    clearData() {
      uni.showModal({
        title: '清除数据',
        content: '确定要清除所有数据吗？此操作不可恢复！',
        success: (res) => {
          if (res.confirm) {
            useRecordStore().clearAll();
            uni.showToast({ title: '数据已清除', icon: 'success' });
          }
        },
      });
    },
    openAbout() {
      uni.showModal({
        title: '关于我们',
        content: '接好孕 v1.0.0\n科学预测，好孕连连',
        showCancel: false,
      });
    },
    handleLogout() {
      uni.showModal({
        title: '退出登录',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            useUserStore().logout();
          }
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f8f8f8;
  padding-bottom: 120rpx;
}

.user-card {
  display: flex;
  align-items: center;
  padding: 40rpx 30rpx;
  background: linear-gradient(135deg, #e85a5a 0%, #ff7b7b 100%);
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.login-avatar {
  background: rgba(255, 255, 255, 0.2);
}

.avatar-text {
  font-size: 44rpx;
  color: #fff;
  font-weight: 600;
}

.user-info {
  flex: 1;
}

.nickname {
  display: block;
  font-size: 34rpx;
  color: #fff;
  font-weight: 600;
  margin-bottom: 8rpx;
}

.phone {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.settings-group {
  margin: 20rpx 0;
  background: #fff;
}

.group-title {
  padding: 20rpx 30rpx 10rpx;
  font-size: 24rpx;
  color: #999;
}

.setting-item {
  display: flex;
  align-items: center;
  padding: 26rpx 30rpx;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }

  &.danger {
    .item-label {
      color: #e85a5a;
    }
  }
}

.item-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}

.item-label {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.item-arrow {
  font-size: 28rpx;
  color: #ccc;
}

.item-value {
  font-size: 28rpx;
  color: #999;
}

.picker-value {
  font-size: 28rpx;
  color: #999;
}

.logout-btn {
  margin: 40rpx 30rpx;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  background: #fff;
  border-radius: 44rpx;
  font-size: 28rpx;
  color: #e85a5a;

  &:active {
    background: #fff5f5;
  }
}
</style>
