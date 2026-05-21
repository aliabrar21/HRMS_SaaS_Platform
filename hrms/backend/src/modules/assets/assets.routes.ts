import { Router } from 'express';
import { getAssets } from './assets.controller.js';

export const assetsRouter = Router();

assetsRouter.get('/', getAssets);
