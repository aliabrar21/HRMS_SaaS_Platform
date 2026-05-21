import { Request, Response, NextFunction } from 'express';

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, data: [], message: 'Notifications retrieved' });
};
