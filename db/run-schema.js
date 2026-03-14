// db/run-schema.js
// Ejecutar UNA SOLA VEZ para crear las tablas en producción:
// node db/run-schema.js

import 'dotenv/config';
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL || process.env.MYSQL_PUBLIC_URL;

let conn;
if (DATABASE_URL) {
    const url = new URL(DATABASE_URL);
    conn = await mysql.createConnection({
        host: url.hostname,
        port: Number(url.port) || 3306,
        user: url.username,
        password: url.password,
        database: url.pathname.replace('/', ''),
        ssl: { rejectUnauthorized: false },
        multipleStatements: true,
    });
} else {
    conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'railway',
        multipleStatements: true,
    });
}

console.log('✅ Conectado a MySQL. Creando tablas...');

const schema = `
CREATE TABLE IF NOT EXISTS empresas (
  id          VARCHAR(36)  PRIMARY KEY,
  nombre      VARCHAR(255) NOT NULL,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  rnc         VARCHAR(50)  NOT NULL,
  direccion   TEXT,
  telefono    VARCHAR(30),
  email       VARCHAR(255),
  periodo_fiscal INT,
  plan        VARCHAR(20) DEFAULT 'basico',
  features    JSON NULL,
  activa      TINYINT(1)   DEFAULT 1,
  setup_completed TINYINT(1) DEFAULT 0,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios (
  id            VARCHAR(36)  PRIMARY KEY,
  empresa_id    VARCHAR(36)  NOT NULL,
  nombre        VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20) DEFAULT 'contador',
  activo        TINYINT(1)   DEFAULT 1,
  ultimo_acceso TIMESTAMP    NULL,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_email_empresa (email, empresa_id)
);

CREATE TABLE IF NOT EXISTS superadmins (
  id            VARCHAR(36)  PRIMARY KEY,
  nombre        VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  activo        TINYINT(1)   DEFAULT 1,
  ultimo_acceso TIMESTAMP    NULL,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auditoria (
  id              BIGINT       AUTO_INCREMENT PRIMARY KEY,
  empresa_id      VARCHAR(36)  NOT NULL,
  usuario_id      VARCHAR(36),
  accion          VARCHAR(50)  NOT NULL,
  entidad         VARCHAR(100),
  registro_id     VARCHAR(64),
  ip              VARCHAR(45),
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_empresa (empresa_id),
  INDEX idx_created (created_at)
);
`;

try {
    await conn.query(schema);
    console.log('✅ Tablas creadas exitosamente.');
} catch (err) {
    console.error('❌ Error creando tablas:', err.message);
}

await conn.end();
console.log('🏁 Schema completado.');
