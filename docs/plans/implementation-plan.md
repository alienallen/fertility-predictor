# 备孕预测应用 - 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 构建一款备孕预测小程序/Web应用，支持经期/体温/试纸记录，精准预测易孕日，以月历形式展示

**Architecture:** 
- 前端：Vue 3 + uni-app（兼顾 Web 与小程序）
- 后端：Node.js API 服务
- 存储：本地 JSON 文件 + AES-256 加密，按用户隔离
- 推送：极光推送（国内）+ Firebase（海外）

**Tech Stack:** Vue 3, uni-app, Node.js, Express, AES-256-GCM

---

## 阶段一：项目初始化

### Task 1: 初始化 uni-app 项目

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/src/App.vue`
- Create: `frontend/src/main.js`
- Create: `frontend/pages/index/index.vue`
- Create: `frontend/uni.scss`
- Create: `frontend/pages.json`
- Create: `frontend/manifest.json`

**Step 1: 创建项目目录结构和 package.json**

```bash
mkdir -p frontend/src/{pages/{index,records,stats,settings},components,utils,api,store}
mkdir -p backend/src/{routes,utils,middleware}
```

**Step 2: 创建 package.json**

```json
{
  "name": "fertility-predictor",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev:web": "uni",
    "dev:mp-weixin": "uni -m mp-weixin",
    "build:web": "uni build",
    "server": "node backend/src/index.js"
  }
}
```

**Step 3: 创建基础 uni-app 配置文件**

创建 `pages.json` 配置页面路由和底部导航栏

**Step 4: Commit**

```bash
git init
git add .
git commit -m "chore: init uni-app project structure"
```

---

### Task 2: 配置 ESLint 和代码规范

**Files:**
- Create: `.eslintrc.js`
- Create: `.prettierrc`

**Step 1: 创建 ESLint 配置**

```javascript
module.exports = {
  extends: ['@uni-helper/uni-app'],
  rules: {
    'vue/multi-word-component-names': 'off'
  }
}
```

**Step 2: Commit**

```bash
git add .
git commit -chore: add ESLint config"
```

---

## 阶段二：后端 API

### Task 3: 实现用户认证模块

**Files:**
- Create: `backend/src/index.js`
- Create: `backend/src/routes/auth.js`
- Create: `backend/src/middleware/auth.js`
- Create: `backend/src/utils/crypto.js`

**Step 1: 创建加密工具类**

```javascript
// backend/src/utils/crypto.js
const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const SALT = 'fertility-app-salt';

function deriveKey(password) {
  return crypto.pbkdf2Sync(password, SALT, 100000, 32, 'sha256');
}

function encrypt(data, password) {
  const key = deriveKey(password);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(data)), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return { iv: iv.toString('hex'), data: encrypted.toString('hex'), authTag: authTag.toString('hex') };
}

