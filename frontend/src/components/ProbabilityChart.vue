<template>
  <view class="chart-container">
    <!-- Y轴标签 -->
    <view class="y-axis">
      <text v-for="p in [100, 75, 50, 25, 0]" :key="p" class="y-label">{{ p }}%</text>
    </view>

    <!-- 图表区域 -->
    <view class="chart-area">
      <!-- 网格线 -->
      <view class="grid-lines">
        <view v-for="p in [100, 75, 50, 25, 0]" :key="p" class="grid-line"></view>
      </view>

      <!-- 曲线 -->
      <view class="curve-container">
        <view
          v-for="(point, index) in curveData"
          :key="index"
          class="curve-point"
          :style="{
            left: `${(index / (curveData.length - 1)) * 100}%`,
            bottom: `${point.probability}%`,
            backgroundColor: getPointColor(point)
          }"
          @click="onPointClick(point)"
        >
          <view v-if="point.is_ovulation_day" class="ovulation-marker"></view>
        </view>

        <!-- 今日指示线 -->
        <view class="today-line" :style="{ left: `${todayPosition}%` }"></view>

        <!-- 易孕窗口高亮 -->
        <view
          v-if="fertilityWindowStart !== null"
          class="fertility-window"
          :style="{
            left: `${fertilityWindowStart}%`,
            width: `${fertilityWindowWidth}%`
          }"
        ></view>
      </view>

      <!-- X轴标签 -->
      <view class="x-axis">
        <text
          v-for="(point, index) in curveData"
          :key="index"
          v-if="index % 5 === 0"
          class="x-label"
          :style="{ left: `${(index / (curveData.length - 1)) * 100}%` }"
        >
          {{ formatDate(point.date) }}
        </text>
      </view>
    </view>

    <!-- 详情弹窗 -->
    <uni-popup ref="detailPopup" type="bottom">
      <view class="detail-card">
        <text class="detail-date">{{ selectedPoint?.date }}</text>
        <text class="detail-probability">怀孕概率: {{ selectedPoint?.probability }}%</text>
        <text class="detail-status">{{ getStatusText(selectedPoint) }}</text>
      </view>
    </uni-popup>
  </view>
</template>

<script>
export default {
  name: 'ProbabilityChart',
  props: {
    curveData: {
      type: Array,
      default: () => []
    },
    fertilityWindow: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      selectedPoint: null
    };
  },
  computed: {
    todayPosition() {
      return 0;
    },
    fertilityWindowStart() {
      if (!this.fertilityWindow || !this.curveData.length) return null;
      const startDate = new Date(this.fertilityWindow.start);
      const firstDate = new Date(this.curveData[0].date);
      return Math.max(0, Math.round((startDate - firstDate) / (1000 * 60 * 60 * 24) / 30 * 100));
    },
    fertilityWindowWidth() {
      if (!this.fertilityWindow) return 0;
      return Math.round(7 / 30 * 100);
    }
  },
  methods: {
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    },
    getPointColor(point) {
      if (point.is_in_fertility_window) return '#9CAF88';
      if (point.is_ovulation_day) return '#D4A574';
      return '#E8B4B8';
    },
    getStatusText(point) {
      if (!point) return '';
      if (point.is_ovulation_day) return '排卵日';
      if (point.is_in_fertility_window) return '易孕期';
      return '安全期';
    },
    onPointClick(point) {
      this.selectedPoint = point;
      this.$refs.detailPopup.open();
    }
  }
};
</script>

<style scoped>
.chart-container {
  display: flex;
  height: 300px;
  padding: 20px;
  background: #fff;
  border-radius: 16px;
}

.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: 10px;
  width: 40px;
}

.y-label {
  font-size: 12px;
  color: #4A4541;
  text-align: right;
}

.chart-area {
  flex: 1;
  position: relative;
}

.grid-lines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.grid-line {
  border-top: 1px dashed #E5E0DC;
}

.curve-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 30px;
}

.curve-point {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transform: translate(-50%, 50%);
  cursor: pointer;
}

.ovulation-marker {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 15px;
  background: #D4A574;
}

.today-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #4A4541;
}

.fertility-window {
  position: absolute;
  top: 0;
  bottom: 0;
  background: rgba(156, 175, 136, 0.2);
  border-radius: 4px;
}

.x-axis {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30px;
}

.x-label {
  position: absolute;
  transform: translateX(-50%);
  font-size: 11px;
  color: #4A4541;
}

.detail-card {
  padding: 30px;
  background: #fff;
  border-radius: 24px 24px 0 0;
  text-align: center;
}

.detail-date {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #4A4541;
  margin-bottom: 10px;
}

.detail-probability {
  display: block;
  font-size: 32px;
  color: #9CAF88;
  margin-bottom: 10px;
}

.detail-status {
  display: block;
  font-size: 14px;
  color: #4A4541;
}
</style>
