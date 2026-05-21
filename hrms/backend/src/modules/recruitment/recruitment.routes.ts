import { Router } from 'express';
import { getCandidates } from './recruitment.controller.js';

export const recruitmentRouter = Router();

recruitmentRouter.get('/candidates', getCandidates);
