import type { Request, Response } from 'express';
import pool from '../config/db.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import { enviarAsignacion } from '../services/email.service.js';

export const listar = async (_req: Request, res: Response): Promise<void> => {
  const [rows] = await pool.query(`
    SELECT t.*, c.nombre AS categoria_nombre, c.color AS categoria_color
    FROM tareas t
    LEFT JOIN categorias c ON c.id = t.categoria_id
    ORDER BY t.fecha_inicio ASC
  `);
  res.json(rows);
};

export const crear = async (req: AuthRequest, res: Response): Promise<void> => {
  const u = req.usuario!;
  const {
    titulo, descripcion, lugar, fecha_inicio, fecha_fin, todo_el_dia,
    categoria_id, columna_kanban, recordatorio_min, integrantes,
  } = req.body as Record<string, unknown>;

  if (!titulo || !fecha_inicio || !fecha_fin) {
    res.status(400).json({ error: 'titulo, fecha_inicio y fecha_fin son requeridos' });
    return;
  }

  const integrantesList = (integrantes as string[] | undefined) ?? [];
  const integrantesJson = JSON.stringify(integrantesList);

  const [result] = await pool.query(
    `INSERT INTO tareas (titulo, descripcion, lugar, fecha_inicio, fecha_fin, todo_el_dia,
      categoria_id, creador_id, columna_kanban, recordatorio_min, integrantes)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [titulo, descripcion ?? null, lugar ?? null, fecha_inicio, fecha_fin,
     todo_el_dia ? 1 : 0, categoria_id ?? null, u.id,
     columna_kanban ?? 'pendiente', recordatorio_min ?? null, integrantesJson]
  );
  const { insertId } = result as { insertId: number };

  // Correo de asignación — solo si hay integrantes
  if (integrantesList.length > 0) {
    const [rows] = await pool.query('SELECT email FROM usuarios WHERE id = ?', [u.id]) as any[];
    const creadorEmail: string = (rows as { email: string }[])[0]?.email ?? '';

    enviarAsignacion({
      to: integrantesList,
      titulo: titulo as string,
      descripcion: descripcion as string | undefined,
      lugar: lugar as string | undefined,
      fecha_inicio: fecha_inicio as string,
      fecha_fin: fecha_fin as string,
      creador: u.nombre,
      integrantes: integrantesList,
    }).catch(err => console.error('Error correo asignación:', err));

    // También notificar al creador si no está en la lista
    if (creadorEmail && !integrantesList.includes(creadorEmail)) {
      enviarAsignacion({
        to: [creadorEmail],
        titulo: titulo as string,
        descripcion: descripcion as string | undefined,
        lugar: lugar as string | undefined,
        fecha_inicio: fecha_inicio as string,
        fecha_fin: fecha_fin as string,
        creador: u.nombre,
        integrantes: integrantesList,
      }).catch(err => console.error('Error correo creador:', err));
    }
  }

  res.status(201).json({ id: insertId });
};

export const actualizar = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const {
    titulo, descripcion, lugar, fecha_inicio, fecha_fin, todo_el_dia,
    categoria_id, columna_kanban, recordatorio_min, integrantes,
  } = req.body as Record<string, unknown>;

  await pool.query(
    `UPDATE tareas SET titulo=?, descripcion=?, lugar=?, fecha_inicio=?, fecha_fin=?,
      todo_el_dia=?, categoria_id=?, columna_kanban=?, recordatorio_min=?,
      integrantes=?, recordatorio_enviado=0, recordatorio_fin_enviado=0
     WHERE id=?`,
    [titulo, descripcion ?? null, lugar ?? null, fecha_inicio, fecha_fin,
     todo_el_dia ? 1 : 0, categoria_id ?? null,
     columna_kanban ?? 'pendiente', recordatorio_min ?? null,
     JSON.stringify(integrantes ?? []), id]
  );
  res.json({ ok: true });
};

export const mover = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { columna_kanban } = req.body as { columna_kanban: string };
  await pool.query('UPDATE tareas SET columna_kanban=? WHERE id=?', [columna_kanban, id]);
  res.json({ ok: true });
};

export const eliminar = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  await pool.query('DELETE FROM tareas WHERE id=?', [id]);
  res.json({ ok: true });
};
