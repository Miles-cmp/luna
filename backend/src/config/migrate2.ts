import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const conn = await mysql.createConnection({
  host: process.env.DB_HOST, user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
});

const addCol = async (sql: string) => { try { await conn.query(sql) } catch { /* ya existe */ } };

await addCol(`ALTER TABLE tareas ADD COLUMN recordatorio_fin_enviado TINYINT(1) NOT NULL DEFAULT 0`);

console.log('✅ Migración 2 completa');
await conn.end();
