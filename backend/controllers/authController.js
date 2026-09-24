import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/apiResponse.js';
import { authService } from '../services/authService.js';
import { env, isProd } from '../config/env.js';

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'strict' : 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

const meta = (req) => ({ userAgent: req.headers['user-agent'], ip: req.ip });

const sendAuthResponse = (res, statusCode, user, tokens) => {
  res.cookie('refreshToken', tokens.refreshToken, cookieOptions);
  return success(res, statusCode, { user: user.toSafeObject ? user.toSafeObject() : user, accessToken: tokens.accessToken });
};

export const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  const { user: loggedInUser, ...tokens } = await authService.login(req.body.email, req.body.password, meta(req));
  sendAuthResponse(res, 201, loggedInUser, tokens);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, ...tokens } = await authService.login(email, password, meta(req));
  sendAuthResponse(res, 200, user, tokens);
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  const tokens = await authService.refresh(token, meta(req));
  res.cookie('refreshToken', tokens.refreshToken, cookieOptions);
  success(res, 200, { accessToken: tokens.accessToken });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  await authService.logout(token);
  res.clearCookie('refreshToken');
  success(res, 200, { message: 'Logged out' });
});

export const me = asyncHandler(async (req, res) => {
  success(res, 200, req.user.toSafeObject());
});

export const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  const { user, ...tokens } = await authService.loginWithGoogle(idToken, meta(req));
  sendAuthResponse(res, 200, user, tokens);
});

export const firebasePhoneLogin = asyncHandler(async (req, res) => {
  const { firebaseIdToken } = req.body;
  const { user, ...tokens } = await authService.loginWithFirebasePhone(firebaseIdToken, meta(req));
  sendAuthResponse(res, 200, user, tokens);
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const rawToken = await authService.forgotPassword(req.body.email);
  // TODO: send rawToken via email using services/../utils mailer (nodemailer + SMTP_* env vars).
  // Always return the same response whether or not the email exists, to avoid user enumeration.
  success(res, 200, { message: 'If an account exists for this email, a reset link has been sent.', ...(isProd ? {} : { devResetToken: rawToken }) });
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.password);
  success(res, 200, { message: 'Password reset successfully. Please log in again.' });
});
