import request from 'supertest';
import app from '../app.js';

describe('GET /api/v1/health', () => {
  it('returns 200 and status ok', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('ok');
  });
});
