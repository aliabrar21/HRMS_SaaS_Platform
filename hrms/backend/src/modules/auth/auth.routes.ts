import { Router } from 'express';
import {
  forgotPasswordSchema,
  googleLoginSchema,
  inviteUserSchema,
  loginSchema,
  otpVerifySchema,
  registerFromInviteSchema,
  resetPasswordSchema,
} from '@hrms/shared';
import { validate } from '../../common/validators/validate.js';
import { authController } from './auth.controller.js';
import { authRateLimiter } from '../../common/middleware/rate-limit.middleware.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { requireRoles } from '../../common/middleware/rbac.middleware.js';
import { resolveTenant } from '../../common/middleware/tenant.middleware.js';

export const authRouter = Router();

authRouter.post('/invite', resolveTenant, authenticate, requireRoles(['super_admin', 'hr_admin']), validate({ body: inviteUserSchema }), authController.invite);
authRouter.post('/register', validate({ body: registerFromInviteSchema }), authController.register);
authRouter.post('/login', resolveTenant, authRateLimiter, validate({ body: loginSchema }), authController.login);
authRouter.post('/verify-otp', validate({ body: otpVerifySchema }), authController.verifyOtp);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);
authRouter.post('/forgot-password', resolveTenant, validate({ body: forgotPasswordSchema }), authController.forgotPassword);
authRouter.post('/reset-password', validate({ body: resetPasswordSchema }), authController.resetPassword);
authRouter.post('/google', resolveTenant, validate({ body: googleLoginSchema }), authController.googleLogin);
authRouter.get('/sessions', authenticate, authController.listSessions);
authRouter.delete('/sessions/:sessionId', authenticate, authController.revokeSession);
