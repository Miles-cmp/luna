import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import type { Usuario } from '../types/index.js';


export const registro = async (req: Request, res: Response): Promise<void> => {
  const { nombre, email, password, rol = 'usuario' } = req.body as Partial<Usuario> & { password: string };
  if (!nombre || !email || !password) {
    res.status(400).json({ error: 'nombre, email y password son requeridos' });
    return;
  }
  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
    [nombre, email, hash, rol]
  );
  const { insertId } = result as { insertId: number };
  res.status(201).json({ id: insertId, nombre, email, rol });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };
  if (!email || !password) {
    res.status(400).json({ error: 'email y password son requeridos' });
    return;
  }
  const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
  const usuarios = rows as Usuario[];
  if (usuarios.length === 0) {
    res.status(401).json({ error: 'Credenciales inválidas' });
    return;
  }
  const usuario = usuarios[0]!;
  const valido = await bcrypt.compare(password, usuario.password);
  if (!valido) {
    res.status(401).json({ error: 'Credenciales inválidas' });
    return;
  }
  const puedeCrear = Boolean(usuario.puede_crear_usuarios);
  const token = jwt.sign(
    { id: usuario.id, email: usuario.email, nombre: usuario.nombre, rol: usuario.rol, puede_crear_usuarios: puedeCrear },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '8h' }
  );
  res.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol, puede_crear_usuarios: puedeCrear } });
};

export const perfil = async (req: Request, res: Response): Promise<void> => {
  res.json({ mensaje: 'ruta protegida OK', usuario: (req as any).usuario });
};

export const listarUsuarios = async (_req: Request, res: Response): Promise<void> => {
  const [rows] = await pool.query(
    'SELECT id, nombre, email, rol, puede_crear_usuarios, creado FROM usuarios ORDER BY creado DESC'
  );
  res.json(rows);
};

export const actualizarNombre = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { nombre } = req.body as { nombre: string };
  if (!nombre?.trim()) {
    res.status(400).json({ error: 'El nombre no puede estar vacío' });
    return;
  }
  await pool.query('UPDATE usuarios SET nombre = ? WHERE id = ?', [nombre.trim(), id]);
  res.json({ ok: true, nombre: nombre.trim() });
};
