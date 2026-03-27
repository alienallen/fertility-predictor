const express = require('express');
const router = express.Router();
const Period = require('../models/Period');
const authMiddleware = require('../middleware/auth');

// 应用认证中间件
router.use(authMiddleware);

// 获取经期记录列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const periods = await Period.find({ openid: req.openid })
      .sort({ start_date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Period.countDocuments({ openid: req.openid });

    res.json({
      periods,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch periods' });
  }
});

// 创建经期记录
router.post('/', async (req, res) => {
  try {
    const { start_date, end_date, cycle_length } = req.body;

    if (!start_date) {
      return res.status(400).json({ error: 'start_date is required' });
    }

    const period = new Period({
      openid: req.openid,
      start_date: new Date(start_date),
      end_date: end_date ? new Date(end_date) : null,
      cycle_length
    });

    await period.save();

    res.status(201).json({
      success: true,
      period
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create period' });
  }
});

// 更新经期记录
router.put('/:id', async (req, res) => {
  try {
    const { start_date, end_date, cycle_length } = req.body;

    const period = await Period.findOneAndUpdate(
      { _id: req.params.id, openid: req.openid },
      {
        ...(start_date && { start_date: new Date(start_date) }),
        ...(end_date && { end_date: new Date(end_date) }),
        ...(cycle_length && { cycle_length })
      },
      { new: true }
    );

    if (!period) {
      return res.status(404).json({ error: 'Period not found' });
    }

    res.json({ success: true, period });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update period' });
  }
});

// 删除经期记录
router.delete('/:id', async (req, res) => {
  try {
    const period = await Period.findOneAndDelete({
      _id: req.params.id,
      openid: req.openid
    });

    if (!period) {
      return res.status(404).json({ error: 'Period not found' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete period' });
  }
});

module.exports = router;