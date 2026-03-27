<!-- frontend/src/pages/stats/stats.vue -->
<template>
  <view class="page">
    <!-- Tab 导航 -->
    <view class="tabs">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab', { active: currentTab === tab.key }]"
        @click="currentTab = tab.key"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <!-- 周期统计 -->
    <view v-if="currentTab === 'cycle'" class="content">
      <view class="stat-card">
        <view class="stat-row">
          <text class="stat-label">平均周期长度</text>
          <text class="stat-value">{{ stats.average_cycle_length }} 天</text>
        </view>
        <view class="stat-row">
          <text class="stat-label">最长周期</text>
          <text class="stat-value">{{ stats.longest_cycle_length }} 天</text>
        </view>
        <view class="stat-row">
          <text class="stat-label">最短周期</text>
          <text class="stat-value">{{ stats.shortest_cycle_length }} 天</text>
        </view>
        <view class="stat-row">
          <text class="stat-label">记录周期数</text>
          <text class="stat-value">{{ stats.period_count }} 个</text>
        </view>
      </view>

      <view v-if="!stats.has_enough_data" class="data-tip">
        <text>记录更多经期数据，获得更准确的统计</text>
      </view>
    </view>

    <!-- 概率 Tab -->
    <view v-if="currentTab === 'probability'" class="content">
      <view class="stat-card highlight">
        <text class="card-title">当前周期受孕概率</text>
        <text class="big-value">{{ currentProbability }}%</text>
        <text class="confidence">置信度: {{ confidenceLevel }}</text>
      </view>
    </view>

    <!-- 倒计时 Tab -->
    <view v-if="currentTab === 'countdown'" class="content">
      <view class="stat-card">
        <view class="countdown-big">
          <text class="countdown-num">{{ daysToOvulation }}</text>
          <text class="countdown-unit">天</text>
        </view>
        <view class="countdown-info">
          <text>距离排卵日</text>
          <text>排卵日: {{ ovulationDay }}</text>
        </view>
      </view>

      <view class="next-period">
        <text>预计下次月经: {{ nextPeriodDate }}</text>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script>
import { predictionsApi } from '../../api/predictions.js';

export default {
  data() {
    return {
      currentTab: 'cycle',
      tabs: [
        { key: 'cycle', label: '周期' },
        { key: 'probability', label: '概率' },
        { key: 'countdown', label: '倒计时' }
      ],
      loading: false,
      stats: {
        average_cycle_length: 28,
        longest_cycle_length: 28,
        shortest_cycle_length: 28,
        period_count: 0,
        has_enough_data: false
      },
      currentProbability: 0,
      daysToOvulation: 0,
      ovulationDay: '',
      nextPeriodDate: ''
    };
  },
  computed: {
    confidenceLevel() {
      if (this.stats.period_count >= 6) return '高';
      if (this.stats.period_count >= 3) return '中';
      return '低';
    }
  },
  onShow() {
    this.loadStats();
  },
  methods: {
    async loadStats() {
      this.loading = true;
      try {
        const res = await predictionsApi.getStats();
        this.stats = res.cycle_stats;
        this.currentProbability = res.current_probability;
        this.daysToOvulation = res.days_to_ovulation;
        this.ovulationDay = res.ovulation_day;
        this.nextPeriodDate = res.fertility_window?.end || '';
      } catch (error) {
        console.error('Load stats error:', error);
      } finally {
        this.loading = false;
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

.tabs {
  display: flex;
  background: #fff;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 20px;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 12px;
  border-radius: 8px;
}

.tab.active {
  background: #9CAF88;
}

.tab.active text {
  color: #fff;
}

.tab text {
  color: #4A4541;
  font-size: 14px;
}

.content {
  min-height: 300px;
}

.stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 16px;
}

.stat-card.highlight {
  background: linear-gradient(135deg, #9CAF88, #C5D4B8);
  text-align: center;
}

.card-title {
  display: block;
  font-size: 14px;
  color: #fff;
  margin-bottom: 10px;
}

.big-value {
  display: block;
  font-size: 56px;
  font-weight: bold;
  color: #fff;
}

.confidence {
  display: block;
  font-size: 14px;
  color: rgba(255,255,255,0.8);
  margin-top: 10px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0ebe6;
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-label {
  color: #4A4541;
  font-size: 14px;
}

.stat-value {
  color: #9CAF88;
  font-size: 14px;
  font-weight: 500;
}

.data-tip {
  text-align: center;
  padding: 20px;
  color: #9CAF88;
  font-size: 14px;
}

.countdown-big {
  text-align: center;
  padding: 20px 0;
}

.countdown-num {
  font-size: 72px;
  font-weight: bold;
  color: #9CAF88;
}

.countdown-unit {
  font-size: 24px;
  color: #4A4541;
  margin-left: 8px;
}

.countdown-info {
  text-align: center;
  margin-top: 16px;
}

.countdown-info text {
  display: block;
  color: #4A4541;
  font-size: 14px;
  margin-top: 8px;
}

.next-period {
  text-align: center;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  color: #D4A574;
  font-size: 14px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #4A4541;
}
</style>