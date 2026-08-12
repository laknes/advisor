import { prisma } from '@/lib/db';
import { createHash, randomInt } from 'crypto';
import { hashPassword, comparePassword, createToken } from '@/lib/auth';
import { AppError, ConflictError, NotFoundError, UnauthorizedError } from '@/lib/errors';
import type { RegisterInput, LoginInput, RequestOtpInput, UpdateProfileInput, VerifyOtpInput, RequestPasswordResetInput, ResetPasswordInput } from '@/lib/validations';
import { SettingsService } from './SettingsService';
import { createPasswordResetToken, consumePasswordResetToken } from '@/lib/passwordReset';

function normalizePhone(phone: string) {
  const normalized = phone
    .trim()
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[()\s-]/g, '')
    .replace(/[^\d+]/g, '');

  if (!normalized) return '';

  if (normalized.startsWith('0098')) {
    return `0${normalized.slice(4).replace(/\D/g, '')}`;
  }

  if (normalized.startsWith('+98')) {
    return `0${normalized.slice(3).replace(/\D/g, '')}`;
  }

  const digitsOnly = normalized.replace(/\D/g, '');
  if (digitsOnly.startsWith('98') && digitsOnly.length === 12) {
    return `0${digitsOnly.slice(2)}`;
  }

  if (digitsOnly.length === 10 && digitsOnly.startsWith('9')) {
    return `0${digitsOnly}`;
  }

  if (normalized.startsWith('+')) {
    return `+${digitsOnly}`;
  }

  return digitsOnly;
}

function hashOtp(phone: string, code: string) {
  return createHash('sha256')
    .update(`${phone}:${code}:${process.env.JWT_SECRET || 'fallback-secret'}`)
    .digest('hex');
}

