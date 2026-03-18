/**
 * 接好孕算法
 * 基于月经周期计算排卵日和安全期
 */

/**
 * 计算月经周期长度（默认28天）
 */
export function getCycleLength(records = []) {
  if (records.length < 2) return 28;

  // 获取最近两次月经开始日期
  const menstruationStarts = records
    .filter((r) => r.type === 'menstruation' && r.isStart)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (menstruationStarts.length < 2) return 28;

  const current = new Date(menstruationStarts[0].date);
  const previous = new Date(menstruationStarts[1].date);
  const diffTime = Math.abs(current - previous);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // 合理的周期范围 21-35 天
  return Math.max(21, Math.min(35, diffDays));
}

/**
 * 计算月经持续天数（默认5天）
 */
export function getPeriodLength(records = []) {
  const menstruationRecords = records
    .filter((r) => r.type === 'menstruation')
    .sort((a, b) => b.date.localeCompare(a.date));

  if (menstruationRecords.length === 0) return 5;

  // 找到最近一次月经的持续天数
  const lastPeriod = menstruationRecords[0];
  if (lastPeriod.days) return lastPeriod.days;

  // 如果没有记录持续天数，计算连续记录的天数
  let consecutiveDays = 1;
  const lastDate = new Date(lastPeriod.date);
  for (let i = 1; i < menstruationRecords.length; i += 1) {
    const currentDate = new Date(menstruationRecords[i].date);
    const diffDays = Math.floor((lastDate - currentDate) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      consecutiveDays += 1;
    } else {
      break;
    }
  }
  return consecutiveDays;
}

/**
 * 计算下一次月经开始日期
 * @param {string} lastPeriodDate - 上一次月经开始日期 YYYY-MM-DD
 * @param {number} cycleLength - 周期长度
 */
export function predictNextPeriod(lastPeriodDate, cycleLength = 28) {
  const date = new Date(lastPeriodDate);
  date.setDate(date.getDate() + cycleLength);
  return formatDate(date);
}

/**
 * 计算排卵日
 * @param {string} lastPeriodDate - 上一次月经开始日期 YYYY-MM-DD
 * @param {number} cycleLength - 周期长度
 */
export function predictOvulation(lastPeriodDate, cycleLength = 28) {
  // 排卵日 = 月经开始日期 + 周期长度 - 14 天
  const date = new Date(lastPeriodDate);
  date.setDate(date.getDate() + cycleLength - 14);
  return formatDate(date);
}

/**
 * 计算排卵期（排卵日前5天到排卵日后1天）
 * @param {string} lastPeriodDate - 上一次月经开始日期
 * @param {number} cycleLength - 周期长度
 */
export function predictFertileWindow(lastPeriodDate, cycleLength = 28) {
  const ovulationDate = new Date(predictOvulation(lastPeriodDate, cycleLength));

  const startDate = new Date(ovulationDate);
  startDate.setDate(startDate.getDate() - 5);

  const endDate = new Date(ovulationDate);
  endDate.setDate(endDate.getDate() + 1);

  return {
    start: formatDate(startDate),
    end: formatDate(endDate),
  };
}

/**
 * 计算安全期（月经结束后到排卵期开始前，以及排卵日后）
 * @param {string} lastPeriodDate - 上一次月经开始日期
 * @param {number} cycleLength - 周期长度
 * @param {number} periodLength - 月经持续天数
 */
export function predictSafePeriod(lastPeriodDate, cycleLength = 28, periodLength = 5) {
  // 第一个安全期：月经结束后到排卵期开始前
  const periodEndDate = new Date(lastPeriodDate);
  periodEndDate.setDate(periodEndDate.getDate() + periodLength);

  const fertileWindow = predictFertileWindow(lastPeriodDate, cycleLength);
  const fertileStartDate = new Date(fertileWindow.start);

  const firstSafeEnd = new Date(fertileStartDate);
  firstSafeEnd.setDate(firstSafeEnd.getDate() - 1);

  // 第二个安全期：排卵日后到下次月经前
  const fertileEndDate = new Date(fertileWindow.end);
  const nextPeriodDate = new Date(predictNextPeriod(lastPeriodDate, cycleLength));
  nextPeriodDate.setDate(nextPeriodDate.getDate() - 1);

  return {
    // 第一个安全期
    first: {
      start: formatDate(periodEndDate),
      end: formatDate(firstSafeEnd),
    },
    // 第二个安全期
    second: {
      start: formatDate(fertileEndDate),
      end: formatDate(nextPeriodDate),
    },
  };
}

