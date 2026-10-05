import { TelegramService } from '../services/telegram.service';
import { generateTestInitData } from '../utils/crypto';
import { BadRequestError, UnauthorizedError } from '../utils/errors';

describe('TelegramService - Signature Verification & Validation', () => {
  const TEST_BOT_TOKEN = '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz';
  let telegramService: TelegramService;

  beforeEach(() => {
    // 24 hours max age for tests
    telegramService = new TelegramService(TEST_BOT_TOKEN, 86400);
  });

  const getValidParams = () => {
    const now = Math.floor(Date.now() / 1000);
    return {
      auth_date: String(now),
      query_id: 'AAHdF6IQAAAAAN0XohDhrOrc',
      user: JSON.stringify({
        id: 987654321,
        first_name: 'Amanuel',
        last_name: 'Developer',
        username: 'amanuel_dev',
        language_code: 'en',
        photo_url: 'https://t.me/i/userpic/320/test.jpg',
      }),
    };
  };

  it('1. Successfully verifies and parses valid Telegram initData', () => {
    const params = getValidParams();
    const initData = generateTestInitData(params, TEST_BOT_TOKEN);

    const verified = telegramService.verifyInitData(initData);

    expect(verified).toBeDefined();
    expect(verified.user.id).toBe(987654321);
    expect(verified.user.first_name).toBe('Amanuel');
    expect(verified.user.last_name).toBe('Developer');
    expect(verified.user.username).toBe('amanuel_dev');
    expect(verified.user.photo_url).toBe('https://t.me/i/userpic/320/test.jpg');
    expect(verified.authDate).toBe(Number(params.auth_date));
  });

  it('2. Rejects invalid initData with altered hash', () => {
    const params = getValidParams();
    const initData = generateTestInitData(params, TEST_BOT_TOKEN);
    // Tamper with the hash string
    const tamperedInitData = initData.replace(/hash=[a-f0-9]{10}/, 'hash=ffffffffff');

    expect(() => {
      telegramService.verifyInitData(tamperedInitData);
    }).toThrow(UnauthorizedError);
  });

  it('3. Rejects tampered initData where parameter was modified after signing', () => {
    const params = getValidParams();
    const initData = generateTestInitData(params, TEST_BOT_TOKEN);
    // Tamper with username in query string without regenerating hash
    const tamperedInitData = initData.replace('amanuel_dev', 'hacker_user');

    expect(() => {
      telegramService.verifyInitData(tamperedInitData);
    }).toThrow(UnauthorizedError);
  });

  it('4. Rejects expired authentication data', () => {
    const oldTimestamp = Math.floor(Date.now() / 1000) - 90000; // ~25 hours ago (> 24 hours)
    const params = {
      ...getValidParams(),
      auth_date: String(oldTimestamp),
    };
    const expiredInitData = generateTestInitData(params, TEST_BOT_TOKEN);

    expect(() => {
      telegramService.verifyInitData(expiredInitData);
    }).toThrow(UnauthorizedError);
  });

  it('5. Rejects future auth_date (> 60s in the future)', () => {
    const futureTimestamp = Math.floor(Date.now() / 1000) + 120; // 2 minutes in future
    const params = {
      ...getValidParams(),
      auth_date: String(futureTimestamp),
    };
    const futureInitData = generateTestInitData(params, TEST_BOT_TOKEN);

    expect(() => {
      telegramService.verifyInitData(futureInitData);
    }).toThrow(UnauthorizedError);
  });

  it('6. Rejects empty or missing initData', () => {
    expect(() => {
      telegramService.verifyInitData('');
    }).toThrow(BadRequestError);

    expect(() => {
      // @ts-expect-error test invalid parameter type
      telegramService.verifyInitData(null);
    }).toThrow(BadRequestError);
  });

  it('7. Rejects initData missing hash parameter', () => {
    const params = getValidParams();
    const searchParams = new URLSearchParams(params);

    expect(() => {
      telegramService.verifyInitData(searchParams.toString());
    }).toThrow(UnauthorizedError);
  });

  it('8. Rejects initData missing user parameter', () => {
    const now = Math.floor(Date.now() / 1000);
    const params: Record<string, string> = {
      auth_date: String(now),
      query_id: 'AAHdF6IQAAAAAN0XohDhrOrc',
    };
    const initData = generateTestInitData(params, TEST_BOT_TOKEN);

    expect(() => {
      telegramService.verifyInitData(initData);
    }).toThrow(UnauthorizedError);
  });

  it('9. Rejects initData with malformed JSON user', () => {
    const now = Math.floor(Date.now() / 1000);
    const params: Record<string, string> = {
      auth_date: String(now),
      user: '{not_valid_json}',
    };
    const initData = generateTestInitData(params, TEST_BOT_TOKEN);

    expect(() => {
      telegramService.verifyInitData(initData);
    }).toThrow(BadRequestError);
  });
});
