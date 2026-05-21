import { Router } from 'express';
import { getNotifications } from './notifications.controller.js';

export const notificationsRouter = Router();

notificationsRouter.get('/', getNotifications);
