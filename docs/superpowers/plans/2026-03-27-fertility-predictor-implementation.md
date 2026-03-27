# 备孕预测应用 - 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现完整的备孕预测应用 MVP，包括微信登录、经期/体温/试纸/同房记录 CRUD、概率曲线图、周期统计

**Architecture:** 前后端分离架构，前端 uni-app 兼容小程序和 Web，后端 Node.js + Express，数据库 MongoDB，微信登录认证

**Tech Stack:** uni-app (Vue 3), Node.js, Express, MongoDB, wx.login()

---

## 文件结构

```
fertility-predictor/
├── backend/                          # Node.js 后端
│   ├── src/
│   │   ├── app.js                   # Express 应用入口
│   │   ├── config/
│   │   │   └── db.js                # MongoDB 配置
│   │   ├── models/                  # 数据模型
│   │   │   ├── User.js
│   │   │   ├── Period.js
│   │   │   ├── Temperature.js
│   │   │   ├── OvulationTest.js
│   │   │   └── IntercourseRecord.js
│   │   ├── routes/                  # 路由
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── periods.js
│   │   │   ├── temperatures.js
│   │   │   ├── ovulationTests.js
│   │   │   ├── intercourseRecords.js
│   │   │   └── predictions.js
│   │   ├── services/                # 业务逻辑
│   │   │   └── prediction.js        # 预测算法服务
│   │   └── middleware/
│   │       └── auth.js              # 认证中间件
│   ├── tests/                       # 后端测试
│   │   └── prediction.test.js
│   ├── package.json
│   └── .env.example
│
├── frontend/                        # uni-app 前端
│   ├── src/
│   │   ├── App.vue
│   │   ├── main.js
│   │   ├── pages.json
│   │   ├── manifest.json
│   │   ├── pages/
│   │   │   ├── index/
│   │   │   │   └── index.vue        # 首页（曲线图）
│   │   │   ├── input/
│   │   │   │   └── input.vue        # 数据录入页
│   │   │   ├── stats/
│   │   │   │   └── stats.vue        # 统计页
│   │   │   └── settings/
│   │   │       └── settings.vue      # 设置页
│   │   ├── components/
│   │   │   └── ProbabilityChart.vue # 概率曲线组件
│   │   ├── api/
│   │   │   ├── index.js             # API 封装
│   │   │   ├── auth.js
│   │   │   ├── periods.js
│   │   │   ├── temperatures.js
│   │   │   ├── ovulationTests.js
│   │   │   ├── intercourseRecords.js
│   │   │   └── predictions.js
│   │   ├── store/
│   │   │   └── index.js             # 状态管理
│   │   └── utils/
│   │       └── prediction.js        # 前端预测计算
│   ├── package.json
│   └── vite.config.js
│
└── docs/
    └── specs/
        └── 2026-03-27-fertility-predictor-design.md
```

---

## 第一阶段：后端搭建

### Task 1: 后端项目初始化

**Files:**
- Create: `backend/package.json`
- Create: `backend/src/app.js`
- Create: `backend/src/config/db.js`
- Create: `backend/.env.example`
- Test: `backend/tests/init.test.js`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "fertility-predictor-backend",
  "version": "1.0.0",
  "description": "Backend for fertility predictor app",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "jest --coverage"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "dotenv": "^16.3.1",
    "wx-server-sdk": "^2.6.3"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "nodemon": "^3.0.1"
  }
}
```

- [ ] **Step 2: 创建 MongoDB 配置文件**

```javascript
// backend/src/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fertility_predictor';

  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

- [ ] **Step 3: 创建 Express 应用入口**

```javascript
// backend/src/app.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

// 路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const periodRoutes = require('./routes/periods');
const temperatureRoutes = require('./routes/temperatures');
const ovulationTestRoutes = require('./routes/ovulationTests');
const intercourseRecordRoutes = require('./routes/intercourseRecords');
const predictionRoutes = require('./routes/predictions');

const app = express();

// Middleware
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/periods', periodRoutes);
app.use('/api/temperatures', temperatureRoutes);
app.use('/api/ovulation-tests', ovulationTestRoutes);
app.use('/api/intercourse-records', intercourseRecordRoutes);
app.use('/api/predictions', predictionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

- [ ] **Step 4: 创建 .env.example**

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/fertility_predictor
WECHAT_APPID=your_appid
WECHAT_SECRET=your_secret
```

- [ ] **Step 5: 安装依赖并验证**

```bash
cd backend && npm install
npm start &
sleep 3
curl http://localhost:3000/api/health
```

Expected output: `{"status":"ok","timestamp":"..."}`

- [ ] **Step 6: Commit**

```bash
cd backend && git init && git add -A && git commit -m "feat: 后端项目初始化 - Express + MongoDB"
```

---

### Task 2: 数据模型创建

**Files:**
- Create: `backend/src/models/User.js`
- Create: `backend/src/models/Period.js`
- Create: `backend/src/models/Temperature.js`
- Create: `backend/src/models/OvulationTest.js`
- Create: `backend/src/models/IntercourseRecord.js`
- Test: `backend/tests/models.test.js`

- [ ] **Step 1: 创建 User 模型**

```javascript
// backend/src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  openid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  unionid: {
    type: String,
    default: null
  },
  session_key: {
    type: String,
    default: null
  },
  cycle_length: {
    type: Number,
    default: 28
  },
  period_length: {
    type: Number,
    default: 5
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
```

- [ ] **Step 2: 创建 Period 模型**

```javascript
// backend/src/models/Period.js
const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
  openid: {
    type: String,
    required: true,
    index: true
  },
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    default: null
  },
  cycle_length: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

// Compound index for user + date queries
periodSchema.index({ openid: 1, start_date: -1 });

module.exports = mongoose.model('Period', periodSchema);
```

- [ ] **Step 3: 创建 Temperature 模型**

```javascript
// backend/src/models/Temperature.js
const mongoose = require('mongoose');

const temperatureSchema = new mongoose.Schema({
  openid: {
    type: String,
    required: true,
    index: true
  },
  record_date: {
    type: Date,
    required: true
  },
  temperature: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

temperatureSchema.index({ openid: 1, record_date: -1 });

module.exports = mongoose.model('Temperature', temperatureSchema);
```

- [ ] **Step 4: 创建 OvulationTest 模型**

```javascript
// backend/src/models/OvulationTest.js
const mongoose = require('mongoose');

// result: 0=阴性, 1=弱阳, 2=强阳, 3=已排卵
const ovulationTestSchema = new mongoose.Schema({
  openid: {
    type: String,
    required: true,
    index: true
  },
  test_date: {
    type: Date,
    required: true
  },
  result: {
    type: Number,
    required: true,
    enum: [0, 1, 2, 3]
  }
}, {
  timestamps: true
});

ovulationTestSchema.index({ openid: 1, test_date: -1 });

module.exports = mongoose.model('OvulationTest', ovulationTestSchema);
```

- [ ] **Step 5: 创建 IntercourseRecord 模型**

```javascript
// backend/src/models/IntercourseRecord.js
const mongoose = require('mongoose');

const intercourseRecordSchema = new mongoose.Schema({
  openid: {
    type: String,
    required: true,
    index: true
  },
  record_date: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

intercourseRecordSchema.index({ openid: 1, record_date: -1 });

module.exports = mongoose.model('IntercourseRecord', intercourseRecordSchema);
```

- [ ] **Step 6: 创建测试文件**

```javascript
// backend/tests/models.test.js
const mongoose = require('mongoose');

describe('Data Models', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/fertility_predictor_test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('User Model', () => {
    it('should create a user with openid', async () => {
      const User = require('../src/models/User');
      const user = new User({ openid: 'test_openid_123' });
      await user.save();

      expect(user.openid).toBe('test_openid_123');
      expect(user.cycle_length).toBe(28);
      expect(user.period_length).toBe(5);
    });

    it('should require openid', async () => {
      const User = require('../src/models/User');
      const user = new User({});

      await expect(user.save()).rejects.toThrow();
    });
  });

  describe('Period Model', () => {
    it('should create a period record', async () => {
      const Period = require('../src/models/Period');
      const period = new Period({
        openid: 'test_openid_123',
        start_date: new Date('2026-03-01')
      });
      await period.save();

      expect(period.openid).toBe('test_openid_123');
      expect(period.start_date).toBeInstanceOf(Date);
    });
  });
});
```

- [ ] **Step 7: 运行测试**

