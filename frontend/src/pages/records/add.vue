<template>
  <view class="page">
    <view class="form-container">
      <!-- 记录类型 -->
      <view class="form-section">
        <view class="section-title">记录类型</view>
        <view class="type-selector">
          <view
            v-for="type in recordTypes"
            :key="type.value"
            class="type-item"
            :class="{ active: form.type === type.value }"
            @click="form.type = type.value"
          >
            <text class="type-icon">{{ type.icon }}</text>
            <text class="type-label">{{ type.label }}</text>
          </view>
        </view>
      </view>

      <!-- 日期选择 -->
      <view class="form-section">
        <view class="section-title">日期</view>
        <picker mode="date" :value="form.date" @change="onDateChange">
          <view class="picker-display">
            <text>{{ form.date }}</text>
            <text class="arrow">&gt;</text>
          </view>
        </picker>
      </view>

      <!-- 月经记录选项 -->
      <view v-if="form.type === 'menstruation'" class="form-section">
        <view class="section-title">月经情况</view>
        <view class="option-group">
          <view class="option-item">
            <text class="option-label">开始</text>
            <switch
              :checked="form.isStart"
              color="#e85a5a"
              @change="form.isStart = $event.detail.value"
            />
          </view>
        </view>
        <view class="option-group">
          <text class="option-label">经量</text>
          <view class="flow-selector">
            <view
              v-for="flow in flowOptions"
              :key="flow.value"
              class="flow-item"
              :class="{ active: form.flow === flow.value }"
              @click="form.flow = flow.value"
            >
              {{ flow.label }}
            </view>
          </view>
        </view>
      </view>

      <!-- 体温记录选项 -->
      <view v-if="form.type === 'temperature'" class="form-section">
        <view class="section-title">体温</view>
        <view class="temperature-input">
          <input
            v-model="form.temperature"
            type="digit"
            placeholder="请输入体温"
            class="temp-input"
          />
          <text class="temp-unit">°C</text>
        </view>
        <view class="quick-temp">
          <view
            v-for="temp in quickTemps"
            :key="temp"
            class="quick-temp-item"
            @click="form.temperature = temp"
          >
            {{ temp }}°C
          </view>
        </view>
      </view>

      <!-- 同房记录选项 -->
      <view v-if="form.type === 'intercourse'" class="form-section">
        <view class="section-title">同房次数</view>
        <view class="count-selector">
          <view class="count-btn" @click="decreaseCount">-</view>
          <text class="count-value">{{ form.count }}</text>
          <view class="count-btn" @click="increaseCount">+</view>
        </view>
      </view>

      <!-- 排卵试纸选项 -->
      <view v-if="form.type === 'ovulation'" class="form-section">
        <view class="section-title">排卵试纸结果</view>
        <view class="result-selector">
          <view
            v-for="result in resultOptions"
            :key="result.value"
            class="result-item"
            :class="{ active: form.result === result.value }"
            @click="form.result = result.value"
          >
            <text class="result-icon">{{ result.icon }}</text>
            <text class="result-label">{{ result.label }}</text>
          </view>
        </view>
      </view>

      <!-- 备注 -->
      <view class="form-section">
        <view class="section-title">备注</view>
        <textarea
          v-model="form.note"
          placeholder="添加备注..."
          class="note-input"
          auto-height
        />
      </view>

      <!-- 提交按钮 -->
      <view class="form-actions">
        <button v-if="isEdit" class="btn-delete" @click="handleDelete">删除</button>
        <button class="btn-submit" :loading="loading" @click="handleSubmit">
          {{ isEdit ? '保存' : '添加' }}
        </button>
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
      form: {
        id: '',
        type: 'menstruation',
        date: formatDate(new Date()),
        isStart: false,
        flow: 'medium',
        temperature: '',
        count: 1,
        result: 'positive',
        note: '',
      },
      isEdit: false,
      loading: false,
      recordTypes: [
        { value: 'menstruation', label: '月经', icon: '🩸' },
        { value: 'temperature', label: '体温', icon: '🌡️' },
        { value: 'intercourse', label: '同房', icon: '💕' },
        { value: 'ovulation', label: '排卵', icon: '🥚' },
      ],
      flowOptions: [
        { value: 'light', label: '少量' },
        { value: 'medium', label: '中等' },
        { value: 'heavy', label: '大量' },
      ],
      quickTemps: ['36.0', '36.5', '37.0', '37.5'],
      resultOptions: [
        { value: 'positive', label: '阳性', icon: '🟢' },
        { value: 'negative', label: '阴性', icon: '🔴' },
        { value: 'weak', label: '弱阳', icon: '🟡' },
      ],
    };
  },
  onLoad(options) {
    if (options.date) {
      this.form.date = options.date;
    }
    if (options.type) {
      this.form.type = options.type;
    }
    if (options.id) {
      this.loadRecord(options.id);
    }
  },
  methods: {
    onDateChange(e) {
      this.form.date = e.detail.value;
    },
    loadRecord(id) {
      const recordStore = useRecordStore();
      const record = recordStore.allRecords.find((r) => r.id === id);
      if (record) {
        this.form = { ...record };
        this.isEdit = true;
      }
    },
    increaseCount() {
      this.form.count += 1;
    },
    decreaseCount() {
      if (this.form.count > 1) {
        this.form.count -= 1;
      }
    },
    async handleSubmit() {
      this.loading = true;
      const recordStore = useRecordStore();
      const predictionStore = usePredictionStore();

      let result;
      if (this.isEdit) {
        result = await recordStore.updateRecord(this.form.id, this.form);
      } else {
        result = await recordStore.createRecord(this.form);
      }

      this.loading = false;

      if (result.success) {
        predictionStore.updatePrediction();
        uni.showToast({ title: this.isEdit ? '保存成功' : '添加成功', icon: 'success' });
        setTimeout(() => {
          uni.navigateBack();
        }, 500);
      } else {
        uni.showToast({ title: result.message || '操作失败', icon: 'none' });
      }
    },
    handleDelete() {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条记录吗？',
        success: async (res) => {
          if (res.confirm) {
            const recordStore = useRecordStore();
            const predictionStore = usePredictionStore();
            const result = await recordStore.deleteRecord(this.form.id);
            if (result.success) {
              predictionStore.updatePrediction();
              uni.showToast({ title: '删除成功', icon: 'success' });
              setTimeout(() => {
                uni.navigateBack();
              }, 500);
            }
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
  padding: 30rpx;
}

.form-container {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
}

.form-section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.type-selector {
  display: flex;
  gap: 20rpx;
}

.type-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  border: 2rpx solid transparent;

  &.active {
    border-color: #e85a5a;
    background: #fff5f5;
  }
}

.type-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.type-label {
  font-size: 24rpx;
  color: #666;
}

.picker-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 88rpx;
  padding: 0 24rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.arrow {
  color: #999;
}

.option-group {
  margin-bottom: 20rpx;
}

.option-label {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 12rpx;
  display: block;
}

.flow-selector {
  display: flex;
  gap: 20rpx;
}

.flow-item {
  flex: 1;
  text-align: center;
  padding: 16rpx;
  background: #f8f8f8;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #666;

  &.active {
    background: #fff5f5;
    color: #e85a5a;
  }
}

.temperature-input {
  display: flex;
  align-items: center;
  background: #f8f8f8;
  border-radius: 12rpx;
  padding: 0 24rpx;
}

.temp-input {
  flex: 1;
  height: 88rpx;
  font-size: 32rpx;
}

.temp-unit {
  font-size: 32rpx;
  color: #666;
}

.quick-temp {
  display: flex;
  gap: 16rpx;
  margin-top: 16rpx;
}

.quick-temp-item {
  padding: 12rpx 24rpx;
  background: #f8f8f8;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #666;
}

.count-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40rpx;
}

.count-btn {
  width: 80rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background: #f8f8f8;
  border-radius: 50%;
  font-size: 40rpx;
  color: #e85a5a;

  &:active {
    background: #fff5f5;
  }
}

.count-value {
  font-size: 48rpx;
  font-weight: 600;
  color: #333;
  min-width: 80rpx;
  text-align: center;
}

.result-selector {
  display: flex;
  gap: 20rpx;
}

.result-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx;
  background: #f8f8f8;
  border-radius: 12rpx;

  &.active {
    background: #fff5f5;
  }
}

.result-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.result-label {
  font-size: 24rpx;
  color: #666;
}

.note-input {
  width: 100%;
  min-height: 120rpx;
  padding: 20rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.form-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;
}

.btn-submit {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  background: #e85a5a;
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;

  &:active {
    opacity: 0.9;
  }
}

.btn-delete {
  width: 180rpx;
  height: 88rpx;
  line-height: 88rpx;
  background: #f5f5f5;
  color: #999;
  border-radius: 44rpx;
  font-size: 28rpx;
}
</style>
