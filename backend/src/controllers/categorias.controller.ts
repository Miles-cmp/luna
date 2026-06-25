import type { Request, Response } from 'express';
import pool from '../config/db.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

export const listar = async (_req: Request, res: Response): Promise<void> => {
  const [rows] = await pool.query('SELECT * FROM categorias ORDER BY creado ASC');
  res.json(rows);
};

export const crear = async (req: AuthRequest, res: Response): Promise<void> => {
  const { nombre, color, estado } = req.body as { nombre: string; color: string; estado?: string };
  if (!nombre?.trim()) { res.status(400).json({ error: 'nombre requerido' }); return; }
  const [result] = await pool.query(
    'INSERT INTO categorias (nombre, color, estado, creador_id) VALUES (?,?,?,?)',
    [nombre.trim(), color ?? '#6366f1', estado ?? 'activo', req.usuario?.id ?? null]
  );
  const { insertId } = result as { insertId: number };
  res.status(201).json({ id: insertId, nombre: nombre.trim(), color: color ?? '#6366f1', estado: estado ?? 'activo' });
};

export const actualizar = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { nombre, color, estado } = req.body as { nombre?: string; color?: string; estado?: string };
  await pool.query(
    'UPDATE categorias SET nombre=COALESCE(?,nombre), color=COALESCE(?,color), estado=COALESCE(?,estado) WHERE id=?',
    [nombre ?? null, color ?? null, estado ?? null, id]
  );
  res.json({ ok: true });
};

export const eliminar = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  await pool.query('DELETE FROM categorias WHERE id=?', [id]);
  res.json({ ok: true });
};
