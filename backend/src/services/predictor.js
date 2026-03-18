/**
 * 预测算法服务
 * 基于月经周期、体温、试纸数据预测排卵日和易孕日
 */

/**
 * 计算月经周期统计信息
 * @param {Array} records - 记录列表
 * @returns {Object} - 统计信息
 */
function getCycleStatistics(records) {
  // 获取月经开始记录
  const menstruationRecords = records
    .filter(r => r.type === 'menstruation' && r.isStart)
    .sort((a, b) => a.date.localeCompare(b.date));
  
  if (menstruationRecords.length < 2) {
    return {
      averageCycle: 28,
      averagePeriodLength: 5,
      recordCount: menstruationRecords.length,
      hasEnoughData: false,
    };
  }
  
  // 计算平均周期长度
  const cycles = [];
  for (let i = 1; i < menstruationRecords.length; i++) {
    const prev = new Date(menstruationRecords[i - 1].date);
    const curr = new Date(menstruationRecords[i].date);
    const diffTime = Math.abs(curr - prev);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    cycles.push(diffDays);
  }
  
  const averageCycle = Math.round(cycles.reduce((a, b) => a + b, 0) / cycles.length);
  
  // 计算平均经期长度
  const periodLengths = [];
  for (const record of menstruationRecords) {
    const endRecord = records.find(
      r => r.type === 'menstruation' && r.isEnd && r.date > record.date
    );
    if (endRecord) {
      const start = new Date(record.date);
      const end = new Date(endRecord.date);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      periodLengths.push(diffDays);
    }
  }
  
  const averagePeriodLength = periodLengths.length > 0
    ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length)
    : 5;
  
  return {
    averageCycle,
    averagePeriodLength,
    lastPeriodDate: menstruationRecords[menstruationRecords.length - 1]?.date,
    recordCount: menstruationRecords.length,
    hasEnoughData: menstruationRecords.length >= 3,
    cycles,
  };
}

/**
 * 基于月经周期预测
 * @param {Object} statistics - 统计信息
 * @returns {Object} - 基础预测结果
 */
function predictByCycle(statistics) {
  const { averageCycle, averagePeriodLength, lastPeriodDate } = statistics;
  
  if (!lastPeriodDate) {
    return null;
  }
  
  const lastPeriod = new Date(lastPeriodDate);
  
  // 预测下次月经开始日期
  const nextPeriodDate = new Date(lastPeriod);
  nextPeriodDate.setDate(nextPeriodDate.getDate() + averageCycle);
  
  // 预测排卵日（下次月经前14天）
  const ovulationDate = new Date(nextPeriodDate);
  ovulationDate.setDate(ovulationDate.getDate() - 14);
  
  // 易孕窗口（排卵日前5天到排卵日当天）
  const fertileWindowStart = new Date(ovulationDate);
  fertileWindowStart.setDate(fertileWindowStart.getDate() - 5);
  
  const fertileWindowEnd = new Date(ovulationDate);
  
  return {
    method: 'cycle',
    ovulationDate: formatDate(ovulationDate),
    nextPeriodDate: formatDate(nextPeriodDate),
    fertileWindowStart: formatDate(fertileWindowStart),
    fertileWindowEnd: formatDate(fertileWindowEnd),
    confidence: 0.5, // 基础周期法置信度
  };
}

/**
 * 基于体温数据预测
 * @param {Array} records - 记录列表
 * @returns {Object|null} - 体温预测结果
 */
