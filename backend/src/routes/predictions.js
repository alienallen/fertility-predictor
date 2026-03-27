const express = require('express');
const router = express.Router();
const predictionService = require('../services/prediction');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// 获取概率曲线
router.get('/probability-curve', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const result = await predictionService.generateProbabilityCurve(req.openid, parseInt(days));
    res.json(result);
  } catch (error) {
    console.error('Probability curve error:', error);
    res.status(500).json({ error: 'Failed to generate probability curve' });
  }
});

// 获取统计数据
router.get('/stats', async (req, res) => {
  try {
    const cycleStats = await predictionService.getCycleStats(req.openid);
    const curveData = await predictionService.generateProbabilityCurve(req.openid, 30);

    // 计算排卵倒计时
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ovulationDay = new Date(curveData.ovulation_day);
    const daysToOvulation = Math.round((ovulationDay - today) / (1000 * 60 * 60 * 24));

    res.json({
      cycle_stats: cycleStats,
      current_probability: curveData.current_probability,
      ovulation_day: curveData.ovulation_day,
      days_to_ovulation: daysToOvulation,
      fertility_window: curveData.fertility_window
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;