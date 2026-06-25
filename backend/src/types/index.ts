export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  password: string;
  avatar?: string;
  rol: string;
  puede_crear_usuarios: number;
  creado: Date;
}

export interface Tarea {
  id: number;
  titulo: string;
  descripcion?: string;
  lugar?: string;
  fecha_inicio: Date;
  fecha_fin: Date;
  todo_el_dia: boolean;
  categoria_id: number;
  creador_id: number;
  columna_kanban: 'pendiente' | 'en_progreso' | 'en_revision' | 'finalizado';
  recordatorio_min?: number;
}

export interface Categoria {
  id: number;
  nombre: string;
  color: string;
  estado: 'activo' | 'inactivo';
  creado: Date;
}

export interface JwtPayload {
  id: number;
  email: string;
  nombre: string;
  rol: string;
  puede_crear_usuarios: boolean;
}