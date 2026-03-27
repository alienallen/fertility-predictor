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