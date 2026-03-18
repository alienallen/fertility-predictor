<template>
  <view class="page">
    <!-- 自定义导航栏 -->
    <view class="nav-bar">
      <text class="greeting">{{ greeting }}</text>
      <text class="date">{{ currentDate }}</text>
    </view>

    <!-- 今日状态卡片 -->
    <view class="status-card">
      <view class="status-header">
        <text class="status-title">今日状态</text>
        <view class="status-badge" :class="todayStatus.class">
          <text>{{ todayStatus.text }}</text>
        </view>
      </view>
      <view class="status-content">
        <view class="status-item">
          <text class="label">排卵日</text>
          <text class="value">{{ predictionStore.ovulationDate || '待计算' }}</text>
        </view>
        <view class="status-item">
          <text class="label">下次月经</text>
          <text class="value">{{ predictionStore.nextPeriodDate || '待计算' }}</text>
        </view>
        <view class="status-item">
          <text class="label">周期长度</text>
          <text class="value">{{ predictionStore.averageCycle ? `${predictionStore.averageCycle}天` : '待计算' }}</text>
        </view>
      </view>
      <view class="confidence-bar" v-if="predictionStore.hasData">
        <text class="confidence-label">预测准确度</text>
        <view class="progress-bg">
          <view class="progress-fill" :style="{ width: predictionStore.confidenceValue + '%' }"></view>
        </view>
        <text class="confidence-value">{{ predictionStore.confidenceValue }}%</text>
      </view>
    </view>

    <!-- 周期提示 -->
    <view class="tip-card" v-if="predictionStore.hasData">
      <view class="tip-icon">
        <text>{{ tipIcon }}</text>
      </view>
      <text class="tip-text">{{ currentTip }}</text>
    </view>

    <!-- 快捷记录按钮 -->
    <view class="quick-actions">
      <view class="action-btn" @click="quickRecord('menstruation')">
        <text class="action-icon">🩸</text>
        <text class="action-label">月经</text>
      </view>
      <view class="action-btn" @click="quickRecord('ovulation')">
        <text class="action-icon">🥚</text>
        <text class="action-label">排卵</text>
      </view>
      <view class="action-btn" @click="quickRecord('temperature')">
        <text class="action-icon">🌡️</text>
        <text class="action-label">体温</text>
      </view>
      <view class="action-btn" @click="quickRecord('intercourse')">
        <text class="action-icon">💕</text>
        <text class="action-label">同房</text>
      </view>
    </view>

    <!-- 本周概览 -->
    <view class="week-card">
      <view class="card-header">
        <text class="card-title">本周概览</text>
        <text class="card-subtitle">明天天</text>
      </view>
      <view class="week-days">
        <view
          v-for="day in weekDays"
          :key="day.date"
          class="day-item"
          :class="{ today: day.isToday, [day.status]: true }"
        >
          <text class="day-label">{{ day.label }}</text>
          <view class="day-dot"></view>
        </view>
      </view>
    </view>

    <!-- 底部 TabBar 会自动渲染 -->
  </view>
</template>

<script>
import { useRecordStore } from '@/store/record';
import { usePredictionStore } from '@/store/prediction';
import { useUserStore } from '@/store/user';

