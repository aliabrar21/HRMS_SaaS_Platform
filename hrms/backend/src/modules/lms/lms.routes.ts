import { Router } from 'express';
import { getCourses } from './lms.controller.js';

export const lmsRouter = Router();

lmsRouter.get('/courses', getCourses);
