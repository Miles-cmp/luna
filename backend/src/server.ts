import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes      from './routes/auth.routes.js';
import tareasRoutes    from './routes/tareas.routes.js';
import categoriasRoutes from './routes/categorias.routes.js';
import { iniciarRecordatorios } from './services/recordatorio.service.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth',       authRoutes);
app.use('/api/tareas',     tareasRoutes);
app.use('/api/categorias', categoriasRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  iniciarRecordatorios();
});
