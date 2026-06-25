import { Router } from 'express';
import { listar, crear, actualizar, mover, eliminar } from '../controllers/tareas.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(verificarToken);
router.get('/',          listar);
router.post('/',         crear);
router.put('/:id',       actualizar);
router.patch('/:id/mover', mover);
router.delete('/:id',    eliminar);
export default router;
