# 备孕预测应用 - 设计方案

## 1. 概述

一款专注于备孕的智能预测工具，通过多数据源（经期、体温、排卵试纸、同房记录）综合计算，以概率曲线图形式展示怀孕概率，帮助用户抓住最佳受孕时机。

## 2. 核心页面

### 2.1 首页（概率曲线图）

**布局：**
- 顶部：App 标题 + 设置入口
- 主区域：概率曲线图
- 底部：Tab 导航（首页/录入/统计/设置）

**曲线图规格：**
- X轴：时间轴，未来30天
- Y轴：怀孕概率，0-100%
- 曲线特征：
  - 排卵日当天概率最高（100%或峰值）
  - 排卵日前3天到排卵日后1天为高概率区（>60%）
  - 排卵日后概率递减
- 标记点：
  - 排卵日：垂直虚线 + 标记
  - 预计月经日：垂直虚线 + 标记
  - 最佳受孕窗口：高亮背景区域
- 今日指示线：垂直实线

**交互：**
- 点击曲线上某点 → 显示该日详情（日期、概率值、状态说明）
- 左右滑动/切换 → 查看前后30天

### 2.2 数据录入页

**Tab 结构：**
- 经期 Tab
- 体温 Tab
- 试纸 Tab
- 同房 Tab

**经期录入：**
- 字段：上次月经开始日期（日期选择器）
- 说明：记录经期第一天，用于计算周期和预测

**体温录入：**
- 字段：日期（默认当天）、体温值（数字输入，精度0.1℃）
- 说明：每日基础体温，醒来后未活动时测量

**试纸录入：**
- 字段：检测日期时间、结果（单选：阴性/弱阳/强阳/已排卵）
- 说明：排卵试纸检测结果

**同房录入：**
- 字段：日期（日期选择器）
- 说明：记录同房日期，用于概率置信度计算

### 2.3 统计页

**Tab 结构：**
- 周期 Tab
- 概率 Tab
- 倒计时 Tab

**周期统计：**
- 平均周期长度（天）
- 最长周期长度（天）
- 最短周期长度（天）
- 周期数统计

**概率值：**
- 当前周期怀孕概率（%）
- 置信度说明（基于多少天期的数据）

**排卵日倒计时：**
- 距离排卵日还有 X 天
- 排卵日日期

## 3. 概率计算算法

### 3.1 优先级规则

```
if (有试纸记录) {
  // 试纸优先
  if (试纸结果 == '已排卵') 当天概率 = 100%
  else if (试纸结果 == '强阳') 当天及前后1天 = 高概率
  else if (试纸结果 == '弱阳') 当天概率 = 中等
  else 概率 = 低
} else if (有体温记录) {
  // 体温辅助
  // 体温下降日+1 = 预计排卵日
  // 体温升高后持续高温 = 已排卵
} else {
  // 纯周期法
  排卵日 = 下次月经开始日 - 14天
}
```

### 3.2 周期法基础计算

```
排卵日 = 下次月经开始日期 - 14天
易孕窗口 = 排卵日前5天 + 排卵日后1天（共7天）

概率曲线（无修正因素时）：
- 排卵日当天：60%
- 排卵日前1天：50%
- 排卵日前2-3天：40%
- 排卵日前4-5天：20%
- 排卵日后：递减
```

### 3.3 体温修正

```
if (体温记录显示升温) {
  // 体温升高超过0.3℃持续2天 → 已排卵
  排卵日 = 升温开始日 + 1天
  之后概率快速下降
}
```

### 3.4 试纸修正

```
if (试纸 == '已排卵') 概率 = 100%，后续快速下降
if (试纸 == '强阳') 排卵日 = 今天，前后窗口高概率
if (试纸 == '弱阳') 概率中等
if (试纸 == '阴性') 概率降低
```

### 3.5 同房记录置信因子

```
周期成功概率置信度：
- 有同房记录 + 在易孕窗口内 → 置信度 +20%
- 有同房记录 + 不在易孕窗口 → 置信度 +5%
- 无同房记录 → 置信度不变
```

## 4. 数据模型

### 4.1 MongoDB Collections

**users**
```json
{
  "_id": ObjectId,
  "openid": String,           // 微信用户唯一标识
  "unionid": String,           // 跨平台unionid（可选）
  "session_key": String,       // 微信会话密钥
  "cycle_length": Number,      // 周期长度，默认28
  "period_length": Number,     // 经期持续天数，默认5
  "created_at": Date,
  "updated_at": Date
}
```

**periods**
```json
{
  "_id": ObjectId,
  "openid": String,
  "start_date": Date,          // 经期开始日期
  "end_date": Date,            // 经期结束日期（可选）
  "cycle_length": Number,     // 录入时的周期长度参考值
  "created_at": Date
}
```

