<template>
  <view class="page">
    <!-- 顶部 -->
    <view class="header">
      <text class="title">接好孕</text>
    </view>

    <!-- 今日状态卡片 -->
    <view class="today-card">
      <view class="today-info">
        <text class="today-label">今日受孕概率</text>
        <text class="today-value">{{ currentProbability }}%</text>
        <text class="today-status">{{ statusText }}</text>
      </view>
      <view class="countdown">
        <text class="countdown-num">{{ daysToOvulation }}</text>
        <text class="countdown-label">天后排卵</text>
      </view>
    </view>

    <!-- 概率曲线图 -->
    <view class="chart-section">
      <view class="section-title">
        <text>30天受孕概率</text>
      </view>
      <ProbabilityChart
        :curveData="curveData"
        :fertilityWindow="fertilityWindow"
      />
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>

    <!-- 未登录提示 -->
    <view v-if="!isLoggedIn" class="login-prompt">
      <button type="primary" @click="handleLogin">微信一键登录</button>
    </view>
  </view>
</template>

<script>
import ProbabilityChart from '../../components/ProbabilityChart.vue';
import { store } from '../../store/index.js';
import { predictionsApi } from '../../api/predictions.js';
import { authApi } from '../../api/auth.js';

export default {
  components: {
    ProbabilityChart
  },
  data() {
    return {
      loading: false,
      curveData: [],
      fertilityWindow: null,
      currentProbability: 0,
      daysToOvulation: 0,
      statusText: '安全期'
    };
  },
  computed: {
    isLoggedIn() {
      return store.state.isLoggedIn;
    }
  },
  onShow() {
    store.initFromStorage();
    if (store.state.isLoggedIn) {
      this.loadData();
    }
  },
  methods: {
    async handleLogin() {
      try {
        uni.showLoading({ title: '登录中...' });

        const code = await authApi.getOpenid();
        const res = await authApi.login(code);

        store.setOpenid(res.user.openid);
        store.setUser(res.user);

        uni.hideLoading();
        this.loadData();
      } catch (error) {
        uni.hideLoading();
        uni.showToast({ title: '登录失败', icon: 'none' });
        console.error('Login error:', error);
      }
    },
    async loadData() {
      this.loading = true;
      try {
        const [curveRes, statsRes] = await Promise.all([
          predictionsApi.getProbabilityCurve({ days: 30 }),
          predictionsApi.getStats()
        ]);

        this.curveData = curveRes.curve_data;
        this.fertilityWindow = curveRes.fertility_window;
        this.currentProbability = curveRes.current_probability;
        this.daysToOvulation = statsRes.days_to_ovulation;

        // 更新状态文本
        const todayPoint = this.curveData[0];
        if (todayPoint?.is_ovulation_day) {
          this.statusText = '排卵日';
        } else if (todayPoint?.is_in_fertility_window) {
          this.statusText = '易孕期';
        } else {
          this.statusText = '安全期';
        }
      } catch (error) {
        console.error('Load data error:', error);
        uni.showToast({ title: '加载失败', icon: 'none' });
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

.header {
  padding: 10px 0 20px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #4A4541;
}

.today-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: #fff;
  border-radius: 16px;
  margin-bottom: 20px;
}

.today-info {
  flex: 1;
}

.today-label {
  display: block;
  font-size: 14px;
  color: #4A4541;
  margin-bottom: 8px;
}

.today-value {
  display: block;
  font-size: 42px;
  font-weight: bold;
  color: #9CAF88;
}

.today-status {
  display: block;
  font-size: 14px;
  color: #D4A574;
  margin-top: 4px;
}

.countdown {
  text-align: center;
  padding: 16px;
  background: #fdf8f3;
  border-radius: 12px;
}

.countdown-num {
  display: block;
  font-size: 28px;
  font-weight: bold;
  color: #4A4541;
}

.countdown-label {
  display: block;
  font-size: 12px;
  color: #4A4541;
}

.chart-section {
  margin-bottom: 20px;
}

.section-title {
  padding: 10px 0;
}

.section-title text {
  font-size: 16px;
  color: #4A4541;
  font-weight: 500;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #4A4541;
}

.login-prompt {
  padding: 40px 20px;
  text-align: center;
}

.login-prompt button {
  background: #9CAF88;
  color: #fff;
  border: none;
  padding: 12px 40px;
  border-radius: 24px;
}
</style>
