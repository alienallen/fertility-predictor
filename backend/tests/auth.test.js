const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');

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