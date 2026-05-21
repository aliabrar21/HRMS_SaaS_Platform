import { Router } from 'express';
import { getSettings } from './settings.controller.js';

export const settingsRouter = Router();

settingsRouter.get('/', getSettings);