function predictByTemperature(records) {
  const temperatureRecords = records
    .filter(r => r.type === 'temperature' && r.value)
    .sort((a, b) => a.date.localeCompare(b.date));
  
  if (temperatureRecords.length < 20) {
    return null;
  }
  
  // 查找体温突然下降又上升的点（排卵信号）
  let ovulationSignal = null;
  
  for (let i = 2; i < temperatureRecords.length - 1; i++) {
    const prev = temperatureRecords[i - 1].value;
    const curr = temperatureRecords[i].value;
    const next = temperatureRecords[i + 1].value;
    
    // 体温突然上升（0.2度以上）通常是排卵后
    if (next - prev > 0.2 && curr < next) {
      ovulationSignal = temperatureRecords[i + 1].date;
      break;
    }
  }
  
  if (!ovulationSignal) {
    return null;
  }
  
  // 假设排卵发生在体温上升前1-2天
  const ovulationDate = new Date(ovulationSignal);
  ovulationDate.setDate(ovulationDate.getDate() - 1);
  
  const fertileWindowStart = new Date(ovulationDate);
  fertileWindowStart.setDate(fertileWindowStart.getDate() - 5);
  
  return {
    method: 'temperature',
    ovulationDate: formatDate(ovulationDate),
    fertileWindowStart: formatDate(fertileWindowStart),
    fertileWindowEnd: formatDate(ovulationDate),
    confidence: 0.8,
    temperatureRecords: temperatureRecords.length,
  };
}

/**
 * 基于排卵试纸数据预测
 * @param {Array} records - 记录列表
 * @returns {Object|null} - 试纸预测结果
 */
function predictByOvulationTest(records) {
  const testRecords = records
    .filter(r => r.type === 'ovulation')
    .sort((a, b) => a.date.localeCompare(b.date));
  
  // 查找强阳或排卵记录
  const positiveTests = testRecords.filter(
    r => r.value === '强阳性' || r.value === 'strong阳性' || r.value === '排卵'
  );
  
  if (positiveTests.length === 0) {
    // 查找弱阳
    const weakPositive = testRecords.find(r => r.value === '弱阳性' || r.value === 'weak阳性');
    if (!weakPositive) {
      return null;
    }
    
    return {
      method: 'ovulation_test',
      ovulationDate: weakPositive.date, // 弱阳当天算作接近排卵
      fertileWindowStart: weakPositive.date,
      fertileWindowEnd: formatDate(addDays(weakPositive.date, 1)),
      confidence: 0.7,
      testRecords: testRecords.length,
    };
  }
  
  // 强阳后24-48小时排卵
  const firstPositive = positiveTests[0];
  const ovulationDate = formatDate(addDays(firstPositive.date, 1));
  
  return {
    method: 'ovulation_test',
    ovulationDate,
    fertileWindowStart: firstPositive.date,
    fertileWindowEnd: ovulationDate,
    confidence: 0.95,
    testRecords: testRecords.length,
  };
}

/**
 * 综合预测 - 结合多种数据源
 * @param {Array} records - 记录列表
 * @returns {Object} - 综合预测结果
 */
function generatePrediction(records) {
  if (!records || records.length === 0) {
    return {
      hasData: false,
      message: '暂无数据，请先记录月经',
    };
  }
  
  const statistics = getCycleStatistics(records);
  
  // 获取各种预测结果
  const cyclePrediction = predictByCycle(statistics);
  const temperaturePrediction = predictByTemperature(records);
  const ovulationTestPrediction = predictByOvulationTest(records);
  
  // 选择最可靠的预测结果
  let bestPrediction = null;
  let confidence = 0;
  
  if (ovulationTestPrediction) {
    bestPrediction = ovulationTestPrediction;
    confidence = ovulationTestPrediction.confidence;
  } else if (temperaturePrediction) {
    bestPrediction = temperaturePrediction;
    confidence = temperaturePrediction.confidence;
  } else if (cyclePrediction) {
    bestPrediction = cyclePrediction;
    confidence = cyclePrediction.confidence;
  }
  
  if (!bestPrediction) {
    return {
      hasData: true,
      message: '数据不足，无法预测',
      statistics,
    };
  }
  
  // 计算易孕日和安全期
  const ovulationDate = new Date(bestPrediction.ovulationDate);
  const fertileWindowStart = new Date(bestPrediction.fertileWindowStart);
  const fertileWindowEnd = new Date(bestPrediction.fertileWindowEnd);
  
  // 安全期：月经结束后1-2天和排卵后
  const safePeriodAfter = new Date(fertileWindowEnd);
  safePeriodAfter.setDate(safePeriodAfter.getDate() + 1);
  
  const safePeriodBefore = new Date(ovulationDate);
  safePeriodBefore.setDate(safePeriodBefore.getDate() - 7);
  
  return {
    hasData: true,
    ...bestPrediction,
    statistics,
    confidence,
    // 预测可信度等级
    confidenceLevel: confidence >= 0.8 ? 'high' : confidence >= 0.5 ? 'medium' : 'low',
    // 备用预测（周期法）
    backupPrediction: cyclePrediction,
  };
}

