import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from '../types/index.js';

export interface AuthRequest extends Request {
  usuario?: JwtPayload;
}

export const verificarToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Token requerido' });
    return;
  }
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || ''
    ) as JwtPayload;
    req.usuario = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
};