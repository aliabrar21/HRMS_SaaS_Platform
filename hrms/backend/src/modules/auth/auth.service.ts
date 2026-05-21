import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { addDays, addMinutes, differenceInMinutes } from 'date-fns';
import type { Request } from 'express';
import { randomUUID } from 'node:crypto';
import type {
  ForgotPasswordInput,
  GoogleLoginInput,
  InviteUserInput,
  LoginInput,
  OtpVerifyInput,
  RegisterFromInviteInput,
  ResetPasswordInput,
  RoleName,
} from '@hrms/shared';
import { env } from '../../config/env.js';
import { prisma } from '../../config/prisma.js';
import { redis } from '../../config/redis.js';
import { sendEmail } from '../../config/mail.js';
import {
  compareHash,
  hashValue,
  signAccessToken,
  signRefreshToken,
  signTempToken,
  verifyRefreshToken,
  verifyTempToken,
} from '../../common/utils/jwt.js';
import { createAuditLog } from '../../common/utils/audit.js';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);
const mandatoryMfaRoles: RoleName[] = ['hr_admin', 'finance', 'super_admin'];

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

interface SafeUser {
  id: string;
  orgId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: RoleName;
  mfaEnabled: boolean;
}

const sanitizeUser = (user: {
  id: string;
  orgId: string;
  email: string;
  firstName: string;
  lastName: string;
  mfaEnabled: boolean;
  role: { name: string };
}): SafeUser => {
  return {
    id: user.id,
    orgId: user.orgId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role.name as RoleName,
    mfaEnabled: user.mfaEnabled,
  };
};

const parseUserAgent = (userAgent?: string): { browser: string; os: string } => {
  const ua = userAgent ?? '';
  const browser = ua.includes('Chrome') ? 'Chrome' : ua.includes('Firefox') ? 'Firefox' : 'Unknown';
  const os = ua.includes('Windows') ? 'Windows' : ua.includes('Mac') ? 'macOS' : 'Unknown';
  return { browser, os };
};

const issueTokens = async (user: {
  id: string;
  orgId: string;
  email: string;
  role: { name: string };
}): Promise<AuthTokens> => {
  const sessionId = randomUUID();
  const accessToken = signAccessToken({
    sub: user.id,
    orgId: user.orgId,
    role: user.role.name as RoleName,
    email: user.email,
  });

  const refreshToken = signRefreshToken({
    sub: user.id,
    orgId: user.orgId,
    sessionId,
    type: 'refresh',
  });

  const refreshTokenHash = await hashValue(refreshToken);

  await prisma.userSession.create({
    data: {
      id: sessionId,
      orgId: user.orgId,
      userId: user.id,
      refreshTokenHash,
      expiresAt: addDays(new Date(), 7),
      lastActiveAt: new Date(),
    },
  });

  return { accessToken, refreshToken, sessionId };
};

const enforceIpRestriction = async (orgId: string, ipAddress: string | undefined): Promise<void> => {
  if (!ipAddress) {
    return;
  }

  const rules = await prisma.ipRestriction.findMany({
    where: { orgId, isActive: true },
  });

  const blockedIps = rules.filter((rule) => rule.type === 'BLOCK').map((rule) => rule.ipAddress);
  const allowIps = rules.filter((rule) => rule.type === 'ALLOW').map((rule) => rule.ipAddress);

  if (blockedIps.includes(ipAddress)) {
    throw { statusCode: 403, message: 'IP is blocked for this organization' };
  }

  if (allowIps.length > 0 && !allowIps.includes(ipAddress)) {
    throw { statusCode: 403, message: 'IP is not allowlisted for this organization' };
  }
};

const createLoginOtp = async (user: {
  id: string;
  orgId: string;
  email: string;
  firstName: string;
}): Promise<string> => {
  const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
  const otpHash = await hashValue(otp);
  const key = `otp:login:${user.orgId}:${user.id}`;

  try {
    await redis.set(key, otpHash, 'EX', 5 * 60);
  } catch (err) {
    console.error('Redis set failed, falling back to database:', err);
  }
  await prisma.otpCode.create({
    data: {
      orgId: user.orgId,
      userId: user.id,
      purpose: 'login',
      codeHash: otpHash,
      expiresAt: addMinutes(new Date(), 5),
    },
  });

  console.log(`[DEV] Login OTP for ${user.email}: ${otp}`);

  await sendEmail({
    to: user.email,
    subject: 'Your HRMS login OTP',
    html: `<p>Hello ${user.firstName},</p><p>Your OTP is <b>${otp}</b>. It expires in 5 minutes.</p>`,
  });

  return signTempToken({ sub: user.id, orgId: user.orgId, purpose: 'login_otp' });
};