function decrypt(encryptedObj, password) {
  const key = deriveKey(password);
  const iv = Buffer.from(encryptedObj.iv, 'hex');
  const authTag = Buffer.from(encryptedObj.authTag, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = decipher.update(Buffer.from(encryptedObj.data, 'hex'), null, 'utf8');
  return JSON.parse(decrypted + decipher.final('utf8'));
}

module.exports = { encrypt, decrypt };
```

**Step 2: 创建 Express 服务入口**

```javascript
// backend/src/index.js
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

**Step 3: 创建认证路由**

实现微信登录和手机号注册接口

**Step 4: 测试**

```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"code": "test"}'
```

**Step 5: Commit**

```bash
git add backend/
git commit -m "feat: add auth module with encryption"
```

---

### Task 4: 实现数据存储模块

**Files:**
- Create: `backend/src/routes/data.js`
- Create: `backend/src/utils/storage.js`

**Step 1: 创建存储工具**

```javascript
// backend/src/utils/storage.js
const fs = require('fs');
const path = require('path');
const { encrypt, decrypt } = require('./crypto');

const DATA_DIR = path.join(__dirname, '../../data');

function saveUserData(userId, data, password) {
  const encrypted = encrypt(data, password);
  const filePath = path.join(DATA_DIR, `${userId}.enc`);
  fs.writeFileSync(filePath, JSON.stringify(encrypted));
}

function loadUserData(userId, password) {
  const filePath = path.join(DATA_DIR, `${userId}.enc`);
  if (!fs.existsSync(filePath)) return null;
  const encrypted = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return decrypt(encrypted, password);
}

module.exports = { saveUserData, loadUserData };
```

**Step 2: 创建数据路由**

实现经期、体温、试纸记录的 CRUD 接口

**Step 3: 测试**

```bash
curl -X POST http://localhost:3000/api/data/periods \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"startDate": "2026-03-14", "endDate": "2026-03-18"}'
```

**Step 4: Commit**

```bash
git add backend/
git commit -feat: add data storage module"
```

---

### Task 5: 实现预测算法模块

**Files:**
- Create: `backend/src/services/predictor.js`

**Step 1: 创建预测服务**

```javascript
// backend/src/services/predictor.js

/**
 * 预测排卵日和易孕期
 * @param {Object} userData - 用户完整数据
 * @returns {Object} - { ovulationDate, fertileWindow, fertilityLevel }
 */
function predict(data) {
  const { periods, temperatures, ovulationTests, user } = data;
  const cycleLength = user?.cycle_length || 28;
  const periodLength = user?.period_length || 5;
  
  // 优先级：试纸 > 体温 > 周期法
  if (ovulationTests && ovulationTests.length > 0) {
    return predictByTestStrip(ovulationTests);
  }
  
  if (temperatures && temperatures.length > 0) {
    return predictByTemperature(temperatures, cycleLength);
  }
  
  return predictByCycle(periods, cycleLength, periodLength);
}

function predictByCycle(periods, cycleLength, periodLength) {
  if (!periods || periods.length === 0) {
    return {
      ovulationDate: null,
      fertileWindow: { start: null, end: null },
      fertilityLevel: 'unknown'
    };
  }
  
  const lastPeriod = periods[periods.length - 1];
  const nextPeriodStart = addDays(lastPeriod.start_date, cycleLength);
  const ovulationDate = addDays(nextPeriodStart, -14);
  const fertileStart = addDays(ovulationDate, -5);
  const fertileEnd = addDays(ovulationDate, 1);
  
  return {
    ovulationDate: ovulationDate.toISOString().split('T')[0],
    fertileWindow: {
      start: fertileStart.toISOString().split('T')[0],
      end: fertileEnd.toISOString().split('T')[0]
    },
    fertilityLevel: 'cycle'
  };
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

module.exports = { predict };
```

**Step 2: 编写测试用例**

```javascript
// backend/tests/predictor.test.js
const { predict } = require('../src/services/predictor');

test('predicts ovulation by cycle method', () => {
  const data = {
    periods: [{ start_date: '2026-01-10', end_date: '2026-01-14' }],
    user: { cycle_length: 28, period_length: 5 }
  };
  const result = predict(data);
  expect(result.ovulationDate).toBe('2026-01-24');
});
```

**Step 3: 运行测试**

```bash
npm test
```

**Step 4: Commit**

```bash
git add backend/
git commit - "feat: add prediction algorithm"
```

---

## 阶段三：前端开发

### Task 6: 实现日历首页

**Files:**
- Create: `frontend/src/pages/index/index.vue`
- Create: `frontend/src/components/TodayCard.vue`
- Create: `frontend/src/components/Calendar.vue`
- Create: `frontend/src/utils/date.js`

**Step 1: 创建今日状态卡片组件**

```vue
<template>
  <view class="today-card">
    <view class="today-status">
      <view class="status-ring">
        <text>{{ fertilityText }}</text>
        <small>受孕率</small>
      </view>
      <view class="status-text">
        <text class="title">{{ statusTitle }}</text>
        <text class="desc">{{ statusDesc }}</text>
      </view>
    </view>
    <view class="fertile-level">
      <view v-for="i in 5" :key="i" class="fertile-dot" :class="{ active: i <= level, high: i >= level }"></view>
    </view>
  </view>
</template>
```

**Step 2: 创建日历组件**

实现月历渲染，支持：
- 月份切换
- 日期状态标记（经期/易孕/排卵）
- 今日高亮

**Step 3: 集成 API**

调用 `/api/predict` 获取预测数据并渲染

**Step 4: 页面展示**

验证日历正常显示，状态标记正确

**Step 5: Commit**

```bash
git add frontend/
git commit - "feat: implement calendar homepage"
```

---

### Task 7: 实现记录页面

**Files:**
- Create: `frontend/src/pages/records/index.vue`
- Create: `frontend/src/components/PeriodRecord.vue`
- Create: `frontend/src/components/TempRecord.vue`
- Create: `frontend/src/components/TestStripRecord.vue`

**Step 1: 创建记录 Tab 页面**

实现经期、体温、试纸三个 Tab 切换

**Step 2: 实现记录列表**

展示历史记录，支持新增、编辑、删除

**Step 3: 添加记录提示**

首次记录时显示引导提示

**Step 4: Commit**

```bash
git add frontend/
git commit - "feat: implement records page"
```

---

### Task 8: 实现设置页面

**Files:**
- Create: `frontend/src/pages/settings/index.vue`

**Step 1: 创建设置页面**

包含：
- 账户信息
- 周期设置（周期长度、经期天数）
- 提醒设置
- 数据导出
- 关于

**Step 2: Commit**

```bash
git add frontend/
git commit - "feat: implement settings page"
```

---

### Task 9: 实现推送提醒功能

**Files:**
- Create: `frontend/src/utils/push.js`
- Create: `backend/src/services/notification.js`

**Step 1: 前端推送设置**

集成 uni-push 或极光推送 SDK

**Step 2: 后端定时任务**

使用 node-cron 实现定时检查并推送

**Step 3: Commit**

```bash
git add frontend/ backend/
git commit - "feat: add push notification"
```

---

## 阶段四：测试与部署

### Task 10: 单元测试

**Files:**
- Create: `backend/tests/`
- Create: `frontend/tests/`

**Step 1: 后端测试**

- 加密解密
- 预测算法
- API 接口

**Step 2: 前端测试**

- 组件渲染
- 工具函数

**Step 3: Commit**

```bash
git add .
git commit - "test: add unit tests"
```

---

### Task 11: 构建与发布

**Step 1: Web 版构建**

```bash
npm run build:web
```

**Step 2: 小程序构建**

```bash
npm run build:mp-weixin
```

**Step 3: 部署后端**

```bash
pm2 start backend/src/index.js --name fertility-api
```

**Step 4: Commit**

```bash
git tag v1.0.0
git push --tags
```

---

## 执行方式

**Plan complete and saved to `docs/plans/implementation-plan.md`. Two execution options:**

1. **Subagent-Driven (this session)** - 派发子任务，逐个完成，快速迭代
2. **Parallel Session (separate)** - 开新 session 批量执行

选哪个？