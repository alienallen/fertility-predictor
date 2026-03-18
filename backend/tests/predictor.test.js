/**
 * 预测算法测试用例
 */
const predictor = require('../src/services/predictor');

describe('预测算法测试', () => {
  describe('getCycleStatistics', () => {
    test('数据不足时返回默认统计', () => {
      const records = [];
      const stats = predictor.getCycleStatistics(records);
      
      expect(stats.averageCycle).toBe(28);
      expect(stats.averagePeriodLength).toBe(5);
      expect(stats.hasEnoughData).toBe(false);
    });

    test('单条月经记录时返回默认统计', () => {
      const records = [
        { type: 'menstruation', date: '2024-01-01', isStart: true }
      ];
      const stats = predictor.getCycleStatistics(records);
      
      expect(stats.averageCycle).toBe(28);
      expect(stats.hasEnoughData).toBe(false);
    });

    test('多条月经记录时正确计算平均周期', () => {
      const records = [
        { type: 'menstruation', date: '2024-01-01', isStart: true },
        { type: 'menstruation', date: '2024-01-29', isStart: true },
        { type: 'menstruation', date: '2024-02-26', isStart: true }
      ];
      const stats = predictor.getCycleStatistics(records);
      
      expect(stats.averageCycle).toBe(28);
      expect(stats.recordCount).toBe(3);
      expect(stats.hasEnoughData).toBe(true);
    });

    test('正确计算经期长度', () => {
      const records = [
        { type: 'menstruation', date: '2024-01-01', isStart: true },
        { type: 'menstruation', date: '2024-01-05', isEnd: true },
        { type: 'menstruation', date: '2024-01-29', isStart: true },
        { type: 'menstruation', date: '2024-02-02', isEnd: true }
      ];
      const stats = predictor.getCycleStatistics(records);
      
      expect(stats.averagePeriodLength).toBe(5);
    });
  });

  describe('generatePrediction', () => {
    test('无数据时返回提示信息', () => {
      const records = [];
      const prediction = predictor.generatePrediction(records);
      
      expect(prediction.hasData).toBe(false);
      expect(prediction.message).toBe('暂无数据，请先记录月经');
    });

    test('基于周期法预测排卵日', () => {
      const records = [
        { type: 'menstruation', date: '2024-01-01', isStart: true },
        { type: 'menstruation', date: '2024-01-29', isStart: true },
        { type: 'menstruation', date: '2024-02-26', isStart: true }
      ];
      const prediction = predictor.generatePrediction(records);
      
      expect(prediction.hasData).toBe(true);
      expect(prediction.ovulationDate).toBeDefined();
      expect(prediction.nextPeriodDate).toBeDefined();
      expect(prediction.method).toBe('cycle');
    });

    test('正确返回易孕窗口', () => {
      const records = [
        { type: 'menstruation', date: '2024-01-01', isStart: true },
        { type: 'menstruation', date: '2024-01-29', isStart: true }
      ];
      const prediction = predictor.generatePrediction(records);
      
      expect(prediction.fertileWindowStart).toBeDefined();
      expect(prediction.fertileWindowEnd).toBeDefined();
    });
  });

  describe('getDateStatus', () => {
    test('无数据时返回unknown', () => {
      const prediction = { hasData: false };
      const status = predictor.getDateStatus('2024-01-15', prediction);
      
      expect(status).toBe('unknown');
    });

    test('月经期返回menstruation', () => {
      const prediction = {
        hasData: true,
        statistics: {
          lastPeriodDate: '2024-01-01',
          averagePeriodLength: 5
        }
      };
      
      const status = predictor.getDateStatus('2024-01-03', prediction);
      expect(status).toBe('menstruation');
    });

    test('易孕日返回fertile', () => {
      const prediction = {
        hasData: true,
        fertileWindowStart: '2024-01-10',
        fertileWindowEnd: '2024-01-15',
        ovulationDate: '2024-01-15',
        statistics: {}
      };
      
      const status = predictor.getDateStatus('2024-01-12', prediction);
      expect(status).toBe('fertile');
    });

    test('排卵日返回ovulation', () => {
      const prediction = {
        hasData: true,
        fertileWindowStart: '2024-01-10',
        fertileWindowEnd: '2024-01-15',
        ovulationDate: '2024-01-15',
        statistics: {}
      };
      
      const status = predictor.getDateStatus('2024-01-15', prediction);
      expect(status).toBe('ovulation');
    });

    test('安全期返回safe', () => {
      const prediction = {
        hasData: true,
        fertileWindowStart: '2024-01-10',
        fertileWindowEnd: '2024-01-15',
        ovulationDate: '2024-01-15',
        statistics: {}
      };
      
      const status = predictor.getDateStatus('2024-01-20', prediction);
      expect(status).toBe('safe');
    });
  });

  describe('getPredictionConfidence', () => {
    test('无数据时返回低可信度', () => {
      const records = [];
      const confidence = predictor.getPredictionConfidence(records);
      
      expect(confidence.confidence).toBe(0);
      expect(confidence.level).toBe('low');
    });

    test('3条以上月经记录时增加可信度', () => {
      const records = [
        { type: 'menstruation', date: '2024-01-01', isStart: true },
        { type: 'menstruation', date: '2024-01-29', isStart: true },
        { type: 'menstruation', date: '2024-02-26', isStart: true },
        { type: 'menstruation', date: '2024-03-25', isStart: true }
      ];
      const confidence = predictor.getPredictionConfidence(records);
      
      expect(confidence.confidence).toBeGreaterThan(0);
      expect(confidence.factors).toContain('cycle');
    });

    test('20条以上体温记录时增加可信度', () => {
      const records = Array.from({ length: 25 }, (_, i) => ({
        type: 'temperature',
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        value: 36.5 + Math.random() * 0.5
      }));
      const confidence = predictor.getPredictionConfidence(records);
      
      expect(confidence.factors).toContain('temperature');
    });

    test('2条以上试纸记录时增加可信度', () => {
      const records = [
        { type: 'ovulation', date: '2024-01-10', value: '弱阳性' },
        { type: 'ovulation', date: '2024-01-11', value: '强阳性' }
      ];
      const confidence = predictor.getPredictionConfidence(records);
      
      expect(confidence.factors).toContain('ovulation_test');
    });
  });

  describe('predictByOvulationTest', () => {
    test('弱阳时返回预测结果', () => {
      const records = [
        { type: 'ovulation', date: '2024-01-10', value: '弱阳性' }
      ];
      const result = predictor.predictByOvulationTest(records);
      
      expect(result).not.toBeNull();
      expect(result.method).toBe('ovulation_test');
      expect(result.confidence).toBe(0.7);
    });

    test('强阳时返回高可信度预测', () => {
      const records = [
        { type: 'ovulation', date: '2024-01-10', value: '强阳性' }
      ];
      const result = predictor.predictByOvulationTest(records);
      
      expect(result).not.toBeNull();
      expect(result.confidence).toBe(0.95);
    });

    test('无试纸记录时返回null', () => {
      const records = [];
      const result = predictor.predictByOvulationTest(records);
      
      expect(result).toBeNull();
    });
  });
});
