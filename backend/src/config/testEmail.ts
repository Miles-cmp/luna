import dotenv from 'dotenv';
dotenv.config();
import { enviarRecordatorio } from '../services/email.service.js';

await enviarRecordatorio({
  to: [process.env.GMAIL_USER!],
  titulo: 'Prueba de recordatorio Luna 🌙',
  descripcion: 'Este es un correo de prueba del sistema de recordatorios.',
  lugar: 'Sistema Luna',
  fecha_inicio: new Date(Date.now() + 5 * 60000).toISOString(),
  recordatorio_min: 5,
});

console.log('✅ Correo enviado correctamente a', process.env.GMAIL_USER);
