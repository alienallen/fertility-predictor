<template>
  <view class="page">
    <!-- 用户信息 -->
    <view class="section">
      <view class="section-title">
        <text>账户信息</text>
      </view>
      <view class="user-card">
        <view class="user-info">
          <text class="user-name">微信用户</text>
          <text class="user-id">ID: {{ openid }}</text>
        </view>
      </view>
    </view>

    <!-- 周期设置 -->
    <view class="section">
      <view class="section-title">
        <text>周期设置</text>
      </view>
      <view class="settings-card">
        <view class="setting-item">
          <text class="setting-label">月经周期长度</text>
          <input
            type="number"
            :value="cycleLength"
            @change="onCycleLengthChange"
            placeholder="天"
          />
        </view>
        <view class="setting-item">
          <text class="setting-label">经期持续天数</text>
          <input
            type="number"
            :value="periodLength"
            @change="onPeriodLengthChange"
            placeholder="天"
          />
        </view>
      </view>
    </view>

    <!-- 数据管理 -->
    <view class="section">
      <view class="section-title">
        <text>数据管理</text>
      </view>
      <view class="settings-card">
        <view class="setting-item">
          <text class="setting-label">清除所有数据</text>
          <button class="danger-btn" @click="onClearData">清除</button>
        </view>
      </view>
    </view>

    <!-- 关于 -->
    <view class="section">
      <view class="section-title">
        <text>关于</text>
      </view>
      <view class="settings-card">
        <view class="about-item">
          <text>接好孕 v1.0.0</text>
          <text class="about-desc">备孕预测工具</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { store } from '../../store/index.js';
import { periodsApi } from '../../api/periods.js';
import { temperaturesApi } from '../../api/temperatures.js';
import { ovulationTestsApi } from '../../api/ovulationTests.js';
import { intercourseRecordsApi } from '../../api/intercourseRecords.js';

export default {
  data() {
    return {
      cycleLength: 28,
      periodLength: 5
    };
  },
  computed: {
    openid() {
      return store.state.openid || '';
    }
  },
  onShow() {
    this.cycleLength = store.state.cycleLength;
    this.periodLength = store.state.periodLength;
  },
  methods: {
    async onCycleLengthChange(e) {
      const value = parseInt(e.detail.value);
      if (value && value > 0) {
        this.cycleLength = value;
        store.updateSettings(this.cycleLength, this.periodLength);
      }
    },
    async onPeriodLengthChange(e) {
      const value = parseInt(e.detail.value);
      if (value && value > 0) {
        this.periodLength = value;
        store.updateSettings(this.cycleLength, this.periodLength);
      }
    },
    onClearData() {
      uni.showModal({
        title: '确认清除',
        content: '确定要清除所有数据吗？此操作不可恢复。',
        success: async (res) => {
          if (res.confirm) {
            await this.clearAllData();
          }
        }
      });
    },
    async clearAllData() {
      try {
        // 清除所有记录
        const apis = [
          periodsApi,
          temperaturesApi,
          ovulationTestsApi,
          intercourseRecordsApi
        ];

        for (const api of apis) {
          let res;
          try {
            res = await api.list({ page: 1, limit: 1000 });
          } catch {
            continue;
          }

          const ids = res.periods?.map(p => p._id)
            || res.temperatures?.map(t => t._id)
            || res.ovulation_tests?.map(o => o._id)
            || res.intercourse_records?.map(i => i._id)
            || [];

          for (const id of ids) {
            try {
              await api.delete(id);
            } catch {}
          }
        }

        uni.showToast({ title: '数据已清除' });
      } catch (error) {
        uni.showToast({ title: '清除失败', icon: 'none' });
      }
    }
  }
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #fdf8f3;
  padding: 20px;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  padding: 8px 0;
  margin-bottom: 8px;
}

.section-title text {
  font-size: 14px;
  color: #4A4541;
  font-weight: 500;
}

.user-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 16px;
  color: #4A4541;
  font-weight: 500;
}

.user-id {
  font-size: 12px;
  color: #9B9B9B;
  margin-top: 4px;
}

.settings-card {
  background: #fff;
  border-radius: 16px;
  padding: 8px 0;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0ebe6;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  font-size: 14px;
  color: #4A4541;
}

.setting-item input {
  width: 80px;
  text-align: right;
  font-size: 14px;
  color: #9CAF88;
}

.danger-btn {
  background: #E8B4B8;
  color: #fff;
  font-size: 12px;
  padding: 6px 16px;
  border: none;
}

.about-item {
  padding: 16px 20px;
  text-align: center;
}

.about-item text {
  display: block;
  font-size: 14px;
  color: #4A4541;
}

.about-desc {
  color: #9B9B9B !important;
  font-size: 12px !important;
  margin-top: 4px;
}
</style>