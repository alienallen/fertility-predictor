/**
 * 通知路由
 * 处理推送通知相关的 API
 */
const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const notificationService = require('../services/notification');
const { readUserData } = require('../utils/storage');
const predictor = require('../services/predictor');

const router = express.Router();

// 所有路由都需要认证
router.use(authMiddleware);

/**
 * POST /api/notification/send
 * 手动发送通知
 */
router.post('/send', async (req, res) => {
  try {
    const { type, title, content, scheduledTime } = req.body;
    
    if (!type || !title || !content) {
      return res.status(400).json({
        code: 400,
        message: '通知类型、标题和内容为必填项',
      });
    }
    
    const result = await notificationService.send({
      userId: req.user.id,
      type,
      title,
      content,
      scheduledTime,
    });
    
    res.status(200).json({
      code: 0,
      data: result,
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  }
});

/**
 * POST /api/notification/ovulation
 * 发送排卵日提醒
 */
router.post('/ovulation', async (req, res) => {
  try {
    const data = readUserData(req.user.id) || { records: [] };
    const prediction = predictor.generatePrediction(data.records);
    
    if (!prediction || !prediction.ovulationDate) {
      return res.status(400).json({
        code: 400,
        message: '暂无排卵预测数据',
      });
    }
    
    const result = await notificationService.sendOvulationReminder(
      req.user.id,
      prediction.ovulationDate
    );
    
    res.status(200).json({
      code: 0,
      data: result,
    });
  } catch (error) {
    console.error('Send ovulation reminder error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  }
});

/**
 * POST /api/notification/fertile
 * 发送易孕期提醒
 */
router.post('/fertile', async (req, res) => {
  try {
    const data = readUserData(req.user.id) || { records: [] };
    const prediction = predictor.generatePrediction(data.records);
    
    if (!prediction || !prediction.fertileWindowStart || !prediction.fertileWindowEnd) {
      return res.status(400).json({
        code: 400,
        message: '暂无预测数据',
      });
    }
    
    const result = await notificationService.sendFertileReminder(
      req.user.id,
      prediction.fertileWindowStart,
      prediction.fertileWindowEnd
    );
    
    res.status(200).json({
      code: 0,
      data: result,
    });
  } catch (error) {
    console.error('Send fertile reminder error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  }
});

/**
 * POST /api/notification/temperature
 * 发送体温测量提醒
 */
router.post('/temperature', async (req, res) => {
  try {
    const { time } = req.body;
    
    const result = await notificationService.sendTemperatureReminder(
      req.user.id,
      time
    );
    
    res.status(200).json({
      code: 0,
      data: result,
    });
  } catch (error) {
    console.error('Send temperature reminder error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  }
});

/**
 * POST /api/notification/ovulation-test
 * 发送排卵试纸检测提醒
 */
router.post('/ovulation-test', async (req, res) => {
  try {
    const { time } = req.body;
    
    const result = await notificationService.sendOvulationTestReminder(
      req.user.id,
      time
    );
    
    res.status(200).json({
      code: 0,
      data: result,
    });
  } catch (error) {
    console.error('Send ovulation test reminder error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  }
});

/**
 * GET /api/notification/history
 * 获取通知历史
 */
router.get('/history', (req, res) => {
  try {
    const notifications = notificationService.getUserNotifications(req.user.id);
    
    res.status(200).json({
      code: 0,
      data: notifications,
    });
  } catch (error) {
    console.error('Get notification history error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  }
});

/**
 * DELETE /api/notification/:id
 * 取消通知
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = notificationService.cancelNotification(id);
    
    res.status(200).json({
      code: 0,
      ...result,
    });
  } catch (error) {
    console.error('Cancel notification error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  }
});

module.exports = router;
