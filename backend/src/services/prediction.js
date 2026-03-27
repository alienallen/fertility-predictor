const Period = require('../models/Period');
const Temperature = require('../models/Temperature');
const OvulationTest = require('../models/OvulationTest');
const IntercourseRecord = require('../models/IntercourseRecord');

/**
 * 预测服务 - 多数据源综合计算
 */

// 周期法基础计算
function calculateOvulationDayByCycle(lastPeriodStart, cycleLength = 28) {
  const ovulationDay = new Date(lastPeriodStart);
  ovulationDay.setDate(ovulationDay.getDate() + cycleLength - 14);
  return ovulationDay;
}

// 根据体温检测排卵日
function detectOvulationDayByTemperature(temperatures) {
  if (!temperatures || temperatures.length < 2) return null;

  const sorted = [...temperatures].sort((a, b) =>
    new Date(a.record_date) - new Date(b.record_date)
  );

  for (let i = 1; i < sorted.length; i++) {
    const diff = sorted[i].temperature - sorted[i - 1].temperature;
    if (diff >= 0.3) {
      // 体温升高超过0.3度，排卵日 = 升温日开始 + 1天
      const ovulationDay = new Date(sorted[i].record_date);
      ovulationDay.setDate(ovulationDay.getDate() + 1);
      return ovulationDay;
    }
  }

  return null;
}

// 根据试纸检测结果
function detectOvulationDayByTest(ovulationTests) {
  if (!ovulationTests || ovulationTests.length === 0) return null;

  const sorted = [...ovulationTests].sort((a, b) =>
    new Date(b.test_date) - new Date(a.test_date)
  );

  // 优先查找"已排卵"结果
  const ovulated = sorted.find(t => t.result === 3);
  if (ovulated) {
    return new Date(ovulated.test_date);
  }

  // 查找"强阳"结果
  const strongPositive = sorted.find(t => t.result === 2);
  if (strongPositive) {
    return new Date(strongPositive.test_date);
  }

  return null;
}

// 获取最佳受孕窗口
function getFertilityWindow(ovulationDay) {
  const window = {
    start: new Date(ovulationDay),
    end: new Date(ovulationDay)
  };

  window.start.setDate(window.start.getDate() - 5); // 排卵前5天
  window.end.setDate(window.end.getDate() + 1);     // 排卵后1天

  return window;
}

// 计算某日的基础概率（基于距离排卵日的天数）
function getBaseProbability(daysFromOvulation) {
  if (daysFromOvulation < -5) return 0;
  if (daysFromOvulation === -5) return 0.20;
  if (daysFromOvulation === -4) return 0.25;
  if (daysFromOvulation === -3) return 0.40;
  if (daysFromOvulation === -2) return 0.45;
  if (daysFromOvulation === -1) return 0.50;
  if (daysFromOvulation === 0) return 0.60;
  if (daysFromOvulation === 1) return 0.30;
  if (daysFromOvulation === 2) return 0.10;
  return 0;
}

// 计算同房记录置信因子
function calculateIntercourseConfidence(intercourseRecords, fertilityWindow) {
  if (!intercourseRecords || intercourseRecords.length === 0) return 0;

  const hasIntercourseInWindow = intercourseRecords.some(record => {
    const recordDate = new Date(record.record_date);
    return recordDate >= fertilityWindow.start && recordDate <= fertilityWindow.end;
  });

  const hasAnyIntercourse = intercourseRecords.length > 0;

  if (hasIntercourseInWindow) return 0.20;
  if (hasAnyIntercourse) return 0.05;
  return 0;
}

