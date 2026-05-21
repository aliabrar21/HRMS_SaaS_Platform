import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[A-Z]/, 'Password must include one uppercase letter')
  .regex(/[a-z]/, 'Password must include one lowercase letter')
  .regex(/[0-9]/, 'Password must include one number');

export const emailSchema = z.string().email();

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
  rememberMe: z.boolean().optional().default(false),
  orgSlug: z.string().min(2).max(50),
});

export const otpVerifySchema = z.object({
  tempToken: z.string().min(10),
  otp: z.string().regex(/^\d{6}$/),
});

export const inviteUserSchema = z.object({
  email: emailSchema,
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  role: z.enum(['super_admin', 'hr_admin', 'recruiter', 'manager', 'employee', 'finance', 'it_admin']),
});

export const registerFromInviteSchema = z.object({
  inviteToken: z.string().min(10),
  password: passwordSchema,
});

export const refreshSchema = z.object({
  refreshToken: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
  orgSlug: z.string().min(2).max(50),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: passwordSchema,
});

export const googleLoginSchema = z.object({
  idToken: z.string().min(20),
  orgSlug: z.string().min(2).max(50),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type RegisterFromInviteInput = z.infer<typeof registerFromInviteSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type GoogleLoginInput = z.infer<typeof googleLoginSchema>;