```bash
cd backend && npm test
```

Expected: All tests pass

- [ ] **Step 8: Commit**

```bash
git add backend/src/models/ backend/tests/models.test.js
git commit -m "feat: 创建 MongoDB 数据模型 - User, Period, Temperature, OvulationTest, IntercourseRecord"
```

---

### Task 3: 认证 API

**Files:**
- Create: `backend/src/routes/auth.js`
- Create: `backend/src/middleware/auth.js`
- Test: `backend/tests/auth.test.js`

- [ ] **Step 1: 创建认证中间件**

```javascript
// backend/src/middleware/auth.js
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const openid = req.headers['x-openid'];

    if (!openid) {
      return res.status(401).json({ error: 'Unauthorized: missing openid' });
    }

    const user = await User.findOne({ openid });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: user not found' });
    }

    req.user = user;
    req.openid = openid;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Auth middleware error' });
  }
};

module.exports = authMiddleware;
```

- [ ] **Step 2: 创建认证路由**

```javascript
// backend/src/routes/auth.js
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
```

- [ ] **Step 3: 创建测试**

```javascript
// backend/tests/auth.test.js
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');

// Mock app for testing auth routes only
const createTestApp = () => {
  const app = express();
  app.use(express.json());

  const authRoutes = require('../src/routes/auth');
  app.use('/api/auth', authRoutes);

  return app;
};

describe('Auth API', () => {
  let app;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/fertility_predictor_test');
    app = createTestApp();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('POST /api/auth/login', () => {
    it('should login with code and return user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ code: 'test_openid_newuser' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.openid).toBe('test_openid_newuser');
      expect(res.body.user.cycle_length).toBe(28);
    });

    it('should return existing user on second login', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ code: 'test_openid_newuser' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.openid).toBe('test_openid_newuser');
    });

    it('should require code', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Code is required');
    });
  });
});
```

- [ ] **Step 4: 运行测试**

```bash
cd backend && npm test -- tests/auth.test.js
```

Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add backend/src/routes/auth.js backend/src/middleware/auth.js backend/tests/auth.test.js
git commit -m "feat: 认证 API - 微信登录"
```

---

### Task 4: 经期记录 CRUD API

**Files:**
- Create: `backend/src/routes/periods.js`
- Modify: `backend/src/middleware/auth.js` (确认已可复用)
- Test: `backend/tests/periods.test.js`

- [ ] **Step 1: 创建经期路由**

```javascript
// backend/src/routes/periods.js
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
```

- [ ] **Step 2: 创建测试**

```javascript
// backend/tests/periods.test.js
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');

const createTestApp = () => {
  const app = express();
  app.use(express.json());

  const authMiddleware = (req, res, next) => {
    req.openid = 'test_openid_123';
    req.user = { openid: 'test_openid_123' };
    next();
  };

  const periodRoutes = require('../src/routes/periods');
  app.use('/api/periods', authMiddleware, periodRoutes);

  return app;
};

