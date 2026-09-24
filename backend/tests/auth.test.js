import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';

// These tests need a running MongoDB (set MONGODB_URI before running `npm test`).
// They're skipped automatically if it's not configured, so `npm test` still
// passes out of the box — remove the guard once you wire up a test database.
const describeIfDb = process.env.MONGODB_URI ? describe : describe.skip;

describeIfDb('Auth flow', () => {
  const user = { name: 'Test User', email: `test-${Date.now()}@dukaan.example`, password: 'password123' };

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('registers a new user', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(user);
    expect(res.statusCode).toBe(201);
    expect(res.body.data.user.email).toBe(user.email);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('rejects login with wrong password', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: user.email, password: 'wrongpass' });
    expect(res.statusCode).toBe(401);
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: user.email, password: user.password });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });
});
