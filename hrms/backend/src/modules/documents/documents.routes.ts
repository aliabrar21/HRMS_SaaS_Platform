import { Router } from 'express';
import { getDocuments } from './documents.controller.js';

export const documentsRouter = Router();

documentsRouter.get('/', getDocuments);
