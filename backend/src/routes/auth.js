/**
 * 认证路由
 * 处理用户登录、注册、登出
 */
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { findUserByPhone, createUser, findUserById, updateUser, updateUserPassword } = require('../utils/storage');
const { hashPassword, verifyPassword } = require('../utils/crypto');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/register
 * 注册新用户
 */
router.post('/register', (req, res) => {
  try {
    const { phone, password, nickname } = req.body;
    
    // 验证必填字段
    if (!phone || !password) {
      return res.status(400).json({
        code: 400,
        message: '手机号和密码为必填项',
      });
    }
    
    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        code: 400,
        message: '手机号格式不正确',
      });
    }
    
    // 验证密码长度
    if (password.length < 6) {
      return res.status(400).json({
        code: 400,
        message: '密码长度不能少于6位',
      });
    }
    
    // 检查手机号是否已注册
    const existingUser = findUserByPhone(phone);
    if (existingUser) {
      return res.status(400).json({
        code: 400,
        message: '该手机号已注册',
      });
    }
    
    // 创建新用户
    const user = createUser({
      id: uuidv4(),
      phone,
      password: hashPassword(password),
      nickname: nickname || '接好孕用户',
      createdAt: new Date().toISOString(),
    });
    
    // 生成 token
    const token = generateToken(user);
    
    res.status(200).json({
      code: 0,
      message: '注册成功',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  }
});

/**
 * POST /api/auth/login
 * 用户登录
 */
router.post('/login', (req, res) => {
  try {
    const { phone, password } = req.body;
    
    // 验证必填字段
    if (!phone || !password) {
      return res.status(400).json({
        code: 400,
        message: '手机号和密码为必填项',
      });
    }
    
    // 查找用户
    const user = findUserByPhone(phone);
    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '手机号或密码错误',
      });
    }
    
    // 验证密码
    if (!verifyPassword(password, user.password)) {
      return res.status(401).json({
        code: 401,
        message: '手机号或密码错误',
      });
    }
    
    // 生成 token
    const token = generateToken(user);
    
    // 返回用户信息（不含密码）
    const { password: pwd, ...userInfo } = user;
    
    res.status(200).json({
      code: 0,
      message: '登录成功',
      data: {
        user: userInfo,
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  }
});

/**
 * GET /api/auth/profile
 * 获取当前用户信息
 */
router.get('/profile', require('../middleware/auth').authMiddleware, (req, res) => {
  try {
    const user = findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
      });
    }
    
    const { password, ...userInfo } = user;
    res.status(200).json({
      code: 0,
      data: userInfo,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  }
});

/**
 * PUT /api/auth/profile
 * 更新用户信息
 */
router.put('/profile', require('../middleware/auth').authMiddleware, (req, res) => {
  try {
    const { nickname, settings } = req.body;
    const updates = {};
    
    if (nickname) updates.nickname = nickname;
    if (settings) updates.settings = settings;
    
    const user = updateUser(req.user.id, updates);
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
      });
    }
    
    res.status(200).json({
      code: 0,
      message: '更新成功',
      data: user,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  }
});

/**
 * PUT /api/auth/password
 * 修改密码
 */
router.put('/password', require('../middleware/auth').authMiddleware, (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        code: 400,
        message: '旧密码和新密码为必填项',
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        code: 400,
        message: '新密码长度不能少于6位',
      });
    }
    
    const user = findUserById(req.user.id);
    if (!verifyPassword(oldPassword, user.password)) {
      return res.status(400).json({
        code: 400,
        message: '旧密码错误',
      });
    }
    
    const success = updateUserPassword(req.user.id, hashPassword(newPassword));
    if (!success) {
      return res.status(500).json({
        code: 500,
        message: '修改密码失败',
      });
    }
    
    res.status(200).json({
      code: 0,
      message: '密码修改成功',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  }
});

module.exports = router;
