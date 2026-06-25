import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function initDb() {
  const connection = await mysql.createConnection({
    host:     process.env.DB_HOST     || '127.0.0.1',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'lunadb'}\``);
  await connection.query(`USE \`${process.env.DB_NAME || 'lunadb'}\``);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      nombre      VARCHAR(100) NOT NULL,
      email       VARCHAR(150) NOT NULL UNIQUE,
      password    VARCHAR(255) NOT NULL,
      avatar      VARCHAR(255),
      rol         ENUM('admin', 'usuario') NOT NULL DEFAULT 'usuario',
      creado      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS categorias (
      id      INT AUTO_INCREMENT PRIMARY KEY,
      nombre  VARCHAR(100) NOT NULL,
      color   VARCHAR(20)  NOT NULL DEFAULT '#6366f1',
      estado  ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
      creado  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS tareas (
      id               INT AUTO_INCREMENT PRIMARY KEY,
      titulo           VARCHAR(200) NOT NULL,
      descripcion      TEXT,
      lugar            VARCHAR(255),
      fecha_inicio     DATETIME NOT NULL,
      fecha_fin        DATETIME NOT NULL,
      todo_el_dia      TINYINT(1) NOT NULL DEFAULT 0,
      categoria_id     INT,
      creador_id       INT NOT NULL,
      columna_kanban   ENUM('pendiente', 'en_progreso', 'en_revision', 'finalizado') NOT NULL DEFAULT 'pendiente',
      recordatorio_min INT,
      creado           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_tarea_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
      CONSTRAINT fk_tarea_creador   FOREIGN KEY (creador_id)   REFERENCES usuarios(id)   ON DELETE CASCADE
    )
  `);

  console.log('✅ Base de datos "lunadb" y tablas creadas correctamente.');
  await connection.end();
}

initDb().catch(err => {
  console.error('❌ Error al inicializar la base de datos:', err);
  process.exit(1);
});
