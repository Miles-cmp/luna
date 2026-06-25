import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const conn = await mysql.createConnection({
  host: process.env.DB_HOST, user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
});

// Columna para permiso granular de crear usuarios (ignora error si ya existe)
try {
  await conn.query(`ALTER TABLE usuarios ADD COLUMN puede_crear_usuarios TINYINT(1) NOT NULL DEFAULT 0`);
} catch { /* columna ya existe */ }

// Eliminar usuarios de prueba
const [del] = await conn.query(`DELETE FROM usuarios WHERE email IN ('admin@luna.com','demo@luna.com','carlos@luna.com')`) as any[];
console.log(`🗑  Usuarios eliminados: ${del.affectedRows}`);

// Crear / actualizar super admin
const hash = await bcrypt.hash('CMP.Mil$2038', 10);
await conn.query(
  `INSERT INTO usuarios (nombre, email, password, rol, puede_crear_usuarios)
   VALUES ('T Miles', 'tmiles@cmplatam.com', ?, 'admin', 1)
   ON DUPLICATE KEY UPDATE password=VALUES(password), rol='admin', puede_crear_usuarios=1`,
  [hash]
);
console.log('✅ Super admin tmiles@cmplatam.com listo');

const [rows] = await conn.query('SELECT id, nombre, email, rol, puede_crear_usuarios, creado FROM usuarios');
console.table(rows);
await conn.end();