**temperatures**
```json
{
  "_id": ObjectId,
  "openid": String,
  "record_date": Date,         // 记录日期（精度到天）
  "temperature": Number,       // 体温值，精度0.1℃
  "created_at": Date
}
```

**ovulation_tests**
```json
{
  "_id": ObjectId,
  "openid": String,
  "test_date": Date,           // 检测时间
  "result": Number,            // 0=阴性, 1=弱阳, 2=强阳, 3=已排卵
  "created_at": Date
}
```

**intercourse_records**
```json
{
  "_id": ObjectId,
  "openid": String,
  "record_date": Date,         // 同房日期
  "created_at": Date
}
```

### 4.2 索引设计

```javascript
// users
db.users.createIndex({ "openid": 1 }, { unique: true })

// periods
db.periods.createIndex({ "openid": 1, "start_date": -1 })

// temperatures
db.temperatures.createIndex({ "openid": 1, "record_date": -1 })

// ovulation_tests
db.ovulation_tests.createIndex({ "openid": 1, "test_date": -1 })

// intercourse_records
db.intercourse_records.createIndex({ "openid": 1, "record_date": -1 })
```

## 5. 技术方案

### 5.1 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | uni-app (Vue 3) | 兼容微信小程序 + Web |
| 后端 | Node.js | 微信云托管或独立部署 |
| 数据库 | MongoDB | 微信云数据库或 Atlas |
| 认证 | 微信一键登录 | wx.login() 获取 openid |

### 5.2 微信登录流程

```
1. 前端调用 wx.login() 获取 code
2. 前端将 code 发送到后端
3. 后端通过 code2Session 获取 openid + session_key
4. 后端创建/查询用户记录
5. 返回用户信息到前端
6. 前端缓存用户信息
```

### 5.3 数据隔离

每个 MongoDB 文档通过 `openid` 字段隔离，确保用户只能访问自己的数据。

### 5.4 API 设计

**认证相关**
- `POST /api/auth/login` - 微信登录

**用户相关**
- `GET /api/users/me` - 获取当前用户信息
- `PUT /api/users/me` - 更新用户设置

**经期相关**
- `GET /api/periods` - 获取经期记录列表
- `POST /api/periods` - 创建经期记录
- `PUT /api/periods/:id` - 更新经期记录
- `DELETE /api/periods/:id` - 删除经期记录

**体温相关**
- `GET /api/temperatures` - 获取体温记录列表
- `POST /api/temperatures` - 创建体温记录
- `PUT /api/temperatures/:id` - 更新体温记录
- `DELETE /api/temperatures/:id` - 删除体温记录

**试纸相关**
- `GET /api/ovulation-tests` - 获取试纸记录列表
- `POST /api/ovulation-tests` - 创建试纸记录
- `PUT /api/ovulation-tests/:id` - 更新试纸记录
- `DELETE /api/ovulation-tests/:id` - 删除试纸记录

**同房记录相关**
- `GET /api/intercourse-records` - 获取同房记录列表
- `POST /api/intercourse-records` - 创建同房记录
- `DELETE /api/intercourse-records/:id` - 删除同房记录

**预测相关**
- `GET /api/predictions/probability-curve` - 获取概率曲线数据
- `GET /api/predictions/stats` - 获取统计数据

### 5.5 项目结构

```
/
├── frontend/                  # uni-app 前端
│   ├── src/
│   │   ├── pages/
│   │   │   ├── index/         # 首页（曲线图）
│   │   │   ├── input/         # 数据录入页
│   │   │   ├── stats/         # 统计页
│   │   │   └── settings/      # 设置页
│   │   ├── components/        # 公共组件
│   │   ├── api/               # API 请求
│   │   ├── store/             # 状态管理
│   │   └── utils/             # 工具函数
│   ├── pages.json
│   └── manifest.json
│
├── backend/                   # Node.js 后端
│   ├── src/
│   │   ├── routes/            # 路由
│   │   ├── controllers/       # 控制器
│   │   ├── services/          # 业务逻辑
│   │   ├── models/            # 数据模型
│   │   └── middleware/        # 中间件
│   └── package.json
│
└── docs/
    ├── PRD.md                 # 产品需求文档
    └── specs/                 # 设计文档
```

## 6. UI 风格（待定）

UI 设计后续讨论。

## 7. MVP 范围

### 7.1 实现

- 微信一键登录
- 经期记录 CRUD
- 体温记录 CRUD
- 排卵试纸记录 CRUD
- 同房记录 CRUD
- 概率曲线图展示
- 周期统计
- 周期长度自动计算（基于历史记录）

### 7.2 暂不做

- 推送提醒
- 数据导出/导入
- 多设备同步
- 历史记录趋势分析

## 8. 版本

- v1.0 - 2026-03-27 - 初始设计方案
