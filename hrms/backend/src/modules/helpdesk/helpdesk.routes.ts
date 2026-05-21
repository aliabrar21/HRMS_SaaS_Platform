import { Router } from 'express';
import { getTickets } from './helpdesk.controller.js';

export const helpdeskRouter = Router();

helpdeskRouter.get('/tickets', getTickets);
