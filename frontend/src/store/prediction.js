import { defineStore } from 'pinia';
import { useRecordStore } from './record';
import {
  generatePrediction,
  getPredictionConfidence,
  getCycleStatistics,
  getDateStatus,
} from '@/utils/prediction';

export const usePredictionStore = defineStore('prediction', {
  state: () => ({
    prediction: null,
    statistics: null,
    confidence: null,
  }),

  getters: {
    // 是否已有数据
    hasData: (state) => state.prediction?.hasData || false,

    // 预测的排卵日
    ovulationDate: (state) => state.prediction?.ovulationDate || null,

    // 预测的下次月经日期
    nextPeriodDate: (state) => state.prediction?.nextPeriodDate || null,

    // 排卵期
    fertileWindow: (state) => state.prediction?.fertileWindow || null,

    // 安全期
    safePeriod: (state) => state.prediction?.safePeriod || null,

    // 平均周期
    averageCycle: (state) => state.statistics?.averageCycle || null,

    // 预测可信度
    confidenceLevel: (state) => state.confidence?.level || 'low',

    // 可信度数值
    confidenceValue: (state) => state.confidence?.confidence || 0,
  },

  actions: {
    /**
     * 更新预测数据
     */
    updatePrediction() {
      const recordStore = useRecordStore();
      const records = recordStore.allRecords;

      this.prediction = generatePrediction(records);
      this.statistics = getCycleStatistics(records);
      this.confidence = getPredictionConfidence(records);
    },

    /**
     * 获取指定日期的状态
     * @param {string} date - 日期 YYYY-MM-DD
     */
    getStatusForDate(date) {
      if (!this.prediction) return 'unknown';
      return getDateStatus(date, this.prediction);
    },

    /**
     * 获取今日接好孕状态
     */
    getTodayStatus() {
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      return this.getStatusForDate(dateStr);
    },

    /**
     * 获取接下来N天的接好孕状态
     * @param {number} days - 天数
     */
    getUpcomingDays(days = 7) {
      const results = [];
      const today = new Date();

      for (let i = 0; i < days; i += 1) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        results.push({
          date: dateStr,
          status: this.getStatusForDate(dateStr),
        });
      }

      return results;
    },
  },
});