export const authService = {
  async inviteUser(req: Request, input: InviteUserInput) {
    if (!req.tenant || !req.auth) {
      throw { statusCode: 400, message: 'Tenant context missing' };
    }

    const role = await prisma.role.findFirst({
      where: { orgId: req.tenant.orgId, name: input.role },
    });
    if (!role) {
      throw { statusCode: 400, message: `Role ${input.role} not found` };
    }

    const existing = await prisma.user.findFirst({
      where: { orgId: req.tenant.orgId, email: input.email.toLowerCase() },
    });
    if (existing) {
      throw { statusCode: 409, message: 'User already exists for this organization' };
    }

    const inviteToken = jwt.sign(
      {
        orgId: req.tenant.orgId,
        email: input.email.toLowerCase(),
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role,
      },
      env.JWT_INVITE_SECRET,
      { expiresIn: '7d' },
    );

    const createdUser = await prisma.user.create({
      data: {
        orgId: req.tenant.orgId,
        roleId: role.id,
        email: input.email.toLowerCase(),
        firstName: input.firstName,
        lastName: input.lastName,
        isInviteAccepted: false,
        mfaEnabled: true,
      },
      include: { role: true },
    });

    await sendEmail({
      to: input.email,
      subject: 'You are invited to HRMS',
      html: `<p>Hello ${input.firstName},</p><p>Set your password here:</p><p><a href="${env.APP_URL}/register?token=${inviteToken}">${env.APP_URL}/register?token=${inviteToken}</a></p>`,
    });

    await createAuditLog({
      req,
      orgId: req.tenant.orgId,
      userId: req.auth.userId,
      action: 'INVITE',
      module: 'auth',
      entityName: 'users',
      entityId: createdUser.id,
      metadata: { email: createdUser.email, role: createdUser.role.name },
    });

    return { inviteToken };
  },

  async registerFromInvite(req: Request, input: RegisterFromInviteInput) {
    const payload = jwt.verify(input.inviteToken, env.JWT_INVITE_SECRET) as {
      orgId: string;
      email: string;
    };

    const user = await prisma.user.findFirst({
      where: { orgId: payload.orgId, email: payload.email },
      include: { role: true },
    });
    if (!user) {
      throw { statusCode: 404, message: 'Invite user not found' };
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hashValue(input.password),
        isInviteAccepted: true,
      },
      include: { role: true },
    });

    await createAuditLog({
      req,
      orgId: updated.orgId,
      userId: updated.id,
      action: 'REGISTER',
      module: 'auth',
      entityName: 'users',
      entityId: updated.id,
    });

    return sanitizeUser(updated);
  },

  async login(req: Request, input: LoginInput) {
    if (!req.tenant) {
      throw { statusCode: 400, message: 'Organization context is required' };
    }

    await enforceIpRestriction(req.tenant.orgId, req.ip);

    const user = await prisma.user.findFirst({
      where: {
        orgId: req.tenant.orgId,
        email: input.email.toLowerCase(),
        isActive: true,
      },
      include: { role: true },
    });

    if (!user || !user.passwordHash) {
      throw { statusCode: 401, message: 'Invalid credentials' };
    }

    const validPassword = await compareHash(input.password, user.passwordHash);
    if (!validPassword) {
      throw { statusCode: 401, message: 'Invalid credentials' };
    }

    const requiresMfa = mandatoryMfaRoles.includes(user.role.name as RoleName) || user.mfaEnabled;
    if (requiresMfa) {
      const tempToken = await createLoginOtp({
        id: user.id,
        orgId: user.orgId,
        email: user.email,
        firstName: user.firstName,
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      return { requiresTwoFactor: true, tempToken };
    }

    const tokens = await issueTokens(user);
    const ua = parseUserAgent(req.headers['user-agent']);

    await prisma.userSession.update({
      where: { id: tokens.sessionId },
      data: {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        deviceBrowser: ua.browser,
        deviceOs: ua.os,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await createAuditLog({
      req,
      orgId: user.orgId,
      userId: user.id,
      action: 'LOGIN',
      module: 'auth',
      entityName: 'users',
      entityId: user.id,
    });

    return {
      requiresTwoFactor: false,
      ...tokens,
      user: sanitizeUser(user),
    };
  },

  async verifyLoginOtp(req: Request, input: OtpVerifyInput) {
    const payload = verifyTempToken(input.tempToken);
    if (payload.purpose !== 'login_otp') {
      throw { statusCode: 400, message: 'Invalid OTP purpose' };
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    const key = `otp:login:${user.orgId}:${user.id}`;
    let redisHash: string | null = null;
    try {
      redisHash = await redis.get(key);
    } catch (err) {
      console.error('Redis get failed, falling back to database:', err);
    }
    let otpValid = false;

    if (redisHash) {
      otpValid = await compareHash(input.otp, redisHash);
    } else {
      const dbOtp = await prisma.otpCode.findFirst({
        where: {
          orgId: user.orgId,
          userId: user.id,
          purpose: 'login',
          consumedAt: null,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (dbOtp) {
        otpValid = await compareHash(input.otp, dbOtp.codeHash);
      }
    }

    if (!otpValid) {
      throw { statusCode: 400, message: 'Invalid OTP' };
    }

    try {
      await redis.del(key);
    } catch (err) {
      console.error('Redis del failed:', err);
    }
    await prisma.otpCode.updateMany({
      where: {
        orgId: user.orgId,
        userId: user.id,
        purpose: 'login',
        consumedAt: null,
      },
      data: { consumedAt: new Date() },
    });

    const tokens = await issueTokens(user);
    const ua = parseUserAgent(req.headers['user-agent']);
    await prisma.userSession.update({
      where: { id: tokens.sessionId },
      data: {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        deviceBrowser: ua.browser,
        deviceOs: ua.os,
      },
    });

    await createAuditLog({
      req,
      orgId: user.orgId,
      userId: user.id,
      action: 'LOGIN_2FA',
      module: 'auth',
      entityName: 'users',
      entityId: user.id,
    });

    return {
      ...tokens,
      user: sanitizeUser(user),
    };
  },

  async refresh(req: Request, refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    const session = await prisma.userSession.findFirst({
      where: {
        id: payload.sessionId,
        userId: payload.sub,
        orgId: payload.orgId,
        revokedAt: null,
      },
      include: { user: { include: { role: true } } },
    });

    if (!session?.user) {
      throw { statusCode: 401, message: 'Session not found' };
    }
    if (session.expiresAt < new Date()) {
      throw { statusCode: 401, message: 'Session expired' };
    }

    const inactiveMins = differenceInMinutes(new Date(), session.lastActiveAt);
    if (inactiveMins > 30) {
      await prisma.userSession.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
      throw { statusCode: 401, message: 'Session timed out due to inactivity' };
    }

    const validRefresh = await compareHash(refreshToken, session.refreshTokenHash);
    if (!validRefresh) {
      throw { statusCode: 401, message: 'Invalid refresh token' };
    }

    const newAccessToken = signAccessToken({
      sub: session.user.id,
      orgId: session.user.orgId,
      role: session.user.role.name as RoleName,
      email: session.user.email,
    });
    const newRefreshToken = signRefreshToken({
      sub: session.user.id,
      orgId: session.user.orgId,
      sessionId: session.id,
      type: 'refresh',
    });

    await prisma.userSession.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: await hashValue(newRefreshToken),
        lastActiveAt: new Date(),
      },
    });

    await createAuditLog({
      req,
      orgId: session.user.orgId,
      userId: session.user.id,
      action: 'TOKEN_REFRESH',
      module: 'auth',
      entityName: 'user_sessions',
      entityId: session.id,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: sanitizeUser(session.user),
    };
  },

  async logout(req: Request, refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);

    await prisma.userSession.updateMany({
      where: {
        id: payload.sessionId,
        userId: payload.sub,
        orgId: payload.orgId,
      },
      data: { revokedAt: new Date() },
    });

    await createAuditLog({
      req,
      orgId: payload.orgId,
      userId: payload.sub,
      action: 'LOGOUT',
      module: 'auth',
      entityName: 'user_sessions',
      entityId: payload.sessionId,
    });
  },

  async forgotPassword(req: Request, input: ForgotPasswordInput) {
    if (!req.tenant) {
      throw { statusCode: 400, message: 'Organization context is required' };
    }

    const user = await prisma.user.findFirst({
      where: {
        orgId: req.tenant.orgId,
        email: input.email.toLowerCase(),
      },
    });
    if (!user) {
      return;
    }

    const token = jwt.sign({ userId: user.id, orgId: user.orgId }, env.JWT_PASSWORD_RESET_SECRET, {
      expiresIn: '1h',
    });

    await prisma.passwordResetToken.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        tokenHash: await hashValue(token),
        expiresAt: addMinutes(new Date(), 60),
      },
    });

    await sendEmail({
      to: user.email,
      subject: 'Reset your HRMS password',
      html: `<p>Reset password link:</p><p><a href="${env.APP_URL}/reset-password?token=${token}">${env.APP_URL}/reset-password?token=${token}</a></p>`,
    });
  },

  async resetPassword(req: Request, input: ResetPasswordInput) {
    const payload = jwt.verify(input.token, env.JWT_PASSWORD_RESET_SECRET) as {
      userId: string;
      orgId: string;
    };

    const tokens = await prisma.passwordResetToken.findMany({
      where: {
        orgId: payload.orgId,
        userId: payload.userId,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    let tokenMatched = false;
    for (const tokenRow of tokens) {
      if (await compareHash(input.token, tokenRow.tokenHash)) {
        tokenMatched = true;
        break;
      }
    }

    if (!tokenMatched) {
      throw { statusCode: 400, message: 'Invalid or expired reset token' };
    }

    await prisma.user.update({
      where: { id: payload.userId },
      data: { passwordHash: await hashValue(input.password) },
    });

    await prisma.passwordResetToken.updateMany({
      where: {
        orgId: payload.orgId,
        userId: payload.userId,
        usedAt: null,
      },
      data: { usedAt: new Date() },
    });

    await createAuditLog({
      req,
      orgId: payload.orgId,
      userId: payload.userId,
      action: 'RESET_PASSWORD',
      module: 'auth',
      entityName: 'users',
      entityId: payload.userId,
    });
  },

  async googleLogin(req: Request, input: GoogleLoginInput) {
    if (!req.tenant) {
      throw { statusCode: 400, message: 'Organization context is required' };
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: input.idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload?.email?.toLowerCase();
    if (!email) {
      throw { statusCode: 400, message: 'Unable to read email from Google token' };
    }

    const user = await prisma.user.findFirst({
      where: {
        orgId: req.tenant.orgId,
        email,
        isActive: true,
      },
      include: { role: true },
    });
    if (!user) {
      throw { statusCode: 403, message: 'User is not invited to this organization' };
    }

    const requiresMfa = mandatoryMfaRoles.includes(user.role.name as RoleName) || user.mfaEnabled;
    if (requiresMfa) {
      const tempToken = await createLoginOtp({
        id: user.id,
        orgId: user.orgId,
        email: user.email,
        firstName: user.firstName,
      });
      return { requiresTwoFactor: true, tempToken };
    }

    const tokens = await issueTokens(user);
    const ua = parseUserAgent(req.headers['user-agent']);
    await prisma.userSession.update({
      where: { id: tokens.sessionId },
      data: {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        deviceBrowser: ua.browser,
        deviceOs: ua.os,
      },
    });

    await createAuditLog({
      req,
      orgId: user.orgId,
      userId: user.id,
      action: 'GOOGLE_LOGIN',
      module: 'auth',
      entityName: 'users',
      entityId: user.id,
    });

    return {
      requiresTwoFactor: false,
      ...tokens,
      user: sanitizeUser(user),
    };
  },

  async getActiveSessions(userId: string, orgId: string) {
    return prisma.userSession.findMany({
      where: {
        userId,
        orgId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        ipAddress: true,
        deviceBrowser: true,
        deviceOs: true,
        location: true,
        lastActiveAt: true,
        createdAt: true,
      },
    });
  },

  async revokeSession(userId: string, orgId: string, sessionId: string) {
    await prisma.userSession.updateMany({
      where: { id: sessionId, userId, orgId },
      data: { revokedAt: new Date() },
    });
  },
};