/**
 * 获取指定日期的状态
 * @param {string} date - 日期 YYYY-MM-DD
 * @param {Object} prediction - 预测结果
 * @returns {string} - 状态: menstruation(月经期), fertile(易孕), ovulation(排卵), safe(安全), unknown
 */
function getDateStatus(date, prediction) {
  if (!prediction || !prediction.hasData) {
    return 'unknown';
  }
  
  const targetDate = new Date(date);
  
  // 检查是否是月经期（假设经期5-7天）
  if (prediction.statistics && prediction.statistics.lastPeriodDate) {
    const lastPeriod = new Date(prediction.statistics.lastPeriodDate);
    const periodLength = prediction.statistics.averagePeriodLength || 5;
    
    const periodEnd = new Date(lastPeriod);
    periodEnd.setDate(periodEnd.getDate() + periodLength);
    
    if (targetDate >= lastPeriod && targetDate <= periodEnd) {
      return 'menstruation';
    }
  }
  
  // 检查是否是易孕日
  if (prediction.fertileWindowStart && prediction.fertileWindowEnd) {
    const fertileStart = new Date(prediction.fertileWindowStart);
    const fertileEnd = new Date(prediction.fertileWindowEnd);
    
    if (targetDate >= fertileStart && targetDate <= fertileEnd) {
      // 精确检查是否是排卵日
      if (prediction.ovulationDate && date === prediction.ovulationDate) {
        return 'ovulation';
      }
      return 'fertile';
    }
  }
  
  // 检查是否是预测的下次月经
  if (prediction.nextPeriodDate) {
    const nextPeriod = new Date(prediction.nextPeriodDate);
    if (date === prediction.nextPeriodDate) {
      return 'menstruation';
    }
  }
  
  return 'safe';
}

/**
 * 获取预测可信度
 * @param {Array} records - 记录列表
 * @returns {Object} - 可信度信息
 */
function getPredictionConfidence(records) {
  const statistics = getCycleStatistics(records);
  
  const menstruationRecords = records.filter(r => r.type === 'menstruation' && r.isStart).length;
  const temperatureRecords = records.filter(r => r.type === 'temperature').length;
  const ovulationTestRecords = records.filter(r => r.type === 'ovulation').length;
  
  let confidence = 0;
  let factors = [];
  
  // 月经记录可信度
  if (menstruationRecords >= 3) {
    confidence += 0.3;
    factors.push('cycle');
  }
  
  // 体温记录可信度
  if (temperatureRecords >= 20) {
    confidence += 0.4;
    factors.push('temperature');
  }
  
  // 试纸记录可信度
  if (ovulationTestRecords >= 2) {
    confidence += 0.5;
    factors.push('ovulation_test');
  }
  
  return {
    confidence: Math.min(confidence, 1),
    level: confidence >= 0.8 ? 'high' : confidence >= 0.5 ? 'medium' : 'low',
    factors,
    dataCount: {
      menstruation: menstruationRecords,
      temperature: temperatureRecords,
      ovulationTest: ovulationTestRecords,
    },
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
 * 日期加N天
 */
function addDays(dateStr, days) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date;
}

module.exports = {
  getCycleStatistics,
  generatePrediction,
  getDateStatus,
  getPredictionConfidence,
  predictByCycle,
  predictByTemperature,
  predictByOvulationTest,
};