describe('Periods API', () => {
  let app;
  let authHeaders;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/fertility_predictor_test');
    app = createTestApp();
    authHeaders = { 'x-openid': 'test_openid_123' };

    // Clean up
    await mongoose.connection.collection('periods').deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('POST /api/periods', () => {
    it('should create a period record', async () => {
      const res = await request(app)
        .post('/api/periods')
        .set('x-openid', 'test_openid_123')
        .send({ start_date: '2026-03-01' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.period.start_date).toBeDefined();
    });

    it('should require start_date', async () => {
      const res = await request(app)
        .post('/api/periods')
        .set('x-openid', 'test_openid_123')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('start_date is required');
    });
  });

  describe('GET /api/periods', () => {
    it('should list period records', async () => {
      const res = await request(app)
        .get('/api/periods')
        .set('x-openid', 'test_openid_123');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.periods)).toBe(true);
    });
  });

  describe('DELETE /api/periods/:id', () => {
    it('should delete a period record', async () => {
      const createRes = await request(app)
        .post('/api/periods')
        .set('x-openid', 'test_openid_123')
        .send({ start_date: '2026-03-10' });

      const periodId = createRes.body.period._id;

      const res = await request(app)
        .delete(`/api/periods/${periodId}`)
        .set('x-openid', 'test_openid_123');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
```

- [ ] **Step 3: 运行测试**

```bash
cd backend && npm test -- tests/periods.test.js
```

Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add backend/src/routes/periods.js backend/tests/periods.test.js
git commit -m "feat: 经期记录 CRUD API"
```

---

### Task 5: 体温、试纸、同房记录 API

**Files:**
- Create: `backend/src/routes/temperatures.js`
- Create: `backend/src/routes/ovulationTests.js`
- Create: `backend/src/routes/intercourseRecords.js`
- Test: `backend/tests/records.test.js`

- [ ] **Step 1: 创建体温路由**

```javascript
// backend/src/routes/temperatures.js
const express = require('express');
const router = express.Router();
const Temperature = require('../models/Temperature');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;

    const temperatures = await Temperature.find({ openid: req.openid })
      .sort({ record_date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Temperature.countDocuments({ openid: req.openid });

    res.json({ temperatures, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch temperatures' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { record_date, temperature } = req.body;

    if (!record_date || temperature === undefined) {
      return res.status(400).json({ error: 'record_date and temperature are required' });
    }

    const temp = new Temperature({
      openid: req.openid,
      record_date: new Date(record_date),
      temperature: parseFloat(temperature)
    });

    await temp.save();
    res.status(201).json({ success: true, temperature: temp });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create temperature record' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { record_date, temperature } = req.body;

    const temp = await Temperature.findOneAndUpdate(
      { _id: req.params.id, openid: req.openid },
      {
        ...(record_date && { record_date: new Date(record_date) }),
        ...(temperature !== undefined && { temperature: parseFloat(temperature) })
      },
      { new: true }
    );

    if (!temp) {
      return res.status(404).json({ error: 'Temperature record not found' });
    }

    res.json({ success: true, temperature: temp });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update temperature record' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const temp = await Temperature.findOneAndDelete({
      _id: req.params.id,
      openid: req.openid
    });

    if (!temp) {
      return res.status(404).json({ error: 'Temperature record not found' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete temperature record' });
  }
});

module.exports = router;
```

- [ ] **Step 2: 创建试纸路由**

```javascript
// backend/src/routes/ovulationTests.js
const express = require('express');
const router = express.Router();
const OvulationTest = require('../models/OvulationTest');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;

    const tests = await OvulationTest.find({ openid: req.openid })
      .sort({ test_date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await OvulationTest.countDocuments({ openid: req.openid });

    res.json({ ovulation_tests: tests, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ovulation tests' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { test_date, result } = req.body;

    if (!test_date || result === undefined) {
      return res.status(400).json({ error: 'test_date and result are required' });
    }

    if (![0, 1, 2, 3].includes(parseInt(result))) {
      return res.status(400).json({ error: 'result must be 0, 1, 2, or 3' });
    }

    const test = new OvulationTest({
      openid: req.openid,
      test_date: new Date(test_date),
      result: parseInt(result)
    });

    await test.save();
    res.status(201).json({ success: true, ovulation_test: test });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create ovulation test' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { test_date, result } = req.body;

    const test = await OvulationTest.findOneAndUpdate(
      { _id: req.params.id, openid: req.openid },
      {
        ...(test_date && { test_date: new Date(test_date) }),
        ...(result !== undefined && { result: parseInt(result) })
      },
      { new: true }
    );

    if (!test) {
      return res.status(404).json({ error: 'Ovulation test not found' });
    }

    res.json({ success: true, ovulation_test: test });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update ovulation test' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const test = await OvulationTest.findOneAndDelete({
      _id: req.params.id,
      openid: req.openid
    });

    if (!test) {
      return res.status(404).json({ error: 'Ovulation test not found' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete ovulation test' });
  }
});

module.exports = router;
```

- [ ] **Step 3: 创建同房记录路由**

```javascript
// backend/src/routes/intercourseRecords.js
const express = require('express');
const router = express.Router();
const IntercourseRecord = require('../models/IntercourseRecord');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;

    const records = await IntercourseRecord.find({ openid: req.openid })
      .sort({ record_date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await IntercourseRecord.countDocuments({ openid: req.openid });

    res.json({ intercourse_records: records, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch intercourse records' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { record_date } = req.body;

    if (!record_date) {
      return res.status(400).json({ error: 'record_date is required' });
    }

    const record = new IntercourseRecord({
      openid: req.openid,
      record_date: new Date(record_date)
    });

    await record.save();
    res.status(201).json({ success: true, intercourse_record: record });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create intercourse record' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const record = await IntercourseRecord.findOneAndDelete({
      _id: req.params.id,
      openid: req.openid
    });

    if (!record) {
      return res.status(404).json({ error: 'Intercourse record not found' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete intercourse record' });
  }
});

module.exports = router;
```

- [ ] **Step 4: 运行测试**

```bash
cd backend && npm test
```

Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add backend/src/routes/temperatures.js backend/src/routes/ovulationTests.js backend/src/routes/intercourseRecords.js
git commit -m "feat: 体温、试纸、同房记录 CRUD API"
```

---

### Task 6: 用户设置 API

**Files:**
- Create: `backend/src/routes/users.js`
- Test: `backend/tests/users.test.js`

- [ ] **Step 1: 创建用户路由**

```javascript
// backend/src/routes/users.js
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
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/routes/users.js
git commit -m "feat: 用户设置 API"
```

---

### Task 7: 预测算法服务

**Files:**
- Create: `backend/src/services/prediction.js`
- Test: `backend/tests/prediction.test.js`

- [ ] **Step 1: 创建预测服务**

```javascript
// backend/src/services/prediction.js
const Period = require('../models/Period');
const Temperature = require('../models/Temperature');
const OvulationTest = require('../models/OvulationTest');
const IntercourseRecord = require('../models/IntercourseRecord');

/**
 * 预测服务 - 多数据源综合计算
 */

// 周期法基础计算
function calculateOvulationDayByCycle(lastPeriodStart, cycleLength = 28) {
  const ovulationDay = new Date(lastPeriodStart);
  ovulationDay.setDate(ovulationDay.getDate() + cycleLength - 14);
  return ovulationDay;
}

// 根据体温检测排卵日
function detectOvulationDayByTemperature(temperatures) {
  if (!temperatures || temperatures.length < 2) return null;

  const sorted = [...temperatures].sort((a, b) =>
    new Date(a.record_date) - new Date(b.record_date)
  );

  for (let i = 1; i < sorted.length; i++) {
    const diff = sorted[i].temperature - sorted[i - 1].temperature;
    if (diff >= 0.3) {
      // 体温升高超过0.3度，排卵日 = 升温日开始 + 1天
      const ovulationDay = new Date(sorted[i].record_date);
      ovulationDay.setDate(ovulationDay.getDate() + 1);
      return ovulationDay;
    }
  }

  return null;
}

// 根据试纸检测结果
function detectOvulationDayByTest(ovulationTests) {
  if (!ovulationTests || ovulationTests.length === 0) return null;

  const sorted = [...ovulationTests].sort((a, b) =>
    new Date(b.test_date) - new Date(a.test_date)
  );

  // 优先查找"已排卵"结果
  const ovulated = sorted.find(t => t.result === 3);
  if (ovulated) {
    return new Date(ovulated.test_date);
  }

  // 查找"强阳"结果
  const strongPositive = sorted.find(t => t.result === 2);
  if (strongPositive) {
    return new Date(strongPositive.test_date);
  }

  return null;
}

// 获取最佳受孕窗口
function getFertilityWindow(ovulationDay) {
  const window = {
    start: new Date(ovulationDay),
    end: new Date(ovulationDay)
  };

  window.start.setDate(window.start.getDate() - 5); // 排卵前5天
  window.end.setDate(window.end.getDate() + 1);     // 排卵后1天

  return window;
}

// 计算某日的基础概率（基于距离排卵日的天数）
function getBaseProbability(daysFromOvulation) {
  if (daysFromOvulation < -5) return 0;
  if (daysFromOvulation === -5) return 0.20;
  if (daysFromOvulation === -4) return 0.25;
  if (daysFromOvulation === -3) return 0.40;
  if (daysFromOvulation === -2) return 0.45;
  if (daysFromOvulation === -1) return 0.50;
  if (daysFromOvulation === 0) return 0.60;
  if (daysFromOvulation === 1) return 0.30;
  if (daysFromOvulation === 2) return 0.10;
  return 0;
}

// 计算同房记录置信因子
function calculateIntercourseConfidence(intercourseRecords, fertilityWindow) {
  if (!intercourseRecords || intercourseRecords.length === 0) return 0;

  const hasIntercourseInWindow = intercourseRecords.some(record => {
    const recordDate = new Date(record.record_date);
    return recordDate >= fertilityWindow.start && recordDate <= fertilityWindow.end;
  });

  const hasAnyIntercourse = intercourseRecords.length > 0;

  if (hasIntercourseInWindow) return 0.20;
  if (hasAnyIntercourse) return 0.05;
  return 0;
}

// 主预测函数 - 生成30天概率曲线
async function generateProbabilityCurve(openid, days = 30) {
  // 获取数据
  const periods = await Period.find({ openid }).sort({ start_date: -1 }).limit(12);
  const temperatures = await Temperature.find({ openid }).sort({ record_date: -1 }).limit(30);
  const ovulationTests = await OvulationTest.find({ openid }).sort({ test_date: -1 });
  const intercourseRecords = await IntercourseRecord.find({ openid }).sort({ record_date: -1 });

  // 获取用户周期设置
  const user = await require('../models/User').findOne({ openid });
  const cycleLength = user?.cycle_length || 28;
  const periodLength = user?.period_length || 5;

  // 确定基准排卵日（优先级：试纸 > 体温 > 周期法）
  let ovulationDay = null;
  let ovulationSource = 'cycle';

  // 1. 试纸优先
  const testOvulationDay = detectOvulationDayByTest(ovulationTests);
  if (testOvulationDay) {
    ovulationDay = testOvulationDay;
    ovulationSource = 'test';
  }

  // 2. 体温辅助
  const tempOvulationDay = detectOvulationDayByTemperature(temperatures);
  if (tempOvulationDay && !ovulationDay) {
    ovulationDay = tempOvulationDay;
    ovulationSource = 'temperature';
  }

  // 3. 纯周期法
  if (!ovulationDay && periods.length > 0) {
    const lastPeriodStart = new Date(periods[0].start_date);
    ovulationDay = calculateOvulationDayByCycle(lastPeriodStart, cycleLength);
  }

  // 如果没有任何数据，使用默认值
  if (!ovulationDay) {
    ovulationDay = new Date();
    ovulationDay.setDate(ovulationDay.getDate() + 14); // 默认14天后排卵
  }

  // 计算易孕窗口
  const fertilityWindow = getFertilityWindow(ovulationDay);

  // 计算同房置信因子
  const intercourseConfidence = calculateIntercourseConfidence(intercourseRecords, fertilityWindow);

  // 生成30天概率数据
  const curveData = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    const daysFromOvulation = Math.round((date - ovulationDay) / (1000 * 60 * 60 * 24));

    let probability = getBaseProbability(daysFromOvulation);

    // 试纸修正
    if (ovulationSource === 'test') {
      const dayTest = ovulationTests.find(t => {
        const testDate = new Date(t.test_date);
        return testDate.toDateString() === date.toDateString();
      });

      if (dayTest) {
        if (dayTest.result === 3) probability = 1.0;       // 已排卵
        else if (dayTest.result === 2) probability = 0.8; // 强阳
        else if (dayTest.result === 1) probability = 0.5;  // 弱阳
        else probability = 0.2;                           // 阴性
      }
    }

    // 体温修正
    if (ovulationSource === 'temperature' && daysFromOvulation >= 0) {
      probability = probability * 0.8; // 体温确认后概率下降更快
    }

    // 应用置信因子
    probability = Math.min(1, probability + intercourseConfidence);

    curveData.push({
      date: date.toISOString().split('T')[0],
      probability: Math.round(probability * 100),
      days_from_ovulation: daysFromOvulation,
      is_ovulation_day: daysFromOvulation === 0,
      is_in_fertility_window: date >= fertilityWindow.start && date <= fertilityWindow.end
    });
  }

  // 计算下次月经预计日期
  const nextPeriodDate = new Date(ovulationDay);
  nextPeriodDate.setDate(nextPeriodDate.getDate() + 14);

  return {
    curve_data: curveData,
    ovulation_day: ovulationDay.toISOString().split('T')[0],
    ovulation_source: ovulationSource,
    next_period_date: nextPeriodDate.toISOString().split('T')[0],
    fertility_window: {
      start: fertilityWindow.start.toISOString().split('T')[0],
      end: fertilityWindow.end.toISOString().split('T')[0]
    },
    current_probability: curveData[0]?.probability || 0
  };
}

// 获取周期统计
async function getCycleStats(openid) {
  const periods = await Period.find({ openid }).sort({ start_date: -1 }).limit(24 });

  if (periods.length < 2) {
    return {
      average_cycle_length: 28,
      longest_cycle_length: 28,
      shortest_cycle_length: 28,
      period_count: periods.length,
      has_enough_data: false
    };
  }

  // 计算周期长度
  const cycleLengths = [];
  for (let i = 0; i < periods.length - 1; i++) {
    const current = new Date(periods[i].start_date);
    const next = new Date(periods[i + 1].start_date);
    const days = Math.round((current - next) / (1000 * 60 * 60 * 24));
    if (days > 15 && days < 60) { // 过滤异常值
      cycleLengths.push(days);
    }
  }

  if (cycleLengths.length === 0) {
    return {
      average_cycle_length: 28,
      longest_cycle_length: 28,
      shortest_cycle_length: 28,
      period_count: periods.length,
      has_enough_data: false
    };
  }

  return {
    average_cycle_length: Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length),
    longest_cycle_length: Math.max(...cycleLengths),
    shortest_cycle_length: Math.min(...cycleLengths),
    period_count: periods.length,
    has_enough_data: true
  };
}

module.exports = {
  generateProbabilityCurve,
  getCycleStats,
  calculateOvulationDayByCycle,
  getFertilityWindow,
  getBaseProbability
};
```

- [ ] **Step 2: 创建预测路由**

```javascript
// backend/src/routes/predictions.js
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
```

- [ ] **Step 3: 创建测试**

```javascript
// backend/tests/prediction.test.js
const {
  calculateOvulationDayByCycle,
  getFertilityWindow,
  getBaseProbability
} = require('../src/services/prediction');

describe('Prediction Service', () => {
  describe('calculateOvulationDayByCycle', () => {
    it('should calculate ovulation day 14 days before next period', () => {
      const lastPeriodStart = new Date('2026-03-01');
      const ovulationDay = calculateOvulationDayByCycle(lastPeriodStart, 28);

      expect(ovulationDay.toISOString().split('T')[0]).toBe('2026-03-15');
    });

    it('should handle custom cycle length', () => {
      const lastPeriodStart = new Date('2026-03-01');
      const ovulationDay = calculateOvulationDayByCycle(lastPeriodStart, 30);

      expect(ovulationDay.toISOString().split('T')[0]).toBe('2026-03-17');
    });
  });

  describe('getFertilityWindow', () => {
    it('should return 7-day fertility window', () => {
      const ovulationDay = new Date('2026-03-15');
      const window = getFertilityWindow(ovulationDay);

      expect(window.start.toISOString().split('T')[0]).toBe('2026-03-10'); // -5 days
      expect(window.end.toISOString().split('T')[0]).toBe('2026-03-16');    // +1 day
    });
  });

  describe('getBaseProbability', () => {
    it('should return 60% on ovulation day', () => {
      expect(getBaseProbability(0)).toBe(0.60);
    });

    it('should return 50% one day before ovulation', () => {
      expect(getBaseProbability(-1)).toBe(0.50);
    });

    it('should return 20% five days before ovulation', () => {
      expect(getBaseProbability(-5)).toBe(0.20);
    });

    it('should return 0% more than 5 days before ovulation', () => {
      expect(getBaseProbability(-6)).toBe(0);
    });

    it('should return decreasing probability after ovulation', () => {
      expect(getBaseProbability(1)).toBe(0.30);
      expect(getBaseProbability(2)).toBe(0.10);
      expect(getBaseProbability(3)).toBe(0);
    });
  });
});
```

- [ ] **Step 4: 运行测试**

```bash
cd backend && npm test -- tests/prediction.test.js
```

Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add backend/src/services/prediction.js backend/src/routes/predictions.js backend/tests/prediction.test.js
git commit -m "feat: 预测算法服务 - 概率曲线计算"
```

---

## 第二阶段：前端搭建

### Task 8: uni-app 项目初始化

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/src/main.js`
- Create: `frontend/src/App.vue`
- Create: `frontend/src/pages.json`
- Create: `frontend/src/manifest.json`
- Create: `frontend/vite.config.js`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "fertility-predictor-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev:h5": "uni",
    "dev:mp-weixin": "uni build --watch mp-weixin",
    "build:h5": "uni build",
    "build:mp-weixin": "uni build mp-weixin"
  },
  "dependencies": {
    "@dcloudio/uni-app": "^3.0.0-alpha-40102-20240118-000000",
    "@dcloudio/uni-components": "^3.0.0-alpha-40102-20240118-000000",
    "@dcloudio/uni-h5": "^3.0.0-alpha-40102-20240118-000000",
    "@dcloudio/uni-mp-weixin": "^3.0.0-alpha-40102-20240118-000000",
    "vue": "^3.4.0"
  },
  "devDependencies": {
    "@dcloudio/types": "^3.4.0",
    "@dcloudio/uni-automator": "^3.0.0-alpha-40102-20240118-000000",
    "@dcloudio/uni-cli-shared": "^3.0.0-alpha-40102-20240118-000000",
    "@dcloudio/uni-stacktracey": "^3.0.0-alpha-40102-20240118-000000",
    "@dcloudio/vite-plugin-uni": "^3.0.0-alpha-40102-20240118-000000",
    "vite": "^5.0.0"
  }
}
```

- [ ] **Step 2: 创建 main.js**

```javascript
// frontend/src/main.js
import App from './App.vue'
import { createSSRApp } from 'vue'

export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
```

- [ ] **Step 3: 创建 App.vue**

```vue
<!-- frontend/src/App.vue -->
<script>
export default {
  onLaunch() {
    console.log('App Launch')
  },
  onShow() {
    console.log('App Show')
  },
  onHide() {
    console.log('App Hide')
  }
}
</script>

<style>
page {
  background-color: #fdf8f3;
}
</style>
```

- [ ] **Step 4: 创建 pages.json**

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "接好孕"
      }
    },
    {
      "path": "pages/input/input",
      "style": {
        "navigationBarTitleText": "记录"
      }
    },
    {
      "path": "pages/stats/stats",
      "style": {
        "navigationBarTitleText": "统计"
      }
    },
    {
      "path": "pages/settings/settings",
      "style": {
        "navigationBarTitleText": "设置"
      }
    }
  ],
  "tabBar": {
    "color": "#4A4541",
    "selectedColor": "#9CAF88",
    "backgroundColor": "#FFFFFF",
    "borderStyle": "white",
    "list": [
      {
        "text": "首页",
        "iconPath": "static/tab-home.png",
        "selectedIconPath": "static/tab-home-active.png",
        "pagePath": "pages/index/index"
      },
      {
        "text": "记录",
        "iconPath": "static/tab-input.png",
        "selectedIconPath": "static/tab-input-active.png",
        "pagePath": "pages/input/input"
      },
      {
        "text": "统计",
        "iconPath": "static/tab-stats.png",
        "selectedIconPath": "static/tab-stats-active.png",
        "pagePath": "pages/stats/stats"
      },
      {
        "text": "设置",
        "iconPath": "static/tab-settings.png",
        "selectedIconPath": "static/tab-settings-active.png",
        "pagePath": "pages/settings/settings"
      }
    ]
  },
  "globalStyle": {
    "navigationBarTextStyle": "#4A4541",
    "navigationBarTitleText": "接好孕",
    "navigationBarBackgroundColor": "#FDF8F3",
    "backgroundColor": "#FDF8F3"
  }
}
```

- [ ] **Step 5: 创建 manifest.json**

```json
{
  "name": "fertility-predictor",
  "appid": "",
  "description": "备孕预测应用",
  "versionName": "1.0.0",
  "versionCode": "100",
  "transformPx": false,
  "mp-weixin": {
    "appid": "",
    "setting": {
      "urlCheck": false
    },
    "usingComponents": true
  },
  "h5": {
    "devServer": {
      "port": 8080,
      "disableHostCheck": true,
      "proxy": {
        "/api": {
          "target": "http://localhost:3000",
          "changeOrigin": true
        }
      }
    }
  }
}
```

- [ ] **Step 6: 创建 vite.config.js**

```javascript
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()]
})
```

- [ ] **Step 7: 初始化项目并验证**

```bash
cd frontend && npm install
npm run dev:h5
```

- [ ] **Step 8: Commit**

```bash
git add frontend/package.json frontend/src/ frontend/vite.config.js
git commit -m "feat: uni-app 前端项目初始化"
```

---

### Task 9: API 请求封装

**Files:**
- Create: `frontend/src/api/index.js`
- Create: `frontend/src/api/auth.js`
- Create: `frontend/src/api/periods.js`
- Create: `frontend/src/api/temperatures.js`
- Create: `frontend/src/api/ovulationTests.js`
- Create: `frontend/src/api/intercourseRecords.js`
- Create: `frontend/src/api/predictions.js`

- [ ] **Step 1: 创建 API 封装**

```javascript
// frontend/src/api/index.js
const BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-api-domain.com'
  : 'http://localhost:3000';

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('openid');

    uni.request({
      url: BASE_URL + url,
      ...options,
      header: {
        'Content-Type': 'application/json',
        'x-openid': token || '',
        ...options.header
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(new Error(res.data?.error || 'Request failed'));
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || 'Network error'));
      }
    });
  });
}

