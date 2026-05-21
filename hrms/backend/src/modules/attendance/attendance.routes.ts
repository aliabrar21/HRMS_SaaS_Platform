import { Router } from 'express';
import { getAttendanceLogs, getAttendanceAnalytics } from './attendance.controller.js';

export const attendanceRouter = Router();

attendanceRouter.get('/', getAttendanceLogs);
attendanceRouter.get('/analytics', getAttendanceAnalytics);
