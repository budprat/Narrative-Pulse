import bcrypt from 'bcryptjs';
import { User, RefreshToken } from '@prisma/client';
import prisma from './prisma.js';
import { generateTokens, verifyRefreshToken } from '../middleware/auth.js';
import { RegisterInput, LoginInput, SafeUser, AuthResponse, TokenPayload } from '../types/index.js';

const SALT_ROUNDS = 12;

/**
 * Transform User to SafeUser (without password)
 */
function toSafeUser(user: User & { organization?: { id: string; name: string; type: string } | null }): SafeUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
    organizationId: user.organizationId,
    organization: user.organization ? {
      id: user.organization.id,
      name: user.organization.name,
      type: user.organization.type,
    } : null,
    createdAt: user.createdAt,
  };
}

/**
 * Register a new user
 */
export async function register(input: RegisterInput): Promise<AuthResponse> {
  const { email, password, name, organizationType, organizationName } = input;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create organization if provided
  let organizationId: string | undefined;
  if (organizationName && organizationType) {
    const slug = organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const organization = await prisma.organization.create({
      data: {
        name: organizationName,
        slug: `${slug}-${Date.now()}`, // Ensure uniqueness
        type: organizationType as any,
      },
    });
    organizationId = organization.id;
  }

  // Create user
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      name,
      organizationId,
    },
    include: {
      organization: true,
    },
  });

  // Generate tokens
  const tokenPayload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId || undefined,
  };

  const { accessToken, refreshToken } = generateTokens(tokenPayload);

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return {
    user: toSafeUser(user),
    accessToken,
    refreshToken,
  };
}

/**
 * Login user
 */
export async function login(input: LoginInput): Promise<AuthResponse> {
  const { email, password } = input;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      organization: true,
    },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }

  // Generate tokens
  const tokenPayload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId || undefined,
  };

  const { accessToken, refreshToken } = generateTokens(tokenPayload);

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return {
    user: toSafeUser(user),
    accessToken,
    refreshToken,
  };
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(token: string): Promise<AuthResponse> {
  // Verify refresh token
  const payload = verifyRefreshToken(token);

  if (!payload) {
    throw new Error('Invalid refresh token');
  }

  // Check if refresh token exists in database
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          organization: true,
        },
      },
    },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    // Delete expired token if exists
    if (storedToken) {
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
    }
    throw new Error('Refresh token expired');
  }

  // Delete old refresh token
  await prisma.refreshToken.delete({
    where: { id: storedToken.id },
  });

  // Generate new tokens
  const tokenPayload: TokenPayload = {
    userId: storedToken.user.id,
    email: storedToken.user.email,
    role: storedToken.user.role,
    organizationId: storedToken.user.organizationId || undefined,
  };

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(tokenPayload);

  // Store new refresh token
  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: storedToken.user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  return {
    user: toSafeUser(storedToken.user),
    accessToken,
    refreshToken: newRefreshToken,
  };
}

/**
 * Logout user (invalidate refresh token)
 */
export async function logout(refreshToken: string): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });
}

/**
 * Logout from all devices
 */
export async function logoutAll(userId: string): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<SafeUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      organization: true,
    },
  });

  return user ? toSafeUser(user) : null;
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  data: { name?: string; avatar?: string }
): Promise<SafeUser> {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    include: {
      organization: true,
    },
  });

  return toSafeUser(user);
}

/**
 * Change password
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!isValid) {
    throw new Error('Current password is incorrect');
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  // Invalidate all refresh tokens (force re-login)
  await logoutAll(userId);
}

export default {
  register,
  login,
  refreshAccessToken,
  logout,
  logoutAll,
  getUserById,
  updateProfile,
  changePassword,
};