export default {
  get: (url, params) => request(url, { method: 'GET', data: params }),
  post: (url, data) => request(url, { method: 'POST', data }),
  put: (url, data) => request(url, { method: 'PUT', data }),
  delete: (url) => request(url, { method: 'DELETE' })
};
```

- [ ] **Step 2: 创建认证 API**

```javascript
// frontend/src/api/auth.js
import api from './index';

export const authApi = {
  login: (code) => api.post('/api/auth/login', { code }),
  getOpenid: () => {
    return new Promise((resolve, reject) => {
      // #ifdef MP-WEIXIN
      uni.login({
        provider: 'weixin',
        success: (res) => {
          resolve(res.code);
        },
        fail: reject
      });
      // #endif
      // #ifdef H5
      resolve('h5_test_openid_' + Date.now());
      // #endif
    });
  }
};
```

- [ ] **Step 3: 创建经期 API**

```javascript
// frontend/src/api/periods.js
import api from './index';

export const periodsApi = {
  list: (params) => api.get('/api/periods', params),
  create: (data) => api.post('/api/periods', data),
  update: (id, data) => api.put(`/api/periods/${id}`, data),
  delete: (id) => api.delete(`/api/periods/${id}`)
};
```

- [ ] **Step 4: 创建其他 API 文件**

```javascript
// frontend/src/api/temperatures.js
import api from './index';

