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