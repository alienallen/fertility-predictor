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