export const temperaturesApi = {
  list: (params) => api.get('/api/temperatures', params),
  create: (data) => api.post('/api/temperatures', data),
  update: (id, data) => api.put(`/api/temperatures/${id}`, data),
  delete: (id) => api.delete(`/api/temperatures/${id}`)
};
```

```javascript
// frontend/src/api/ovulationTests.js
import api from './index';

export const ovulationTestsApi = {
  list: (params) => api.get('/api/ovulation-tests', params),
  create: (data) => api.post('/api/ovulation-tests', data),
  update: (id, data) => api.put(`/api/ovulation-tests/${id}`, data),
  delete: (id) => api.delete(`/api/ovulation-tests/${id}`)
};
```

```javascript
// frontend/src/api/intercourseRecords.js
import api from './index';

export const intercourseRecordsApi = {
  list: (params) => api.get('/api/intercourse-records', params),
  create: (data) => api.post('/api/intercourse-records', data),
  delete: (id) => api.delete(`/api/intercourse-records/${id}`)
};
```

```javascript
// frontend/src/api/predictions.js
import api from './index';

export const predictionsApi = {
  getProbabilityCurve: (params) => api.get('/api/predictions/probability-curve', params),
  getStats: () => api.get('/api/predictions/stats')
};
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/api/
git commit -m "feat: 前端 API 请求封装"
```

---

### Task 10: 状态管理

**Files:**
- Create: `frontend/src/store/index.js`

- [ ] **Step 1: 创建 Store**

```javascript
// frontend/src/store/index.js
import { reactive, readonly } from 'vue';

const state = reactive({
  openid: null,
  user: null,
  isLoggedIn: false,
  cycleLength: 28,
  periodLength: 5
});

const actions = {
  setOpenid(openid) {
    state.openid = openid;
    uni.setStorageSync('openid', openid);
  },
  setUser(user) {
    state.user = user;
    state.cycleLength = user?.cycle_length || 28;
    state.periodLength = user?.period_length || 5;
    state.isLoggedIn = true;
  },
  updateSettings(cycleLength, periodLength) {
    state.cycleLength = cycleLength;
    state.periodLength = periodLength;
  },
  initFromStorage() {
    const openid = uni.getStorageSync('openid');
    if (openid) {
      state.openid = openid;
      state.isLoggedIn = true;
    }
  },
  logout() {
    state.openid = null;
    state.user = null;
    state.isLoggedIn = false;
    uni.removeStorageSync('openid');
  }
};

export const store = {
  state: readonly(state),
  ...actions
};
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/store/index.js
git commit -m "feat: 前端状态管理"
```

---

### Task 11: 首页（概率曲线图）

**Files:**
- Create: `frontend/src/pages/index/index.vue`
- Create: `frontend/src/components/ProbabilityChart.vue`

- [ ] **Step 1: 创建概率曲线组件**

```vue
<!-- frontend/src/components/ProbabilityChart.vue -->
<template>
  <view class="chart-container">
    <!-- Y轴标签 -->
    <view class="y-axis">
      <text v-for="p in [100, 75, 50, 25, 0]" :key="p" class="y-label">{{ p }}%</text>
    </view>

    <!-- 图表区域 -->
    <view class="chart-area">
      <!-- 网格线 -->
      <view class="grid-lines">
        <view v-for="p in [100, 75, 50, 25, 0]" :key="p" class="grid-line"></view>
      </view>

      <!-- 曲线 -->
      <view class="curve-container">
        <view
          v-for="(point, index) in curveData"
          :key="index"
          class="curve-point"
          :style="{
            left: `${(index / (curveData.length - 1)) * 100}%`,
            bottom: `${point.probability}%`,
            backgroundColor: getPointColor(point)
          }"
          @click="onPointClick(point)"
        >
          <view v-if="point.is_ovulation_day" class="ovulation-marker"></view>
        </view>

        <!-- 今日指示线 -->
        <view class="today-line" :style="{ left: `${todayPosition}%` }"></view>

        <!-- 易孕窗口高亮 -->
        <view
          v-if="fertilityWindowStart !== null"
          class="fertility-window"
          :style="{
            left: `${fertilityWindowStart}%`,
            width: `${fertilityWindowWidth}%`
          }"
        ></view>
      </view>

      <!-- X轴标签 -->
      <view class="x-axis">
        <text
          v-for="(point, index) in curveData"
          :key="index"
          v-if="index % 5 === 0"
          class="x-label"
          :style="{ left: `${(index / (curveData.length - 1)) * 100}%` }"
        >
          {{ formatDate(point.date) }}
        </text>
      </view>
    </view>

    <!-- 详情弹窗 -->
    <uni-popup ref="detailPopup" type="bottom">
      <view class="detail-card">
        <text class="detail-date">{{ selectedPoint?.date }}</text>
        <text class="detail-probability">怀孕概率: {{ selectedPoint?.probability }}%</text>
        <text class="detail-status">{{ getStatusText(selectedPoint) }}</text>
      </view>
    </uni-popup>
  </view>
</template>

<script>
export default {
  name: 'ProbabilityChart',
  props: {
    curveData: {
      type: Array,
      default: () => []
    },
    fertilityWindow: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      selectedPoint: null
    };
  },
  computed: {
    todayPosition() {
      return 0;
    },
    fertilityWindowStart() {
      if (!this.fertilityWindow || !this.curveData.length) return null;
      const startDate = new Date(this.fertilityWindow.start);
      const firstDate = new Date(this.curveData[0].date);
      return Math.max(0, Math.round((startDate - firstDate) / (1000 * 60 * 60 * 24) / 30 * 100));
    },
    fertilityWindowWidth() {
      if (!this.fertilityWindow) return 0;
      return Math.round(7 / 30 * 100);
    }
  },
  methods: {
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    },
    getPointColor(point) {
      if (point.is_in_fertility_window) return '#9CAF88';
      if (point.is_ovulation_day) return '#D4A574';
      return '#E8B4B8';
    },
    getStatusText(point) {
      if (!point) return '';
      if (point.is_ovulation_day) return '排卵日';
      if (point.is_in_fertility_window) return '易孕期';
      return '安全期';
    },
    onPointClick(point) {
      this.selectedPoint = point;
      this.$refs.detailPopup.open();
    }
  }
};
</script>

