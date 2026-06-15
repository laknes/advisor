import { prisma } from '@/lib/db';
import { hashPassword, comparePassword, createToken } from '@/lib/auth';
import { ConflictError, NotFoundError, UnauthorizedError } from '@/lib/errors';
import type { RegisterInput, LoginInput, UpdateProfileInput } from '@/lib/validations';

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
        country: true,
        verified: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Create token
    const token = createToken(user.id, user.email);

    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
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
        country: true,
        verified: true,
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
        country: true,
        verified: true,
        createdAt: true,
      },
    });

    return users;
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

  static async updateUser(userId: string, input: { name?: string; email?: string; country?: string; verified?: boolean }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: input,
      select: {
        id: true,
        email: true,
        name: true,
        country: true,
        verified: true,
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
    const user = await prisma.user.update({
      where: { id: userId },
      data: input,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        country: true,
      },
    });

    return user;
  }
}