// 主预测函数 - 生成30天概率曲线
async function generateProbabilityCurve(openid, days = 30) {
  // 获取数据
  const periods = await Period.find({ openid }).sort({ start_date: -1 }).limit(12);
  const temperatures = await Temperature.find({ openid }).sort({ record_date: -1 }).limit(30);
  const ovulationTests = await OvulationTest.find({ openid }).sort({ test_date: -1 });
  const intercourseRecords = await IntercourseRecord.find({ openid }).sort({ record_date: -1 });

  // 获取用户周期设置
  const user = await require('../models/User').findOne({ openid });
  const cycleLength = user?.cycle_length || 28;
  const periodLength = user?.period_length || 5;

  // 确定基准排卵日（优先级：试纸 > 体温 > 周期法）
  let ovulationDay = null;
  let ovulationSource = 'cycle';

  // 1. 试纸优先
  const testOvulationDay = detectOvulationDayByTest(ovulationTests);
  if (testOvulationDay) {
    ovulationDay = testOvulationDay;
    ovulationSource = 'test';
  }

  // 2. 体温辅助
  const tempOvulationDay = detectOvulationDayByTemperature(temperatures);
  if (tempOvulationDay && !ovulationDay) {
    ovulationDay = tempOvulationDay;
    ovulationSource = 'temperature';
  }

  // 3. 纯周期法
  if (!ovulationDay && periods.length > 0) {
    const lastPeriodStart = new Date(periods[0].start_date);
    ovulationDay = calculateOvulationDayByCycle(lastPeriodStart, cycleLength);
  }

  // 如果没有任何数据，使用默认值
  if (!ovulationDay) {
    ovulationDay = new Date();
    ovulationDay.setDate(ovulationDay.getDate() + 14); // 默认14天后排卵
  }

  // 计算易孕窗口
  const fertilityWindow = getFertilityWindow(ovulationDay);

  // 计算同房置信因子
  const intercourseConfidence = calculateIntercourseConfidence(intercourseRecords, fertilityWindow);

  // 生成30天概率数据
  const curveData = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    const daysFromOvulation = Math.round((date - ovulationDay) / (1000 * 60 * 60 * 24));

    let probability = getBaseProbability(daysFromOvulation);

    // 试纸修正
    if (ovulationSource === 'test') {
      const dayTest = ovulationTests.find(t => {
        const testDate = new Date(t.test_date);
        return testDate.toDateString() === date.toDateString();
      });

      if (dayTest) {
        if (dayTest.result === 3) probability = 1.0;       // 已排卵
        else if (dayTest.result === 2) probability = 0.8; // 强阳
        else if (dayTest.result === 1) probability = 0.5;  // 弱阳
        else probability = 0.2;                           // 阴性
      }
    }

    // 体温修正
    if (ovulationSource === 'temperature' && daysFromOvulation >= 0) {
      probability = probability * 0.8; // 体温确认后概率下降更快
    }

    // 应用置信因子
    probability = Math.min(1, probability + intercourseConfidence);

    curveData.push({
      date: date.toISOString().split('T')[0],
      probability: Math.round(probability * 100),
      days_from_ovulation: daysFromOvulation,
      is_ovulation_day: daysFromOvulation === 0,
      is_in_fertility_window: date >= fertilityWindow.start && date <= fertilityWindow.end
    });
  }

  // 计算下次月经预计日期
  const nextPeriodDate = new Date(ovulationDay);
  nextPeriodDate.setDate(nextPeriodDate.getDate() + 14);

  return {
    curve_data: curveData,
    ovulation_day: ovulationDay.toISOString().split('T')[0],
    ovulation_source: ovulationSource,
    next_period_date: nextPeriodDate.toISOString().split('T')[0],
    fertility_window: {
      start: fertilityWindow.start.toISOString().split('T')[0],
      end: fertilityWindow.end.toISOString().split('T')[0]
    },
    current_probability: curveData[0]?.probability || 0
  };
}

// 获取周期统计
async function getCycleStats(openid) {
  const periods = await Period.find({ openid }).sort({ start_date: -1 }).limit(24);

  if (periods.length < 2) {
    return {
      average_cycle_length: 28,
      longest_cycle_length: 28,
      shortest_cycle_length: 28,
      period_count: periods.length,
      has_enough_data: false
    };
  }

  // 计算周期长度
  const cycleLengths = [];
  for (let i = 0; i < periods.length - 1; i++) {
    const current = new Date(periods[i].start_date);
    const next = new Date(periods[i + 1].start_date);
    const days = Math.round((current - next) / (1000 * 60 * 60 * 24));
    if (days > 15 && days < 60) { // 过滤异常值
      cycleLengths.push(days);
    }
  }

  if (cycleLengths.length === 0) {
    return {
      average_cycle_length: 28,
      longest_cycle_length: 28,
      shortest_cycle_length: 28,
      period_count: periods.length,
      has_enough_data: false
    };
  }

  return {
    average_cycle_length: Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length),
    longest_cycle_length: Math.max(...cycleLengths),
    shortest_cycle_length: Math.min(...cycleLengths),
    period_count: periods.length,
    has_enough_data: true
  };
}

module.exports = {
  generateProbabilityCurve,
  getCycleStats,
  calculateOvulationDayByCycle,
  getFertilityWindow,
  getBaseProbability
};