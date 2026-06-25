import cron from 'node-cron';
import pool from '../config/db.js';
import { enviarRecordatorio, enviarFinalizacion } from './email.service.js';

interface TareaRow {
  id: number;
  titulo: string;
  descripcion: string;
  lugar: string;
  fecha_inicio: Date;
  fecha_fin: Date;
  recordatorio_min: number;
  integrantes: string;
  email_creador: string;
}

function destinatarios(emailCreador: string, integrantesJson: string): string[] {
  let lista: string[] = [];
  try { lista = JSON.parse(integrantesJson ?? '[]') as string[]; } catch { /* */ }
  return Array.from(new Set([emailCreador, ...lista])).filter(Boolean);
}

export function iniciarRecordatorios() {
  cron.schedule('* * * * *', async () => {
    try {

      // ── Recordatorio de INICIO ────────────────────────────────────────────
      const [inicio] = await pool.query<any[]>(`
        SELECT t.id, t.titulo, t.descripcion, t.lugar,
               t.fecha_inicio, t.fecha_fin, t.recordatorio_min, t.integrantes,
               u.email AS email_creador
        FROM tareas t
        JOIN usuarios u ON u.id = t.creador_id
        WHERE t.recordatorio_min IS NOT NULL
          AND t.recordatorio_enviado = 0
          AND t.fecha_inicio > NOW()
          AND DATE_SUB(t.fecha_inicio, INTERVAL t.recordatorio_min MINUTE) <= NOW()
      `);

      for (const t of inicio as TareaRow[]) {
        // Marcar ANTES de enviar para evitar duplicados si hay varias instancias
        const [upd] = await pool.query(
          'UPDATE tareas SET recordatorio_enviado = 1 WHERE id = ? AND recordatorio_enviado = 0', [t.id]
        ) as any[];
        if ((upd as { affectedRows: number }).affectedRows === 0) continue; // otra instancia ya lo envió

        const to = destinatarios(t.email_creador, t.integrantes);
        await enviarRecordatorio({
          to, titulo: t.titulo, descripcion: t.descripcion, lugar: t.lugar,
          fecha_inicio: t.fecha_inicio.toISOString(),
          fecha_fin:    t.fecha_fin.toISOString(),
          recordatorio_min: t.recordatorio_min,
        });
        console.log(`⏰ Inicio enviado: "${t.titulo}" → ${to.join(', ')}`);
      }

      // ── Notificación de FINALIZACIÓN ─────────────────────────────────────
      const [fin] = await pool.query<any[]>(`
        SELECT t.id, t.titulo, t.descripcion, t.fecha_fin, t.integrantes,
               u.email AS email_creador
        FROM tareas t
        JOIN usuarios u ON u.id = t.creador_id
        WHERE t.recordatorio_fin_enviado = 0
          AND t.fecha_fin <= NOW()
          AND t.fecha_fin >= DATE_SUB(NOW(), INTERVAL 2 MINUTE)
      `);

      for (const t of fin as TareaRow[]) {
        const [upd] = await pool.query(
          'UPDATE tareas SET recordatorio_fin_enviado = 1 WHERE id = ? AND recordatorio_fin_enviado = 0', [t.id]
        ) as any[];
        if ((upd as { affectedRows: number }).affectedRows === 0) continue;

        const to = destinatarios(t.email_creador, t.integrantes);
        await enviarFinalizacion({
          to, titulo: t.titulo, descripcion: t.descripcion,
          fecha_fin: t.fecha_fin.toISOString(),
        });
        console.log(`🏁 Fin enviado: "${t.titulo}" → ${to.join(', ')}`);
      }

    } catch (err) {
      console.error('Error en recordatorios:', err);
    }
  });

  console.log('⏰ Servicio de recordatorios iniciado (revisión cada minuto)');
}
