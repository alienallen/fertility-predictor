/**
 * 接好孕应用后端服务
 * Express 服务器入口
 */
const express = require('express');
const cors = require('cors');
const path = require('path');

// 路由
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');
const predictionRoutes = require('./routes/prediction');
const notificationRoutes = require('./routes/notification');

// 预测服务
const predictor = require('./services/predictor');

// 初始化 Express
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志中间件
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/prediction', predictionRoutes);
app.use('/api/notification', notificationRoutes);

// 预测相关路由（快捷方式）
app.use('/api', (req, res, next) => {
  // 如果访问 /api 且需要预测相关功能，转发
  next();
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在',
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║   接好孕应用后端服务已启动                        ║
║   服务端口: ${PORT}                                 ║
║   健康检查: http://localhost:${PORT}/health          ║
║   API 文档: http://localhost:${PORT}/api              ║
╚═══════════════════════════════════════════════════╝
  `);
});

module.exports = app;
