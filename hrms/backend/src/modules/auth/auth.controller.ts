import type { Request, Response } from 'express';
import { sendSuccess } from '../../common/utils/api-response.js';
import { authService } from './auth.service.js';
import { env } from '../../config/env.js';

const refreshCookieName = 'hrms_rt';

const refreshCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: env.COOKIE_SECURE,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

export const authController = {
  async invite(req: Request, res: Response) {
    const data = await authService.inviteUser(req, req.body);
    return sendSuccess(res, data, 'Invite sent successfully');
  },

  async register(req: Request, res: Response) {
    const data = await authService.registerFromInvite(req, req.body);
    return sendSuccess(res, data, 'Registration complete', 201);
  },

  async login(req: Request, res: Response) {
    const data = await authService.login(req, req.body);

    if (!data.requiresTwoFactor && 'refreshToken' in data) {
      res.cookie(refreshCookieName, data.refreshToken, refreshCookieOptions);
    }

    return sendSuccess(res, data, data.requiresTwoFactor ? 'OTP sent to your email' : 'Login successful');
  },

  async verifyOtp(req: Request, res: Response) {
    const data = await authService.verifyLoginOtp(req, req.body);
    res.cookie(refreshCookieName, data.refreshToken, refreshCookieOptions);
    return sendSuccess(res, data, 'Two-factor verification successful');
  },

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies[refreshCookieName] as string | undefined;
    if (!refreshToken) {
      throw { statusCode: 401, message: 'Refresh token missing' };
    }

    const data = await authService.refresh(req, refreshToken);
    res.cookie(refreshCookieName, data.refreshToken, refreshCookieOptions);

    return sendSuccess(res, data, 'Token refreshed successfully');
  },

  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies[refreshCookieName] as string | undefined;
    if (refreshToken) {
      await authService.logout(req, refreshToken);
    }

    res.clearCookie(refreshCookieName, {
      httpOnly: true,
      sameSite: 'lax',
      secure: env.COOKIE_SECURE,
      path: '/',
    });

    return sendSuccess(res, null, 'Logged out successfully');
  },

  async forgotPassword(req: Request, res: Response) {
    await authService.forgotPassword(req, req.body);
    return sendSuccess(res, null, 'If your account exists, a reset link has been sent');
  },

  async resetPassword(req: Request, res: Response) {
    await authService.resetPassword(req, req.body);
    return sendSuccess(res, null, 'Password reset successful');
  },

  async googleLogin(req: Request, res: Response) {
    const data = await authService.googleLogin(req, req.body);

    if (!data.requiresTwoFactor && 'refreshToken' in data) {
      res.cookie(refreshCookieName, data.refreshToken, refreshCookieOptions);
    }

    return sendSuccess(res, data, data.requiresTwoFactor ? 'OTP sent to your email' : 'Google login successful');
  },

  async listSessions(req: Request, res: Response) {
    if (!req.auth) {
      throw { statusCode: 401, message: 'Unauthorized' };
    }

    const data = await authService.getActiveSessions(req.auth.userId, req.auth.orgId);
    return sendSuccess(res, data, 'Sessions fetched');
  },

  async revokeSession(req: Request, res: Response) {
    if (!req.auth) {
      throw { statusCode: 401, message: 'Unauthorized' };
    }

    await authService.revokeSession(req.auth.userId, req.auth.orgId, String(req.params.sessionId));
    return sendSuccess(res, null, 'Session revoked');
  },
};
