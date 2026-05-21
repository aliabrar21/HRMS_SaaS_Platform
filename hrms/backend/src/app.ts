import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import * as Sentry from '@sentry/node';
import { env } from './config/env.js';
import { logger } from './common/utils/logger.js';
import { apiRateLimiter } from './common/middleware/rate-limit.middleware.js';
import { applySecurityMiddleware } from './common/middleware/security.middleware.js';
import { errorHandler } from './common/middleware/error.middleware.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { employeesRouter } from './modules/employees/employees.routes.js';
import { attendanceRouter } from './modules/attendance/attendance.routes.js';
import { leaveRouter } from './modules/leave/leave.routes.js';
import { payrollRouter } from './modules/payroll/payroll.routes.js';
import { recruitmentRouter } from './modules/recruitment/recruitment.routes.js';
import { documentsRouter } from './modules/documents/documents.routes.js';
import { performanceRouter } from './modules/performance/performance.routes.js';
import { helpdeskRouter } from './modules/helpdesk/helpdesk.routes.js';
import { lmsRouter } from './modules/lms/lms.routes.js';
import { onboardingRouter } from './modules/onboarding/onboarding.routes.js';
import { analyticsRouter } from './modules/analytics/analytics.routes.js';
import { assetsRouter } from './modules/assets/assets.routes.js';
import { expensesRouter } from './modules/expenses/expenses.routes.js';
import { notificationsRouter } from './modules/notifications/notifications.routes.js';
import { monitoringRouter } from './modules/monitoring/monitoring.routes.js';
import { settingsRouter } from './modules/settings/settings.routes.js';

export const app = express();

if (env.SENTRY_DSN) {
  Sentry.init({ dsn: env.SENTRY_DSN });
}

applySecurityMiddleware(app);

app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(apiRateLimiter);

app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' }, message: 'Healthy' });
});

app.use('/api/auth', authRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/leave', leaveRouter);
app.use('/api/payroll', payrollRouter);
app.use('/api/recruitment', recruitmentRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/performance', performanceRouter);
app.use('/api/helpdesk', helpdeskRouter);
app.use('/api/lms', lmsRouter);
app.use('/api/onboarding', onboardingRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/assets', assetsRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/monitoring', monitoringRouter);
app.use('/api/settings', settingsRouter);
app.use(errorHandler);
