/**
 * 数据存储 API
 * 用于记录月经、排卵、体温等数据
 */
const BASE_URL = 'http://localhost:3000/api';

const storageKey = {
  RECORDS: 'fertility_records',
  PREDICTIONS: 'fertility_predictions',
  LAST_SYNC: 'fertility_last_sync',
};

/**
 * 获取所有本地记录
 */
export function getStoredRecords() {
  const recordsStr = uni.getStorageSync(storageKey.RECORDS);
  return recordsStr ? JSON.parse(recordsStr) : [];
}

/**
 * 保存记录到本地
 */
function saveRecordsToStorage(records) {
  uni.setStorageSync(storageKey.RECORDS, JSON.stringify(records));
}

/**
 * 创建新记录
 * @param {Object} recordData - 记录数据
 */
export async function createRecord(recordData) {
  const records = getStoredRecords();
  const newRecord = {
    id: Date.now().toString(),
    ...recordData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  records.unshift(newRecord);
  saveRecordsToStorage(records);
  return { success: true, record: newRecord };
}

/**
 * 获取指定日期的记录
 * @param {string} date - 日期字符串 YYYY-MM-DD
 */
export function getRecordByDate(date) {
  const records = getStoredRecords();
  return records.find((r) => r.date === date) || null;
}

/**
 * 获取指定日期范围的记录
 * @param {string} startDate - 开始日期
 * @param {string} endDate - 结束日期
 */
export function getRecordsByDateRange(startDate, endDate) {
  const records = getStoredRecords();
  return records.filter((r) => r.date >= startDate && r.date <= endDate);
}

/**
 * 更新记录
 * @param {string} recordId - 记录ID
 * @param {Object} updateData - 更新的数据
 */
export async function updateRecord(recordId, updateData) {
  const records = getStoredRecords();
  const index = records.findIndex((r) => r.id === recordId);
  if (index === -1) {
    return { success: false, message: '记录不存在' };
  }
  records[index] = {
    ...records[index],
    ...updateData,
    updatedAt: new Date().toISOString(),
  };
  saveRecordsToStorage(records);
  return { success: true, record: records[index] };
}

/**
 * 删除记录
 * @param {string} recordId - 记录ID
 */
export async function deleteRecord(recordId) {
  const records = getStoredRecords();
  const index = records.findIndex((r) => r.id === recordId);
  if (index === -1) {
    return { success: false, message: '记录不存在' };
  }
  records.splice(index, 1);
  saveRecordsToStorage(records);
  return { success: true };
}

/**
 * 获取最近 N 天的记录
 * @param {number} days - 天数
 */
export function getRecentRecords(days = 30) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startStr = formatDate(startDate);
  const endStr = formatDate(endDate);
  return getRecordsByDateRange(startStr, endStr);
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
export function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 获取月经记录
 */
export function getMenstruationRecords() {
  const records = getStoredRecords();
  return records.filter((r) => r.type === 'menstruation');
}

/**
 * 获取排卵记录
 */
export function getOvulationRecords() {
  const records = getStoredRecords();
  return records.filter((r) => r.type === 'ovulation');
}

/**
 * 获取体温记录
 */
export function getTemperatureRecords() {
  const records = getStoredRecords();
  return records.filter((r) => r.type === 'temperature');
}

/**
 * 获取同房记录
 */
export function getIntercourseRecords() {
  const records = getStoredRecords();
  return records.filter((r) => r.type === 'intercourse');
}

/**
 * 清除所有本地数据
 */
export function clearAllData() {
  uni.removeStorageSync(storageKey.RECORDS);
  uni.removeStorageSync(storageKey.PREDICTIONS);
  uni.removeStorageSync(storageKey.LAST_SYNC);
}

/**
 * 导出数据
 */
export function exportData() {
  const records = getStoredRecords();
  return JSON.stringify(records, null, 2);
}

/**
 * 导入数据
 * @param {string} jsonData - JSON 字符串
 */
export function importData(jsonData) {
  try {
    const records = JSON.parse(jsonData);
    if (Array.isArray(records)) {
      saveRecordsToStorage(records);
      return { success: true, count: records.length };
    }
    return { success: false, message: '数据格式错误' };
  } catch (error) {
    return { success: false, message: '解析失败' };
  }
}

export default {
  getStoredRecords,
  createRecord,
  getRecordByDate,
  getRecordsByDateRange,
  updateRecord,
  deleteRecord,
  getRecentRecords,
  formatDate,
  getMenstruationRecords,
  getOvulationRecords,
  getTemperatureRecords,
  getIntercourseRecords,
  clearAllData,
  exportData,
  importData,
};
