const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 微信登录
router.post('/login', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    // 实际项目中通过 code2Session 获取 openid
    // 这里简化处理，假设传入的就是 openid
    const openid = code; // 临时：直接使用 code 作为 openid

    // 查找或创建用户
    let user = await User.findOne({ openid });

    if (!user) {
      user = new User({
        openid,
        cycle_length: 28,
        period_length: 5
      });
      await user.save();
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        openid: user.openid,
        cycle_length: user.cycle_length,
        period_length: user.period_length,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;