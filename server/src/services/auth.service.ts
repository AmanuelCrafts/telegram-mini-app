import { IUser, User } from '../models/user.model';
import { AuthUserResponse, VerifiedTelegramData } from '../types/auth.types';
import { ForbiddenError } from '../utils/errors';
import { telegramService } from './telegram.service';

export class AuthService {
  /**
   * Authenticate a Telegram Mini App user using verified initData.
   * Finds existing user or creates a new user.
   */
  public async authenticateTelegram(initData: string): Promise<IUser> {
    const verifiedData: VerifiedTelegramData = telegramService.verifyInitData(initData);
    const { user: tgUser } = verifiedData;

    const telegramId = String(tgUser.id);

    // Look for existing user
    let user = await User.findOne({ telegramId });

    if (!user) {
      // Create new user
      user = await User.create({
        telegramId,
        username: tgUser.username || undefined,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name || undefined,
        avatarUrl: tgUser.photo_url || undefined,
        status: 'ACTIVE',
      });
      console.log(`👤 New user registered: ${user.firstName} (Telegram ID: ${user.telegramId})`);
    } else {
      // Update existing user profile info if changed
      let hasChanges = false;

      if (user.firstName !== tgUser.first_name) {
        user.firstName = tgUser.first_name;
        hasChanges = true;
      }

      if (tgUser.last_name !== undefined && user.lastName !== tgUser.last_name) {
        user.lastName = tgUser.last_name;
        hasChanges = true;
      }

      if (tgUser.username !== undefined && user.username !== tgUser.username) {
        user.username = tgUser.username;
        hasChanges = true;
      }

      if (tgUser.photo_url !== undefined && user.avatarUrl !== tgUser.photo_url) {
        user.avatarUrl = tgUser.photo_url;
        hasChanges = true;
      }

      if (hasChanges) {
        await user.save();
        console.log(`🔄 Updated user profile for Telegram ID: ${user.telegramId}`);
      }
    }

    // Check account status
    if (user.status === 'SUSPENDED') {
      throw new ForbiddenError('Your account has been suspended. Please contact support.');
    }

    return user;
  }

  /**
   * Format User Mongoose document into clean client-safe DTO.
   */
  public formatUserResponse(user: IUser): AuthUserResponse {
    return {
      id: user._id.toString(),
      telegramId: user.telegramId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      status: user.status,
    };
  }
}

export const authService = new AuthService();