function settingNumber(settings: Record<string, unknown>, key: string, fallback: number) {
  const value = Number(settings[key]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function settingBoolean(settings: Record<string, unknown>, key: string, fallback: boolean) {
  if (typeof settings[key] === 'boolean') return settings[key] as boolean;
  if (settings[key] === 'true') return true;
  if (settings[key] === 'false') return false;
  return fallback;
}

const userSessionSelect = {
  id: true,
  email: true,
  name: true,
  avatar: true,
  phone: true,
  phoneVerified: true,
  country: true,
  verified: true,
} as const;

export class UserService {
  /**
   * Register new user
   */
  static async register(input: RegisterInput) {
    const { email, password, name, country } = input;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        country,
        verified: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        phoneVerified: true,
        country: true,
        createdAt: true,
      },
    });

    // Create token
    const token = createToken(user.id, user.email);

    return { user, token };
  }

  /**
   * Login user
   */
  static async login(input: LoginInput) {
    const { email, password } = input;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        avatar: true,
        phone: true,
        phoneVerified: true,
        country: true,
        verified: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('نام کاربری یا رمز عبور اشتباه است');
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('نام کاربری یا رمز عبور اشتباه است');
    }

    // Create token
    const token = createToken(user.id, user.email);

    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  static async requestOtp(input: RequestOtpInput, userId?: string) {
    const settings = await SettingsService.getSettingsMap(false);
    if (!settingBoolean(settings, 'otp_enabled', true)) {
      throw new AppError('OTP login is disabled', 403, 'OTP_DISABLED');
    }

    const phone = normalizePhone(input.phone);
    if (phone.length < 6) throw new AppError('Invalid phone number', 400, 'INVALID_PHONE');

    const resendSeconds = settingNumber(settings, 'otp_resend_seconds', 60);
    const recentOtp = await prisma.phoneOtp.findFirst({
      where: {
        phone,
        purpose: input.purpose,
        consumedAt: null,
        createdAt: { gt: new Date(Date.now() - resendSeconds * 1000) },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentOtp) {
      throw new AppError(`Please wait ${resendSeconds} seconds before requesting another code`, 429, 'OTP_RATE_LIMITED');
    }

    if (input.purpose === 'verify_phone' && !userId) {
      throw new UnauthorizedError('Login is required to verify phone');
    }

    const codeLength = Math.min(Math.max(settingNumber(settings, 'otp_code_length', 6), 4), 10);
    const ttlMinutes = settingNumber(settings, 'otp_ttl_minutes', 5);
    const maxAttempts = Math.min(Math.max(settingNumber(settings, 'otp_max_attempts', 5), 1), 10);
    const min = 10 ** (codeLength - 1);
    const max = 10 ** codeLength;
    const code = String(randomInt(min, max));

    await prisma.phoneOtp.create({
      data: {
        phone,
        purpose: input.purpose,
        userId,
        codeHash: hashOtp(phone, code),
        maxAttempts,
        expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000),
      },
    });

    await this.sendOtpCode(phone, code, settings);

    return {
      phone,
      expiresInSeconds: ttlMinutes * 60,
      resendAfterSeconds: resendSeconds,
      ...(settingBoolean(settings, 'otp_dev_show_code', process.env.NODE_ENV !== 'production') ? { devCode: code } : {}),
    };
  }

  static async verifyOtp(input: VerifyOtpInput, userId?: string) {
    const settings = await SettingsService.getSettingsMap(false);
    if (!settingBoolean(settings, 'otp_enabled', true)) {
      throw new AppError('OTP login is disabled', 403, 'OTP_DISABLED');
    }

    const phone = normalizePhone(input.phone);
    const code = input.code.trim();
    const otp = await prisma.phoneOtp.findFirst({
      where: {
        phone,
        purpose: input.purpose,
        consumedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp || otp.expiresAt < new Date()) {
      throw new AppError('OTP code is expired or invalid', 400, 'OTP_INVALID');
    }

    if (otp.attempts >= otp.maxAttempts) {
      throw new AppError('OTP max attempts exceeded', 429, 'OTP_MAX_ATTEMPTS');
    }

    const isValid = otp.codeHash === hashOtp(phone, code);
    if (!isValid) {
      await prisma.phoneOtp.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });
      throw new AppError('OTP code is invalid', 400, 'OTP_INVALID');
    }

    await prisma.phoneOtp.update({
      where: { id: otp.id },
      data: { consumedAt: new Date() },
    });

    if (input.purpose === 'verify_phone') {
      if (!userId) throw new UnauthorizedError('Login is required to verify phone');
      const linkedUser = await this.findVerifiedUserByPhone(phone);
      if (linkedUser && linkedUser.id !== userId) {
        throw new ConflictError('This phone number is already connected to another user');
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: { phone, phoneVerified: true },
        select: userSessionSelect,
      });

      return { user, token: createToken(user.id, user.email) };
    }

    const user = await this.findOrCreateOtpUser(phone);
    const token = createToken(user.id, user.email);
    return { user, token };
  }

  private static async findOrCreateOtpUser(phone: string) {
    const verifiedUser = await this.findVerifiedUserByPhone(phone);
    if (verifiedUser) return verifiedUser;

    const existing = await prisma.user.findFirst({
      where: { phone },
      orderBy: { updatedAt: 'desc' },
      select: userSessionSelect,
    });

    if (existing) {
      if (!existing.phoneVerified) {
        return prisma.user.update({
          where: { id: existing.id },
          data: { phoneVerified: true },
          select: userSessionSelect,
        });
      }
      return existing;
    }

    const syntheticEmail = `phone-${phone.replace(/[^\d]/g, '') || Date.now()}@otp.local`;
    return prisma.user.create({
      data: {
        email: syntheticEmail,
        password: await hashPassword(createHash('sha256').update(`${phone}:${Date.now()}`).digest('hex')),
        name: null,
        phone,
        phoneVerified: true,
        verified: true,
      },
      select: userSessionSelect,
    });
  }

  private static async findVerifiedUserByPhone(phone: string) {
    return prisma.user.findFirst({
      where: {
        phone,
        phoneVerified: true,
      },
      orderBy: { updatedAt: 'desc' },
      select: userSessionSelect,
    });
  }

  private static async sendOtpCode(phone: string, code: string, settings: Record<string, unknown>) {
    const provider = String(settings.otp_sms_provider || 'manual');
    console.info(`[otp:${provider}] ${phone} -> ${code}`);
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        phoneVerified: true,
        country: true,
        verified: true,
        nationalId: true,
        birthDate: true,
        address: true,
        identityStatus: true,
        createdAt: true,
        updatedAt: true,
        subscriptions: {
          where: { isActive: true },
          select: {
            id: true,
            planId: true,
            endDate: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  static async getAllUsers() {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        country: true,
        verified: true,
        phoneVerified: true,
        nationalId: true,
        birthDate: true,
        address: true,
        identityStatus: true,
        createdAt: true,
      },
    });

    return users;
  }

  static async requestPasswordReset(input: RequestPasswordResetInput) {
    const email = input.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return {
        message: 'اگر این ایمیل در سیستم ثبت شده باشد، لینک بازیابی رمز عبور برای آن ارسال شده است.',
      };
    }

    const reset = createPasswordResetToken(user.id, email);

    if (process.env.NODE_ENV !== 'production') {
      console.info(`[password-reset] ${email} -> ${reset.token}`);
    }

    return {
      message: 'اگر این ایمیل در سیستم ثبت شده باشد، لینک بازیابی رمز عبور برای آن ارسال شده است.',
      ...(process.env.NODE_ENV !== 'production' ? { token: reset.token } : {}),
    };
  }

  static async resetPassword(input: ResetPasswordInput) {
    const email = input.email.trim().toLowerCase();
    const reset = consumePasswordResetToken(input.token, email);

    if (!reset) {
      throw new AppError('کد بازیابی نامعتبر یا منقضی شده است', 400, 'RESET_TOKEN_INVALID');
    }

    const hashedPassword = await hashPassword(input.password);
    await prisma.user.update({
      where: { id: reset.userId },
      data: { password: hashedPassword },
    });

    return {
      message: 'رمز عبور با موفقیت تغییر کرد.',
    };
  }

  static async createUser(input: { email: string; password: string; name: string; country?: string; verified?: boolean }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const hashedPassword = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name,
        country: input.country,
        verified: input.verified ?? false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        country: true,
        verified: true,
        createdAt: true,
      },
    });

    return user;
  }

  static async updateUser(userId: string, input: {
    name?: string;
    email?: string;
    phone?: string;
    country?: string;
    verified?: boolean;
    phoneVerified?: boolean;
    nationalId?: string;
    birthDate?: Date;
    address?: string;
    identityStatus?: string;
  }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: input,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        country: true,
        verified: true,
        phoneVerified: true,
        nationalId: true,
        birthDate: true,
        address: true,
        identityStatus: true,
        updatedAt: true,
      },
    });

    return user;
  }

  static async deleteUser(userId: string) {
    await prisma.user.delete({
      where: { id: userId },
    });
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, input: UpdateProfileInput) {
    const normalizedPhone = input.phone ? normalizePhone(input.phone) : input.phone;
    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        phone: true,
        nationalId: true,
        birthDate: true,
        address: true,
        identityStatus: true,
      },
    });

    if (!existing) throw new NotFoundError('User');

    if (normalizedPhone && normalizedPhone !== existing.phone) {
      const linkedUser = await this.findVerifiedUserByPhone(normalizedPhone);
      if (linkedUser && linkedUser.id !== userId) {
        throw new ConflictError('This phone number is already connected to another user');
      }
    }

    const nextIdentity = {
      phone: normalizedPhone ?? existing.phone,
      nationalId: input.nationalId ?? existing.nationalId,
      birthDate: input.birthDate ?? existing.birthDate,
      address: input.address ?? existing.address,
    };

    const identityStatus =
      nextIdentity.phone && nextIdentity.nationalId && nextIdentity.birthDate && nextIdentity.address && existing.identityStatus !== 'verified'
        ? 'pending'
        : undefined;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...input,
        ...(normalizedPhone !== undefined && { phone: normalizedPhone }),
        ...(normalizedPhone !== undefined && normalizedPhone !== existing.phone && { phoneVerified: false }),
        ...(identityStatus && { identityStatus }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        phoneVerified: true,
        country: true,
        verified: true,
        nationalId: true,
        birthDate: true,
        address: true,
        identityStatus: true,
      },
    });

    return user;
  }

  static async getSubscriptionEligibility(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        verified: true,
        phone: true,
        phoneVerified: true,
        nationalId: true,
        birthDate: true,
        address: true,
        identityStatus: true,
      },
    });

    if (!user) throw new NotFoundError('User');

    const missing: string[] = [];
    if (!user.verified) missing.push('email');
    if (!user.phone) missing.push('phone');
    if (!user.phoneVerified) missing.push('phoneVerification');
    if (!user.nationalId) missing.push('nationalId');
    if (!user.birthDate) missing.push('birthDate');
    if (!user.address) missing.push('address');
    if (user.identityStatus !== 'verified') missing.push('identityVerification');

    return {
      eligible: missing.length === 0,
      missing,
      user,
    };
  }
}
