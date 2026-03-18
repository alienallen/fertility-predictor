/**
 * 数据路由
 * 处理用户数据的 CRUD 操作
 */
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { readUserData, writeUserData } = require('../utils/storage');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// 所有路由都需要认证
router.use(authMiddleware);

/**
 * GET /api/data
 * 获取用户所有数据
 */
router.get('/', (req, res) => {
  try {
    const data = readUserData(req.user.id);
    
    if (!data) {
      return res.status(200).json({
        code: 0,
        data: {
          userId: req.user.id,
          records: [],
          predictions: [],
        },
      });
    }
    
    res.status(200).json({
      code: 0,
      data,
    });
  } catch (error) {
    console.error('Get data error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  }
});

/**
 * POST /api/data/records
 * 创建新记录
 */
router.post('/records', (req, res) => {
  try {
    const { type, date, value, notes, isStart, isEnd } = req.body;
    
    // 验证必填字段
    if (!type || !date) {
      return res.status(400).json({
        code: 400,
        message: '类型和日期为必填项',
      });
    }
    
    // 验证记录类型
    const validTypes = ['menstruation', 'ovulation', 'temperature', 'intercourse'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        code: 400,
        message: '无效的记录类型',
      });
    }
    
    const data = readUserData(req.user.id) || { userId: req.user.id, records: [] };
    
    // 检查同日期同类型记录是否已存在
    const existingIndex = data.records.findIndex(
      r => r.date === date && r.type === type
    );
    
    const newRecord = {
      id: uuidv4(),
      type,
      date,
      value: value || null,
      notes: notes || '',
      isStart: isStart || false,
      isEnd: isEnd || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    if (existingIndex >= 0) {
      // 更新已存在的记录
      data.records[existingIndex] = {
        ...data.records[existingIndex],
        ...newRecord,
        id: data.records[existingIndex].id,
        createdAt: data.records[existingIndex].createdAt,
      };
    } else {
      data.records.push(newRecord);
    }
    
    // 按日期排序
    data.records.sort((a, b) => b.date.localeCompare(a.date));
    
    writeUserData(req.user.id, data);
    
    res.status(200).json({
      code: 0,
      message: '记录保存成功',
      data: existingIndex >= 0 ? data.records[existingIndex] : newRecord,
    });
  } catch (error) {
    console.error('Create record error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  }
});

/**
 * GET /api/data/records
 * 获取记录列表
 */
router.get('/records', (req, res) => {
  try {
    const { type, startDate, endDate, limit } = req.query;
    
    const data = readUserData(req.user.id) || { records: [] };
    let records = [...data.records];
    
    // 按类型过滤
    if (type) {
      records = records.filter(r => r.type === type);
    }
    
    // 按日期范围过滤
    if (startDate) {
      records = records.filter(r => r.date >= startDate);
    }
    if (endDate) {
      records = records.filter(r => r.date <= endDate);
    }
    
    // 限制数量
    if (limit) {
      records = records.slice(0, parseInt(limit));
    }
    
    res.status(200).json({
      code: 0,
      data: records,
    });
  } catch (error) {
    console.error('Get records error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  }
});

/**
 * GET /api/data/records/:id
 * 获取单条记录
 */
router.get('/records/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = readUserData(req.user.id) || { records: [] };
    
    const record = data.records.find(r => r.id === id);
    
    if (!record) {
      return res.status(404).json({
        code: 404,
        message: '记录不存在',
      });
    }
    
    res.status(200).json({
      code: 0,
      data: record,
    });
  } catch (error) {
    console.error('Get record error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  }
});

/**
 * PUT /api/data/records/:id
 * 更新记录
 */
router.put('/records/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { type, date, value, notes, isStart, isEnd } = req.body;
    
    const data = readUserData(req.user.id) || { records: [] };
    const index = data.records.findIndex(r => r.id === id);
    
    if (index < 0) {
      return res.status(404).json({
        code: 404,
        message: '记录不存在',
      });
    }
    
    const updates = {
      type,
      date,
      value,
      notes,
      isStart,
      isEnd,
      updatedAt: new Date().toISOString(),
    };
    
    // 过滤掉 undefined
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined) delete updates[key];
    });
    
    data.records[index] = {
      ...data.records[index],
      ...updates,
    };
    
    writeUserData(req.user.id, data);
    
    res.status(200).json({
      code: 0,
      message: '更新成功',
      data: data.records[index],
    });
  } catch (error) {
    console.error('Update record error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  }
});

/**
 * DELETE /api/data/records/:id
 * 删除记录
 */
router.delete('/records/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const data = readUserData(req.user.id) || { records: [] };
    const index = data.records.findIndex(r => r.id === id);
    
    if (index < 0) {
      return res.status(404).json({
        code: 404,
        message: '记录不存在',
      });
    }
    
    data.records.splice(index, 1);
    writeUserData(req.user.id, data);
    
    res.status(200).json({
      code: 0,
      message: '删除成功',
    });
  } catch (error) {
    console.error('Delete record error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  }
});

/**
 * GET /api/data/records/date/:date
 * 获取指定日期的记录
 */
router.get('/records/date/:date', (req, res) => {
  try {
    const { date } = req.params;
    
    const data = readUserData(req.user.id) || { records: [] };
    const records = data.records.filter(r => r.date === date);
    
    res.status(200).json({
      code: 0,
      data: records,
    });
  } catch (error) {
    console.error('Get records by date error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  }
});

/**
 * POST /api/data/export
 * 导出数据
 */
router.post('/export', (req, res) => {
  try {
    const data = readUserData(req.user.id);
    
    res.status(200).json({
      code: 0,
      data: {
        userId: req.user.id,
        exportedAt: new Date().toISOString(),
        data: data || { records: [] },
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  }
});

/**
 * POST /api/data/import
 * 导入数据
 */
router.post('/import', (req, res) => {
  try {
    const { records } = req.body;
    
    if (!Array.isArray(records)) {
      return res.status(400).json({
        code: 400,
        message: '数据格式错误',
      });
    }
    
    const data = readUserData(req.user.id) || { userId: req.user.id };
    
    // 合并记录
    const existingIds = new Set(data.records.map(r => r.id));
    const newRecords = records.filter(r => !existingIds.has(r.id));
    
    data.records = [...data.records, ...newRecords];
    data.records.sort((a, b) => b.date.localeCompare(a.date));
    
    writeUserData(req.user.id, data);
    
    res.status(200).json({
      code: 0,
      message: '导入成功',
      data: {
        imported: newRecords.length,
        total: data.records.length,
      },
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  }
});

/**
 * DELETE /api/data/clear
 * 清除所有数据
 */
router.delete('/clear', (req, res) => {
  try {
    writeUserData(req.user.id, {
      userId: req.user.id,
      records: [],
      predictions: [],
    });
    
    res.status(200).json({
      code: 0,
      message: '数据已清除',
    });
  } catch (error) {
    console.error('Clear data error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  }
});

module.exports = router;
