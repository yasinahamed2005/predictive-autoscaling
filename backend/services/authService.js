import crypto from 'crypto';
import mongoose from 'mongoose';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import { ApiError } from '../utils/ApiError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken, hashToken } from '../utils/tokens.js';
import { env } from '../config/env.js';

const REFRESH_COOKIE_DAYS = 30;

// Standalone in-memory user registry when MongoDB is disconnected/offline
const inMemoryUsers = [
  {
    _id: 'admin-1',
    name: 'Dukaan Admin',
    email: 'admin@dukaan.example',
    password: 'Admin@123',
    role: 'admin',
    isActive: true,
  },
  {
    _id: 'admin-2',
    name: 'Dukaan Admin',
    email: 'admin@dukaan.com',
    password: 'admin@123',
    role: 'admin',
    isActive: true,
  },
];

const issueTokenPair = async (user, meta = {}) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  if (mongoose.connection.readyState === 1) {
    try {
      await RefreshToken.create({
        user: user._id,
        tokenHash: hashToken(refreshToken),
        userAgent: meta.userAgent,
        ip: meta.ip,
        expiresAt: new Date(Date.now() + REFRESH_COOKIE_DAYS * 24 * 60 * 60 * 1000),
      });
    } catch {
      // Ignore token persist errors in fallback mode
    }
  }

  return { accessToken, refreshToken };
};

export const authService = {
  async register({ name, email, password, phone }) {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const existing = await User.findOne({ $or: [{ email }, ...(phone ? [{ phone }] : [])] });
      if (existing) throw ApiError.conflict('An account with this email or phone already exists');
      const user = await User.create({ name, email, password, phone, role: 'customer' });
      return user;
    }

    // Standalone in-memory registration fallback when MongoDB is offline
    const normEmail = email.toLowerCase().trim();
    if (inMemoryUsers.some((u) => u.email.toLowerCase() === normEmail)) {
      throw ApiError.conflict('An account with this email already exists');
    }

    const newUser = {
      _id: `mem_${Date.now()}`,
      id: `mem_${Date.now()}`,
      name,
      email: normEmail,
      password,
      phone,
      role: 'customer',
      isActive: true,
      createdAt: new Date(),
    };
    inMemoryUsers.push(newUser);
    return newUser;
  },

  async login(email, password, meta) {
    const isDbConnected = mongoose.connection.readyState === 1;
    const normEmail = email.toLowerCase().trim();

    if (isDbConnected) {
      const user = await User.findOne({ email: normEmail }).select('+password');
      if (!user || !(await user.comparePassword(password))) {
        throw ApiError.unauthorized('Invalid email or password');
      }
      if (!user.isActive) throw ApiError.forbidden('This account has been disabled');

      const tokens = await issueTokenPair(user, meta);
      return { user, ...tokens };
    }

    // Standalone in-memory login fallback when MongoDB is offline
    const memUser = inMemoryUsers.find(
      (u) => u.email.toLowerCase() === normEmail && u.password === password
    );

    if (!memUser) {
      throw ApiError.unauthorized('Invalid email or password');
    }
    if (!memUser.isActive) throw ApiError.forbidden('This account has been disabled');

    const safeUser = {
      _id: memUser._id,
      name: memUser.name,
      email: memUser.email,
      role: memUser.role || 'customer',
      phone: memUser.phone,
      isActive: true,
    };

    const tokens = await issueTokenPair(safeUser, meta);
    return { user: safeUser, ...tokens };
  },

  async refresh(refreshToken, meta) {
    if (!refreshToken) throw ApiError.unauthorized('No refresh token provided');

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Refresh token invalid or expired');
    }

    if (mongoose.connection.readyState === 1) {
      const stored = await RefreshToken.findOne({ user: payload.sub, tokenHash: hashToken(refreshToken), revoked: false });
      if (!stored || stored.expiresAt < new Date()) throw ApiError.unauthorized('Session expired — please log in again');

      const user = await User.findById(payload.sub);
      if (!user || !user.isActive) throw ApiError.unauthorized('Account not found or disabled');

      stored.revoked = true;
      await stored.save();

      return issueTokenPair(user, meta);
    }

    const user = { _id: payload.sub, role: payload.role || 'customer' };
    return issueTokenPair(user, meta);
  },

  async logout(refreshToken) {
    if (!refreshToken || mongoose.connection.readyState !== 1) return;
    try {
      await RefreshToken.updateOne({ tokenHash: hashToken(refreshToken) }, { revoked: true });
    } catch {
      // Ignore logout persist errors
    }
  },

  async logoutAllDevices(userId) {
    if (mongoose.connection.readyState !== 1) return;
    try {
      await RefreshToken.updateMany({ user: userId }, { revoked: true });
    } catch {
      // Ignore
    }
  },

  async forgotPassword(email) {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email });
      if (!user) return null;

      const rawToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = crypto.createHash('sha256').update(rawToken).digest('hex');
      user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
      await user.save({ validateBeforeSave: false });
      return rawToken;
    }
    return crypto.randomBytes(32).toString('hex');
  },

  async resetPassword(rawToken, newPassword) {
    if (mongoose.connection.readyState === 1) {
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const user = await User.findOne({ passwordResetToken: tokenHash, passwordResetExpires: { $gt: new Date() } });
      if (!user) throw ApiError.badRequest('Reset link is invalid or has expired');

      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      await authService.logoutAllDevices(user._id);
    }
  },
};
