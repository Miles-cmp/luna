import { Router } from 'express';
import { listar, crear, actualizar, eliminar } from '../controllers/categorias.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(verificarToken);
router.get('/',      listar);
router.post('/',     crear);
router.put('/:id',   actualizar);
router.delete('/:id', eliminar);
export default router;
