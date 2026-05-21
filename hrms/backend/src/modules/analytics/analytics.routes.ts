import { Router } from 'express';
import { getAnalyticsData } from './analytics.controller.js';

export const analyticsRouter = Router();

analyticsRouter.get('/data', getAnalyticsData);