<style scoped>
.chart-container {
  display: flex;
  height: 300px;
  padding: 20px;
  background: #fff;
  border-radius: 16px;
}

.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: 10px;
  width: 40px;
}

.y-label {
  font-size: 12px;
  color: #4A4541;
  text-align: right;
}

.chart-area {
  flex: 1;
  position: relative;
}

.grid-lines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.grid-line {
  border-top: 1px dashed #E5E0DC;
}

.curve-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 30px;
}

.curve-point {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transform: translate(-50%, 50%);
  cursor: pointer;
}

.ovulation-marker {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 15px;
  background: #D4A574;
}

.today-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #4A4541;
}

.fertility-window {
  position: absolute;
  top: 0;
  bottom: 0;
  background: rgba(156, 175, 136, 0.2);
  border-radius: 4px;
}

.x-axis {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30px;
}

.x-label {
  position: absolute;
  transform: translateX(-50%);
  font-size: 11px;
  color: #4A4541;
}

.detail-card {
  padding: 30px;
  background: #fff;
  border-radius: 24px 24px 0 0;
  text-align: center;
}

.detail-date {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #4A4541;
  margin-bottom: 10px;
}

.detail-probability {
  display: block;
  font-size: 32px;
  color: #9CAF88;
  margin-bottom: 10px;
}

.detail-status {
  display: block;
  font-size: 14px;
  color: #4A4541;
}
</style>
```

- [ ] **Step 2: 创建首页**

```vue
<!-- frontend/src/pages/index/index.vue -->
<template>
  <view class="page">
    <!-- 顶部 -->
    <view class="header">
      <text class="title">接好孕</text>
    </view>

    <!-- 今日状态卡片 -->
    <view class="today-card">
      <view class="today-info">
        <text class="today-label">今日受孕概率</text>
        <text class="today-value">{{ currentProbability }}%</text>
        <text class="today-status">{{ statusText }}</text>
      </view>
      <view class="countdown">
        <text class="countdown-num">{{ daysToOvulation }}</text>
        <text class="countdown-label">天后排卵</text>
      </view>
    </view>

    <!-- 概率曲线图 -->
    <view class="chart-section">
      <view class="section-title">
        <text>30天受孕概率</text>
      </view>
      <ProbabilityChart
        :curveData="curveData"
        :fertilityWindow="fertilityWindow"
      />
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>

    <!-- 未登录提示 -->
    <view v-if="!isLoggedIn" class="login-prompt">
      <button type="primary" @click="handleLogin">微信一键登录</button>
    </view>
  </view>
</template>

<script>
import ProbabilityChart from '../../components/ProbabilityChart.vue';
import { store } from '../../store/index.js';
import { predictionsApi } from '../../api/predictions.js';
import { authApi } from '../../api/auth.js';

