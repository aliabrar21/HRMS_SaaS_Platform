import { Router } from 'express';
import { getEmployees, createEmployee, getDepartments, getDesignations, getEmployee, updateEmployee } from './employees.controller.js';

export const employeesRouter = Router();

employeesRouter.get('/', getEmployees);
employeesRouter.post('/', createEmployee);
employeesRouter.get('/departments/all', getDepartments);
employeesRouter.get('/designations/all', getDesignations);
employeesRouter.get('/:id', getEmployee);
employeesRouter.put('/:id', updateEmployee);
