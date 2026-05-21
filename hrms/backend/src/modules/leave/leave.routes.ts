import { Router } from 'express';
import { getLeaveRequests, createLeaveRequest, getLeaveTypes, getLeaveAnalytics, updateLeaveStatus } from './leave.controller.js';

export const leaveRouter = Router();

leaveRouter.get('/', getLeaveRequests);
leaveRouter.post('/', createLeaveRequest);
leaveRouter.get('/types', getLeaveTypes);
leaveRouter.get('/analytics', getLeaveAnalytics);
leaveRouter.patch('/:id/status', updateLeaveStatus);