/**
 * 获取指定日期的接好孕状态
 * @param {string} date - 日期 YYYY-MM-DD
 * @param {Object} prediction - 预测数据
 */
export function getDateStatus(date, prediction) {
  if (!prediction) return 'unknown';

  const { fertileWindow, safePeriod } = prediction;

  // 检查是否在排卵期
  if (date >= fertileWindow.start && date <= fertileWindow.end) {
    return 'fertile';
  }

  // 检查是否在安全期
  if (
    (date >= safePeriod.first.start && date <= safePeriod.first.end)
    || (date >= safePeriod.second.start && date <= safePeriod.second.end)
  ) {
    return 'safe';
  }

  // 月经期（假设月经期间为月经开始后5天内）
  if (prediction.lastPeriodDate) {
    const periodStart = new Date(prediction.lastPeriodDate);
    const currentDate = new Date(date);
    const diffDays = Math.floor((currentDate - periodStart) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays < prediction.periodLength) {
      return 'period';
    }
  }

  return 'uncertain';
}

/**
 * 生成完整的预测数据
 * @param {Array} records - 记录列表
 */
export function generatePrediction(records = []) {
  const cycleLength = getCycleLength(records);
  const periodLength = getPeriodLength(records);

  // 获取最后一次月经开始日期
  const menstruationStarts = records
    .filter((r) => r.type === 'menstruation' && r.isStart)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (menstruationStarts.length === 0) {
    return {
      hasData: false,
      cycleLength,
      periodLength,
      nextPeriodDate: null,
      ovulationDate: null,
      fertileWindow: null,
      safePeriod: null,
    };
  }

  const lastPeriodDate = menstruationStarts[0].date;

  const nextPeriodDate = predictNextPeriod(lastPeriodDate, cycleLength);
  const ovulationDate = predictOvulation(lastPeriodDate, cycleLength);
  const fertileWindow = predictFertileWindow(lastPeriodDate, cycleLength);
  const safePeriod = predictSafePeriod(lastPeriodDate, cycleLength, periodLength);

  return {
    hasData: true,
    cycleLength,
    periodLength,
    lastPeriodDate,
    nextPeriodDate,
    ovulationDate,
    fertileWindow,
    safePeriod,
  };
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 获取月经周期统计
 * @param {Array} records - 记录列表
 */
export function getCycleStatistics(records = []) {
  const menstruationStarts = records
    .filter((r) => r.type === 'menstruation' && r.isStart)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (menstruationStarts.length < 2) {
    return {
      averageCycle: null,
      shortestCycle: null,
      longestCycle: null,
      cycleCount: 0,
    };
  }

  const cycles = [];
  for (let i = 1; i < menstruationStarts.length; i += 1) {
    const current = new Date(menstruationStarts[i].date);
    const previous = new Date(menstruationStarts[i - 1].date);
    const diffDays = Math.floor((current - previous) / (1000 * 60 * 60 * 24));
    cycles.push(diffDays);
  }

  const averageCycle = Math.round(cycles.reduce((a, b) => a + b, 0) / cycles.length);
  const shortestCycle = Math.min(...cycles);
  const longestCycle = Math.max(...cycles);

  return {
    averageCycle,
    shortestCycle,
    longestCycle,
    cycleCount: cycles.length,
  };
}

/**
 * 预测成功率计算（基于周期规律性）
 * @param {Array} records - 记录列表
 */
export function getPredictionConfidence(records = []) {
  const stats = getCycleStatistics(records);

  if (!stats.averageCycle) {
    return { level: 'low', message: '数据不足', confidence: 0 };
  }

  const variation = stats.longestCycle - stats.shortestCycle;

  if (variation <= 3) {
    return { level: 'high', message: '周期规律', confidence: 90 };
  }
  if (variation <= 7) {
    return { level: 'medium', message: '周期较规律', confidence: 70 };
  }
  return { level: 'low', message: '周期不规律', confidence: 50 };
}

export default {
  getCycleLength,
  getPeriodLength,
  predictNextPeriod,
  predictOvulation,
  predictFertileWindow,
  predictSafePeriod,
  getDateStatus,
  generatePrediction,
  getCycleStatistics,
  getPredictionConfidence,
};
