import { Router } from 'express';
import { registro, login, perfil, listarUsuarios, actualizarNombre } from '../controllers/auth.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/registro',  registro);
router.post('/login',     login);
router.get('/perfil',     verificarToken, perfil);
router.get('/usuarios',          verificarToken, listarUsuarios);
router.patch('/usuarios/:id',    verificarToken, actualizarNombre);

export default router;
