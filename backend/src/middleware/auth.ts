import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { JWT_SECRET } from '../config';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) {
        console.warn(`[AUTH] Token verification failed for ${req.path}: ${err.message}`);
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } else {
    console.warn(`[AUTH] No authorization header provided for ${req.path}`);
    res.sendStatus(401);
  }
};
