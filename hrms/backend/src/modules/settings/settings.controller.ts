import { Request, Response, NextFunction } from 'express';

export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, data: { theme: 'dark' }, message: 'Settings retrieved' });
};
