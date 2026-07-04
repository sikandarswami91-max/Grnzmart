import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel, IUser } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'genzmart-super-secret-key-2026';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export function protect(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const user = UserModel.findById(decoded.id);

    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
  }
}

export function adminOnly(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied, admin authorization required' });
  }
}
