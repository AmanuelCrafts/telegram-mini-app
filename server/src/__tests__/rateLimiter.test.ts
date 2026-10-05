import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { createApp } from '../app';
import { env } from '../config/env';

describe('Rate Limiting Tests', () => {
  let mongoServer: MongoMemoryServer;
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    app = createApp();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('12. Enforces authentication rate limits when threshold is exceeded', async () => {
    const limit = env.AUTH_RATE_LIMIT; // default 10

    // Send requests up to limit
    for (let i = 0; i < limit; i++) {
      await request(app)
        .post('/api/auth/telegram')
        .send({ initData: 'invalid_data_to_trigger_fast_response' });
    }

    // Next request should be blocked by rate limiter (HTTP 429)
    const rateLimitedRes = await request(app)
      .post('/api/auth/telegram')
      .send({ initData: 'any' });

    expect(rateLimitedRes.status).toBe(429);
    expect(rateLimitedRes.body.error).toBe('TooManyRequestsError');
    expect(rateLimitedRes.body.message).toContain('Too many authentication attempts');
  });
});
