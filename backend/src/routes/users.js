const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// 获取当前用户信息
router.get('/me', async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        openid: req.user.openid,
        cycle_length: req.user.cycle_length,
        period_length: req.user.period_length,
        created_at: req.user.created_at,
        updated_at: req.user.updated_at
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// 更新用户设置
router.put('/me', async (req, res) => {
  try {
    const { cycle_length, period_length } = req.body;

    const user = await User.findOneAndUpdate(
      { openid: req.openid },
      {
        ...(cycle_length && { cycle_length: parseInt(cycle_length) }),
        ...(period_length && { period_length: parseInt(period_length) })
      },
      { new: true }
    );

    res.json({
      success: true,
      user: {
        id: user._id,
        openid: user.openid,
        cycle_length: user.cycle_length,
        period_length: user.period_length
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

module.exports = router;
