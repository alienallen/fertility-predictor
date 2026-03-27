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