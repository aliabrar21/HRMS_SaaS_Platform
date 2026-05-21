import { Router } from 'express';
import { getOnboardingTasks } from './onboarding.controller.js';

export const onboardingRouter = Router();

onboardingRouter.get('/tasks', getOnboardingTasks);