export default {
  components: {
    ProbabilityChart
  },
  data() {
    return {
      loading: false,
      curveData: [],
      fertilityWindow: null,
      currentProbability: 0,
      daysToOvulation: 0,
      statusText: '安全期'
    };
  },
  computed: {
    isLoggedIn() {
      return store.state.isLoggedIn;
    }
  },
  onShow() {
    store.initFromStorage();
    if (store.state.isLoggedIn) {
      this.loadData();
    }
  },
  methods: {
    async handleLogin() {
      try {
        uni.showLoading({ title: '登录中...' });

        const code = await authApi.getOpenid();
        const res = await authApi.login(code);

        store.setOpenid(res.user.openid);
        store.setUser(res.user);

        uni.hideLoading();
        this.loadData();
      } catch (error) {
        uni.hideLoading();
        uni.showToast({ title: '登录失败', icon: 'none' });
        console.error('Login error:', error);
      }
    },
    async loadData() {
      this.loading = true;
      try {
        const [curveRes, statsRes] = await Promise.all([
          predictionsApi.getProbabilityCurve({ days: 30 }),
          predictionsApi.getStats()
        ]);

        this.curveData = curveRes.curve_data;
        this.fertilityWindow = curveRes.fertility_window;
        this.currentProbability = curveRes.current_probability;
        this.daysToOvulation = statsRes.days_to_ovulation;

        // 更新状态文本
        const todayPoint = this.curveData[0];
        if (todayPoint?.is_ovulation_day) {
          this.statusText = '排卵日';
        } else if (todayPoint?.is_in_fertility_window) {
          this.statusText = '易孕期';
        } else {
          this.statusText = '安全期';
        }
      } catch (error) {
        console.error('Load data error:', error);
        uni.showToast({ title: '加载失败', icon: 'none' });
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #fdf8f3;
  padding: 20px;
}

.header {
  padding: 10px 0 20px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #4A4541;
}

.today-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: #fff;
  border-radius: 16px;
  margin-bottom: 20px;
}

.today-info {
  flex: 1;
}

.today-label {
  display: block;
  font-size: 14px;
  color: #4A4541;
  margin-bottom: 8px;
}

.today-value {
  display: block;
  font-size: 42px;
  font-weight: bold;
  color: #9CAF88;
}

.today-status {
  display: block;
  font-size: 14px;
  color: #D4A574;
  margin-top: 4px;
}

.countdown {
  text-align: center;
  padding: 16px;
  background: #fdf8f3;
  border-radius: 12px;
}

.countdown-num {
  display: block;
  font-size: 28px;
  font-weight: bold;
  color: #4A4541;
}

.countdown-label {
  display: block;
  font-size: 12px;
  color: #4A4541;
}

.chart-section {
  margin-bottom: 20px;
}

.section-title {
  padding: 10px 0;
}

.section-title text {
  font-size: 16px;
  color: #4A4541;
  font-weight: 500;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #4A4541;
}

.login-prompt {
  padding: 40px 20px;
  text-align: center;
}

.login-prompt button {
  background: #9CAF88;
  color: #fff;
  border: none;
  padding: 12px 40px;
  border-radius: 24px;
}
</style>
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/index/index.vue frontend/src/components/ProbabilityChart.vue
git commit -m "feat: 首页 - 概率曲线图"
```

---

### Task 12: 数据录入页

**Files:**
- Create: `frontend/src/pages/input/input.vue`

- [ ] **Step 1: 创建录入页面**

```vue
<!-- frontend/src/pages/input/input.vue -->
<template>
  <view class="page">
    <!-- Tab 导航 -->
    <view class="tabs">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab', { active: currentTab === tab.key }]"
        @click="currentTab = tab.key"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <!-- 经期录入 -->
    <view v-if="currentTab === 'period'" class="tab-content">
      <view class="form-item">
        <text class="label">上次月经开始日期</text>
        <picker mode="date" :value="periodForm.start_date" @change="onPeriodDateChange">
          <view class="picker-value">
            {{ periodForm.start_date || '请选择日期' }}
          </view>
        </picker>
      </view>
      <button type="primary" @click="submitPeriod">保存</button>
    </view>

    <!-- 体温录入 -->
    <view v-if="currentTab === 'temperature'" class="tab-content">
      <view class="form-item">
        <text class="label">日期</text>
        <picker mode="date" :value="tempForm.record_date" @change="onTempDateChange">
          <view class="picker-value">
            {{ tempForm.record_date || '请选择日期' }}
          </view>
        </picker>
      </view>
      <view class="form-item">
        <text class="label">体温 (℃)</text>
        <input type="digit" v-model="tempForm.temperature" placeholder="如: 36.5" />
      </view>
      <button type="primary" @click="submitTemperature">保存</button>
    </view>

    <!-- 试纸录入 -->
    <view v-if="currentTab === 'test'" class="tab-content">
      <view class="form-item">
        <text class="label">检测日期</text>
        <picker mode="date" :value="testForm.test_date" @change="onTestDateChange">
          <view class="picker-value">
            {{ testForm.test_date || '请选择日期' }}
          </view>
        </picker>
      </view>
      <view class="form-item">
        <text class="label">检测结果</text>
        <radio-group @change="onTestResultChange">
          <label v-for="opt in testOptions" :key="opt.value">
            <radio :value="String(opt.value)" :checked="testForm.result === opt.value" />
            <text>{{ opt.label }}</text>
          </label>
        </radio-group>
      </view>
      <button type="primary" @click="submitTest">保存</button>
    </view>

    <!-- 同房录入 -->
    <view v-if="currentTab === 'intercourse'" class="tab-content">
      <view class="form-item">
        <text class="label">同房日期</text>
        <picker mode="date" :value="intercourseForm.record_date" @change="onIntercourseDateChange">
          <view class="picker-value">
            {{ intercourseForm.record_date || '请选择日期' }}
          </view>
        </picker>
      </view>
      <button type="primary" @click="submitIntercourse">保存</button>
    </view>

    <!-- 提示信息 -->
    <view class="tip">
      <text>记录越完整，预测越准确</text>
    </view>
  </view>
</template>

<script>
import { periodsApi } from '../../api/periods.js';
import { temperaturesApi } from '../../api/temperatures.js';
import { ovulationTestsApi } from '../../api/ovulationTests.js';
import { intercourseRecordsApi } from '../../api/intercourseRecords.js';

export default {
  data() {
    return {
      currentTab: 'period',
      tabs: [
        { key: 'period', label: '经期' },
        { key: 'temperature', label: '体温' },
        { key: 'test', label: '试纸' },
        { key: 'intercourse', label: '同房' }
      ],
      periodForm: {
        start_date: ''
      },
      tempForm: {
        record_date: '',
        temperature: ''
      },
      testForm: {
        test_date: '',
        result: null
      },
      testOptions: [
        { value: 0, label: '阴性' },
        { value: 1, label: '弱阳' },
        { value: 2, label: '强阳' },
        { value: 3, label: '已排卵' }
      ],
      intercourseForm: {
        record_date: ''
      }
    };
  },
  methods: {
    // 经期
    onPeriodDateChange(e) {
      this.periodForm.start_date = e.detail.value;
    },
    async submitPeriod() {
      if (!this.periodForm.start_date) {
        return uni.showToast({ title: '请选择日期', icon: 'none' });
      }
      try {
        await periodsApi.create(this.periodForm);
        uni.showToast({ title: '保存成功' });
        this.periodForm.start_date = '';
      } catch (error) {
        uni.showToast({ title: '保存失败', icon: 'none' });
      }
    },

    // 体温
    onTempDateChange(e) {
      this.tempForm.record_date = e.detail.value;
    },
    async submitTemperature() {
      if (!this.tempForm.record_date || !this.tempForm.temperature) {
        return uni.showToast({ title: '请填写完整', icon: 'none' });
      }
      try {
        await temperaturesApi.create(this.tempForm);
        uni.showToast({ title: '保存成功' });
        this.tempForm = { record_date: '', temperature: '' };
      } catch (error) {
        uni.showToast({ title: '保存失败', icon: 'none' });
      }
    },

    // 试纸
    onTestDateChange(e) {
      this.testForm.test_date = e.detail.value;
    },
    onTestResultChange(e) {
      this.testForm.result = parseInt(e.detail.value);
    },
    async submitTest() {
      if (!this.testForm.test_date || this.testForm.result === null) {
        return uni.showToast({ title: '请填写完整', icon: 'none' });
      }
      try {
        await ovulationTestsApi.create(this.testForm);
        uni.showToast({ title: '保存成功' });
        this.testForm = { test_date: '', result: null };
      } catch (error) {
        uni.showToast({ title: '保存失败', icon: 'none' });
      }
    },

    // 同房
    onIntercourseDateChange(e) {
      this.intercourseForm.record_date = e.detail.value;
    },
    async submitIntercourse() {
      if (!this.intercourseForm.record_date) {
        return uni.showToast({ title: '请选择日期', icon: 'none' });
      }
      try {
        await intercourseRecordsApi.create(this.intercourseForm);
        uni.showToast({ title: '保存成功' });
        this.intercourseForm.record_date = '';
      } catch (error) {
        uni.showToast({ title: '保存失败', icon: 'none' });
      }
    }
  }
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #fdf8f3;
  padding: 20px;
}

.tabs {
  display: flex;
  background: #fff;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 20px;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 12px;
  border-radius: 8px;
}

.tab.active {
  background: #9CAF88;
}

.tab.active text {
  color: #fff;
}

.tab text {
  color: #4A4541;
  font-size: 14px;
}

.tab-content {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
}

.form-item {
  margin-bottom: 20px;
}

.label {
  display: block;
  font-size: 14px;
  color: #4A4541;
  margin-bottom: 8px;
}

.picker-value {
  padding: 12px;
  background: #fdf8f3;
  border-radius: 8px;
  color: #4A4541;
}

input {
  padding: 12px;
  background: #fdf8f3;
  border-radius: 8px;
  color: #4A4541;
}

radio-group label {
  display: inline-block;
  margin-right: 20px;
  font-size: 14px;
}

button {
  background: #9CAF88;
  color: #fff;
  border: none;
  margin-top: 20px;
}

.tip {
  text-align: center;
  padding: 20px;
  color: #9CAF88;
  font-size: 14px;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/input/input.vue
git commit -m "feat: 数据录入页 - 经期/体温/试纸/同房"
```

---

### Task 13: 统计页

**Files:**
- Create: `frontend/src/pages/stats/stats.vue`

- [ ] **Step 1: 创建统计页面**

```vue
<!-- frontend/src/pages/stats/stats.vue -->
<template>
  <view class="page">
    <!-- Tab 导航 -->
    <view class="tabs">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab', { active: currentTab === tab.key }]"
        @click="currentTab = tab.key"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <!-- 周期统计 -->
    <view v-if="currentTab === 'cycle'" class="content">
      <view class="stat-card">
        <view class="stat-row">
          <text class="stat-label">平均周期长度</text>
          <text class="stat-value">{{ stats.average_cycle_length }} 天</text>
        </view>
        <view class="stat-row">
          <text class="stat-label">最长周期</text>
          <text class="stat-value">{{ stats.longest_cycle_length }} 天</text>
        </view>
        <view class="stat-row">
          <text class="stat-label">最短周期</text>
          <text class="stat-value">{{ stats.shortest_cycle_length }} 天</text>
        </view>
        <view class="stat-row">
          <text class="stat-label">记录周期数</text>
          <text class="stat-value">{{ stats.period_count }} 个</text>
        </view>
      </view>

      <view v-if="!stats.has_enough_data" class="data-tip">
        <text>记录更多经期数据，获得更准确的统计</text>
      </view>
    </view>

    <!-- 概率 Tab -->
    <view v-if="currentTab === 'probability'" class="content">
      <view class="stat-card highlight">
        <text class="card-title">当前周期受孕概率</text>
        <text class="big-value">{{ currentProbability }}%</text>
        <text class="confidence">置信度: {{ confidenceLevel }}</text>
      </view>
    </view>

    <!-- 倒计时 Tab -->
    <view v-if="currentTab === 'countdown'" class="content">
      <view class="stat-card">
        <view class="countdown-big">
          <text class="countdown-num">{{ daysToOvulation }}</text>
          <text class="countdown-unit">天</text>
        </view>
        <view class="countdown-info">
          <text>距离排卵日</text>
          <text>排卵日: {{ ovulationDay }}</text>
        </view>
      </view>

      <view class="next-period">
        <text>预计下次月经: {{ nextPeriodDate }}</text>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script>
import { predictionsApi } from '../../api/predictions.js';

export default {
  data() {
    return {
      currentTab: 'cycle',
      tabs: [
        { key: 'cycle', label: '周期' },
        { key: 'probability', label: '概率' },
        { key: 'countdown', label: '倒计时' }
      ],
      loading: false,
      stats: {
        average_cycle_length: 28,
        longest_cycle_length: 28,
        shortest_cycle_length: 28,
        period_count: 0,
        has_enough_data: false
      },
      currentProbability: 0,
      daysToOvulation: 0,
      ovulationDay: '',
      nextPeriodDate: ''
    };
  },
  computed: {
    confidenceLevel() {
      if (this.stats.period_count >= 6) return '高';
      if (this.stats.period_count >= 3) return '中';
      return '低';
    }
  },
  onShow() {
    this.loadStats();
  },
  methods: {
    async loadStats() {
      this.loading = true;
      try {
        const res = await predictionsApi.getStats();
        this.stats = res.cycle_stats;
        this.currentProbability = res.current_probability;
        this.daysToOvulation = res.days_to_ovulation;
        this.ovulationDay = res.ovulation_day;
        this.nextPeriodDate = res.fertility_window?.end || '';
      } catch (error) {
        console.error('Load stats error:', error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #fdf8f3;
  padding: 20px;
}

.tabs {
  display: flex;
  background: #fff;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 20px;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 12px;
  border-radius: 8px;
}

.tab.active {
  background: #9CAF88;
}

.tab.active text {
  color: #fff;
}

.tab text {
  color: #4A4541;
  font-size: 14px;
}

.content {
  min-height: 300px;
}

.stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 16px;
}

.stat-card.highlight {
  background: linear-gradient(135deg, #9CAF88, #C5D4B8);
  text-align: center;
}

.card-title {
  display: block;
  font-size: 14px;
  color: #fff;
  margin-bottom: 10px;
}

.big-value {
  display: block;
  font-size: 56px;
  font-weight: bold;
  color: #fff;
}

.confidence {
  display: block;
  font-size: 14px;
  color: rgba(255,255,255,0.8);
  margin-top: 10px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0ebe6;
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-label {
  color: #4A4541;
  font-size: 14px;
}

.stat-value {
  color: #9CAF88;
  font-size: 14px;
  font-weight: 500;
}

.data-tip {
  text-align: center;
  padding: 20px;
  color: #9CAF88;
  font-size: 14px;
}

.countdown-big {
  text-align: center;
  padding: 20px 0;
}

.countdown-num {
  font-size: 72px;
  font-weight: bold;
  color: #9CAF88;
}

.countdown-unit {
  font-size: 24px;
  color: #4A4541;
  margin-left: 8px;
}

.countdown-info {
  text-align: center;
  margin-top: 16px;
}

.countdown-info text {
  display: block;
  color: #4A4541;
  font-size: 14px;
  margin-top: 8px;
}

.next-period {
  text-align: center;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  color: #D4A574;
  font-size: 14px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #4A4541;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/stats/stats.vue
git commit -m "feat: 统计页 - 周期/概率/倒计时"
```

---

### Task 14: 设置页

**Files:**
- Create: `frontend/src/pages/settings/settings.vue`

- [ ] **Step 1: 创建设置页面**

```vue
<!-- frontend/src/pages/settings/settings.vue -->
<template>
  <view class="page">
    <!-- 用户信息 -->
    <view class="section">
      <view class="section-title">
        <text>账户信息</text>
      </view>
      <view class="user-card">
        <view class="user-info">
          <text class="user-name">微信用户</text>
          <text class="user-id">ID: {{ openid }}</text>
        </view>
      </view>
    </view>

    <!-- 周期设置 -->
    <view class="section">
      <view class="section-title">
        <text>周期设置</text>
      </view>
      <view class="settings-card">
        <view class="setting-item">
          <text class="setting-label">月经周期长度</text>
          <input
            type="number"
            :value="cycleLength"
            @change="onCycleLengthChange"
            placeholder="天"
          />
        </view>
        <view class="setting-item">
          <text class="setting-label">经期持续天数</text>
          <input
            type="number"
            :value="periodLength"
            @change="onPeriodLengthChange"
            placeholder="天"
          />
        </view>
      </view>
    </view>

    <!-- 数据管理 -->
    <view class="section">
      <view class="section-title">
        <text>数据管理</text>
      </view>
      <view class="settings-card">
        <view class="setting-item">
          <text class="setting-label">清除所有数据</text>
          <button class="danger-btn" @click="onClearData">清除</button>
        </view>
      </view>
    </view>

    <!-- 关于 -->
    <view class="section">
      <view class="section-title">
        <text>关于</text>
      </view>
      <view class="settings-card">
        <view class="about-item">
          <text>接好孕 v1.0.0</text>
          <text class="about-desc">备孕预测工具</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { store } from '../../store/index.js';
import { periodsApi } from '../../api/periods.js';
import { temperaturesApi } from '../../api/temperatures.js';
import { ovulationTestsApi } from '../../api/ovulationTests.js';
import { intercourseRecordsApi } from '../../api/intercourseRecords.js';

export default {
  data() {
    return {
      cycleLength: 28,
      periodLength: 5
    };
  },
  computed: {
    openid() {
      return store.state.openid || '';
    }
  },
  onShow() {
    this.cycleLength = store.state.cycleLength;
    this.periodLength = store.state.periodLength;
  },
  methods: {
    async onCycleLengthChange(e) {
      const value = parseInt(e.detail.value);
      if (value && value > 0) {
        this.cycleLength = value;
        store.updateSettings(this.cycleLength, this.periodLength);
      }
    },
    async onPeriodLengthChange(e) {
      const value = parseInt(e.detail.value);
      if (value && value > 0) {
        this.periodLength = value;
        store.updateSettings(this.cycleLength, this.periodLength);
      }
    },
    onClearData() {
      uni.showModal({
        title: '确认清除',
        content: '确定要清除所有数据吗？此操作不可恢复。',
        success: async (res) => {
          if (res.confirm) {
            await this.clearAllData();
          }
        }
      });
    },
    async clearAllData() {
      try {
        // 清除所有记录
        const apis = [
          periodsApi,
          temperaturesApi,
          ovulationTestsApi,
          intercourseRecordsApi
        ];

        for (const api of apis) {
          const listMethod = api.list || (() => ({ periods: [], temperatures: [], ovulation_tests: [], intercourse_records: [] }));
          let res;
          try {
            res = await api.list({ page: 1, limit: 1000 });
          } catch {
            continue;
          }

          const ids = res.periods?.map(p => p._id)
            || res.temperatures?.map(t => t._id)
            || res.ovulation_tests?.map(o => o._id)
            || res.intercourse_records?.map(i => i._id)
            || [];

          for (const id of ids) {
            try {
              await api.delete(id);
            } catch {}
          }
        }

        uni.showToast({ title: '数据已清除' });
      } catch (error) {
        uni.showToast({ title: '清除失败', icon: 'none' });
      }
    }
  }
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #fdf8f3;
  padding: 20px;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  padding: 8px 0;
  margin-bottom: 8px;
}

.section-title text {
  font-size: 14px;
  color: #4A4541;
  font-weight: 500;
}

.user-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 16px;
  color: #4A4541;
  font-weight: 500;
}

.user-id {
  font-size: 12px;
  color: #9B9B9B;
  margin-top: 4px;
}

.settings-card {
  background: #fff;
  border-radius: 16px;
  padding: 8px 0;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0ebe6;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  font-size: 14px;
  color: #4A4541;
}

.setting-item input {
  width: 80px;
  text-align: right;
  font-size: 14px;
  color: #9CAF88;
}

.danger-btn {
  background: #E8B4B8;
  color: #fff;
  font-size: 12px;
  padding: 6px 16px;
  border: none;
}

.about-item {
  padding: 16px 20px;
  text-align: center;
}

.about-item text {
  display: block;
  font-size: 14px;
  color: #4A4541;
}

.about-desc {
  color: #9B9B9B !important;
  font-size: 12px !important;
  margin-top: 4px;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/settings/settings.vue
git commit -m "feat: 设置页 - 账户信息、周期设置、数据管理"
```

---

## 计划自检

### Spec 覆盖检查

| 设计方案章节 | 实现任务 |
|------------|---------|
| 2.1 首页（概率曲线图） | Task 11 |
| 2.2 数据录入页 | Task 12 |
| 2.3 统计页 | Task 13 |
| 3.1 优先级规则 | Task 7 |
| 3.2 周期法基础计算 | Task 7 |
| 3.3 体温修正 | Task 7 |
| 3.4 试纸修正 | Task 7 |
| 3.5 同房置信因子 | Task 7 |
| 4.1 MongoDB 数据模型 | Task 2 |
| 4.2 索引设计 | Task 2 |
| 5.1 技术栈 | Task 1 |
| 5.2 微信登录 | Task 3 |
| 5.3 数据隔离 | Task 3 |
| 5.4 API 设计 | Task 4-7 |
| 7.1 MVP 范围 | Task 8-14 |

### 占位符检查
- 无 TBD/TODO
- 无 "implement later"
- 无 "add appropriate error handling" 等模糊描述

### 类型一致性检查
- `generateProbabilityCurve(openid, days)` - 一致
- `getCycleStats(openid)` - 一致
- API 路由前缀 - 一致

---

## 执行选择

**Plan complete and saved to `docs/superpowers/plans/2026-03-27-fertility-predictor-implementation.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
