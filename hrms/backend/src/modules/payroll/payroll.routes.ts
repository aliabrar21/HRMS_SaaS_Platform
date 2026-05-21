import { Router } from 'express';
import { getPayrollRecords } from './payroll.controller.js';

export const payrollRouter = Router();

payrollRouter.get('/', getPayrollRecords);
