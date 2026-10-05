import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { createApp } from '../app';
import { env } from '../config/env';
import { Session } from '../models/session.model';
import { User } from '../models/user.model';
import { generateTestInitData } from '../utils/crypto';

describe('Auth & User API Integration Tests', () => {
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

  beforeEach(async () => {
    await User.deleteMany({});
    await Session.deleteMany({});
  });

  const createValidInitData = (
    telegramId: number = 123456789,
    username: string = 'testuser',
    firstName: string = 'John',
    lastName?: string,
    photoUrl?: string
  ) => {
    const now = Math.floor(Date.now() / 1000);
    const params: Record<string, string> = {
      auth_date: String(now),
      query_id: 'AAHdF6IQAAAAAN0XohDhrOrc',
      user: JSON.stringify({
        id: telegramId,
        first_name: firstName,
        last_name: lastName,
        username,
        photo_url: photoUrl,
      }),
    };
    return generateTestInitData(params, env.TELEGRAM_BOT_TOKEN);
  };

  it('1. Valid Telegram initData succeeds and creates exactly one MongoDB user', async () => {
    const initData = createValidInitData(111222333, 'johndoe', 'John', 'Doe');

    const response = await request(app)
      .post('/api/auth/telegram')
      .send({ initData })
      .expect(200);

    // Verify response format
    expect(response.body.user).toBeDefined();
    expect(response.body.user.telegramId).toBe('111222333');
    expect(response.body.user.firstName).toBe('John');
    expect(response.body.user.lastName).toBe('Doe');
    expect(response.body.user.username).toBe('johndoe');
    expect(response.body.user.status).toBe('ACTIVE');

    // 14. Bot token is NEVER returned in response
    expect(JSON.stringify(response.body)).not.toContain(env.TELEGRAM_BOT_TOKEN);
    expect(response.body.botToken).toBeUndefined();

    // Verify HTTP-only session cookie is set
    const cookies = response.headers['set-cookie'] as unknown as string[] | undefined;
    expect(cookies).toBeDefined();
    const sessionCookie = Array.isArray(cookies) ? cookies.find((c: string) => c.includes('tg_session_id=')) : undefined;
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie).toContain('HttpOnly');

    // 5. Verify database user count is exactly 1
    const userCount = await User.countDocuments({ telegramId: '111222333' });
    expect(userCount).toBe(1);

    // Verify session count is 1
    const sessionCount = await Session.countDocuments();
    expect(sessionCount).toBe(1);
  });

  it('6 & 7. Existing Telegram user is recognized on repeated authentication and does not duplicate', async () => {
    const initData1 = createValidInitData(444555666, 'sam_original', 'Sam');

    // First login
    await request(app)
      .post('/api/auth/telegram')
      .send({ initData: initData1 })
      .expect(200);

    expect(await User.countDocuments({ telegramId: '444555666' })).toBe(1);

    // Second login with updated username
    const initData2 = createValidInitData(444555666, 'sam_updated', 'Sam Updated');
    const response2 = await request(app)
      .post('/api/auth/telegram')
      .send({ initData: initData2 })
      .expect(200);

    expect(response2.body.user.username).toBe('sam_updated');
    expect(response2.body.user.firstName).toBe('Sam Updated');

    // Still exactly 1 user in DB
    const totalUsers = await User.countDocuments({ telegramId: '444555666' });
    expect(totalUsers).toBe(1);
  });

  it('2. Invalid initData hash is rejected with 401', async () => {
    const initData = createValidInitData(777, 'fake', 'Fake');
    const corruptedInitData = initData.replace(/hash=[a-f0-9]{8}/, 'hash=12345678');

    const res = await request(app)
      .post('/api/auth/telegram')
      .send({ initData: corruptedInitData })
      .expect(401);

    expect(res.body.error).toBe('UnauthorizedError');
    expect(res.body.message).toContain('invalid signature');
  });

  it('3. Tampered initData is rejected with 401', async () => {
    const initData = createValidInitData(888, 'real', 'Real');
    // Change id in query string without changing hash
    const tampered = initData.replace('888', '999');

    const res = await request(app)
      .post('/api/auth/telegram')
      .send({ initData: tampered })
      .expect(401);

    expect(res.body.error).toBe('UnauthorizedError');
  });

  it('4. Expired authentication data is rejected with 401', async () => {
    const oldTimestamp = Math.floor(Date.now() / 1000) - 100000; // > 24 hours ago
    const params: Record<string, string> = {
      auth_date: String(oldTimestamp),
      user: JSON.stringify({ id: 999, first_name: 'Old' }),
    };
    const expiredInitData = generateTestInitData(params, env.TELEGRAM_BOT_TOKEN);

    const res = await request(app)
      .post('/api/auth/telegram')
      .send({ initData: expiredInitData })
      .expect(401);

    expect(res.body.message).toContain('expired');
  });

  it('13. Invalid request bodies (missing initData) are rejected with 400', async () => {
    const res1 = await request(app)
      .post('/api/auth/telegram')
      .send({})
      .expect(400);

    expect(res1.body.error).toBe('BadRequestError');

    const res2 = await request(app)
      .post('/api/auth/telegram')
      .send({ initData: '   ' })
      .expect(400);

    expect(res2.body.error).toBe('BadRequestError');
  });

  it('8. Authenticated /api/auth/me returns the correct user with valid cookie', async () => {
    const initData = createValidInitData(12345, 'sessionuser', 'Alice');

    // Sign in to get cookie
    const loginRes = await request(app)
      .post('/api/auth/telegram')
      .send({ initData })
      .expect(200);

    const cookieHeader = loginRes.headers['set-cookie'];

    // Call /api/auth/me with cookie
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookieHeader)
      .expect(200);

    expect(meRes.body.user).toBeDefined();
    expect(meRes.body.user.telegramId).toBe('12345');
    expect(meRes.body.user.firstName).toBe('Alice');
  });

  it('9 & 11. Unauthenticated /api/auth/me returns 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .expect(401);

    expect(res.body.error).toBe('UnauthorizedError');
    expect(res.body.message).toContain('Authentication required');
  });

  it('10. Logout invalidates the session and subsequent requests return 401', async () => {
    const initData = createValidInitData(54321, 'logoutuser', 'Bob');

    const loginRes = await request(app)
      .post('/api/auth/telegram')
      .send({ initData })
      .expect(200);

    const cookieHeader = loginRes.headers['set-cookie'];

    // Verify authenticated
    await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookieHeader)
      .expect(200);

    // Call logout
    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookieHeader)
      .expect(200);

    expect(logoutRes.body.success).toBe(true);

    // Call /api/auth/me again -> should fail with 401
    await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookieHeader)
      .expect(401);

    // Verify session was destroyed in DB
    const sessionCount = await Session.countDocuments();
    expect(sessionCount).toBe(0);
  });
});
