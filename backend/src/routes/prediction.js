/**
 * 预测路由
 * 处理预测相关的 API
 */
const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { readUserData } = require('../utils/storage');
const predictor = require('../services/predictor');

const router = express.Router();

// 所有路由都需要认证
router.use(authMiddleware);

/**
 * GET /api/prediction
 * 获取当前预测结果
 */
router.get('/', (req, res) => {
  try {
    const data = readUserData(req.user.id) || { records: [] };
    const prediction = predictor.generatePrediction(data.records);
    
    res.status(200).json({
      code: 0,
      data: prediction,
    });
  } catch (error) {
    console.error('Get prediction error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  }
});

/**
 * GET /api/prediction/statistics
 * 获取周期统计信息
 */
router.get('/statistics', (req, res) => {
  try {
    const data = readUserData(req.user.id) || { records: [] };
    const statistics = predictor.getCycleStatistics(data.records);
    
    res.status(200).json({
      code: 0,
      data: statistics,
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  }
});

/**
 * GET /api/prediction/confidence
 * 获取预测可信度
 */
router.get('/confidence', (req, res) => {
  try {
    const data = readUserData(req.user.id) || { records: [] };
    const confidence = predictor.getPredictionConfidence(data.records);
    
    res.status(200).json({
      code: 0,
      data: confidence,
    });
  } catch (error) {
    console.error('Get confidence error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  }
});

/**
 * GET /api/prediction/date/:date/status
 * 获取指定日期的状态
 */
router.get('/date/:date/status', (req, res) => {
  try {
    const { date } = req.params;
    const data = readUserData(req.user.id) || { records: [] };
    const prediction = predictor.generatePrediction(data.records);
    const status = predictor.getDateStatus(date, prediction);
    
    res.status(200).json({
      code: 0,
      data: { date, status },
    });
  } catch (error) {
    console.error('Get date status error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  }
});

/**
 * GET /api/prediction/month/:year/:month
 * 获取指定月份的日历数据
 */
router.get('/month/:year/:month', (req, res) => {
  try {
    const { year, month } = req.params;
    const data = readUserData(req.user.id) || { records: [] };
    const prediction = predictor.generatePrediction(data.records);
    
    // 生成月份日历数据
    const daysInMonth = new Date(year, month, 0).getDate();
    const monthData = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const status = predictor.getDateStatus(dateStr, prediction);
      
      // 查找当天的记录
      const dayRecords = data.records.filter(r => r.date === dateStr);
      
      monthData.push({
        date: dateStr,
        status,
        records: dayRecords,
      });
    }
    
    res.status(200).json({
      code: 0,
      data: {
        year: parseInt(year),
        month: parseInt(month),
        days: monthData,
      },
    });
  } catch (error) {
    console.error('Get month data error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  }
});

module.exports = router;
