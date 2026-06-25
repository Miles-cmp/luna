import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const usuarios = [
  { nombre: 'Administrador',  email: 'admin@luna.com',  password: 'Admin123!',  rol: 'admin'   },
  { nombre: 'Usuario Demo',   email: 'demo@luna.com',   password: 'Demo123!',   rol: 'usuario' },
  { nombre: 'Carlos López',   email: 'carlos@luna.com', password: 'Carlos123!', rol: 'usuario' },
];

async function seed() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || '127.0.0.1',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'lunadb',
  });

  for (const u of usuarios) {
    const hash = await bcrypt.hash(u.password, 10);
    await conn.query(
      `INSERT INTO usuarios (nombre, email, password, rol)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)`,
      [u.nombre, u.email, hash, u.rol]
    );
    console.log(`✅ ${u.rol.padEnd(8)} | ${u.email.padEnd(22)} | ${u.password}`);
  }

  await conn.end();
  console.log('\nUsuarios listos.');
}

seed().catch(err => { console.error(err); process.exit(1); });