export default {
  data() {
    return {
      weekDays: [],
    };
  },
  computed: {
    greeting() {
      const hour = new Date().getHours();
      if (hour < 12) return `早上好，${useUserStore().nickname}`;
      if (hour < 18) return `下午好，${useUserStore().nickname}`;
      return `晚上好，${useUserStore().nickname}`;
    },
    currentDate() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const weekDay = weekDays[date.getDay()];
      return `${year}年${month}月${day}日 ${weekDay}`;
    },
    todayStatus() {
      const status = usePredictionStore().getTodayStatus();
      const statusMap = {
        fertile: { text: '排卵期', class: 'fertile' },
        safe: { text: '安全期', class: 'safe' },
        period: { text: '月经期', class: 'period' },
        unknown: { text: '待记录', class: 'unknown' },
      };
      return statusMap[status] || statusMap.unknown;
    },
    tipIcon() {
      const status = usePredictionStore().getTodayStatus();
      const icons = {
        fertile: '🌟',
        safe: '✅',
        period: '💊',
        unknown: '📝',
      };
      return icons[status] || '📝';
    },
    currentTip() {
      const status = usePredictionStore().getTodayStatus();
      const tips = {
        fertile: '现在是排卵期，受孕几率较高！',
        safe: '现在是安全期，可以放松心情~',
        period: '注意保暖，多喝热水哦~',
        unknown: '记录月经数据，获得更准确的预测',
      };
      return tips[status] || tips.unknown;
    },
  },
  onLoad() {
    this.initData();
  },
  onShow() {
    this.refreshData();
  },
  methods: {
    initData() {
      this.generateWeekDays();
    },
    refreshData() {
      const recordStore = useRecordStore();
      recordStore.refreshRecords();
      usePredictionStore().updatePrediction();
      this.generateWeekDays();
    },
    generateWeekDays() {
      const days = [];
      const today = new Date();
      const weekLabels = ['日', '一', '二', '三', '四', '五', '六'];

      for (let i = 0; i < 7; i += 1) {
        const date = new Date(today);
        date.setDate(date.getDate() + i - 3); // 从今天-3天开始
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const status = usePredictionStore().getStatusForDate(dateStr);

        days.push({
          date: dateStr,
          label: weekLabels[date.getDay()],
          status,
          isToday: i === 3,
        });
      }

      this.weekDays = days;
    },
    quickRecord(type) {
      // 检查登录状态
      if (!useUserStore().isLoggedIn) {
        uni.navigateTo({ url: '/pages/auth/login' });
        return;
      }

      let url = '/pages/records/add';
      if (type === 'menstruation') {
        url += '?type=menstruation';
      } else if (type === 'ovulation') {
        url += '?type=ovulation';
      } else if (type === 'temperature') {
        url += '?type=temperature';
      } else if (type === 'intercourse') {
        url += '?type=intercourse';
      }
      uni.navigateTo({ url });
    },
  },
};
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff5f5 0%, #f8f8f8 100%);
  padding-bottom: 120rpx;
}

.nav-bar {
  padding: 100rpx 30rpx 30rpx;
  background: linear-gradient(135deg, #e85a5a 0%, #ff7b7b 100%);
}

.greeting {
  font-size: 44rpx;
  font-weight: bold;
  color: #fff;
  display: block;
  margin-bottom: 8rpx;
}

.date {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.status-card {
  margin: -60rpx 24rpx 24rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(232, 90, 90, 0.12);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.status-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.status-badge {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;

  &.fertile {
    background: #fff7e6;
    color: #ff9800;
  }

  &.safe {
    background: #e8f5e9;
    color: #4caf50;
  }

  &.period {
    background: #ffebee;
    color: #e85a5a;
  }

  &.unknown {
    background: #f5f5f5;
    color: #999;
  }
}

.status-content {
  display: flex;
  justify-content: space-between;
}

.status-item {
  flex: 1;
  text-align: center;

  .label {
    display: block;
    font-size: 24rpx;
    color: #999;
    margin-bottom: 8rpx;
  }

  .value {
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
  }
}

.confidence-bar {
  display: flex;
  align-items: center;
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #f0f0f0;
}

.confidence-label {
  font-size: 24rpx;
  color: #999;
  margin-right: 16rpx;
}

.progress-bg {
  flex: 1;
  height: 12rpx;
  background: #f0f0f0;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #e85a5a 0%, #ff7b7b 100%);
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.confidence-value {
  font-size: 24rpx;
  color: #e85a5a;
  margin-left: 16rpx;
}

.tip-card {
  margin: 0 24rpx 24rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
}

.tip-icon {
  font-size: 40rpx;
  margin-right: 16rpx;
}

.tip-text {
  font-size: 26rpx;
  color: #666;
}

.quick-actions {
  margin: 0 24rpx 24rpx;
  display: flex;
  justify-content: space-between;
}

.action-btn {
  width: 160rpx;
  height: 140rpx;
  background: #fff;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);

  &:active {
    transform: scale(0.98);
  }
}

.action-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.action-label {
  font-size: 24rpx;
  color: #666;
}

.week-card {
  margin: 0 24rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.card-subtitle {
  font-size: 24rpx;
  color: #999;
}

.week-days {
  display: flex;
  justify-content: space-between;
}

.day-item {
  display: flex;
  flex-direction: column;
  align-items: center;

  &.today {
    .day-label {
      color: #e85a5a;
      font-weight: 600;
    }
  }

  &.fertile {
    .day-dot {
      background: #ff9800;
    }
  }

  &.safe {
    .day-dot {
      background: #4caf50;
    }
  }

  &.period {
    .day-dot {
      background: #e85a5a;
    }
  }
}

.day-label {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.day-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #ddd;
}
</style>
