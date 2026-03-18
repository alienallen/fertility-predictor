<template>
  <view class="page">
    <!-- 日历头部 -->
    <view class="calendar-header">
      <view class="header-left">
        <text class="month-text">{{ currentMonthText }}</text>
      </view>
      <view class="header-right">
        <text class="nav-btn" @click="prevMonth">&lt;</text>
        <text class="today-btn" @click="goToToday">今天</text>
        <text class="nav-btn" @click="nextMonth">&gt;</text>
      </view>
    </view>

    <!-- 星期标题 -->
    <view class="week-title">
      <text v-for="day in weekDays" :key="day" class="week-day">{{ day }}</text>
    </view>

    <!-- 日历主体 -->
    <view class="calendar-body">
      <view
        v-for="(day, index) in calendarDays"
        :key="index"
        class="calendar-day"
        :class="{
          'is-empty': !day.date,
          'is-today': day.isToday,
          'is-selected': day.date === selectedDate,
          [day.status]: day.status && day.date,
        }"
        @click="selectDate(day)"
      >
        <text v-if="day.date" class="day-number">{{ day.day }}</text>
        <view v-if="day.date" class="day-markers">
          <view v-if="day.hasRecord" class="marker record"></view>
          <view v-if="day.isOvulation" class="marker ovulation"></view>
        </view>
      </view>
    </view>

    <!-- 记录类型选择 -->
    <view class="record-types">
      <view
        v-for="type in recordTypes"
        :key="type.value"
        class="type-btn"
        :class="{ active: currentType === type.value }"
        @click="currentType = type.value"
      >
        <text class="type-icon">{{ type.icon }}</text>
        <text class="type-label">{{ type.label }}</text>
      </view>
    </view>

    <!-- 记录详情/添加 -->
    <view class="record-panel">
      <view class="panel-header">
        <text class="panel-title">{{ selectedDate }}</text>
        <text v-if="currentRecord" class="panel-edit" @click="editRecord">编辑</text>
      </view>

      <view v-if="currentRecord" class="record-detail">
        <view v-if="currentRecord.type === 'menstruation'" class="detail-item">
          <text class="detail-label">经量</text>
          <text class="detail-value">{{ currentRecord.flow || '中等' }}</text>
        </view>
        <view v-if="currentRecord.type === 'temperature'" class="detail-item">
          <text class="detail-label">体温</text>
          <text class="detail-value">{{ currentRecord.temperature }}°C</text>
        </view>
        <view v-if="currentRecord.type === 'intercourse'" class="detail-item">
          <text class="detail-label">同房</text>
          <text class="detail-value">{{ currentRecord.count || 1 }} 次</text>
        </view>
        <view v-if="currentRecord.type === 'ovulation'" class="detail-item">
          <text class="detail-label">排卵试纸</text>
          <text class="detail-value">{{ currentRecord.result || '阳性' }}</text>
        </view>
        <view v-if="currentRecord.note" class="detail-item">
          <text class="detail-label">备注</text>
          <text class="detail-value">{{ currentRecord.note }}</text>
        </view>
      </view>

      <view v-else class="empty-state">
        <text class="empty-text">暂无记录</text>
        <button class="add-btn" @click="addRecord">添加记录</button>
      </view>
    </view>
  </view>
</template>

<script>
import { useRecordStore } from '@/store/record';
import { usePredictionStore } from '@/store/prediction';
import { formatDate } from '@/api/records';

