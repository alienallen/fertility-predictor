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

    <!-- 经期录入 -->
    <view v-if="currentTab === 'period'" class="tab-content">
      <view class="form-item">
        <text class="label">上次月经开始日期</text>
        <picker mode="date" :value="periodForm.start_date" @change="onPeriodDateChange">
          <view class="picker-value">
            {{ periodForm.start_date || '请选择日期' }}
          </view>
        </picker>
      </view>
      <button type="primary" @click="submitPeriod">保存</button>
    </view>

    <!-- 体温录入 -->
    <view v-if="currentTab === 'temperature'" class="tab-content">
      <view class="form-item">
        <text class="label">日期</text>
        <picker mode="date" :value="tempForm.record_date" @change="onTempDateChange">
          <view class="picker-value">
            {{ tempForm.record_date || '请选择日期' }}
          </view>
        </picker>
      </view>
      <view class="form-item">
        <text class="label">体温 (℃)</text>
        <input type="digit" v-model="tempForm.temperature" placeholder="如: 36.5" />
      </view>
      <button type="primary" @click="submitTemperature">保存</button>
    </view>

    <!-- 试纸录入 -->
    <view v-if="currentTab === 'test'" class="tab-content">
      <view class="form-item">
        <text class="label">检测日期</text>
        <picker mode="date" :value="testForm.test_date" @change="onTestDateChange">
          <view class="picker-value">
            {{ testForm.test_date || '请选择日期' }}
          </view>
        </picker>
      </view>
      <view class="form-item">
        <text class="label">检测结果</text>
        <radio-group @change="onTestResultChange">
          <label v-for="opt in testOptions" :key="opt.value">
            <radio :value="String(opt.value)" :checked="testForm.result === opt.value" />
            <text>{{ opt.label }}</text>
          </label>
        </radio-group>
      </view>
      <button type="primary" @click="submitTest">保存</button>
    </view>

    <!-- 同房录入 -->
    <view v-if="currentTab === 'intercourse'" class="tab-content">
      <view class="form-item">
        <text class="label">同房日期</text>
        <picker mode="date" :value="intercourseForm.record_date" @change="onIntercourseDateChange">
          <view class="picker-value">
            {{ intercourseForm.record_date || '请选择日期' }}
          </view>
        </picker>
      </view>
      <button type="primary" @click="submitIntercourse">保存</button>
    </view>

    <!-- 提示信息 -->
    <view class="tip">
      <text>记录越完整，预测越准确</text>
    </view>
  </view>
</template>

<script>
import { periodsApi } from '../../api/periods.js';
import { temperaturesApi } from '../../api/temperatures.js';
import { ovulationTestsApi } from '../../api/ovulationTests.js';
import { intercourseRecordsApi } from '../../api/intercourseRecords.js';

export default {
  data() {
    return {
      currentTab: 'period',
      tabs: [
        { key: 'period', label: '经期' },
        { key: 'temperature', label: '体温' },
        { key: 'test', label: '试纸' },
        { key: 'intercourse', label: '同房' }
      ],
      periodForm: {
        start_date: ''
      },
      tempForm: {
        record_date: '',
        temperature: ''
      },
      testForm: {
        test_date: '',
        result: null
      },
      testOptions: [
        { value: 0, label: '阴性' },
        { value: 1, label: '弱阳' },
        { value: 2, label: '强阳' },
        { value: 3, label: '已排卵' }
      ],
      intercourseForm: {
        record_date: ''
      }
    };
  },
  methods: {
    // 经期
    onPeriodDateChange(e) {
      this.periodForm.start_date = e.detail.value;
    },
    async submitPeriod() {
      if (!this.periodForm.start_date) {
        return uni.showToast({ title: '请选择日期', icon: 'none' });
      }
      try {
        await periodsApi.create(this.periodForm);
        uni.showToast({ title: '保存成功' });
        this.periodForm.start_date = '';
      } catch (error) {
        uni.showToast({ title: '保存失败', icon: 'none' });
      }
    },

    // 体温
    onTempDateChange(e) {
      this.tempForm.record_date = e.detail.value;
    },
    async submitTemperature() {
      if (!this.tempForm.record_date || !this.tempForm.temperature) {
        return uni.showToast({ title: '请填写完整', icon: 'none' });
      }
      try {
        await temperaturesApi.create(this.tempForm);
        uni.showToast({ title: '保存成功' });
        this.tempForm = { record_date: '', temperature: '' };
      } catch (error) {
        uni.showToast({ title: '保存失败', icon: 'none' });
      }
    },

    // 试纸
    onTestDateChange(e) {
      this.testForm.test_date = e.detail.value;
    },
    onTestResultChange(e) {
      this.testForm.result = parseInt(e.detail.value);
    },
    async submitTest() {
      if (!this.testForm.test_date || this.testForm.result === null) {
        return uni.showToast({ title: '请填写完整', icon: 'none' });
      }
      try {
        await ovulationTestsApi.create(this.testForm);
        uni.showToast({ title: '保存成功' });
        this.testForm = { test_date: '', result: null };
      } catch (error) {
        uni.showToast({ title: '保存失败', icon: 'none' });
      }
    },

    // 同房
    onIntercourseDateChange(e) {
      this.intercourseForm.record_date = e.detail.value;
    },
    async submitIntercourse() {
      if (!this.intercourseForm.record_date) {
        return uni.showToast({ title: '请选择日期', icon: 'none' });
      }
      try {
        await intercourseRecordsApi.create(this.intercourseForm);
        uni.showToast({ title: '保存成功' });
        this.intercourseForm.record_date = '';
      } catch (error) {
        uni.showToast({ title: '保存失败', icon: 'none' });
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

.tab-content {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
}

.form-item {
  margin-bottom: 20px;
}

.label {
  display: block;
  font-size: 14px;
  color: #4A4541;
  margin-bottom: 8px;
}

.picker-value {
  padding: 12px;
  background: #fdf8f3;
  border-radius: 8px;
  color: #4A4541;
}

input {
  padding: 12px;
  background: #fdf8f3;
  border-radius: 8px;
  color: #4A4541;
}

radio-group label {
  display: inline-block;
  margin-right: 20px;
  font-size: 14px;
}

button {
  background: #9CAF88;
  color: #fff;
  border: none;
  margin-top: 20px;
}

.tip {
  text-align: center;
  padding: 20px;
  color: #9CAF88;
  font-size: 14px;
}
</style>
