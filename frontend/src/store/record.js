import { defineStore } from 'pinia';
import {
  getStoredRecords,
  createRecord as apiCreateRecord,
  getRecordByDate,
  getRecordsByDateRange,
  updateRecord as apiUpdateRecord,
  deleteRecord as apiDeleteRecord,
  getRecentRecords,
  formatDate,
  getMenstruationRecords,
  getOvulationRecords,
  getTemperatureRecords,
  getIntercourseRecords,
  clearAllData,
  exportData,
  importData,
} from '@/api/records';

export const useRecordStore = defineStore('record', {
  state: () => ({
    records: getStoredRecords(),
    loading: false,
  }),

  getters: {
    // 获取所有记录
    allRecords: (state) => state.records,

    // 获取月经记录
    menstruationRecords: (state) => state.records.filter((r) => r.type === 'menstruation'),

    // 获取排卵记录
    ovulationRecords: (state) => state.records.filter((r) => r.type === 'ovulation'),

    // 获取体温记录
    temperatureRecords: (state) => state.records.filter((r) => r.type === 'temperature'),

    // 获取同房记录
    intercourseRecords: (state) => state.records.filter((r) => r.type === 'intercourse'),

    // 获取今日记录
    todayRecord: (state) => {
      const today = formatDate(new Date());
      return state.records.find((r) => r.date === today) || null;
    },

    // 获取最近月经开始日期
    lastMenstruationDate: (state) => {
      const records = state.records.filter((r) => r.type === 'menstruation' && r.isStart);
      return records.length > 0 ? records[0].date : null;
    },

    // 获取月经周期长度（最近一次）
    cycleLength: (state) => {
      const menstruationRecords = state.records
        .filter((r) => r.type === 'menstruation' && r.isStart)
        .sort((a, b) => b.date.localeCompare(a.date));

      if (menstruationRecords.length < 2) return null;

      const current = new Date(menstruationRecords[0].date);
      const previous = new Date(menstruationRecords[1].date);
      const diffTime = Math.abs(current - previous);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    },
  },

  actions: {
    /**
     * 刷新本地数据
     */
    refreshRecords() {
      this.records = getStoredRecords();
    },

    /**
     * 创建记录
     */
    async createRecord(recordData) {
      this.loading = true;
      const result = await apiCreateRecord(recordData);
      this.loading = false;

      if (result.success) {
        this.records.unshift(result.record);
      }
      return result;
    },

    /**
     * 获取指定日期的记录
     */
    getByDate(date) {
      return getRecordByDate(date);
    },

    /**
     * 获取日期范围记录
     */
    getByDateRange(startDate, endDate) {
      return getRecordsByDateRange(startDate, endDate);
    },

    /**
     * 更新记录
     */
    async updateRecord(recordId, updateData) {
      this.loading = true;
      const result = await apiUpdateRecord(recordId, updateData);
      this.loading = false;

      if (result.success) {
        const index = this.records.findIndex((r) => r.id === recordId);
        if (index !== -1) {
          this.records[index] = result.record;
        }
      }
      return result;
    },

    /**
     * 删除记录
     */
    async deleteRecord(recordId) {
      this.loading = true;
      const result = await apiDeleteRecord(recordId);
      this.loading = false;

      if (result.success) {
        const index = this.records.findIndex((r) => r.id === recordId);
        if (index !== -1) {
          this.records.splice(index, 1);
        }
      }
      return result;
    },

    /**
     * 获取最近记录
     */
    getRecent(days = 30) {
      return getRecentRecords(days);
    },

    /**
     * 清除所有数据
     */
    clearAll() {
      clearAllData();
      this.records = [];
    },

    /**
     * 导出数据
     */
    export() {
      return exportData();
    },

    /**
     * 导入数据
     */
    async import(jsonData) {
      const result = await importData(jsonData);
      if (result.success) {
        this.refreshRecords();
      }
      return result;
    },
  },
});