export default {
  data() {
    return {
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth(),
      selectedDate: formatDate(new Date()),
      currentType: 'menstruation',
      weekDays: ['日', '一', '二', '三', '四', '五', '六'],
      recordTypes: [
        { value: 'menstruation', label: '月经', icon: '🩸' },
        { value: 'temperature', label: '体温', icon: '🌡️' },
        { value: 'intercourse', label: '同房', icon: '💕' },
        { value: 'ovulation', label: '排卵', icon: '🥚' },
      ],
    };
  },
  computed: {
    currentMonthText() {
      return `${this.currentYear}年${this.currentMonth + 1}月`;
    },
    calendarDays() {
      const days = [];
      const firstDay = new Date(this.currentYear, this.currentMonth, 1);
      const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
      const startWeek = firstDay.getDay();
      const totalDays = lastDay.getDate();

      // 获取当月所有记录
      const recordStore = useRecordStore();
      const predictionStore = usePredictionStore();

      // 填充空日期
      for (let i = 0; i < startWeek; i += 1) {
        days.push({ date: '', day: '' });
      }

      // 填充日期
      const today = new Date();
      const todayStr = formatDate(today);

      for (let i = 1; i <= totalDays; i += 1) {
        const date = new Date(this.currentYear, this.currentMonth, i);
        const dateStr = formatDate(date);
        const record = recordStore.getByDate(dateStr);
        const status = predictionStore.getStatusForDate(dateStr);

        days.push({
          date: dateStr,
          day: i,
          isToday: dateStr === todayStr,
          hasRecord: !!record,
          status: status !== 'unknown' ? status : null,
          isOvulation: predictionStore.prediction?.ovulationDate === dateStr,
        });
      }

      return days;
    },
    currentRecord() {
      const recordStore = useRecordStore();
      return recordStore.getByDate(this.selectedDate);
    },
  },
  methods: {
    prevMonth() {
      if (this.currentMonth === 0) {
        this.currentMonth = 11;
        this.currentYear -= 1;
      } else {
        this.currentMonth -= 1;
      }
    },
    nextMonth() {
      if (this.currentMonth === 11) {
        this.currentMonth = 0;
        this.currentYear += 1;
      } else {
        this.currentMonth += 1;
      }
    },
    goToToday() {
      const today = new Date();
      this.currentYear = today.getFullYear();
      this.currentMonth = today.getMonth();
      this.selectedDate = formatDate(today);
    },
    selectDate(day) {
      if (!day.date) return;
      this.selectedDate = day.date;
      this.currentType = this.currentRecord?.type || 'menstruation';
    },
    addRecord() {
      uni.navigateTo({
        url: `/pages/records/add?date=${this.selectedDate}&type=${this.currentType}`,
      });
    },
    editRecord() {
      if (this.currentRecord) {
        uni.navigateTo({
          url: `/pages/records/add?date=${this.selectedDate}&type=${this.currentRecord.type}&id=${this.currentRecord.id}`,
        });
      }
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

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background: #fff;
}

.month-text {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
}

.nav-btn {
  font-size: 36rpx;
  color: #e85a5a;
  padding: 10rpx 20rpx;
}

.today-btn {
  font-size: 26rpx;
  color: #e85a5a;
  padding: 10rpx 20rpx;
  margin: 0 10rpx;
}

.week-title {
  display: flex;
  background: #fff;
  padding: 0 20rpx 20rpx;
}

.week-day {
  flex: 1;
  text-align: center;
  font-size: 24rpx;
  color: #999;
}

.calendar-body {
  display: flex;
  flex-wrap: wrap;
  background: #fff;
  padding: 0 20rpx 30rpx;
}

.calendar-day {
  width: 14.28%;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;

  &.is-empty {
    opacity: 0;
  }

  &.is-today {
    .day-number {
      color: #e85a5a;
      font-weight: 600;
    }
  }

  &.is-selected {
    background: #fff5f5;
    border-radius: 50%;
  }

  &.fertile .day-number {
    color: #ff9800;
  }

  &.safe .day-number {
    color: #4caf50;
  }

  &.period .day-number {
    color: #e85a5a;
  }
}

.day-number {
  font-size: 28rpx;
  color: #333;
}

.day-markers {
  display: flex;
  gap: 4rpx;
  position: absolute;
  bottom: 10rpx;
}

.marker {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;

  &.record {
    background: #e85a5a;
  }

  &.ovulation {
    background: #ff9800;
  }
}

.record-types {
  display: flex;
  justify-content: space-around;
  padding: 20rpx;
  background: #fff;
  margin-top: 20rpx;
}

.type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 24rpx;
  border-radius: 12rpx;

  &.active {
    background: #fff5f5;
  }
}

.type-icon {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.type-label {
  font-size: 24rpx;
  color: #666;
}

.record-panel {
  margin: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.panel-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.panel-edit {
  font-size: 26rpx;
  color: #e85a5a;
}

.record-detail {
  .detail-item {
    display: flex;
    justify-content: space-between;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }
  }

  .detail-label {
    font-size: 26rpx;
    color: #999;
  }

  .detail-value {
    font-size: 26rpx;
    color: #333;
  }
}

.empty-state {
  text-align: center;
  padding: 40rpx 0;
}

.empty-text {
  font-size: 26rpx;
  color: #999;
  display: block;
  margin-bottom: 20rpx;
}

.add-btn {
  width: 200rpx;
  height: 70rpx;
  line-height: 70rpx;
  background: #e85a5a;
  color: #fff;
  border-radius: 35rpx;
  font-size: 26rpx;
}
</style>
