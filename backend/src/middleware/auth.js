/**
 * 认证中间件
 * 用于验证 JWT token
 */
const jwt = require('jsonwebtoken');
const { findUserById } = require('../utils/storage');

const JWT_SECRET = process.env.JWT_SECRET || 'fertility-app-jwt-secret-key';

/**
 * 生成 JWT token
 * @param {Object} user - 用户信息
 * @returns {string} - JWT token
 */
function generateToken(user) {
  const payload = {
    id: user.id,
    phone: user.phone,
    nickname: user.nickname,
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * 验证 JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} - 解码后的用户信息
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * 认证中间件 - 验证请求
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      message: '未授权，请先登录',
    });
  }
  
  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({
      code: 401,
      message: 'Token 已失效，请重新登录',
    });
  }
  
  // 查找用户确保用户存在
  const user = findUserById(decoded.id);
  if (!user) {
    return res.status(401).json({
      code: 401,
      message: '用户不存在',
    });
  }
  
  // 将用户信息挂载到请求对象
  req.user = {
    id: user.id,
    phone: user.phone,
    nickname: user.nickname,
  };
  
  next();
}

/**
 * 可选认证中间件 - 如果有 token 则验证，没有则跳过
 */
function optionalAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  
  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  
  if (decoded) {
    const user = findUserById(decoded.id);
    if (user) {
      req.user = {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
      };
    }
  }
  
  next();
}

module.exports = {
  generateToken,
  verifyToken,
  authMiddleware,
  optionalAuthMiddleware,
  JWT_SECRET,
};
