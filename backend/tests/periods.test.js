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