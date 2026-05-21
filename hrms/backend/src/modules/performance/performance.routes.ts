import { Router } from 'express';
import { getReviews, getPerformanceAnalytics } from './performance.controller.js';

export const performanceRouter = Router();

performanceRouter.get('/reviews', getReviews);
performanceRouter.get('/analytics', getPerformanceAnalytics);
