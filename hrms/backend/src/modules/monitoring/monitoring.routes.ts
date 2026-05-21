import { Router } from 'express';
import { getSystemLogs } from './monitoring.controller.js';

export const monitoringRouter = Router();

monitoringRouter.get('/logs', getSystemLogs);
